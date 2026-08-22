# -*- coding: utf-8 -*-
"""
Authentication & Session Tests for Dayflow API.
Tests GET /api/v1/session and GET /api/v1/me according to Phase 4 & 5 requirements.
"""
import json
import unittest
from tests.test_helpers import auth_mod, set_request, MockUser
from unittest.mock import MagicMock

class TestAuthEndpoints(unittest.TestCase):

    def setUp(self):
        self.ctrl = auth_mod.DayflowAuthController()

    def test_session_state_unauthenticated(self):
        """AUTH-007: Unauthenticated session returns 401 Unauthorized"""
        mock_req = MagicMock()
        mock_req.session.uid = None
        set_request(mock_req)

        res = self.ctrl.session_state()
        self.assertEqual(res.status, 401)
        data = json.loads(res.output)
        self.assertEqual(data["error"]["code"], "unauthorized")

    def test_session_state_authenticated_employee(self):
        """AUTH-006: Authenticated employee session returns valid user info & role"""
        user = MockUser(id=101, name="Alice Employee", login="alice@company.com", role="employee")

        mock_req = MagicMock()
        mock_req.session.uid = 101
        mock_req.env.user = user
        set_request(mock_req)

        res = self.ctrl.session_state()
        self.assertEqual(res.status, 200)
        data = json.loads(res.output)["data"]
        self.assertTrue(data["authenticated"])
        self.assertEqual(data["user_id"], 101)
        self.assertEqual(data["role"], "employee")

    def test_me_unauthenticated(self):
        """AUTH-007: GET /api/v1/me rejects unauthenticated user with 401 Unauthorized"""
        mock_req = MagicMock()
        mock_req.session.uid = None
        set_request(mock_req)

        res = self.ctrl.me()
        self.assertEqual(res.status, 401)
        data = json.loads(res.output)
        self.assertEqual(data["error"]["code"], "unauthorized")

    def test_me_authenticated_hr_officer(self):
        """AUTH-006: GET /api/v1/me returns user profile and HR role for HR Officer"""
        user = MockUser(id=102, name="Bob HR", login="bob@company.com", role="hr_officer")

        mock_req = MagicMock()
        mock_req.session.uid = 102
        mock_req.env.user = user
        set_request(mock_req)

        res = self.ctrl.me()
        self.assertEqual(res.status, 200)
        data = json.loads(res.output)["data"]
        self.assertEqual(data["id"], 102)
        self.assertEqual(data["name"], "Bob HR")
        self.assertEqual(data["role"], "hr_officer")
        self.assertNotIn("password", data)

if __name__ == "__main__":
    unittest.main()
