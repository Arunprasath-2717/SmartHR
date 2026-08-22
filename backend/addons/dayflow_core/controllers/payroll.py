# -*- coding: utf-8 -*-
import json
from odoo import http
from odoo.http import request
from .auth import get_authenticated_user, resolve_user_role
from .profile import get_user_employee
from .common import (
    api_response,
    paginated_response,
    unauthorized_response,
    forbidden_response,
    not_found_response,
    bad_request_response,
    validation_error_response,
    parse_pagination_params,
    handle_api_exceptions,
)

ALLOWED_SALARY_FIELDS = {'basic_salary', 'allowances', 'deductions', 'payment_frequency', 'currency'}
VALID_PAYMENT_FREQUENCIES = {'monthly', 'biweekly', 'weekly'}


def is_hr_authorized(user):
    """
    Checks whether the user has HR Officer or Administrator role.
    """
    role = resolve_user_role(user)
    return role in ('hr_officer', 'administrator')


def format_payroll_data(payroll, employee):
    """
    Serializes a dayflow.payroll record into a clean dictionary.
    """
    emp_id = employee.id if employee else (payroll.employee_id.id if payroll and payroll.employee_id else None)
    emp_name = employee.name if employee else (payroll.employee_id.name if payroll and payroll.employee_id else "")

    if payroll and (not hasattr(payroll, 'exists') or payroll.exists()):
        rec = payroll[0] if isinstance(payroll, (list, tuple)) else payroll
        basic = round(rec.basic_salary or 0.0, 2)
        allow = round(rec.allowances or 0.0, 2)
        deduct = round(rec.deductions or 0.0, 2)
        net = round(rec.net_salary if rec.net_salary is not None else (basic + allow - deduct), 2)

        return {
            "id": rec.id,
            "employee_id": emp_id,
            "employee_name": emp_name,
            "basic_salary": basic,
            "allowances": allow,
            "deductions": deduct,
            "net_salary": net,
            "payment_frequency": rec.payment_frequency or "monthly",
            "currency": rec.currency or "USD"
        }

    return {
        "id": None,
        "employee_id": emp_id,
        "employee_name": emp_name,
        "basic_salary": 0.0,
        "allowances": 0.0,
        "deductions": 0.0,
        "net_salary": 0.0,
        "payment_frequency": "monthly",
        "currency": "USD"
    }


def get_or_create_payroll(employee):
    """
    Retrieves or initializes a dayflow.payroll record for the specified employee.
    """
    if not employee or not employee.exists():
        return None

    emp_rec = employee[0] if isinstance(employee, (list, tuple)) else employee
    existing = request.env['dayflow.payroll'].sudo().search([('employee_id', '=', emp_rec.id)], limit=1)
    if existing:
        return existing[0] if isinstance(existing, (list, tuple)) else existing

    return request.env['dayflow.payroll'].sudo().create({
        'employee_id': emp_rec.id,
        'basic_salary': 0.0,
        'allowances': 0.0,
        'deductions': 0.0,
        'payment_frequency': 'monthly',
        'currency': 'USD'
    })


class DayflowPayrollController(http.Controller):

    @http.route('/api/v1/payroll/me', type='http', auth='public', methods=['GET'], csrf=False)
    @handle_api_exceptions
    def get_own_payroll(self, **kwargs):
        """
        Retrieves the authenticated employee's own payroll and salary structure (read-only).
        """
        user = get_authenticated_user()
        if not user:
            return unauthorized_response("Authentication required")

        employee = get_user_employee(user)
        if not employee or not employee.exists():
            return not_found_response("No associated employee profile found for user")

        payroll = get_or_create_payroll(employee)
        return api_response(format_payroll_data(payroll, employee), status=200)

    @http.route('/api/v1/payroll', type='http', auth='public', methods=['GET'], csrf=False)
    @handle_api_exceptions
    def list_payroll(self, **kwargs):
        """
        Retrieves paginated payroll information across all employees.
        Restricted to HR Officers and Administrators.
        """
        user = get_authenticated_user()
        if not user:
            return unauthorized_response("Authentication required")

        if not is_hr_authorized(user):
            return forbidden_response("HR Officer or Administrator role required")

        page, page_size, offset, error_res = parse_pagination_params()
        if error_res:
            return error_res

        domain = []
        req_args = request.httprequest.args if request and hasattr(request, 'httprequest') else {}
        emp_id_raw = req_args.get('employee_id')
        if emp_id_raw:
            try:
                emp_id = int(emp_id_raw)
                domain.append(('employee_id', '=', emp_id))
            except (ValueError, TypeError):
                pass

        total_count = request.env['dayflow.payroll'].sudo().search_count(domain)
        records = request.env['dayflow.payroll'].sudo().search(
            domain,
            offset=offset,
            limit=page_size,
            order='id desc'
        )

        data = [format_payroll_data(r, r.employee_id) for r in records]
        return paginated_response(data, page=page, page_size=page_size, total=total_count, status=200)

    @http.route('/api/v1/payroll/<int:employee_id>', type='http', auth='public', methods=['GET'], csrf=False)
    @handle_api_exceptions
    def get_employee_payroll(self, employee_id, **kwargs):
        """
        Retrieves payroll information for a specific employee.
        Allowed for HR Officers/Admins or an employee viewing their own record.
        """
        user = get_authenticated_user()
        if not user:
            return unauthorized_response("Authentication required")

        employee = request.env['hr.employee'].sudo().browse(employee_id)
        if not employee.exists() or not employee.active:
            return not_found_response("Employee not found")

        # Authorization: HR/Admin or Self
        if not is_hr_authorized(user):
            self_emp = get_user_employee(user)
            if not self_emp or self_emp.id != employee.id:
                return forbidden_response("Permission denied to access this payroll record")

        payroll = get_or_create_payroll(employee)
        return api_response(format_payroll_data(payroll, employee), status=200)

    @http.route('/api/v1/payroll/<int:employee_id>', type='http', auth='public', methods=['PATCH'], csrf=False)
    @handle_api_exceptions
    def update_employee_salary(self, employee_id, **kwargs):
        """
        Updates the salary structure for a specific employee.
        Restricted to HR Officers and Administrators.
        """
        user = get_authenticated_user()
        if not user:
            return unauthorized_response("Authentication required")

        if not is_hr_authorized(user):
            return forbidden_response("HR Officer or Administrator role required")

        employee = request.env['hr.employee'].sudo().browse(employee_id)
        if not employee.exists() or not employee.active:
            return not_found_response("Employee not found")

        try:
            raw_body = request.httprequest.data.decode('utf-8') if request.httprequest.data else '{}'
            payload = json.loads(raw_body)
        except Exception:
            return bad_request_response("Request payload must be valid JSON")

        if not isinstance(payload, dict):
            return bad_request_response("Request payload must be a JSON object")

        # Check for disallowed fields
        disallowed = [k for k in payload.keys() if k not in ALLOWED_SALARY_FIELDS]
        if disallowed:
            return validation_error_response(
                f"Field '{disallowed[0]}' cannot be updated in salary structure",
                details={"restricted_fields": disallowed, "allowed_fields": list(ALLOWED_SALARY_FIELDS)}
            )

        update_vals = {}

        # Validate numeric fields
        for num_field in ('basic_salary', 'allowances', 'deductions'):
            if num_field in payload:
                val = payload[num_field]
                try:
                    num_val = float(val)
                    if num_val < 0:
                        return validation_error_response(
                            f"{num_field} cannot be negative",
                            details={"field": num_field, "value": val}
                        )
                    update_vals[num_field] = round(num_val, 2)
                except (ValueError, TypeError):
                    return validation_error_response(
                        f"{num_field} must be a valid numeric value",
                        details={"field": num_field, "value": val}
                    )

        # Validate payment_frequency
        if 'payment_frequency' in payload:
            freq = str(payload['payment_frequency']).strip().lower()
            if freq not in VALID_PAYMENT_FREQUENCIES:
                return validation_error_response(
                    "Invalid payment_frequency. Must be one of: monthly, biweekly, weekly",
                    details={"field": "payment_frequency", "allowed": list(VALID_PAYMENT_FREQUENCIES)}
                )
            update_vals['payment_frequency'] = freq

        # Validate currency
        if 'currency' in payload:
            curr = str(payload['currency']).strip().upper()
            if not curr:
                return validation_error_response("currency cannot be empty", details={"field": "currency"})
            update_vals['currency'] = curr

        payroll = get_or_create_payroll(employee)
        if update_vals:
            payroll.sudo().write(update_vals)

        return api_response(format_payroll_data(payroll, employee), status=200)
