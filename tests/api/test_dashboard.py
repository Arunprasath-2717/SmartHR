# -*- coding: utf-8 -*-
"""
Dashboard Aggregation Tests for Dayflow API.
Tests GET /api/v1/dashboard, /employee, and /admin according to Phase 13 requirements.
"""
import json
import unittest
from tests.test_helpers import dashboard_mod, set_request, MockUser, MockEmployee, MockPayroll, MockEnv
from unittest.mock import MagicMock

class TestDashboardEndpoints(unittest.TestCase):

    def setUp(self):
        self.ctrl = dashboard_mod.DayflowDashboardController()
        self.emp_user = MockUser(id=101, name="Alice Employee", login="alice@company.com", role="employee")
        self.emp = MockEmployee(id=501, name="Alice Employee", user=self.emp_user)
        self.emp_user.employee_id = self.emp
        self.payroll = MockPayroll(id=1, employee=self.emp)

    def test_employee_dashboard(self):
        """DASH-001: Employee dashboard aggregates profile, attendance, leaves, and payroll"""
        mock_req = MagicMock()
        mock_req.session.uid = 101
        mock_req.env = MockEnv(user=self.emp_user)
        mock_req.env['hr.employee'].search.return_value = self.emp
        mock_req.env['hr.attendance'].search.return_value = []
        mock_req.env['dayflow.leave'].search_count.return_value = 2
        mock_req.env['dayflow.leave'].search.return_value = []
        mock_req.env['dayflow.payroll'].search.return_value = [self.payroll]
        set_request(mock_req)

        res = self.ctrl.get_employee_dashboard()
        self.assertEqual(res.status, 200)
        data = json.loads(res.output)["data"]
        self.assertIn("profile", data)
        self.assertIn("attendance", data)
        self.assertIn("leave", data)
        self.assertIn("payroll", data)

    def test_admin_dashboard_employee_forbidden(self):
        """DASH-004: Regular employee blocked from GET /api/v1/dashboard/admin (403 Forbidden)"""
        mock_req = MagicMock()
        mock_req.session.uid = 101
        mock_req.env = MockEnv(user=self.emp_user)
        set_request(mock_req)

        res = self.ctrl.get_admin_dashboard()
        self.assertEqual(res.status, 403)

if __name__ == "__main__":
    unittest.main()
