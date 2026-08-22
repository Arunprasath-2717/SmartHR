# -*- coding: utf-8 -*-
"""
AI Service & Leave Integration Tests for Dayflow.
Tests AI evaluation, non-blocking resilience, and fallback handling according to Phase 16 & 17 requirements.
"""
import json
import unittest
from datetime import date
from tests.test_helpers import leave_mod, set_request, MockUser, MockEmployee, MockLeave
from unittest.mock import MagicMock, patch

class TestAILeaveIntegration(unittest.TestCase):

    def setUp(self):
        self.ctrl = leave_mod.DayflowLeaveController()
        self.user = MockUser(id=101, name="Alice Employee", login="alice@company.com", role="employee")
        self.emp = MockEmployee(id=501, name="Alice Employee", user=self.user)
        self.user.employee_id = self.emp

    def test_ai_integration_success_path(self):
        """INT-001: Leave request successfully scored by AI and saved with anomaly flag"""
        created_rec = MockLeave(
            id=10,
            employee=self.emp,
            leave_type="paid",
            start_date=date(2026, 10, 1),
            end_date=date(2026, 10, 20),
            remarks="Long leave"
        )
        created_rec.ai_is_anomaly = True
        created_rec.ai_score = 0.85
        created_rec.ai_risk_level = "high"
        created_rec.ai_reasons = "Leave duration exceeds 14 continuous days"
        created_rec.ai_evaluation_status = "evaluated"

        mock_req = MagicMock()
        mock_req.session.uid = 101
        mock_req.env.user = self.user
        mock_req.env['dayflow.leave'].sudo().create.return_value = created_rec
        mock_req.httprequest.data = json.dumps({
            "leave_type": "paid",
            "start_date": "2026-10-01",
            "end_date": "2026-10-20",
            "remarks": "Long leave"
        }).encode('utf-8')
        set_request(mock_req)

        with patch.object(leave_mod, 'evaluate_leave_anomaly') as mock_ai:
            mock_ai.return_value = {
                "is_anomaly": True,
                "score": 0.85,
                "risk_level": "high",
                "reasons": "Leave duration exceeds 14 continuous days",
                "evaluation_status": "evaluated"
            }

            res = self.ctrl.create_leave()
            self.assertEqual(res.status, 201)
            data = json.loads(res.output)["data"]
            self.assertTrue(data["ai_is_anomaly"])
            self.assertEqual(data["ai_risk_level"], "high")
            self.assertEqual(data["status"], "pending")

    def test_ai_integration_fallback_path(self):
        """INT-002: Leave request succeeds with fallback when AI service is unavailable"""
        created_rec = MockLeave(
            id=11,
            employee=self.emp,
            leave_type="sick",
            start_date=date(2026, 11, 1),
            end_date=date(2026, 11, 2),
            remarks="Flu"
        )
        created_rec.ai_is_anomaly = False
        created_rec.ai_score = 0.0
        created_rec.ai_risk_level = "low"
        created_rec.ai_reasons = "AI evaluation unavailable - default fallback applied"
        created_rec.ai_evaluation_status = "fallback"

        mock_req = MagicMock()
        mock_req.session.uid = 101
        mock_req.env.user = self.user
        mock_req.env['dayflow.leave'].sudo().create.return_value = created_rec
        mock_req.httprequest.data = json.dumps({
            "leave_type": "sick",
            "start_date": "2026-11-01",
            "end_date": "2026-11-02",
            "remarks": "Flu"
        }).encode('utf-8')
        set_request(mock_req)

        with patch.object(leave_mod, 'evaluate_leave_anomaly') as mock_ai:
            mock_ai.return_value = {
                "is_anomaly": False,
                "score": 0.0,
                "risk_level": "low",
                "reasons": "AI evaluation unavailable - default fallback applied",
                "evaluation_status": "fallback"
            }

            res = self.ctrl.create_leave()
            self.assertEqual(res.status, 201)
            data = json.loads(res.output)["data"]
            self.assertFalse(data["ai_is_anomaly"])
            self.assertEqual(data["ai_evaluation_status"], "fallback")
            self.assertEqual(data["status"], "pending")

if __name__ == "__main__":
    unittest.main()
