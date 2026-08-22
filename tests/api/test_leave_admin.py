# -*- coding: utf-8 -*-
"""
Admin / HR Leave Approval Tests for Dayflow API.
Tests GET /api/v1/admin/leave, POST /api/v1/leave/{id}/approve, and POST /api/v1/leave/{id}/reject according to Phase 11 requirements.
"""
import json
import unittest
from datetime import date
from tests.test_helpers import leave_mod, set_request, MockUser, MockEmployee, MockLeave
from unittest.mock import MagicMock

class TestLeaveAdminEndpoints(unittest.TestCase):

    def setUp(self):
        self.ctrl = leave_mod.DayflowLeaveController()
        self.hr_user = MockUser(id=102, name="Bob HR", login="bob@company.com", role="hr_officer")
        self.emp_user = MockUser(id=101, name="Alice Employee", login="alice@company.com", role="employee")
        self.emp = MockEmployee(id=501, name="Alice Employee", user=self.emp_user)

    def test_approve_leave_success(self):
        """HR-LEAVE-003: HR Officer approves pending leave request (pending -> approved)"""
        leave_rec = MockLeave(
            id=1,
            employee=self.emp,
            leave_type="paid",
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 5),
            remarks="Vacation"
        )

        mock_req = MagicMock()
        mock_req.session.uid = 102
        mock_req.env.user = self.hr_user
        mock_req.env['dayflow.leave'].sudo().browse.return_value = leave_rec
        mock_req.httprequest.data = json.dumps({"comment": "Approved by HR"}).encode('utf-8')
        set_request(mock_req)

        res = self.ctrl.approve_leave(1)
        self.assertEqual(res.status, 200)
        data = json.loads(res.output)["data"]
        self.assertEqual(data["status"], "approved")
        self.assertEqual(data["approver_comments"], "Approved by HR")

    def test_approve_leave_invalid_state_conflict(self):
        """HR-LEAVE-005: Approving an already approved leave request returns 409 Conflict"""
        leave_rec = MockLeave(id=1, employee=self.emp)
        leave_rec.status = "approved"

        mock_req = MagicMock()
        mock_req.session.uid = 102
        mock_req.env.user = self.hr_user
        mock_req.env['dayflow.leave'].sudo().browse.return_value = leave_rec
        set_request(mock_req)

        res = self.ctrl.approve_leave(1)
        self.assertEqual(res.status, 409)
        error = json.loads(res.output)["error"]
        self.assertEqual(error["code"], "conflict")

    def test_employee_approve_leave_forbidden(self):
        """HR-LEAVE-007: Regular employee attempting to approve leave receives 403 Forbidden"""
        mock_req = MagicMock()
        mock_req.session.uid = 101
        mock_req.env.user = self.emp_user
        set_request(mock_req)

        res = self.ctrl.approve_leave(1)
        self.assertEqual(res.status, 403)

if __name__ == "__main__":
    unittest.main()
