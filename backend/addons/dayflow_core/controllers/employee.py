# -*- coding: utf-8 -*-
import json
from odoo import http
from odoo.http import request
from .auth import get_authenticated_user, resolve_user_role
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
from .profile import format_profile_data

# Allowed editable fields for HR Officers & Administrators
ALLOWED_HR_EMPLOYEE_FIELDS = {
    'name',
    'work_email',
    'work_phone',
    'mobile_phone',
    'department_id',
    'job_title',
    'user_id',
    'emergency_contact',
    'emergency_phone',
    'active',
}


def is_hr_authorized(user):
    """
    Checks whether the authenticated user has HR Officer or Administrator role.
    """
    role = resolve_user_role(user)
    return role in ('hr_officer', 'administrator')


class DayflowEmployeeController(http.Controller):

    @http.route('/api/v1/employees', type='http', auth='public', methods=['GET'], csrf=False)
    @handle_api_exceptions
    def list_employees(self, **kwargs):
        """
        Lists employee records with pagination.
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

        domain = [('active', '=', True)]
        total_count = request.env['hr.employee'].sudo().search_count(domain)
        employees = request.env['hr.employee'].sudo().search(
            domain,
            offset=offset,
            limit=page_size,
            order='name asc, id asc'
        )

        data = [format_profile_data(emp, emp.user_id) for emp in employees]
        return paginated_response(data, page=page, page_size=page_size, total=total_count, status=200)

    @http.route('/api/v1/employees', type='http', auth='public', methods=['POST'], csrf=False)
    @handle_api_exceptions
    def create_employee(self, **kwargs):
        """
        Creates a new employee record.
        Restricted to HR Officers and Administrators.
        """
        user = get_authenticated_user()
        if not user:
            return unauthorized_response("Authentication required")

        if not is_hr_authorized(user):
            return forbidden_response("HR Officer or Administrator role required")

        try:
            raw_body = request.httprequest.data.decode('utf-8') if request.httprequest.data else '{}'
            payload = json.loads(raw_body)
        except Exception:
            return bad_request_response("Request payload must be valid JSON")

        if not isinstance(payload, dict):
            return bad_request_response("Request payload must be a JSON object")

        # Validate required fields
        name = payload.get('name')
        if not name or not str(name).strip():
            return validation_error_response("Name is required", details={"field": "name"})

        create_vals = {'name': str(name).strip()}

        # Optional field mapping & validation
        for field in ALLOWED_HR_EMPLOYEE_FIELDS:
            if field in payload and field != 'name':
                val = payload[field]
                if field == 'department_id':
                    if val:
                        dept = request.env['hr.department'].sudo().browse(val)
                        if not dept.exists():
                            return validation_error_response("Invalid department_id", details={"field": "department_id"})
                        create_vals['department_id'] = val
                    else:
                        create_vals['department_id'] = False
                elif field == 'user_id':
                    if val:
                        u = request.env['res.users'].sudo().browse(val)
                        if not u.exists():
                            return validation_error_response("Invalid user_id", details={"field": "user_id"})
                        create_vals['user_id'] = val
                    else:
                        create_vals['user_id'] = False
                elif field == 'active':
                    create_vals['active'] = bool(val)
                else:
                    create_vals[field] = str(val).strip() if val is not None else False

        employee = request.env['hr.employee'].sudo().create(create_vals)
        return api_response(format_profile_data(employee, employee.user_id), status=201)

    @http.route('/api/v1/employees/<int:employee_id>', type='http', auth='public', methods=['GET'], csrf=False)
    @handle_api_exceptions
    def get_employee(self, employee_id, **kwargs):
        """
        Retrieves a single employee record by ID.
        Allowed for HR Officers/Admins or an employee viewing their own associated record.
        """
        user = get_authenticated_user()
        if not user:
            return unauthorized_response("Authentication required")

        employee = request.env['hr.employee'].sudo().browse(employee_id)
        if not employee.exists() or not employee.active:
            return not_found_response("Employee not found")

        # Authorization: HR/Admin or Self
        if not is_hr_authorized(user):
            if not employee.user_id or employee.user_id.id != user.id:
                return forbidden_response("Permission denied to access this employee record")

        return api_response(format_profile_data(employee, employee.user_id), status=200)

    @http.route('/api/v1/employees/<int:employee_id>', type='http', auth='public', methods=['PATCH'], csrf=False)
    @handle_api_exceptions
    def update_employee(self, employee_id, **kwargs):
        """
        Updates an employee record by ID.
        Restricted to HR Officers and Administrators.
        """
        user = get_authenticated_user()
        if not user:
            return unauthorized_response("Authentication required")

        if not is_hr_authorized(user):
            return forbidden_response("HR Officer or Administrator role required")

        employee = request.env['hr.employee'].sudo().browse(employee_id)
        if not employee.exists():
            return not_found_response("Employee not found")

        try:
            raw_body = request.httprequest.data.decode('utf-8') if request.httprequest.data else '{}'
            payload = json.loads(raw_body)
        except Exception:
            return bad_request_response("Request payload must be valid JSON")

        if not isinstance(payload, dict):
            return bad_request_response("Request payload must be a JSON object")

        disallowed_fields = [k for k in payload.keys() if k not in ALLOWED_HR_EMPLOYEE_FIELDS]
        if disallowed_fields:
            return validation_error_response(
                f"Field '{disallowed_fields[0]}' cannot be updated via this endpoint",
                details={"restricted_fields": disallowed_fields}
            )

        update_vals = {}
        for field in ALLOWED_HR_EMPLOYEE_FIELDS:
            if field in payload:
                val = payload[field]
                if field == 'department_id':
                    if val:
                        dept = request.env['hr.department'].sudo().browse(val)
                        if not dept.exists():
                            return validation_error_response("Invalid department_id", details={"field": "department_id"})
                        update_vals['department_id'] = val
                    else:
                        update_vals['department_id'] = False
                elif field == 'user_id':
                    if val:
                        u = request.env['res.users'].sudo().browse(val)
                        if not u.exists():
                            return validation_error_response("Invalid user_id", details={"field": "user_id"})
                        update_vals['user_id'] = val
                    else:
                        update_vals['user_id'] = False
                elif field == 'active':
                    update_vals['active'] = bool(val)
                else:
                    update_vals[field] = str(val).strip() if val is not None else False

        if update_vals:
            employee.sudo().write(update_vals)

        return api_response(format_profile_data(employee, employee.user_id), status=200)
