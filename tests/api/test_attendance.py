# -*- coding: utf-8 -*-
"""
Attendance Management Tests for Dayflow API.
Tests check-in, check-out, status, and history according to Phase 9 requirements.
"""
import json
import unittest
from datetime import datetime
from tests.test_helpers import att_mod, set_request, MockUser, MockEmployee, MockAttendance
from unittest.mock import MagicMock

class TestAttendanceEndpoints(unittest.TestCase):

    def setUp(self):
        self.ctrl = att_mod.DayflowAttendanceController()
        self.user = MockUser(id=101, name="Alice Employee", login="alice@company.com", role="employee")
        self.emp = MockEmployee(id=501, name="Alice Employee", work_email="alice@company.com", user=self.user)
        self.user.employee_id = self.emp

    def test_check_in_and_duplicate(self):
        """ATT-001 & ATT-002: Check-in succeeds with 201; subsequent check-in fails with 409 Conflict"""
        mock_att = MockAttendance(id=1, employee=self.emp, check_in=datetime(2026, 8, 22, 9, 0, 0))

        mock_req = MagicMock()
        mock_req.session.uid = 101
        mock_req.env.user = self.user
        mock_req.env['hr.attendance'].sudo().search.return_value = []
        mock_req.env['hr.attendance'].sudo().create.return_value = mock_att
        set_request(mock_req)

        res1 = self.ctrl.check_in()
        self.assertEqual(res1.status, 201)
        data1 = json.loads(res1.output)["data"]
        self.assertEqual(data1["employee_id"], 501)
        self.assertEqual(data1["employee_name"], "Alice Employee")

        # Second check-in: active record exists
        mock_req.env['hr.attendance'].sudo().search.return_value = [mock_att]
        res2 = self.ctrl.check_in()
        self.assertEqual(res2.status, 409)
        self.assertEqual(json.loads(res2.output)["error"]["code"], "conflict")

    def test_check_out(self):
        """ATT-004 & ATT-005: Check-out succeeds with 200; check-out without check-in fails with 400"""
        mock_att = MockAttendance(id=1, employee=self.emp, check_in=datetime(2026, 8, 22, 9, 0, 0), check_out=datetime(2026, 8, 22, 17, 0, 0), worked_hours=8.0)

        mock_req = MagicMock()
        mock_req.session.uid = 101
        mock_req.env.user = self.user
        mock_req.env['hr.attendance'].sudo().search.return_value = [mock_att]
        set_request(mock_req)

        res = self.ctrl.check_out()
        self.assertEqual(res.status, 200)
        data = json.loads(res.output)["data"]
        self.assertEqual(data["worked_hours"], 8.0)

        # No active record -> 400 Bad Request
        mock_req.env['hr.attendance'].sudo().search.return_value = []
        res_no = self.ctrl.check_out()
        self.assertEqual(res_no.status, 400)

if __name__ == "__main__":
    unittest.main()
