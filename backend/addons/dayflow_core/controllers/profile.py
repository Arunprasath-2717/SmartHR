# -*- coding: utf-8 -*-
import json
from odoo import http
from odoo.http import request
from .auth import get_authenticated_user
from .common import (
    api_response,
    unauthorized_response,
    bad_request_response,
    not_found_response,
    validation_error_response,
    handle_api_exceptions,
)

# Fields that an employee is permitted to update on their own profile
ALLOWED_SELF_EDIT_FIELDS = {
    'work_phone',
    'mobile_phone',
    'emergency_contact',
    'emergency_phone',
}


def get_user_employee(user):
    """
    Resolves the associated hr.employee record for the authenticated user.
    """
    if not user:
        return None

    if hasattr(user, 'employee_id') and user.employee_id:
        return user.employee_id

    return request.env['hr.employee'].sudo().search([('user_id', '=', user.id)], limit=1)


def format_profile_data(employee, user):
    """
    Serializes employee profile data, ensuring no sensitive credentials or internal secrets leak.
    """
    if employee and employee.exists():
        return {
            "id": employee.id,
            "user_id": user.id if user else (employee.user_id.id if employee.user_id else None),
            "name": employee.name or (user.name if user else ""),
            "work_email": employee.work_email or (user.login if user else ""),
            "work_phone": employee.work_phone or "",
            "mobile_phone": employee.mobile_phone or "",
            "department_id": employee.department_id.id if employee.department_id else None,
            "department_name": employee.department_id.name if employee.department_id else "",
            "job_title": employee.job_title or "",
            "emergency_contact": employee.emergency_contact or "",
            "emergency_phone": employee.emergency_phone or ""
        }

    return {
        "id": None,
        "user_id": user.id if user else None,
        "name": user.name if user else "",
        "work_email": user.login if user else "",
        "work_phone": "",
        "mobile_phone": "",
        "department_id": None,
        "department_name": "",
        "job_title": "",
        "emergency_contact": "",
        "emergency_phone": ""
    }


class DayflowProfileController(http.Controller):

    @http.route('/api/v1/profile', type='http', auth='public', methods=['GET'], csrf=False)
    @handle_api_exceptions
    def get_profile(self, **kwargs):
        """
        Retrieves the authenticated user's own profile.
        """
        user = get_authenticated_user()
        if not user:
            return unauthorized_response("Authentication required")

        employee = get_user_employee(user)
        payload = format_profile_data(employee, user)
        return api_response(payload, status=200)

    @http.route('/api/v1/profile', type='http', auth='public', methods=['PATCH'], csrf=False)
    @handle_api_exceptions
    def update_profile(self, **kwargs):
        """
        Updates self-editable contact fields for the authenticated user's profile.
        Modifying restricted fields (role, identity, department, salary) is rejected.
        """
        user = get_authenticated_user()
        if not user:
            return unauthorized_response("Authentication required")

        employee = get_user_employee(user)
        if not employee or not employee.exists():
            return not_found_response("No associated employee profile record found to update")

        try:
            raw_body = request.httprequest.data.decode('utf-8') if request.httprequest.data else '{}'
            payload = json.loads(raw_body)
        except Exception:
            return bad_request_response("Request payload must be valid JSON")

        if not isinstance(payload, dict):
            return bad_request_response("Request payload must be a JSON object")

        # Validate that only allowed fields are being updated
        disallowed_fields = [k for k in payload.keys() if k not in ALLOWED_SELF_EDIT_FIELDS]
        if disallowed_fields:
            return validation_error_response(
                f"Field '{disallowed_fields[0]}' cannot be updated via self-service profile",
                details={"restricted_fields": disallowed_fields}
            )

        update_vals = {}
        for field_name in ALLOWED_SELF_EDIT_FIELDS:
            if field_name in payload:
                val = payload[field_name]
                update_vals[field_name] = str(val).strip() if val is not None else False

        if update_vals:
            employee.sudo().write(update_vals)

        return api_response(format_profile_data(employee, user), status=200)
