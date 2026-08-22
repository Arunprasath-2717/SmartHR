# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request
from .common import (
    api_response,
    unauthorized_response,
    forbidden_response,
    handle_api_exceptions,
)


def resolve_user_role(user):
    """
    Resolves the highest Dayflow role for a given user.
    Role hierarchy: administrator > hr_officer > employee
    """
    if not user or user._is_public():
        return "public"

    # Administrator check (Dayflow Admin group or system superuser)
    if user._is_admin() or user.has_group('dayflow_core.group_dayflow_admin') or user.has_group('base.group_system'):
        return "administrator"

    # HR Officer check
    if user.has_group('dayflow_core.group_dayflow_hr_officer'):
        return "hr_officer"

    # Standard Employee check (Internal User)
    if user.has_group('dayflow_core.group_dayflow_employee') or user.has_group('base.group_user'):
        return "employee"

    return "public"


def get_authenticated_user():
    """
    Retrieves the currently authenticated user from the active session.
    Returns None if unauthenticated or public.
    """
    if not request.session.uid:
        return None

    user = request.env.user
    if not user or user._is_public():
        return None

    return user


class DayflowAuthController(http.Controller):

    @http.route('/api/v1/me', type='http', auth='public', methods=['GET'], csrf=False)
    @handle_api_exceptions
    def me(self, **kwargs):
        """
        Retrieves the authenticated user's profile and resolved role.
        Returns 401 Unauthorized if no active authenticated session exists.
        """
        user = get_authenticated_user()
        if not user:
            return unauthorized_response("Authentication required")

        role = resolve_user_role(user)

        payload = {
            "id": user.id,
            "name": user.name or "",
            "email": user.login or user.email or "",
            "role": role
        }
        return api_response(payload, status=200)

    @http.route('/api/v1/session', type='http', auth='public', methods=['GET'], csrf=False)
    @handle_api_exceptions
    def session_state(self, **kwargs):
        """
        Retrieves the current authentication session state.
        Returns 401 Unauthorized if no active authenticated session exists.
        """
        user = get_authenticated_user()
        if not user:
            return unauthorized_response("Authentication required")

        role = resolve_user_role(user)

        payload = {
            "authenticated": True,
            "user_id": user.id,
            "role": role
        }
        return api_response(payload, status=200)
