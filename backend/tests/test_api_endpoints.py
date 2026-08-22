# -*- coding: utf-8 -*-
from unittest.mock import patch

def test_health_endpoint(client):
    """HLTH-001: GET /api/v1/health returns 200 with standard health contract"""
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    body = res.json()
    assert body["data"]["status"] == "healthy"
    assert body["data"]["service"] == "dayflow-api"
    assert body["data"]["version"] == "v1"

def test_auth_login_and_session(client):
    """AUTH-001: User login and session verification"""
    # 1. Login with valid credentials
    login_res = client.post("/api/v1/auth/login", json={
        "login": "alice@company.com",
        "password": "Password123!"
    })
    assert login_res.status_code == 200
    token = login_res.json()["data"]["access_token"]
    assert token is not None

    # 2. Verify Session
    session_res = client.get("/api/v1/session", headers={"Authorization": f"Bearer {token}"})
    assert session_res.status_code == 200
    assert session_res.json()["data"]["authenticated"] is True
    assert session_res.json()["data"]["user_login"] == "alice@company.com"

    # 3. Verify /me
    me_res = client.get("/api/v1/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["data"]["name"] == "Alice Employee"
    assert me_res.json()["data"]["role"] == "employee"

def test_profile_get_and_update(client, auth_headers_emp):
    """PROF-001: Retrieve and update employee profile with permitted fields"""
    # 1. Get profile
    res = client.get("/api/v1/profile", headers=auth_headers_emp)
    assert res.status_code == 200
    assert res.json()["data"]["name"] == "Alice Employee"
    assert res.json()["data"]["job_title"] == "Software Engineer"

    # 2. Update allowed fields
    patch_res = client.patch("/api/v1/profile", headers=auth_headers_emp, json={
        "work_phone": "+1-555-8888",
        "emergency_contact": "Jane Doe"
    })
    assert patch_res.status_code == 200
    assert patch_res.json()["data"]["work_phone"] == "+1-555-8888"
    assert patch_res.json()["data"]["emergency_contact"] == "Jane Doe"

    # 3. Reject modification to restricted fields
    bad_res = client.patch("/api/v1/profile", headers=auth_headers_emp, json={
        "job_title": "CTO"
    })
    assert bad_res.status_code == 422
    assert bad_res.json()["error"]["code"] == "validation_error"

def test_employee_directory_and_isolation(client, auth_headers_emp, auth_headers_hr, auth_headers_dave):
    """EMP-001 & EMP-002: HR lists employees; regular employee blocked from directory & other records"""
    # 1. HR lists employees
    hr_res = client.get("/api/v1/employees", headers=auth_headers_hr)
    assert hr_res.status_code == 200
    assert len(hr_res.json()["data"]) >= 3

    # 2. Regular employee blocked from directory
    emp_res = client.get("/api/v1/employees", headers=auth_headers_emp)
    assert emp_res.status_code == 403

    # 3. Employee can view self (Alice id=1)
    self_res = client.get("/api/v1/employees/1", headers=auth_headers_emp)
    assert self_res.status_code == 200

    # 4. Employee Dave (id=3) blocked from viewing Alice (id=1)
    cross_res = client.get("/api/v1/employees/1", headers=auth_headers_dave)
    assert cross_res.status_code == 403

def test_attendance_lifecycle(client, auth_headers_emp):
    """ATT-001 to ATT-005: Check-in, duplicate guard, check-out, and status"""
    # 1. Check status
    status_res = client.get("/api/v1/attendance/status", headers=auth_headers_emp)
    assert status_res.status_code == 200
    assert status_res.json()["data"]["attendance_state"] == "checked_out"

    # 2. Check in
    in_res = client.post("/api/v1/attendance/check-in", headers=auth_headers_emp)
    assert in_res.status_code == 201
    assert in_res.json()["data"]["check_out"] is None

    # 3. Duplicate check-in fails with 409 Conflict
    dup_res = client.post("/api/v1/attendance/check-in", headers=auth_headers_emp)
    assert dup_res.status_code == 409
    assert dup_res.json()["error"]["code"] == "conflict"

    # 4. Check out
    out_res = client.post("/api/v1/attendance/check-out", headers=auth_headers_emp)
    assert out_res.status_code == 200
    assert out_res.json()["data"]["check_out"] is not None

def test_leave_creation_and_ai_integration(client, auth_headers_emp):
    """LEAVE-001 & INT-001: Leave creation with AI scoring integration and fallback"""
    # 1. Reject invalid date range
    bad_res = client.post("/api/v1/leave", headers=auth_headers_emp, json={
        "leave_type": "paid",
        "start_date": "2026-10-10",
        "end_date": "2026-10-05",
        "remarks": "Invalid dates"
    })
    assert bad_res.status_code == 422

    # 2. Create leave with simulated AI success
    mock_ai_result = {
        "is_anomaly": True,
        "score": 0.85,
        "risk_level": "high",
        "reasons": "Extended leave duration",
        "evaluation_status": "evaluated"
    }
    with patch("app.api.v1.leave.ai_client.score_leave_anomaly", return_value=mock_ai_result):
        create_res = client.post("/api/v1/leave", headers=auth_headers_emp, json={
            "leave_type": "paid",
            "start_date": "2026-11-01",
            "end_date": "2026-11-20",
            "remarks": "Extended holiday"
        })
        assert create_res.status_code == 201
        data = create_res.json()["data"]
        assert data["status"] == "pending"
        assert data["ai_is_anomaly"] is True
        assert data["ai_score"] == 0.85
        assert data["ai_risk_level"] == "high"

    # 3. Create leave with simulated AI service offline (fallback path)
    mock_fallback_result = {
        "is_anomaly": False,
        "score": 0.0,
        "risk_level": "low",
        "reasons": "AI evaluation bypassed due to service timeout",
        "evaluation_status": "fallback"
    }
    with patch("app.api.v1.leave.ai_client.score_leave_anomaly", return_value=mock_fallback_result):
        fallback_res = client.post("/api/v1/leave", headers=auth_headers_emp, json={
            "leave_type": "sick",
            "start_date": "2026-12-01",
            "end_date": "2026-12-02",
            "remarks": "Doctor appointment"
        })
        assert fallback_res.status_code == 201
        data = fallback_res.json()["data"]
        assert data["status"] == "pending"
        assert data["ai_evaluation_status"] == "fallback"

def test_leave_approval_workflow(client, auth_headers_emp, auth_headers_hr):
    """HR-LEAVE-001: Leave approval, double-approval conflict guard, and employee forbidden check"""
    # 1. Employee cannot approve leave
    emp_approve = client.post("/api/v1/leave/1/approve", headers=auth_headers_emp, json={"comments": "Self approve"})
    assert emp_approve.status_code == 403

    # 2. HR approves pending leave (id=1)
    hr_approve = client.post("/api/v1/leave/1/approve", headers=auth_headers_hr, json={"comments": "Approved by HR"})
    assert hr_approve.status_code == 200
    assert hr_approve.json()["data"]["status"] == "approved"
    assert hr_approve.json()["data"]["approver_comments"] == "Approved by HR"

    # 3. Double approval fails with 409 Conflict
    dup_approve = client.post("/api/v1/leave/1/approve", headers=auth_headers_hr)
    assert dup_approve.status_code == 409

def test_payroll_management(client, auth_headers_emp, auth_headers_hr):
    """PAY-001 to PAY-005: Payroll view and salary update with automatic net recalculation"""
    # 1. Employee views own payroll
    own_res = client.get("/api/v1/payroll/me", headers=auth_headers_emp)
    assert own_res.status_code == 200
    assert own_res.json()["data"]["net_salary"] == 5500.0

    # 2. Employee cannot modify salary
    emp_patch = client.patch("/api/v1/payroll/1", headers=auth_headers_emp, json={"basic_salary": 99999.0})
    assert emp_patch.status_code == 403

    # 3. HR updates salary (basic=7000, allowances=1500, deductions=500 -> net=8000)
    hr_patch = client.patch("/api/v1/payroll/1", headers=auth_headers_hr, json={
        "basic_salary": 7000.0,
        "allowances": 1500.0,
        "deductions": 500.0
    })
    assert hr_patch.status_code == 200
    assert hr_patch.json()["data"]["net_salary"] == 8000.0

def test_dashboards(client, auth_headers_emp, auth_headers_hr):
    """DASH-001 & DASH-004: Employee & Admin dashboard aggregation"""
    # 1. Employee dashboard
    emp_dash = client.get("/api/v1/dashboard/employee", headers=auth_headers_emp)
    assert emp_dash.status_code == 200
    assert "profile" in emp_dash.json()["data"]
    assert "attendance" in emp_dash.json()["data"]
    assert "leave" in emp_dash.json()["data"]

    # 2. Regular employee blocked from admin dashboard
    emp_admin_dash = client.get("/api/v1/dashboard/admin", headers=auth_headers_emp)
    assert emp_admin_dash.status_code == 403

    # 3. HR accesses admin dashboard
    hr_dash = client.get("/api/v1/dashboard/admin", headers=auth_headers_hr)
    assert hr_dash.status_code == 200
    assert hr_dash.json()["data"]["summary"]["total_employees"] >= 3

def test_notifications(client, auth_headers_emp, auth_headers_dave):
    """NOTIF-001 to NOTIF-004: In-app notifications and ownership isolation"""
    # 1. List notifications for Alice
    list_res = client.get("/api/v1/notifications", headers=auth_headers_emp)
    assert list_res.status_code == 200
    assert len(list_res.json()["data"]) >= 1

    # 2. Alice marks own notification (id=1) as read
    read_res = client.patch("/api/v1/notifications/1/read", headers=auth_headers_emp)
    assert read_res.status_code == 200
    assert read_res.json()["data"]["is_read"] is True

    # 3. Dave (id=4) blocked from modifying Alice's notification (id=1)
    cross_read = client.patch("/api/v1/notifications/1/read", headers=auth_headers_dave)
    assert cross_read.status_code == 403

def test_reports_and_analytics(client, auth_headers_emp, auth_headers_hr):
    """REP-001 & REP-006: Attendance reports and workforce analytics overview"""
    # 1. Employee generates own attendance report
    att_rep = client.get("/api/v1/reports/attendance", headers=auth_headers_emp)
    assert att_rep.status_code == 200
    assert att_rep.json()["data"]["total_records"] >= 1

    # 2. Employee blocked from analytics overview
    emp_analytics = client.get("/api/v1/analytics/overview", headers=auth_headers_emp)
    assert emp_analytics.status_code == 403

    # 3. HR generates analytics overview
    hr_analytics = client.get("/api/v1/analytics/overview", headers=auth_headers_hr)
    assert hr_analytics.status_code == 200
    assert hr_analytics.json()["data"]["workforce"]["total_active_employees"] >= 3

def test_security_negative_matrix(client):
    """SEC-001: Unauthenticated requests to protected endpoints return 401 Unauthorized"""
    protected_endpoints = [
        ("GET", "/api/v1/session"),
        ("GET", "/api/v1/me"),
        ("GET", "/api/v1/profile"),
        ("PATCH", "/api/v1/profile"),
        ("GET", "/api/v1/employees"),
        ("POST", "/api/v1/employees"),
        ("POST", "/api/v1/attendance/check-in"),
        ("POST", "/api/v1/attendance/check-out"),
        ("GET", "/api/v1/leave"),
        ("POST", "/api/v1/leave"),
        ("GET", "/api/v1/payroll/me"),
        ("GET", "/api/v1/dashboard/employee"),
        ("GET", "/api/v1/notifications"),
        ("GET", "/api/v1/analytics/overview")
    ]
    for method, path in protected_endpoints:
        if method == "GET":
            res = client.get(path)
        elif method == "POST":
            res = client.post(path, json={})
        elif method == "PATCH":
            res = client.patch(path, json={})
        assert res.status_code == 401, f"Expected 401 for unauthenticated {method} {path}, got {res.status_code}"
        assert res.json()["error"]["code"] == "unauthorized"
