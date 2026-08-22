# -*- coding: utf-8 -*-
from datetime import datetime
from odoo import http, fields
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
    conflict_response,
    parse_pagination_params,
    handle_api_exceptions,
)


def format_attendance_data(attendance):
    """
    Serializes an hr.attendance record into a clean dictionary.
    """
    if not attendance:
        return None

    rec = attendance[0] if isinstance(attendance, (list, tuple)) else attendance
    if hasattr(rec, 'exists') and not rec.exists():
        return None

    check_in_str = rec.check_in.strftime('%Y-%m-%d %H:%M:%S') if rec.check_in else None
    check_out_str = rec.check_out.strftime('%Y-%m-%d %H:%M:%S') if rec.check_out else None

    return {
        "id": rec.id,
        "employee_id": rec.employee_id.id if rec.employee_id else None,
        "employee_name": rec.employee_id.name if rec.employee_id else "",
        "check_in": check_in_str,
        "check_out": check_out_str,
        "worked_hours": round(rec.worked_hours, 2) if rec.worked_hours is not None else 0.0
    }


def get_active_attendance(employee):
    """
    Finds the active attendance record (checked in, not yet checked out) for an employee.
    """
    if not employee:
        return None

    emp_rec = employee[0] if isinstance(employee, (list, tuple)) else employee
    if hasattr(emp_rec, 'exists') and not emp_rec.exists():
        return None

    records = request.env['hr.attendance'].sudo().search(
        [('employee_id', '=', emp_rec.id), ('check_out', '=', False)],
        order='check_in desc, id desc',
        limit=1
    )
    if records:
        return records[0] if isinstance(records, (list, tuple)) else records[:1]

    return None


class DayflowAttendanceController(http.Controller):

    @http.route('/api/v1/attendance/check-in', type='http', auth='public', methods=['POST'], csrf=False)
    @handle_api_exceptions
    def check_in(self, **kwargs):
        """
        Starts an active attendance record for the authenticated employee.
        Returns 409 Conflict if an active check-in already exists.
        """
        user = get_authenticated_user()
        if not user:
            return unauthorized_response("Authentication required")

        employee = get_user_employee(user)
        if not employee or not employee.exists():
            return not_found_response("No associated employee profile found for user")

        active_att = get_active_attendance(employee)
        if active_att:
            return conflict_response(
                "Employee is already checked in",
                details={
                    "active_attendance_id": active_att.id,
                    "check_in": active_att.check_in.strftime('%Y-%m-%d %H:%M:%S') if active_att.check_in else None
                }
            )

        now = fields.Datetime.now() if hasattr(fields, 'Datetime') else datetime.utcnow()
        att = request.env['hr.attendance'].sudo().create({
            'employee_id': employee.id,
            'check_in': now
        })

        return api_response(format_attendance_data(att), status=201)

    @http.route('/api/v1/attendance/check-out', type='http', auth='public', methods=['POST'], csrf=False)
    @handle_api_exceptions
    def check_out(self, **kwargs):
        """
        Closes the active attendance record for the authenticated employee.
        Returns 400 Bad Request if no active check-in exists.
        """
        user = get_authenticated_user()
        if not user:
            return unauthorized_response("Authentication required")

        employee = get_user_employee(user)
        if not employee or not employee.exists():
            return not_found_response("No associated employee profile found for user")

        active_att = get_active_attendance(employee)
        if not active_att:
            return bad_request_response("No active check-in found to check out from")

        now = fields.Datetime.now() if hasattr(fields, 'Datetime') else datetime.utcnow()
        active_att.sudo().write({'check_out': now})

        return api_response(format_attendance_data(active_att), status=200)

    @http.route('/api/v1/attendance/status', type='http', auth='public', methods=['GET'], csrf=False)
    @handle_api_exceptions
    def attendance_status(self, **kwargs):
        """
        Returns the current attendance status (checked_in or checked_out) and active record details.
        """
        user = get_authenticated_user()
        if not user:
            return unauthorized_response("Authentication required")

        employee = get_user_employee(user)
        if not employee or not employee.exists():
            return api_response({"status": "checked_out", "active_attendance": None}, status=200)

        active_att = get_active_attendance(employee)
        if active_att:
            payload = {
                "status": "checked_in",
                "active_attendance": format_attendance_data(active_att)
            }
        else:
            payload = {
                "status": "checked_out",
                "active_attendance": None
            }

        return api_response(payload, status=200)

    @http.route('/api/v1/attendance', type='http', auth='public', methods=['GET'], csrf=False)
    @handle_api_exceptions
    def list_attendance(self, **kwargs):
        """
        Retrieves paginated attendance history.
        Employees see only their own records.
        HR Officers and Administrators can view all records (or filter by employee_id).
        """
        user = get_authenticated_user()
        if not user:
            return unauthorized_response("Authentication required")

        role = resolve_user_role(user)
        is_hr = role in ('hr_officer', 'administrator')

        page, page_size, offset, error_res = parse_pagination_params()
        if error_res:
            return error_res

        domain = []
        if not is_hr:
            employee = get_user_employee(user)
            if not employee or not employee.exists():
                return paginated_response([], page=page, page_size=page_size, total=0, status=200)
            domain.append(('employee_id', '=', employee.id))
        else:
            req_args = request.httprequest.args if request and hasattr(request, 'httprequest') else {}
            emp_id_raw = req_args.get('employee_id')
            if emp_id_raw:
                try:
                    emp_id = int(emp_id_raw)
                    domain.append(('employee_id', '=', emp_id))
                except (ValueError, TypeError):
                    pass

        total_count = request.env['hr.attendance'].sudo().search_count(domain)
        records = request.env['hr.attendance'].sudo().search(
            domain,
            offset=offset,
            limit=page_size,
            order='check_in desc, id desc'
        )

        data = [format_attendance_data(att) for att in records]
        return paginated_response(data, page=page, page_size=page_size, total=total_count, status=200)

    @http.route('/api/v1/attendance/<int:attendance_id>', type='http', auth='public', methods=['GET'], csrf=False)
    @handle_api_exceptions
    def get_attendance(self, attendance_id, **kwargs):
        """
        Retrieves a single attendance record by ID.
        Allowed for HR Officers/Admins or the employee who owns the record.
        """
        user = get_authenticated_user()
        if not user:
            return unauthorized_response("Authentication required")

        att = request.env['hr.attendance'].sudo().browse(attendance_id)
        if not att.exists():
            return not_found_response("Attendance record not found")

        role = resolve_user_role(user)
        is_hr = role in ('hr_officer', 'administrator')

        if not is_hr:
            employee = get_user_employee(user)
            if not employee or att.employee_id.id != employee.id:
                return forbidden_response("Permission denied to access this attendance record")

        return api_response(format_attendance_data(att), status=200)
