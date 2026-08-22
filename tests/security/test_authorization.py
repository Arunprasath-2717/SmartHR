# -*- coding: utf-8 -*-
"""
Security & Authorization Matrix Tests for Dayflow API.
Tests negative security boundaries, ownership isolation, and privilege escalation guards according to Phase 18 requirements.
"""
import unittest
from tests.test_helpers import (
    auth_mod, profile_mod, emp_mod, att_mod, notif_mod,
    leave_mod, payroll_mod, dashboard_mod, reports_mod, set_request
)
from unittest.mock import MagicMock

class TestSecurityMatrix(unittest.TestCase):

    def setUp(self):
        self.ctrls = {
            "auth": auth_mod.DayflowAuthController(),
            "profile": profile_mod.DayflowProfileController(),
            "employee": emp_mod.DayflowEmployeeController(),
            "attendance": att_mod.DayflowAttendanceController(),
            "leave": leave_mod.DayflowLeaveController(),
            "payroll": payroll_mod.DayflowPayrollController(),
            "dashboard": dashboard_mod.DayflowDashboardController(),
            "notification": notif_mod.DayflowNotificationController(),
            "reports": reports_mod.DayflowReportsController(),
        }

    def test_unauthenticated_requests_return_401(self):
        """SEC-001: Unauthenticated requests to protected endpoints return 401 Unauthorized"""
        mock_req = MagicMock()
        mock_req.session.uid = None
        set_request(mock_req)

        self.assertEqual(self.ctrls["auth"].me().status, 401)
        self.assertEqual(self.ctrls["profile"].get_profile().status, 401)
        self.assertEqual(self.ctrls["employee"].list_employees().status, 401)
        self.assertEqual(self.ctrls["attendance"].attendance_status().status, 401)
        self.assertEqual(self.ctrls["leave"].list_leave().status, 401)
        self.assertEqual(self.ctrls["payroll"].get_own_payroll().status, 401)
        self.assertEqual(self.ctrls["dashboard"].get_dashboard().status, 401)
        self.assertEqual(self.ctrls["notification"].list_notifications().status, 401)
        self.assertEqual(self.ctrls["reports"].get_attendance_report().status, 401)

    def test_role_boundary_employee_cannot_access_hr_endpoints(self):
        """SEC-002: Regular employee attempting HR operations receives 403 Forbidden"""
        user = MagicMock(id=101, _is_public=lambda: False, _is_admin=lambda: False)
        user.has_group.side_effect = lambda g: g in ['dayflow_core.group_dayflow_employee', 'base.group_user']

        mock_req = MagicMock()
        mock_req.session.uid = 101
        mock_req.env.user = user
        set_request(mock_req)

        self.assertEqual(self.ctrls["employee"].list_employees().status, 403)
        self.assertEqual(self.ctrls["leave"].admin_list_leave().status, 403)
        self.assertEqual(self.ctrls["leave"].approve_leave(1).status, 403)
        self.assertEqual(self.ctrls["leave"].reject_leave(1).status, 403)
        self.assertEqual(self.ctrls["payroll"].list_payroll().status, 403)
        self.assertEqual(self.ctrls["payroll"].update_employee_salary(501).status, 403)
        self.assertEqual(self.ctrls["dashboard"].get_admin_dashboard().status, 403)
        self.assertEqual(self.ctrls["reports"].get_analytics_overview().status, 403)

if __name__ == "__main__":
    unittest.main()
