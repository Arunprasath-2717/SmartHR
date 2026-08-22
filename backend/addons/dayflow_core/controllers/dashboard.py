# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request
from .auth import get_authenticated_user, resolve_user_role
from .profile import get_user_employee
from .attendance import get_active_attendance, format_attendance_data
from .leave import format_leave_data
from .payroll import get_or_create_payroll, format_payroll_data
from .common import (
    api_response,
    unauthorized_response,
    forbidden_response,
    not_found_response,
    handle_api_exceptions,
)


def is_hr_authorized(user):
    """
    Checks whether the user has HR Officer or Administrator role.
    """
    role = resolve_user_role(user)
    return role in ('hr_officer', 'administrator')


def get_employee_dashboard_data(user, employee):
    """
    Aggregates dashboard data for the authenticated employee from existing models.
    """
    # Profile Summary
    profile_data = {
        "id": employee.id,
        "name": employee.name or "",
        "work_email": employee.work_email or "",
        "job_title": employee.job_title or "",
        "department_name": employee.department_id.name if employee.department_id else ""
    }

    # Attendance Status
    active_att = get_active_attendance(employee)
    attendance_data = {
        "status": "checked_in" if active_att else "checked_out",
        "active_session": format_attendance_data(active_att) if active_att else None
    }

    # Leave Summary
    pending_count = request.env['dayflow.leave'].sudo().search_count([
        ('employee_id', '=', employee.id),
        ('status', '=', 'pending')
    ])
    approved_count = request.env['dayflow.leave'].sudo().search_count([
        ('employee_id', '=', employee.id),
        ('status', '=', 'approved')
    ])
    rejected_count = request.env['dayflow.leave'].sudo().search_count([
        ('employee_id', '=', employee.id),
        ('status', '=', 'rejected')
    ])
    recent_leaves = request.env['dayflow.leave'].sudo().search(
        [('employee_id', '=', employee.id)],
        limit=5,
        order='create_date desc, id desc'
    )

    leave_data = {
        "summary": {
            "pending": pending_count,
            "approved": approved_count,
            "rejected": rejected_count,
            "total": pending_count + approved_count + rejected_count
        },
        "recent_requests": [format_leave_data(l) for l in recent_leaves]
    }

    # Payroll Summary
    payroll_rec = get_or_create_payroll(employee)
    payroll_data = format_payroll_data(payroll_rec, employee)

    return {
        "role": resolve_user_role(user),
        "profile": profile_data,
        "attendance": attendance_data,
        "leave": leave_data,
        "payroll": payroll_data
    }


def get_admin_dashboard_data(user):
    """
    Aggregates organization-wide dashboard data for HR Officers and Administrators.
    """
    # Employees Overview
    total_employees = request.env['hr.employee'].sudo().search_count([('active', '=', True)])
    total_departments = request.env['hr.department'].sudo().search_count([]) if 'hr.department' in request.env else 0

    # Attendance Overview
    currently_checked_in = request.env['hr.attendance'].sudo().search_count([('check_out', '=', False)])
    total_attendance_records = request.env['hr.attendance'].sudo().search_count([])

    # Leave Overview
    pending_leaves = request.env['dayflow.leave'].sudo().search_count([('status', '=', 'pending')])
    approved_leaves = request.env['dayflow.leave'].sudo().search_count([('status', '=', 'approved')])
    rejected_leaves = request.env['dayflow.leave'].sudo().search_count([('status', '=', 'rejected')])
    recent_pending = request.env['dayflow.leave'].sudo().search(
        [('status', '=', 'pending')],
        limit=5,
        order='create_date desc, id desc'
    )

    # Payroll Overview
    all_payroll = request.env['dayflow.payroll'].sudo().search([])
    total_net_expenditure = round(sum(
        r.net_salary if r.net_salary is not None else ((r.basic_salary or 0.0) + (r.allowances or 0.0) - (r.deductions or 0.0))
        for r in all_payroll
    ), 2)
    total_payroll_records = len(all_payroll)

    return {
        "role": resolve_user_role(user),
        "employees": {
            "total_active": total_employees,
            "total_departments": total_departments
        },
        "attendance": {
            "currently_checked_in": currently_checked_in,
            "total_records": total_attendance_records
        },
        "leave": {
            "pending_approval": pending_leaves,
            "approved": approved_leaves,
            "rejected": rejected_leaves,
            "total": pending_leaves + approved_leaves + rejected_leaves,
            "recent_pending": [format_leave_data(l) for l in recent_pending]
        },
        "payroll": {
            "total_net_expenditure": total_net_expenditure,
            "total_records": total_payroll_records
        }
    }


class DayflowDashboardController(http.Controller):

    @http.route('/api/v1/dashboard/employee', type='http', auth='public', methods=['GET'], csrf=False)
    @handle_api_exceptions
    def get_employee_dashboard(self, **kwargs):
        """
        Retrieves the authenticated employee's personal dashboard overview.
        """
        user = get_authenticated_user()
        if not user:
            return unauthorized_response("Authentication required")

        employee = get_user_employee(user)
        if not employee or not employee.exists():
            return not_found_response("No associated employee profile found for user")

        data = get_employee_dashboard_data(user, employee)
        return api_response(data, status=200)

    @http.route('/api/v1/dashboard/admin', type='http', auth='public', methods=['GET'], csrf=False)
    @handle_api_exceptions
    def get_admin_dashboard(self, **kwargs):
        """
        Retrieves organization-wide metrics for HR Officers and Administrators.
        """
        user = get_authenticated_user()
        if not user:
            return unauthorized_response("Authentication required")

        if not is_hr_authorized(user):
            return forbidden_response("HR Officer or Administrator role required")

        data = get_admin_dashboard_data(user)
        return api_response(data, status=200)

    @http.route('/api/v1/dashboard', type='http', auth='public', methods=['GET'], csrf=False)
    @handle_api_exceptions
    def get_dashboard(self, **kwargs):
        """
        Dynamic dashboard endpoint returning the appropriate view according to user role.
        """
        user = get_authenticated_user()
        if not user:
            return unauthorized_response("Authentication required")

        if is_hr_authorized(user):
            data = get_admin_dashboard_data(user)
            return api_response(data, status=200)

        employee = get_user_employee(user)
        if not employee or not employee.exists():
            return not_found_response("No associated employee profile found for user")

        data = get_employee_dashboard_data(user, employee)
        return api_response(data, status=200)
