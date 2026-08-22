# -*- coding: utf-8 -*-
"""
Employee Leave Management Tests for Dayflow API.
Tests POST /api/v1/leave, GET /api/v1/leave, and GET /api/v1/leave/{id} according to Phase 10 requirements.
"""
import json
import unittest
from datetime import date
from tests.test_helpers import leave_mod, set_request, MockUser, MockEmployee, MockLeave
from unittest.mock import MagicMock, patch

class TestLeaveEndpoints(unittest.TestCase):

    def setUp(self):
        self.ctrl = leave_mod.DayflowLeaveController()
        self.user = MockUser(id=101, name="Alice Employee", login="alice@company.com", role="employee")
        self.emp = MockEmployee(id=501, name="Alice Employee", work_email="alice@company.com", user=self.user)
        self.user.employee_id = self.emp

    def test_create_leave_success_pending(self):
        """LEAVE-002 & LEAVE-005: Create leave succeeds with status 'pending' (201 Created)"""
        leave_rec = MockLeave(
            id=1,
            employee=self.emp,
            leave_type="paid",
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 5),
            remarks="Family vacation"
        )

        mock_req = MagicMock()
        mock_req.session.uid = 101
        mock_req.env.user = self.user
        mock_req.httprequest.data = json.dumps({
            "leave_type": "paid",
            "start_date": "2026-09-01",
            "end_date": "2026-09-05",
            "remarks": "Family vacation"
        }).encode('utf-8')
        mock_req.env['dayflow.leave'].sudo().create.return_value = leave_rec
        set_request(mock_req)

        with patch.object(leave_mod, 'evaluate_leave_anomaly') as mock_eval:
            mock_eval.return_value = {"is_anomaly": False, "score": 0.0, "risk_level": "low", "reasons": "", "evaluation_status": "evaluated"}
            res = self.ctrl.create_leave()
            self.assertEqual(res.status, 201)
            data = json.loads(res.output)["data"]
            self.assertEqual(data["status"], "pending")
            self.assertEqual(data["leave_type"], "paid")

    def test_create_leave_invalid_dates_rejected(self):
        """LEAVE-007: start_date > end_date rejected with 422 Validation Error"""
        mock_req = MagicMock()
        mock_req.session.uid = 101
        mock_req.env.user = self.user
        mock_req.httprequest.data = json.dumps({
            "leave_type": "paid",
            "start_date": "2026-09-10",
            "end_date": "2026-09-05"
        }).encode('utf-8')
        set_request(mock_req)

        res = self.ctrl.create_leave()
        self.assertEqual(res.status, 422)
        error = json.loads(res.output)["error"]
        self.assertEqual(error["code"], "validation_error")

    def test_leave_ownership_isolation(self):
        """LEAVE-009: Employee A cannot access Employee B's leave request (403 Forbidden)"""
        user_b = MockUser(id=102, name="Charlie", login="charlie@company.com", role="employee")
        emp_b = MockEmployee(id=502, name="Charlie", user=user_b)
        leave_b = MockLeave(id=2, employee=emp_b)

        mock_req = MagicMock()
        mock_req.session.uid = 101
        mock_req.env.user = self.user
        mock_req.env['dayflow.leave'].sudo().browse.return_value = leave_b
        set_request(mock_req)

        res = self.ctrl.get_leave(2)
        self.assertEqual(res.status, 403)

if __name__ == "__main__":
    unittest.main()
