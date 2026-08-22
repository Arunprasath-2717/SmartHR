# -*- coding: utf-8 -*-
import logging
import httpx
from typing import Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

class AIServiceClient:
    def __init__(self, base_url: str = None, timeout: float = None):
        self.base_url = base_url or settings.AI_SERVICE_URL
        self.timeout = timeout or settings.AI_SERVICE_TIMEOUT_SECONDS

    def score_leave_anomaly(
        self,
        leave_id: int,
        employee_id: int,
        leave_type: str,
        start_date: str,
        end_date: str,
        duration_days: int,
        remarks: str = ""
    ) -> Dict[str, Any]:
        """
        Submits leave request data to the Go AI microservice for heuristic scoring.
        Implements a non-blocking timeout fallback if the AI microservice is unreachable.
        """
        payload = {
            "leave_id": leave_id,
            "employee_id": employee_id,
            "leave_type": leave_type,
            "start_date": str(start_date),
            "end_date": str(end_date),
            "duration_days": int(duration_days),
            "remarks": remarks or ""
        }

        url = f"{self.base_url.rstrip('/')}/anomaly/score"

        try:
            with httpx.Client(timeout=self.timeout) as client:
                response = client.post(url, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    reasons = data.get("reasons", [])
                    reasons_str = "; ".join(reasons) if isinstance(reasons, list) else str(reasons)
                    return {
                        "is_anomaly": bool(data.get("is_anomaly", False)),
                        "score": float(data.get("score", 0.0)),
                        "risk_level": str(data.get("risk_level", "low")),
                        "reasons": reasons_str,
                        "evaluation_status": "evaluated"
                    }
                else:
                    logger.warning("AI Service returned HTTP %s: %s", response.status_code, response.text)
        except httpx.TimeoutException:
            logger.warning("AI Service request timed out after %ss, applying safe fallback", self.timeout)
        except Exception as e:
            logger.warning("AI Service communication failed (%s), applying safe fallback", str(e))

        # Safe non-blocking fallback
        return {
            "is_anomaly": False,
            "score": 0.0,
            "risk_level": "low",
            "reasons": "AI evaluation bypassed due to service timeout or unreachable microservice",
            "evaluation_status": "fallback"
        }

ai_client = AIServiceClient()
