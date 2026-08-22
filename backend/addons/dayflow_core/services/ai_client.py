# -*- coding: utf-8 -*-
import os
import json
import logging
import urllib.request
import urllib.error

_logger = logging.getLogger(__name__)

DEFAULT_AI_SERVICE_URL = "http://localhost:8080"
DEFAULT_AI_SERVICE_TIMEOUT = 2.0


def get_ai_service_url():
    """
    Retrieves the internal URL of the Go AI Service.
    """
    return os.getenv("AI_SERVICE_URL", DEFAULT_AI_SERVICE_URL).rstrip('/')


def get_ai_service_timeout():
    """
    Retrieves the maximum HTTP timeout in seconds for AI evaluation calls.
    """
    try:
        return float(os.getenv("AI_SERVICE_TIMEOUT", DEFAULT_AI_SERVICE_TIMEOUT))
    except (ValueError, TypeError):
        return DEFAULT_AI_SERVICE_TIMEOUT


def get_fallback_result(reason="AI evaluation unavailable - default fallback applied"):
    """
    Generates a deterministic fallback response when the AI service is unreachable or errors.
    """
    return {
        "is_anomaly": False,
        "score": 0.0,
        "risk_level": "low",
        "reasons": reason,
        "evaluation_status": "fallback",
        "engine": "fallback"
    }


def evaluate_leave_anomaly(employee_id, leave_type, start_date, end_date, duration_days=None, remarks=""):
    """
    Calls the Go AI Service to evaluate a leave request for anomalous patterns.
    Enforces a finite timeout and returns a deterministic fallback upon any failure.
    AI failure NEVER blocks leave submission.
    """
    if duration_days is None:
        try:
            if hasattr(start_date, 'strftime') and hasattr(end_date, 'strftime'):
                duration_days = (end_date - start_date).days + 1
            else:
                duration_days = 1
        except Exception:
            duration_days = 1

    payload = {
        "employee_id": employee_id,
        "leave_type": str(leave_type or "").lower(),
        "start_date": str(start_date or ""),
        "end_date": str(end_date or ""),
        "duration_days": int(duration_days),
        "remarks": str(remarks or "")
    }

    url = f"{get_ai_service_url()}/anomaly/score"
    timeout = get_ai_service_timeout()

    try:
        req_data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            url,
            data=req_data,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )

        with urllib.request.urlopen(req, timeout=timeout) as response:
            if response.status == 200:
                body = response.read().decode('utf-8')
                data = json.loads(body)
                reasons_list = data.get('reasons', [])
                reasons_str = "; ".join(reasons_list) if isinstance(reasons_list, list) else str(reasons_list)

                return {
                    "is_anomaly": bool(data.get('is_anomaly', False)),
                    "score": float(data.get('score', 0.0)),
                    "risk_level": str(data.get('risk_level', 'low')),
                    "reasons": reasons_str,
                    "evaluation_status": "evaluated",
                    "engine": str(data.get('engine', 'rule-based-v1'))
                }
            else:
                _logger.warning("AI Service returned non-200 status code: %s", response.status)
                return get_fallback_result(f"AI Service returned HTTP status {response.status}")

    except urllib.error.URLError as e:
        _logger.warning("AI Service communication error: %s", e)
        return get_fallback_result(f"AI Service unreachable: {e.reason if hasattr(e, 'reason') else str(e)}")
    except Exception as e:
        _logger.warning("Unexpected error during AI evaluation: %s", e)
        return get_fallback_result(f"AI evaluation error: {str(e)}")
