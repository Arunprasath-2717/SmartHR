# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request
from .auth import get_authenticated_user
from .common import (
    api_response,
    paginated_response,
    unauthorized_response,
    forbidden_response,
    not_found_response,
    parse_pagination_params,
    handle_api_exceptions,
)


def create_user_notification(env, user_id, title, message, notification_type='info', res_model=None, res_id=None):
    """
    Creates an in-app notification record for a specific user.
    """
    if not user_id or not title or not message:
        return None

    vals = {
        'user_id': user_id,
        'title': str(title).strip(),
        'message': str(message).strip(),
        'notification_type': notification_type if notification_type in ('info', 'success', 'warning', 'danger') else 'info',
        'is_read': False,
        'res_model': res_model,
        'res_id': res_id
    }
    return env['dayflow.notification'].sudo().create(vals)


def format_notification_data(notif):
    """
    Serializes a dayflow.notification record into a clean dictionary.
    """
    if not notif:
        return None

    rec = notif[0] if isinstance(notif, (list, tuple)) else notif
    if hasattr(rec, 'exists') and not rec.exists():
        return None

    created_at = rec.create_date.strftime('%Y-%m-%d %H:%M:%S') if hasattr(rec, 'create_date') and rec.create_date else ""

    return {
        "id": rec.id,
        "user_id": rec.user_id.id if rec.user_id else None,
        "title": rec.title or "",
        "message": rec.message or "",
        "notification_type": rec.notification_type or "info",
        "is_read": bool(rec.is_read),
        "res_model": rec.res_model or "",
        "res_id": rec.res_id or None,
        "created_at": created_at
    }


class DayflowNotificationController(http.Controller):

    @http.route('/api/v1/notifications', type='http', auth='public', methods=['GET'], csrf=False)
    @handle_api_exceptions
    def list_notifications(self, **kwargs):
        """
        Retrieves paginated in-app notifications for the authenticated user.
        """
        user = get_authenticated_user()
        if not user:
            return unauthorized_response("Authentication required")

        page, page_size, offset, error_res = parse_pagination_params()
        if error_res:
            return error_res

        domain = [('user_id', '=', user.id)]

        req_args = request.httprequest.args if request and hasattr(request, 'httprequest') else {}
        is_read_param = req_args.get('is_read')
        if is_read_param is not None:
            if str(is_read_param).lower() in ('true', '1'):
                domain.append(('is_read', '=', True))
            elif str(is_read_param).lower() in ('false', '0'):
                domain.append(('is_read', '=', False))

        total_count = request.env['dayflow.notification'].sudo().search_count(domain)
        records = request.env['dayflow.notification'].sudo().search(
            domain,
            offset=offset,
            limit=page_size,
            order='create_date desc, id desc'
        )

        data = [format_notification_data(r) for r in records]
        return paginated_response(data, page=page, page_size=page_size, total=total_count, status=200)

    @http.route('/api/v1/notifications/<int:notification_id>/read', type='http', auth='public', methods=['PATCH'], csrf=False)
    @handle_api_exceptions
    def mark_notification_read(self, notification_id, **kwargs):
        """
        Marks a specific notification as read.
        """
        user = get_authenticated_user()
        if not user:
            return unauthorized_response("Authentication required")

        notif_rec = request.env['dayflow.notification'].sudo().browse(notification_id)
        if not notif_rec.exists():
            return not_found_response("Notification not found")

        # Recipient ownership check
        if notif_rec.user_id.id != user.id:
            return forbidden_response("Permission denied to access this notification")

        notif_rec.sudo().write({'is_read': True})
        return api_response(format_notification_data(notif_rec), status=200)

    @http.route('/api/v1/notifications/read-all', type='http', auth='public', methods=['POST'], csrf=False)
    @handle_api_exceptions
    def mark_all_notifications_read(self, **kwargs):
        """
        Marks all unread notifications for the authenticated user as read.
        """
        user = get_authenticated_user()
        if not user:
            return unauthorized_response("Authentication required")

        domain = [('user_id', '=', user.id), ('is_read', '=', False)]
        unread_records = request.env['dayflow.notification'].sudo().search(domain)
        if unread_records:
            unread_records.sudo().write({'is_read': True})

        return api_response({"message": f"Marked {len(unread_records)} notifications as read"}, status=200)
