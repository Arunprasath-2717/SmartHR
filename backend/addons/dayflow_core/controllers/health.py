# -*- coding: utf-8 -*-
from odoo import http
from .common import api_response, handle_api_exceptions


class DayflowHealthController(http.Controller):

    @http.route('/api/v1/health', type='http', auth='public', methods=['GET'], csrf=False)
    @handle_api_exceptions
    def health(self, **kwargs):
        """
        Health check endpoint for Dayflow API.
        Returns the operational status, service name, and API version.
        """
        return api_response({
            "status": "healthy",
            "service": "dayflow-api",
            "version": "v1"
        }, status=200)
