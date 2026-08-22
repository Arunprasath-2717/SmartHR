# -*- coding: utf-8 -*-
"""
Notification Management Tests for Dayflow API.
Tests GET /api/v1/notifications, PATCH .../read, and POST .../read-all according to Phase 14 requirements.
"""
import json
import unittest
from tests.test_helpers import notif_mod, set_request
from unittest.mock import MagicMock

class TestNotificationEndpoints(unittest.TestCase):

    def setUp(self):
        self.ctrl = notif_mod.DayflowNotificationController()

    def test_list_notifications(self):
        """NOTIF-001: Retrieve paginated notifications for current user"""
        user = MagicMock(id=101, _is_public=lambda: False)
        notif_rec = MagicMock(
            id=1,
            user_id=user,
            title="Leave Approved",
            message="Your leave request has been approved",
            notification_type="success",
            is_read=False,
            res_model="dayflow.leave",
            res_id=1,
            create_date=MagicMock(strftime=lambda fmt: "2026-08-22 10:00:00"),
            exists=lambda: True
        )

        mock_req = MagicMock()
        mock_req.session.uid = 101
        mock_req.env.user = user
        mock_req.httprequest.args = {'page': '1', 'page_size': '20'}
        mock_req.env['dayflow.notification'].sudo().search_count.return_value = 1
        mock_req.env['dayflow.notification'].sudo().search.return_value = [notif_rec]
        set_request(mock_req)

        res = self.ctrl.list_notifications()
        self.assertEqual(res.status, 200)
        data = json.loads(res.output)
        self.assertEqual(len(data["data"]), 1)
        self.assertEqual(data["data"][0]["title"], "Leave Approved")

    def test_mark_notification_read_ownership(self):
        """NOTIF-002 & NOTIF-004: Mark own notification as read (200) and reject other user's notification (403)"""
        user_a = MagicMock(id=101, _is_public=lambda: False)
        user_b = MagicMock(id=102, _is_public=lambda: False)

        notif_own = MagicMock(
            id=1,
            user_id=user_a,
            title="Alert",
            message="Msg",
            notification_type="info",
            is_read=False,
            res_model=None,
            res_id=None,
            create_date=MagicMock(strftime=lambda fmt: "2026-08-22 10:00:00"),
            exists=lambda: True
        )
        notif_own.sudo().write.return_value = True

        notif_other = MagicMock(
            id=2,
            user_id=user_b,
            exists=lambda: True
        )

        mock_req = MagicMock()
        mock_req.session.uid = 101
        mock_req.env.user = user_a
        mock_req.env['dayflow.notification'].sudo().browse.side_effect = lambda nid: notif_own if nid == 1 else notif_other
        set_request(mock_req)

        # Own notification
        res_own = self.ctrl.mark_notification_read(1)
        self.assertEqual(res_own.status, 200)

        # Other user's notification
        res_other = self.ctrl.mark_notification_read(2)
        self.assertEqual(res_other.status, 403)

if __name__ == "__main__":
    unittest.main()
