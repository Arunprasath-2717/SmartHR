# -*- coding: utf-8 -*-
"""
Analytics & Reports Tests for Dayflow API.
Tests GET /api/v1/reports/attendance, /payroll, and /analytics/overview according to Phase 15 requirements.
"""
import json
import unittest
from datetime import datetime
from tests.test_helpers import reports_mod, set_request, MockUser, MockEmployee, MockAttendance, MockEnv
from unittest.mock import MagicMock

class TestReportsEndpoints(unittest.TestCase):

    def setUp(self):
        self.ctrl = reports_mod.DayflowReportsController()
        self.emp_user = MockUser(id=101, name="Alice Employee", login="alice@company.com", role="employee")
        self.emp = MockEmployee(id=501, name="Alice Employee", user=self.emp_user)
        self.emp_user.employee_id = self.emp

    def test_attendance_report_employee(self):
        """REP-001: Employee generates own attendance report"""
        att_rec = MockAttendance(
            id=1,
            employee=self.emp,
            check_in=datetime(2026, 8, 1, 9, 0, 0),
            check_out=datetime(2026, 8, 1, 17, 30, 0),
            worked_hours=8.5
        )

        mock_req = MagicMock()
        mock_req.session.uid = 101
        mock_req.env = MockEnv(user=self.emp_user)
        mock_req.httprequest.args = {}
        mock_req.env['hr.attendance'].search.return_value = [att_rec]
        set_request(mock_req)

        res = self.ctrl.get_attendance_report()
        self.assertEqual(res.status, 200)
        data = json.loads(res.output)["data"]
        self.assertEqual(data["total_records"], 1)
        self.assertEqual(data["total_worked_hours"], 8.5)

    def test_analytics_overview_hr_vs_employee(self):
        """REP-006: HR accesses analytics overview (200); employee is blocked (403)"""
        # Employee
        mock_req_emp = MagicMock()
        mock_req_emp.session.uid = 101
        mock_req_emp.env = MockEnv(user=self.emp_user)
        set_request(mock_req_emp)

        res_emp = self.ctrl.get_analytics_overview()
        self.assertEqual(res_emp.status, 403)

        # HR Officer
        hr_user = MockUser(id=102, name="Bob HR", login="bob@company.com", role="hr_officer")
        mock_req_hr = MagicMock()
        mock_req_hr.session.uid = 102
        mock_req_hr.env = MockEnv(user=hr_user)
        mock_req_hr.env['hr.employee'].search_count.return_value = 10
        mock_req_hr.env['hr.department'].search_count.return_value = 2
        mock_req_hr.env['hr.attendance'].search_count.return_value = 6
        mock_req_hr.env['dayflow.leave'].search_count.return_value = 2
        mock_req_hr.env['dayflow.payroll'].search.return_value = []
        set_request(mock_req_hr)

        res_hr = self.ctrl.get_analytics_overview()
        self.assertEqual(res_hr.status, 200)
        data = json.loads(res_hr.output)["data"]
        self.assertEqual(data["workforce"]["total_active_employees"], 10)
        self.assertEqual(data["workforce"]["total_departments"], 2)
        self.assertEqual(data["attendance"]["currently_checked_in"], 6)

if __name__ == "__main__":
    unittest.main()
