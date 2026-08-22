# -*- coding: utf-8 -*-
from datetime import datetime
from odoo import http
from odoo.http import request
from .auth import get_authenticated_user, resolve_user_role
from .profile import get_user_employee
from .attendance import format_attendance_data
from .payroll import get_or_create_payroll, format_payroll_data
from .common import (
    api_response,
    unauthorized_response,
    forbidden_response,
    not_found_response,
    validation_error_response,
    handle_api_exceptions,
)


def is_hr_authorized(user):
    """
    Checks whether the user has HR Officer or Administrator role.
    """
    role = resolve_user_role(user)
    return role in ('hr_officer', 'administrator')


class DayflowReportsController(http.Controller):

    @http.route('/api/v1/reports/attendance', type='http', auth='public', methods=['GET'], csrf=False)
    @handle_api_exceptions
    def get_attendance_report(self, **kwargs):
        """
        Generates an attendance report with optional date filtering (from_date, to_date).
        Restricted to the employee's own records unless requested by HR/Admin.
        """
        user = get_authenticated_user()
        if not user:
            return unauthorized_response("Authentication required")

        req_args = request.httprequest.args if request and hasattr(request, 'httprequest') else {}
        domain = []

        # Target Employee Resolution & Authorization
        if is_hr_authorized(user):
            emp_id_param = req_args.get('employee_id')
            if emp_id_param:
                try:
                    emp_id = int(emp_id_param)
                    target_emp = request.env['hr.employee'].sudo().browse(emp_id)
                    if not target_emp.exists() or not target_emp.active:
                        return not_found_response("Employee not found")
                    domain.append(('employee_id', '=', emp_id))
                except (ValueError, TypeError):
                    return validation_error_response("employee_id must be a valid integer", details={"field": "employee_id"})
        else:
            self_emp = get_user_employee(user)
            if not self_emp or not self_emp.exists():
                return not_found_response("No associated employee profile found for user")

            emp_id_param = req_args.get('employee_id')
            if emp_id_param:
                try:
                    if int(emp_id_param) != self_emp.id:
                        return forbidden_response("Permission denied to access attendance report for other employees")
                except (ValueError, TypeError):
                    return validation_error_response("employee_id must be a valid integer", details={"field": "employee_id"})
            domain.append(('employee_id', '=', self_emp.id))

        # Date Range Validation
        from_date_raw = req_args.get('from_date') or req_args.get('start_date')
        to_date_raw = req_args.get('to_date') or req_args.get('end_date')

        dt_from = None
        dt_to = None

        if from_date_raw:
            try:
                dt_from = datetime.strptime(str(from_date_raw).strip(), '%Y-%m-%d')
                domain.append(('check_in', '>=', dt_from.strftime('%Y-%m-%d 00:00:00')))
            except ValueError:
                return validation_error_response("from_date must be in YYYY-MM-DD format", details={"field": "from_date"})

        if to_date_raw:
            try:
                dt_to = datetime.strptime(str(to_date_raw).strip(), '%Y-%m-%d')
                domain.append(('check_in', '<=', dt_to.strftime('%Y-%m-%d 23:59:59')))
            except ValueError:
                return validation_error_response("to_date must be in YYYY-MM-DD format", details={"field": "to_date"})

        if dt_from and dt_to and dt_from > dt_to:
            return validation_error_response(
                "from_date cannot be later than to_date",
                details={"from_date": from_date_raw, "to_date": to_date_raw}
            )

        records = request.env['hr.attendance'].sudo().search(domain, order='check_in desc, id desc')
        formatted_records = [format_attendance_data(r) for r in records]

        # Aggregations
        total_worked_hours = round(sum(r.worked_hours or 0.0 for r in records), 2)
        distinct_days = len(set(
            r.check_in.strftime('%Y-%m-%d') if hasattr(r.check_in, 'strftime') else str(r.check_in)[:10]
            for r in records if r.check_in
        ))

        report_data = {
            "from_date": from_date_raw or "",
            "to_date": to_date_raw or "",
            "total_records": len(records),
            "total_days": distinct_days,
            "total_worked_hours": total_worked_hours,
            "records": formatted_records
        }
        return api_response(report_data, status=200)

    @http.route('/api/v1/reports/payroll', type='http', auth='public', methods=['GET'], csrf=False)
    @handle_api_exceptions
    def get_payroll_report(self, **kwargs):
        """
        Generates a salary slip / payroll report.
        Restricted to the employee's own payroll unless requested by HR/Admin.
        """
        user = get_authenticated_user()
        if not user:
            return unauthorized_response("Authentication required")

        req_args = request.httprequest.args if request and hasattr(request, 'httprequest') else {}

        if is_hr_authorized(user):
            emp_id_param = req_args.get('employee_id')
            if emp_id_param:
                try:
                    emp_id = int(emp_id_param)
                    target_emp = request.env['hr.employee'].sudo().browse(emp_id)
                    if not target_emp.exists() or not target_emp.active:
                        return not_found_response("Employee not found")
                    payroll = get_or_create_payroll(target_emp)
                    return api_response(format_payroll_data(payroll, target_emp), status=200)
                except (ValueError, TypeError):
                    return validation_error_response("employee_id must be a valid integer", details={"field": "employee_id"})

            # Organization-wide payroll report
            records = request.env['dayflow.payroll'].sudo().search([])
            total_expenditure = round(sum(
                r.net_salary if r.net_salary is not None else ((r.basic_salary or 0.0) + (r.allowances or 0.0) - (r.deductions or 0.0))
                for r in records
            ), 2)
            return api_response({
                "total_records": len(records),
                "total_net_expenditure": total_expenditure,
                "payrolls": [format_payroll_data(r, r.employee_id) for r in records]
            }, status=200)

        # Employee self-service
        self_emp = get_user_employee(user)
        if not self_emp or not self_emp.exists():
            return not_found_response("No associated employee profile found for user")

        emp_id_param = req_args.get('employee_id')
        if emp_id_param:
            try:
                if int(emp_id_param) != self_emp.id:
                    return forbidden_response("Permission denied to access payroll report for other employees")
            except (ValueError, TypeError):
                return validation_error_response("employee_id must be a valid integer", details={"field": "employee_id"})

        payroll = get_or_create_payroll(self_emp)
        return api_response(format_payroll_data(payroll, self_emp), status=200)

    @http.route('/api/v1/analytics/overview', type='http', auth='public', methods=['GET'], csrf=False)
    @handle_api_exceptions
    def get_analytics_overview(self, **kwargs):
        """
        Retrieves high-level workforce, attendance, leave, and payroll analytics.
        Restricted to HR Officers and Administrators.
        """
        user = get_authenticated_user()
        if not user:
            return unauthorized_response("Authentication required")

        if not is_hr_authorized(user):
            return forbidden_response("HR Officer or Administrator role required")

        total_employees = request.env['hr.employee'].sudo().search_count([('active', '=', True)])
        total_departments = request.env['hr.department'].sudo().search_count([]) if 'hr.department' in request.env else 0
        currently_checked_in = request.env['hr.attendance'].sudo().search_count([('check_out', '=', False)])

        pending_leaves = request.env['dayflow.leave'].sudo().search_count([('status', '=', 'pending')])
        approved_leaves = request.env['dayflow.leave'].sudo().search_count([('status', '=', 'approved')])
        rejected_leaves = request.env['dayflow.leave'].sudo().search_count([('status', '=', 'rejected')])

        payrolls = request.env['dayflow.payroll'].sudo().search([])
        total_payroll_expenditure = round(sum(
            r.net_salary if r.net_salary is not None else ((r.basic_salary or 0.0) + (r.allowances or 0.0) - (r.deductions or 0.0))
            for r in payrolls
        ), 2)

        analytics_data = {
            "workforce": {
                "total_active_employees": total_employees,
                "total_departments": total_departments
            },
            "attendance": {
                "currently_checked_in": currently_checked_in
            },
            "leaves": {
                "pending": pending_leaves,
                "approved": approved_leaves,
                "rejected": rejected_leaves,
                "total": pending_leaves + approved_leaves + rejected_leaves
            },
            "payroll": {
                "total_expenditure": total_payroll_expenditure,
                "records_count": len(payrolls)
            }
        }
        return api_response(analytics_data, status=200)
