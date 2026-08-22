# -*- coding: utf-8 -*-
"""
Payroll Management Tests for Dayflow API.
Tests GET /api/v1/payroll/me, GET /api/v1/payroll, and PATCH /api/v1/payroll/{employee_id} according to Phase 12 requirements.
"""
import json
import unittest
from tests.test_helpers import payroll_mod, set_request, MockUser, MockEmployee, MockPayroll
from unittest.mock import MagicMock

class TestPayrollEndpoints(unittest.TestCase):

    def setUp(self):
        self.ctrl = payroll_mod.DayflowPayrollController()
        self.emp_user = MockUser(id=101, name="Alice Employee", login="alice@company.com", role="employee")
        self.hr_user = MockUser(id=102, name="Bob HR", login="bob@company.com", role="hr_officer")
        self.emp = MockEmployee(id=501, name="Alice Employee", user=self.emp_user)
        self.emp_user.employee_id = self.emp

    def test_get_own_payroll(self):
        """PAY-001: Employee views own salary structure (read-only)"""
        payroll_rec = MockPayroll(id=1, employee=self.emp, basic_salary=5000.0, allowances=1000.0, deductions=500.0)

        mock_req = MagicMock()
        mock_req.session.uid = 101
        mock_req.env.user = self.emp_user
        mock_req.env['dayflow.payroll'].sudo().search.return_value = payroll_rec
        set_request(mock_req)

        res = self.ctrl.get_own_payroll()
        self.assertEqual(res.status, 200)
        data = json.loads(res.output)["data"]
        self.assertEqual(data["basic_salary"], 5000.0)
        self.assertEqual(data["net_salary"], 5500.0)

    def test_employee_update_salary_forbidden(self):
        """PAY-003: Employee attempting to modify salary structure receives 403 Forbidden"""
        mock_req = MagicMock()
        mock_req.session.uid = 101
        mock_req.env.user = self.emp_user
        set_request(mock_req)

        res = self.ctrl.update_employee_salary(501)
        self.assertEqual(res.status, 403)

    def test_hr_update_salary_recalculates_net(self):
        """PAY-005: HR updates basic_salary, automatically recalculating net_salary"""
        payroll_rec = MockPayroll(id=1, employee=self.emp, basic_salary=5000.0, allowances=1000.0, deductions=500.0)

        mock_req = MagicMock()
        mock_req.session.uid = 102
        mock_req.env.user = self.hr_user
        mock_req.env['hr.employee'].sudo().browse.return_value = self.emp
        mock_req.env['dayflow.payroll'].sudo().search.return_value = payroll_rec
        mock_req.httprequest.data = json.dumps({"basic_salary": 7000.0}).encode('utf-8')
        set_request(mock_req)

        res = self.ctrl.update_employee_salary(501)
        self.assertEqual(res.status, 200)
        data = json.loads(res.output)["data"]
        self.assertEqual(data["basic_salary"], 7000.0)
        self.assertEqual(data["net_salary"], 7500.0)  # 7000 + 1000 - 500

if __name__ == "__main__":
    unittest.main()
