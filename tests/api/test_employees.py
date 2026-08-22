# -*- coding: utf-8 -*-
"""
Employee Management Tests for Dayflow API.
Tests GET/POST /api/v1/employees and GET/PATCH /api/v1/employees/{id} according to Phase 8 requirements.
"""
import json
import unittest
from tests.test_helpers import emp_mod, set_request, MockUser, MockEmployee
from unittest.mock import MagicMock

class TestEmployeeEndpoints(unittest.TestCase):

    def setUp(self):
        self.ctrl = emp_mod.DayflowEmployeeController()
        self.emp_user = MockUser(id=101, name="Alice Employee", login="alice@company.com", role="employee")
        self.hr_user = MockUser(id=102, name="Bob HR", login="bob@company.com", role="hr_officer")
        self.emp_alice = MockEmployee(id=501, name="Alice Employee", user=self.emp_user)
        self.emp_user.employee_id = self.emp_alice
        self.emp_charlie = MockEmployee(id=502, name="Charlie", user=MockUser(id=103, name="Charlie", login="charlie@company.com", role="employee"))

    def test_list_employees_employee_forbidden(self):
        """EMP-002: Regular employee attempting to list all employees receives 403 Forbidden"""
        mock_req = MagicMock()
        mock_req.session.uid = 101
        mock_req.env.user = self.emp_user
        set_request(mock_req)

        res = self.ctrl.list_employees()
        self.assertEqual(res.status, 403)
        self.assertEqual(json.loads(res.output)["error"]["code"], "forbidden")

    def test_list_employees_hr_allowed(self):
        """EMP-001: HR Officer successfully retrieves paginated employee directory"""
        mock_req = MagicMock()
        mock_req.session.uid = 102
        mock_req.env.user = self.hr_user
        mock_req.httprequest.args = {'page': '1', 'page_size': '10'}
        mock_req.env['hr.employee'].sudo().search_count.return_value = 1
        mock_req.env['hr.employee'].sudo().search.return_value = [self.emp_alice]
        set_request(mock_req)

        res = self.ctrl.list_employees()
        self.assertEqual(res.status, 200)
        data = json.loads(res.output)
        self.assertEqual(len(data["data"]), 1)
        self.assertEqual(data["pagination"]["total"], 1)

    def test_get_employee_ownership(self):
        """EMP-003 & EMP-004: Employee can view self (200) but blocked from viewing others (403)"""
        mock_req = MagicMock()
        mock_req.session.uid = 101
        mock_req.env.user = self.emp_user
        mock_req.env['hr.employee'].sudo().browse.side_effect = lambda eid: self.emp_alice if eid == 501 else self.emp_charlie
        set_request(mock_req)

        # View own record
        res_own = self.ctrl.get_employee(501)
        self.assertEqual(res_own.status, 200)
        data_own = json.loads(res_own.output)["data"]
        self.assertEqual(data_own["id"], 501)

        # View other record
        res_other = self.ctrl.get_employee(502)
        self.assertEqual(res_other.status, 403)

if __name__ == "__main__":
    unittest.main()
