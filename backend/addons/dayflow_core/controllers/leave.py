# -*- coding: utf-8 -*-
import json
from datetime import datetime
from odoo import http
from odoo.http import request
from .auth import get_authenticated_user, resolve_user_role
from .profile import get_user_employee
try:
    from .notification import create_user_notification
except ImportError:
    def create_user_notification(*args, **kwargs):
        pass
try:
    from ..services.ai_client import evaluate_leave_anomaly
except Exception:
    def evaluate_leave_anomaly(*args, **kwargs):
        return {
            "is_anomaly": False,
            "score": 0.0,
            "risk_level": "low",
            "reasons": "AI evaluation unavailable - default fallback applied",
            "evaluation_status": "fallback",
            "engine": "fallback"
        }
from .common import (
    api_response,
    paginated_response,
    unauthorized_response,
    forbidden_response,
    not_found_response,
    bad_request_response,
    conflict_response,
    validation_error_response,
    parse_pagination_params,
    handle_api_exceptions,
)

VALID_LEAVE_TYPES = {'paid', 'sick', 'unpaid'}
VALID_LEAVE_STATUSES = {'pending', 'approved', 'rejected'}


def is_hr_authorized(user):
    """
    Checks whether the user has HR Officer or Administrator role.
    """
    role = resolve_user_role(user)
    return role in ('hr_officer', 'administrator')


def format_leave_data(leave):
    """
    Serializes a dayflow.leave record into a dictionary.
    """
    if not leave:
        return None

    rec = leave[0] if isinstance(leave, (list, tuple)) else leave
    if hasattr(rec, 'exists') and not rec.exists():
        return None

    start_str = rec.start_date.strftime('%Y-%m-%d') if hasattr(rec.start_date, 'strftime') else str(rec.start_date)
    end_str = rec.end_date.strftime('%Y-%m-%d') if hasattr(rec.end_date, 'strftime') else str(rec.end_date)
    approver_comments = getattr(rec, 'approver_comments', '') or ''

    return {
        "id": rec.id,
        "employee_id": rec.employee_id.id if rec.employee_id else None,
        "employee_name": rec.employee_id.name if rec.employee_id else "",
        "leave_type": rec.leave_type,
        "start_date": start_str,
        "end_date": end_str,
        "remarks": rec.remarks or "",
        "status": rec.status,
        "approver_comments": approver_comments,
        # Phase 13 AI Anomaly Fields
        "ai_is_anomaly": bool(getattr(rec, 'ai_is_anomaly', False)),
        "ai_score": float(getattr(rec, 'ai_score', 0.0) or 0.0),
        "ai_risk_level": str(getattr(rec, 'ai_risk_level', 'low') or 'low'),
        "ai_reasons": str(getattr(rec, 'ai_reasons', '') or ''),
        "ai_evaluation_status": str(getattr(rec, 'ai_evaluation_status', 'fallback') or 'fallback')
    }


class DayflowLeaveController(http.Controller):

    @http.route('/api/v1/leave', type='http', auth='public', methods=['POST'], csrf=False)
    @handle_api_exceptions
    def create_leave(self, **kwargs):
        """
        Creates a new leave request in 'pending' status for the authenticated employee,
        invoking the isolated AI anomaly service with timeout and fallback.
        """
        user = get_authenticated_user()
        if not user:
            return unauthorized_response("Authentication required")

        employee = get_user_employee(user)
        if not employee or not employee.exists():
            return not_found_response("No associated employee profile found for user")

        try:
            raw_body = request.httprequest.data.decode('utf-8') if request.httprequest.data else '{}'
            payload = json.loads(raw_body)
        except Exception:
            return bad_request_response("Request payload must be valid JSON")

        if not isinstance(payload, dict):
            return bad_request_response("Request payload must be a JSON object")

        # Validate leave_type
        leave_type = str(payload.get('leave_type', '')).strip().lower()
        if leave_type not in VALID_LEAVE_TYPES:
            return validation_error_response(
                "Invalid leave_type. Must be one of: paid, sick, unpaid",
                details={"field": "leave_type", "allowed": list(VALID_LEAVE_TYPES)}
            )

        # Validate start_date
        start_date_raw = payload.get('start_date')
        if not start_date_raw or not isinstance(start_date_raw, str):
            return validation_error_response("start_date is required in YYYY-MM-DD format", details={"field": "start_date"})
        try:
            dt_start = datetime.strptime(start_date_raw.strip(), '%Y-%m-%d').date()
        except ValueError:
            return validation_error_response("start_date must be a valid date in YYYY-MM-DD format", details={"field": "start_date"})

        # Validate end_date
        end_date_raw = payload.get('end_date')
        if not end_date_raw or not isinstance(end_date_raw, str):
            return validation_error_response("end_date is required in YYYY-MM-DD format", details={"field": "end_date"})
        try:
            dt_end = datetime.strptime(end_date_raw.strip(), '%Y-%m-%d').date()
        except ValueError:
            return validation_error_response("end_date must be a valid date in YYYY-MM-DD format", details={"field": "end_date"})

        # Validate date range
        if dt_start > dt_end:
            return validation_error_response(
                "start_date cannot be later than end_date",
                details={"start_date": start_date_raw, "end_date": end_date_raw}
            )

        remarks = str(payload.get('remarks', '')).strip()
        duration_days = (dt_end - dt_start).days + 1

        # Phase 13: Advisory AI Anomaly Evaluation (Non-blocking with fallback)
        ai_eval = evaluate_leave_anomaly(
            employee_id=employee.id,
            leave_type=leave_type,
            start_date=dt_start,
            end_date=dt_end,
            duration_days=duration_days,
            remarks=remarks
        )

        create_vals = {
            'employee_id': employee.id,
            'leave_type': leave_type,
            'start_date': dt_start,
            'end_date': dt_end,
            'remarks': remarks,
            'status': 'pending',  # Initial status strictly forced to 'pending'
            # AI Anomaly Fields
            'ai_is_anomaly': ai_eval.get('is_anomaly', False),
            'ai_score': ai_eval.get('score', 0.0),
            'ai_risk_level': ai_eval.get('risk_level', 'low'),
            'ai_reasons': ai_eval.get('reasons', ''),
            'ai_evaluation_status': ai_eval.get('evaluation_status', 'fallback')
        }

        leave_rec = request.env['dayflow.leave'].sudo().create(create_vals)
        return api_response(format_leave_data(leave_rec), status=201)

    @http.route('/api/v1/leave', type='http', auth='public', methods=['GET'], csrf=False)
    @handle_api_exceptions
    def list_leave(self, **kwargs):
        """
        Retrieves paginated leave history for the authenticated employee.
        """
        user = get_authenticated_user()
        if not user:
            return unauthorized_response("Authentication required")

        employee = get_user_employee(user)
        if not employee or not employee.exists():
            return paginated_response([], page=1, page_size=20, total=0, status=200)

        page, page_size, offset, error_res = parse_pagination_params()
        if error_res:
            return error_res

        domain = [('employee_id', '=', employee.id)]

        # Optional status filter
        req_args = request.httprequest.args if request and hasattr(request, 'httprequest') else {}
        status_filter = req_args.get('status')
        if status_filter:
            status_clean = str(status_filter).strip().lower()
            if status_clean in VALID_LEAVE_STATUSES:
                domain.append(('status', '=', status_clean))

        total_count = request.env['dayflow.leave'].sudo().search_count(domain)
        records = request.env['dayflow.leave'].sudo().search(
            domain,
            offset=offset,
            limit=page_size,
            order='create_date desc, id desc'
        )

        data = [format_leave_data(r) for r in records]
        return paginated_response(data, page=page, page_size=page_size, total=total_count, status=200)

    @http.route('/api/v1/admin/leave', type='http', auth='public', methods=['GET'], csrf=False)
    @handle_api_exceptions
    def admin_list_leave(self, **kwargs):
        """
        Retrieves paginated leave requests across all employees for HR Officers and Administrators.
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

        status_filter = req_args.get('status')
        if status_filter:
            status_clean = str(status_filter).strip().lower()
            if status_clean in VALID_LEAVE_STATUSES:
                domain.append(('status', '=', status_clean))

        emp_id_raw = req_args.get('employee_id')
        if emp_id_raw:
            try:
                emp_id = int(emp_id_raw)
                domain.append(('employee_id', '=', emp_id))
            except (ValueError, TypeError):
                pass

        total_count = request.env['dayflow.leave'].sudo().search_count(domain)
        records = request.env['dayflow.leave'].sudo().search(
            domain,
            offset=offset,
            limit=page_size,
            order='create_date desc, id desc'
        )

        data = [format_leave_data(r) for r in records]
        return paginated_response(data, page=page, page_size=page_size, total=total_count, status=200)

    @http.route('/api/v1/leave/<int:leave_id>', type='http', auth='public', methods=['GET'], csrf=False)
    @handle_api_exceptions
    def get_leave(self, leave_id, **kwargs):
        """
        Retrieves a single leave request by ID.
        Allowed for HR Officers/Admins or the owning employee.
        """
        user = get_authenticated_user()
        if not user:
            return unauthorized_response("Authentication required")

        leave_rec = request.env['dayflow.leave'].sudo().browse(leave_id)
        if not leave_rec.exists():
            return not_found_response("Leave request not found")

        # Authorization: HR/Admin or Record Owner
        if not is_hr_authorized(user):
            employee = get_user_employee(user)
            if not employee or leave_rec.employee_id.id != employee.id:
                return forbidden_response("Permission denied to access this leave request")

        return api_response(format_leave_data(leave_rec), status=200)

    @http.route('/api/v1/leave/<int:leave_id>/approve', type='http', auth='public', methods=['POST'], csrf=False)
    @handle_api_exceptions
    def approve_leave(self, leave_id, **kwargs):
        """
        Approves a pending leave request (pending -> approved) and sends in-app alert.
        Restricted to HR Officers and Administrators.
        """
        user = get_authenticated_user()
        if not user:
            return unauthorized_response("Authentication required")

        if not is_hr_authorized(user):
            return forbidden_response("HR Officer or Administrator role required")

        leave_rec = request.env['dayflow.leave'].sudo().browse(leave_id)
        if not leave_rec.exists():
            return not_found_response("Leave request not found")

        if leave_rec.status != 'pending':
            return conflict_response(
                f"Leave request cannot be approved because current status is '{leave_rec.status}'",
                details={"current_status": leave_rec.status, "required_status": "pending"}
            )

        comment = ""
        try:
            if request.httprequest.data:
                payload = json.loads(request.httprequest.data.decode('utf-8'))
                if isinstance(payload, dict):
                    comment = payload.get('comment') or payload.get('approver_comments') or ""
        except Exception:
            pass

        update_vals = {'status': 'approved'}
        if comment:
            update_vals['approver_comments'] = str(comment).strip()

        leave_rec.sudo().write(update_vals)

        # Trigger in-app notification for employee
        if leave_rec.employee_id and leave_rec.employee_id.user_id:
            create_user_notification(
                env=request.env,
                user_id=leave_rec.employee_id.user_id.id,
                title="Leave Request Approved",
                message=f"Your leave request for {leave_rec.start_date} to {leave_rec.end_date} ({leave_rec.leave_type}) has been approved.",
                notification_type='success',
                res_model='dayflow.leave',
                res_id=leave_rec.id
            )

        return api_response(format_leave_data(leave_rec), status=200)

    @http.route('/api/v1/leave/<int:leave_id>/reject', type='http', auth='public', methods=['POST'], csrf=False)
    @handle_api_exceptions
    def reject_leave(self, leave_id, **kwargs):
        """
        Rejects a pending leave request (pending -> rejected) and sends in-app alert.
        Restricted to HR Officers and Administrators.
        """
        user = get_authenticated_user()
        if not user:
            return unauthorized_response("Authentication required")

        if not is_hr_authorized(user):
            return forbidden_response("HR Officer or Administrator role required")

        leave_rec = request.env['dayflow.leave'].sudo().browse(leave_id)
        if not leave_rec.exists():
            return not_found_response("Leave request not found")

        if leave_rec.status != 'pending':
            return conflict_response(
                f"Leave request cannot be rejected because current status is '{leave_rec.status}'",
                details={"current_status": leave_rec.status, "required_status": "pending"}
            )

        comment = ""
        try:
            if request.httprequest.data:
                payload = json.loads(request.httprequest.data.decode('utf-8'))
                if isinstance(payload, dict):
                    comment = payload.get('comment') or payload.get('approver_comments') or ""
        except Exception:
            pass

        update_vals = {'status': 'rejected'}
        if comment:
            update_vals['approver_comments'] = str(comment).strip()

        leave_rec.sudo().write(update_vals)

        # Trigger in-app notification for employee
        if leave_rec.employee_id and leave_rec.employee_id.user_id:
            create_user_notification(
                env=request.env,
                user_id=leave_rec.employee_id.user_id.id,
                title="Leave Request Rejected",
                message=f"Your leave request for {leave_rec.start_date} to {leave_rec.end_date} ({leave_rec.leave_type}) has been rejected.",
                notification_type='warning',
                res_model='dayflow.leave',
                res_id=leave_rec.id
            )

        return api_response(format_leave_data(leave_rec), status=200)
