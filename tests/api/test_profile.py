# -*- coding: utf-8 -*-
"""
Profile Endpoint Tests for Dayflow API.
Tests GET /api/v1/profile and PATCH /api/v1/profile according to Phase 7 requirements.
"""
import json
import unittest
from tests.test_helpers import profile_mod, set_request
from unittest.mock import MagicMock

class TestProfileEndpoints(unittest.TestCase):

    def setUp(self):
        self.ctrl = profile_mod.DayflowProfileController()

    def test_get_profile_unauthenticated(self):
        """PROFILE-007: Unauthenticated profile request returns 401"""
        mock_req = MagicMock()
        mock_req.session.uid = None
        set_request(mock_req)

        res = self.ctrl.get_profile()
        self.assertEqual(res.status, 401)
        self.assertEqual(json.loads(res.output)["error"]["code"], "unauthorized")

    def test_get_profile_authenticated(self):
        """PROFILE-001: Employee gets own profile data"""
        user = MagicMock()
        user.id = 101
        user.name = "Alice Employee"
        user.login = "alice@company.com"
        user._is_public.return_value = False
        user.has_group.side_effect = lambda g: g in ['dayflow_core.group_dayflow_employee', 'base.group_user']

        emp = MagicMock()
        emp.id = 501
        emp.name = "Alice Employee"
        emp.work_email = "alice@company.com"
        emp.work_phone = "+1-555-0101"
        emp.mobile_phone = "+1-555-0102"
        emp.department_id.id = 1
        emp.department_id.name = "Engineering"
        emp.job_title = "Software Engineer"
        emp.emergency_contact = "Bob"
        emp.emergency_phone = "+1-555-0199"
        emp.exists.return_value = True

        mock_req = MagicMock()
        mock_req.session.uid = 101
        mock_req.env.user = user
        mock_req.env['hr.employee'].sudo().search.return_value = emp
        user.employee_id = emp
        set_request(mock_req)

        res = self.ctrl.get_profile()
        self.assertEqual(res.status, 200)
        data = json.loads(res.output)["data"]
        self.assertEqual(data["id"], 501)
        self.assertEqual(data["name"], "Alice Employee")
        self.assertEqual(data["job_title"], "Software Engineer")
        self.assertEqual(data["department_name"], "Engineering")

    def test_update_profile_permitted_fields(self):
        """PROFILE-002: Employee successfully updates permitted contact fields"""
        user = MagicMock()
        user.id = 101
        user._is_public.return_value = False
        user.has_group.side_effect = lambda g: g in ['dayflow_core.group_dayflow_employee', 'base.group_user']

        emp = MagicMock()
        emp.id = 501
        emp.exists.return_value = True
        emp.name = "Alice Employee"
        emp.work_email = "alice@company.com"
        emp.work_phone = "+1-555-9999"
        emp.mobile_phone = "+1-555-8888"
        emp.department_id.id = 1
        emp.department_id.name = "Engineering"
        emp.job_title = "Software Engineer"
        emp.emergency_contact = "Charlie"
        emp.emergency_phone = "+1-555-7777"
        emp.sudo().write.return_value = True

        mock_req = MagicMock()
        mock_req.session.uid = 101
        mock_req.env.user = user
        mock_req.httprequest.data = json.dumps({
            "work_phone": "+1-555-9999",
            "mobile_phone": "+1-555-8888",
            "emergency_contact": "Charlie",
            "emergency_phone": "+1-555-7777"
        }).encode('utf-8')
        mock_req.env['hr.employee'].sudo().search.return_value = emp
        user.employee_id = emp
        set_request(mock_req)

        res = self.ctrl.update_profile()
        self.assertEqual(res.status, 200)
        data = json.loads(res.output)["data"]
        self.assertEqual(data["work_phone"], "+1-555-9999")

    def test_update_profile_restricted_fields_rejected(self):
        """PROFILE-003: Employee attempting to modify job_title / department is rejected with 422"""
        user = MagicMock()
        user.id = 101
        user._is_public.return_value = False
        user.has_group.side_effect = lambda g: g in ['dayflow_core.group_dayflow_employee', 'base.group_user']

        emp = MagicMock()
        emp.id = 501
        emp.exists.return_value = True

        mock_req = MagicMock()
        mock_req.session.uid = 101
        mock_req.env.user = user
        mock_req.httprequest.data = json.dumps({
            "job_title": "CEO & President",
            "department_id": 99
        }).encode('utf-8')
        mock_req.env['hr.employee'].sudo().search.return_value = emp
        user.employee_id = emp
        set_request(mock_req)

        res = self.ctrl.update_profile()
        self.assertEqual(res.status, 422)
        error = json.loads(res.output)["error"]
        self.assertEqual(error["code"], "validation_error")

if __name__ == "__main__":
    unittest.main()
