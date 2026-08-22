# -*- coding: utf-8 -*-
"""
Health Endpoint Tests for Dayflow API.
Tests GET /api/v1/health according to Phase 6 requirements.
"""
import json
import unittest
from tests.test_helpers import health_mod, set_request
from unittest.mock import MagicMock

class TestHealthEndpoint(unittest.TestCase):

    def setUp(self):
        self.ctrl = health_mod.DayflowHealthController()

    def test_health_check_success(self):
        """HLTH-001: GET /api/v1/health returns 200 with standard health contract"""
        set_request(MagicMock())
        res = self.ctrl.health()
        self.assertEqual(res.status, 200)
        data = json.loads(res.output)
        self.assertIn("data", data)
        self.assertEqual(data["data"]["status"], "healthy")
        self.assertEqual(data["data"]["service"], "dayflow-api")
        self.assertEqual(data["data"]["version"], "v1")
        self.assertIsNone(data.get("error"))

if __name__ == "__main__":
    unittest.main()
