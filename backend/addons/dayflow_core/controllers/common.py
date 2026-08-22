# -*- coding: utf-8 -*-
import functools
import json
import logging
import math
from odoo.http import Response, request

_logger = logging.getLogger(__name__)


def api_response(data, status=200):
    """
    Constructs a standard single-resource or plain data API success response.
    Format: {"data": <data>}
    """
    payload = {"data": data}
    return Response(
        json.dumps(payload),
        status=status,
        headers=[('Content-Type', 'application/json')]
    )


def paginated_response(data, page, page_size, total, status=200):
    """
    Constructs a standard paginated collection API response.
    Format:
    {
      "data": [...],
      "pagination": {
        "page": 1,
        "page_size": 20,
        "total": 100,
        "total_pages": 5
      }
    }
    """
    safe_page_size = max(1, page_size) if page_size else 20
    safe_page = max(1, page) if page else 1
    total_count = max(0, total) if total else 0
    total_pages = max(1, math.ceil(total_count / safe_page_size)) if total_count > 0 else 1

    payload = {
        "data": data,
        "pagination": {
            "page": safe_page,
            "page_size": safe_page_size,
            "total": total_count,
            "total_pages": total_pages
        }
    }
    return Response(
        json.dumps(payload),
        status=status,
        headers=[('Content-Type', 'application/json')]
    )


def api_error_response(code, message, status=400, details=None):
    """
    Constructs a standard API error response.
    Format:
    {
      "error": {
        "code": "<ERROR_CODE>",
        "message": "<Description>",
        "details": {...}  # optional
      }
    }
    """
    error_obj = {
        "code": code,
        "message": message
    }
    if details is not None:
        error_obj["details"] = details

    payload = {"error": error_obj}
    return Response(
        json.dumps(payload),
        status=status,
        headers=[('Content-Type', 'application/json')]
    )


def bad_request_response(message="Bad request", details=None):
    """Returns 400 Bad Request error."""
    return api_error_response("bad_request", message, status=400, details=details)


def unauthorized_response(message="Authentication required"):
    """Returns 401 Unauthorized error."""
    return api_error_response("unauthorized", message, status=401)


def forbidden_response(message="Permission denied"):
    """Returns 403 Forbidden error."""
    return api_error_response("forbidden", message, status=403)


def not_found_response(message="Resource not found"):
    """Returns 404 Not Found error."""
    return api_error_response("not_found", message, status=404)


def conflict_response(message="Conflict", details=None):
    """Returns 409 Conflict error."""
    return api_error_response("conflict", message, status=409, details=details)


def validation_error_response(message="Validation error", details=None):
    """Returns 422 Unprocessable Entity error."""
    return api_error_response("validation_error", message, status=422, details=details)


def internal_error_response(message="An internal server error occurred"):
    """Returns 500 Internal Server Error without leaking internal tracebacks."""
    return api_error_response("internal_error", message, status=500)


def parse_pagination_params(params=None, default_page=1, default_page_size=20, max_page_size=100):
    """
    Parses and validates query parameters for pagination.
    Returns a tuple of (page, page_size, offset, error_response).
    If validation fails, returns (None, None, None, error_response).
    """
    if params is None:
        if request and hasattr(request, 'httprequest') and hasattr(request.httprequest, 'args'):
            params = request.httprequest.args
        else:
            params = {}

    page_raw = params.get('page', default_page)
    page_size_raw = params.get('page_size') or params.get('limit') or default_page_size

    try:
        page = int(page_raw)
        if page < 1:
            return None, None, None, validation_error_response("Page parameter must be a positive integer greater than or equal to 1.")
    except (ValueError, TypeError):
        return None, None, None, validation_error_response("Page parameter must be an integer.")

    try:
        page_size = int(page_size_raw)
        if page_size < 1:
            return None, None, None, validation_error_response("Page size parameter must be a positive integer greater than or equal to 1.")
    except (ValueError, TypeError):
        return None, None, None, validation_error_response("Page size parameter must be an integer.")

    # Bound page size to maximum permitted
    page_size = min(max_page_size, page_size)
    offset = (page - 1) * page_size

    return page, page_size, offset, None


def handle_api_exceptions(func):
    """
    Decorator to intercept uncaught controller exceptions, log them server-side,
    and return safe, structured HTTP 500 responses without leaking internals.
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as exc:
            _logger.exception("Unhandled API exception in %s: %s", func.__name__, exc)
            return internal_error_response("An internal server error occurred")
    return wrapper
