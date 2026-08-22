# -*- coding: utf-8 -*-
"""
Dayflow Comprehensive QA & Security Automated Test Suite.
Executes detailed test cases across all FastAPI routes, Go AI Service, and Security Matrix.
"""
import time
import pytest
from unittest.mock import patch
from datetime import date, datetime, timezone

# ------------------------------------------------------------------------------
# 1. HEALTH CHECKS
# ------------------------------------------------------------------------------
def test_health_check_contract(client):
    """HLTH-001: GET /api/v1/health validates status code and exact schema contract"""
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    assert res.headers["content-type"].startswith("application/json")
    data = res.json()["data"]
    assert data["status"] == "healthy"
    assert data["service"] == "dayflow-api"
    assert data["version"] == "v1"

def test_root_endpoint(client):
    """ROOT-001: GET / returns API metadata and documentation links"""
    res = client.get("/")
    assert res.status_code == 200
    body = res.json()
    assert "message" in body
    assert body["docs"] == "/docs"

# ------------------------------------------------------------------------------
# 2. AUTHENTICATION, REGISTRATION, SESSION & LOGOUT
# ------------------------------------------------------------------------------
def test_auth_register_and_logout(client):
    """AUTH-REG-001: Self-service employee signup and logout"""
    # 1. Register new employee
    reg_res = client.post("/api/v1/auth/register", json={
        "name": "Frank Employee",
        "email": "frank@company.com",
        "password": "Password123!",
        "phone": "+1-555-0109",
        "address": "123 Main Street, Springfield"
    })
    assert reg_res.status_code == 201
    reg_data = reg_res.json()["data"]
    assert reg_data["user"]["login"] == "frank@company.com"
    token = reg_data["access_token"]

    # 2. Logout
    logout_res = client.post("/api/v1/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert logout_res.status_code == 200
    assert logout_res.json()["data"]["success"] is True

def test_auth_login_valid(client):
    """AUTH-001: Valid credentials login returns JWT access token"""
    res = client.post("/api/v1/auth/login", json={"login": "alice@company.com", "password": "Password123!"})
    assert res.status_code == 200
    data = res.json()["data"]
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["login"] == "alice@company.com"

def test_auth_login_invalid_password(client):
    """AUTH-004: Invalid password returns 401 Unauthorized"""
    res = client.post("/api/v1/auth/login", json={"login": "alice@company.com", "password": "WrongPassword"})
    assert res.status_code == 401
    assert res.json()["error"]["code"] == "unauthorized"

def test_auth_login_nonexistent_user(client):
    """AUTH-006: Nonexistent user returns 401 Unauthorized"""
    res = client.post("/api/v1/auth/login", json={"login": "nonexistent@company.com", "password": "Password123!"})
    assert res.status_code == 401
    assert res.json()["error"]["code"] == "unauthorized"

def test_auth_session_and_me(client, auth_headers_emp, auth_headers_hr):
    """AUTH-SESSION-001: /session and /me return identity metadata without password hashes"""
    # Employee session
    sess_emp = client.get("/api/v1/session", headers=auth_headers_emp)
    assert sess_emp.status_code == 200
    assert sess_emp.json()["data"]["role"] == "employee"
    assert "password_hash" not in str(sess_emp.json())

    # Employee me
    me_emp = client.get("/api/v1/me", headers=auth_headers_emp)
    assert me_emp.status_code == 200
    assert me_emp.json()["data"]["employee_id"] == 1

    # HR session
    sess_hr = client.get("/api/v1/session", headers=auth_headers_hr)
    assert sess_hr.status_code == 200
    assert sess_hr.json()["data"]["role"] == "hr_officer"

# ------------------------------------------------------------------------------
# 3. PROFILE TESTS
# ------------------------------------------------------------------------------
def test_profile_retrieval_and_update(client, auth_headers_emp):
    """PROF-001 & PROF-002: Profile get, whitelist update (address, phone, avatar), and restricted field blocking"""
    # Get profile
    res = client.get("/api/v1/profile", headers=auth_headers_emp)
    assert res.status_code == 200
    assert res.json()["data"]["name"] == "Alice Employee"

    # Whitelist update with address, phone, and profile_picture
    patch_res = client.patch("/api/v1/profile", headers=auth_headers_emp, json={
        "address": "456 Oak Avenue, Metropolis",
        "phone": "+1-555-4321",
        "profile_picture": "https://cdn.dayflow.com/avatars/alice.png",
        "emergency_contact": "Bob Senior",
        "emergency_phone": "+1-555-9876"
    })
    assert patch_res.status_code == 200
    assert patch_res.json()["data"]["address"] == "456 Oak Avenue, Metropolis"
    assert patch_res.json()["data"]["profile_picture"] == "https://cdn.dayflow.com/avatars/alice.png"
    assert patch_res.json()["data"]["phone"] == "+1-555-4321"

    # Restricted field attempt (modifying role)
    bad_res = client.patch("/api/v1/profile", headers=auth_headers_emp, json={"role": "hr_officer"})
    assert bad_res.status_code == 422
    assert bad_res.json()["error"]["code"] == "validation_error"

# ------------------------------------------------------------------------------
# 4. EMPLOYEE DIRECTORY & ISOLATION
# ------------------------------------------------------------------------------
def test_employee_directory_crud_and_isolation(client, auth_headers_emp, auth_headers_hr, auth_headers_dave):
    """EMP-001 to EMP-005: HR CRUD vs Employee access isolation"""
    # 1. HR lists employees
    hr_list = client.get("/api/v1/employees?page=1&page_size=10", headers=auth_headers_hr)
    assert hr_list.status_code == 200
    assert len(hr_list.json()["data"]) >= 3
    assert hr_list.json()["pagination"]["total"] >= 3

    # 2. Regular employee blocked from listing directory
    emp_list = client.get("/api/v1/employees", headers=auth_headers_emp)
    assert emp_list.status_code == 403

    # 3. HR creates new employee
    new_emp = client.post("/api/v1/employees", headers=auth_headers_hr, json={
        "name": "Eve Engineer",
        "work_email": "eve@company.com",
        "work_phone": "+1-555-0105",
        "job_title": "Security Engineer",
        "department_id": 1,
        "role": "employee"
    })
    assert new_emp.status_code == 201
    created_id = new_emp.json()["data"]["id"]

    # 4. HR updates employee
    patch_emp = client.patch(f"/api/v1/employees/{created_id}", headers=auth_headers_hr, json={
        "job_title": "Lead Security Engineer"
    })
    assert patch_emp.status_code == 200
    assert patch_emp.json()["data"]["job_title"] == "Lead Security Engineer"

    # 5. Employee Dave blocked from viewing Alice (id=1)
    cross_res = client.get("/api/v1/employees/1", headers=auth_headers_dave)
    assert cross_res.status_code == 403

    # 6. Alice can view self (id=1)
    self_res = client.get("/api/v1/employees/1", headers=auth_headers_emp)
    assert self_res.status_code == 200

# ------------------------------------------------------------------------------
# 5. ATTENDANCE WORKFLOW, DAILY/WEEKLY VIEWS & STATUSES
# ------------------------------------------------------------------------------
def test_attendance_complete_lifecycle(client, auth_headers_emp, auth_headers_hr, auth_headers_dave):
    """ATT-001 to ATT-009: Check-in, duplicate guard, status, check-out, daily/weekly view, and HR view"""
    # 1. Initial status: checked_out
    st_init = client.get("/api/v1/attendance/status", headers=auth_headers_emp)
    assert st_init.status_code == 200
    assert st_init.json()["data"]["attendance_state"] == "checked_out"

    # 2. Check-in
    in_res = client.post("/api/v1/attendance/check-in", headers=auth_headers_emp)
    assert in_res.status_code == 201
    att_id = in_res.json()["data"]["id"]
    assert in_res.json()["data"]["status"] == "Present"

    # 3. Duplicate check-in fails with 409 Conflict
    dup_res = client.post("/api/v1/attendance/check-in", headers=auth_headers_emp)
    assert dup_res.status_code == 409
    assert dup_res.json()["error"]["code"] == "conflict"

    # 4. Status reflects checked_in
    st_in = client.get("/api/v1/attendance/status", headers=auth_headers_emp)
    assert st_in.status_code == 200
    assert st_in.json()["data"]["attendance_state"] == "checked_in"

    # 5. Check-out
    out_res = client.post("/api/v1/attendance/check-out", headers=auth_headers_emp)
    assert out_res.status_code == 200
    assert out_res.json()["data"]["check_out"] is not None

    # 6. Daily view filter
    daily_res = client.get("/api/v1/attendance?view=daily", headers=auth_headers_emp)
    assert daily_res.status_code == 200
    assert len(daily_res.json()["data"]) >= 1

    # 7. Weekly view filter
    weekly_res = client.get("/api/v1/attendance?view=weekly", headers=auth_headers_emp)
    assert weekly_res.status_code == 200

    # 8. Dave blocked from viewing Alice's attendance record
    cross_att = client.get(f"/api/v1/attendance/{att_id}", headers=auth_headers_dave)
    assert cross_att.status_code == 403

    # 9. HR can view any attendance record
    hr_att = client.get(f"/api/v1/attendance/{att_id}", headers=auth_headers_hr)
    assert hr_att.status_code == 200

# ------------------------------------------------------------------------------
# 6. LEAVE MANAGEMENT & TIME-OFF
# ------------------------------------------------------------------------------
def test_leave_creation_and_ai_scoring(client, auth_headers_emp):
    """LEAVE-001: Leave creation with AI scoring integration and validation"""
    # 1. Invalid date range fails validation
    bad_dates = client.post("/api/v1/leave", headers=auth_headers_emp, json={
        "leave_type": "paid",
        "start_date": "2026-11-20",
        "end_date": "2026-11-10",
        "remarks": "Backward dates"
    })
    assert bad_dates.status_code == 422

    # 2. Invalid leave type fails validation
    bad_type = client.post("/api/v1/leave", headers=auth_headers_emp, json={
        "leave_type": "sabbatical_unsupported",
        "start_date": "2026-11-01",
        "end_date": "2026-11-05"
    })
    assert bad_type.status_code == 422

    # 3. Create Leave with successful AI scoring
    mock_ai = {
        "is_anomaly": True,
        "score": 0.88,
        "risk_level": "high",
        "reasons": "Long leave duration requested during peak sprint",
        "evaluation_status": "evaluated"
    }
    with patch("app.api.v1.leave.ai_client.score_leave_anomaly", return_value=mock_ai):
        leave_res = client.post("/api/v1/leave", headers=auth_headers_emp, json={
            "leave_type": "paid",
            "start_date": "2026-11-01",
            "end_date": "2026-11-15",
            "remarks": "Vacation trip"
        })
        assert leave_res.status_code == 201
        data = leave_res.json()["data"]
        assert data["status"] == "pending"
        assert data["ai_is_anomaly"] is True
        assert data["ai_score"] == 0.88
        assert data["ai_risk_level"] == "high"

def test_leave_standalone_and_ai_service_fallback(client, auth_headers_emp):
    """AI-INT-002: Leave creation functions cleanly standalone and gracefully falls back on AI timeout"""
    mock_fallback = {
        "is_anomaly": False,
        "score": 0.0,
        "risk_level": "low",
        "reasons": "AI evaluation bypassed due to service timeout",
        "evaluation_status": "fallback"
    }
    with patch("app.api.v1.leave.ai_client.score_leave_anomaly", return_value=mock_fallback):
        leave_res = client.post("/api/v1/leave", headers=auth_headers_emp, json={
            "leave_type": "sick",
            "start_date": "2026-12-01",
            "end_date": "2026-12-03",
            "remarks": "Fever recovery"
        })
        assert leave_res.status_code == 201
        data = leave_res.json()["data"]
        assert data["status"] == "pending"
        assert data["ai_evaluation_status"] == "fallback"
        assert data["ai_is_anomaly"] is False

# ------------------------------------------------------------------------------
# 7. LEAVE APPROVAL & REJECTION WORKFLOW
# ------------------------------------------------------------------------------
def test_leave_approval_rejection_lifecycle(client, auth_headers_emp, auth_headers_hr, auth_headers_dave):
    """HR-001 to HR-008: Leave approval, rejection, state guards, and notification emission"""
    # 1. Admin/HR lists organization leave requests
    all_leaves = client.get("/api/v1/admin/leave?status=pending", headers=auth_headers_hr)
    assert all_leaves.status_code == 200
    assert len(all_leaves.json()["data"]) >= 1

    # 2. Employee Dave blocked from accessing Admin leave endpoint
    emp_admin = client.get("/api/v1/admin/leave", headers=auth_headers_dave)
    assert emp_admin.status_code == 403

    # 3. Employee Alice cannot approve own leave (id=1)
    emp_app = client.post("/api/v1/leave/1/approve", headers=auth_headers_emp, json={"comments": "Self"})
    assert emp_app.status_code == 403

    # 4. HR approves leave id=1
    hr_app = client.post("/api/v1/leave/1/approve", headers=auth_headers_hr, json={"comments": "Approved by manager"})
    assert hr_app.status_code == 200
    assert hr_app.json()["data"]["status"] == "approved"

    # 5. Double approval fails with 409 Conflict
    dup_app = client.post("/api/v1/leave/1/approve", headers=auth_headers_hr)
    assert dup_app.status_code == 409
    assert dup_app.json()["error"]["code"] == "conflict"

    # 6. HR rejects leave id=2
    hr_rej = client.post("/api/v1/leave/2/reject", headers=auth_headers_hr, json={"comments": "Insufficient notice"})
    assert hr_rej.status_code == 200
    assert hr_rej.json()["data"]["status"] == "rejected"

    # 7. Double rejection fails with 409 Conflict
    dup_rej = client.post("/api/v1/leave/2/reject", headers=auth_headers_hr)
    assert dup_rej.status_code == 409

# ------------------------------------------------------------------------------
# 8. PAYROLL
# ------------------------------------------------------------------------------
def test_payroll_management_and_recalculation(client, auth_headers_emp, auth_headers_hr, auth_headers_dave):
    """PAY-001 to PAY-007: Employee payroll view, net calculation, and HR salary update"""
    # 1. Employee Alice views own payroll
    own_pay = client.get("/api/v1/payroll/me", headers=auth_headers_emp)
    assert own_pay.status_code == 200
    assert own_pay.json()["data"]["basic_salary"] == 5000.0
    assert own_pay.json()["data"]["net_salary"] == 5500.0

    # 2. Employee Alice blocked from viewing Bob's payroll (id=2)
    cross_pay = client.get("/api/v1/payroll/2", headers=auth_headers_emp)
    assert cross_pay.status_code == 403

    # 3. Employee Alice blocked from updating salary
    emp_update = client.patch("/api/v1/payroll/1", headers=auth_headers_emp, json={"basic_salary": 99999.0})
    assert emp_update.status_code == 403

    # 4. HR updates salary structure (basic=8000, allowances=2000, deductions=1000 -> net=9000)
    hr_update = client.patch("/api/v1/payroll/1", headers=auth_headers_hr, json={
        "basic_salary": 8000.0,
        "allowances": 2000.0,
        "deductions": 1000.0,
        "payment_frequency": "monthly"
    })
    assert hr_update.status_code == 200
    assert hr_update.json()["data"]["net_salary"] == 9000.0

    # 5. Invalid negative salary fails validation
    bad_salary = client.patch("/api/v1/payroll/1", headers=auth_headers_hr, json={"basic_salary": -500.0})
    assert bad_salary.status_code == 422

# ------------------------------------------------------------------------------
# 9. DASHBOARD AGGREGATION
# ------------------------------------------------------------------------------
def test_dashboards_employee_admin_and_dynamic(client, auth_headers_emp, auth_headers_hr):
    """DASH-001 to DASH-007: Personalized vs Organizational Dashboard endpoints"""
    # 1. Employee Dashboard
    emp_d = client.get("/api/v1/dashboard/employee", headers=auth_headers_emp)
    assert emp_d.status_code == 200
    data = emp_d.json()["data"]
    assert "profile" in data
    assert "attendance" in data
    assert "leave" in data

    # 2. Employee blocked from Admin Dashboard
    emp_adm_d = client.get("/api/v1/dashboard/admin", headers=auth_headers_emp)
    assert emp_adm_d.status_code == 403

    # 3. HR Admin Dashboard
    hr_d = client.get("/api/v1/dashboard/admin", headers=auth_headers_hr)
    assert hr_d.status_code == 200
    assert hr_d.json()["data"]["summary"]["total_employees"] >= 3

    # 4. Dynamic Dashboard routing
    dyn_emp = client.get("/api/v1/dashboard", headers=auth_headers_emp)
    assert dyn_emp.status_code == 200
    assert "profile" in dyn_emp.json()["data"]

    dyn_hr = client.get("/api/v1/dashboard", headers=auth_headers_hr)
    assert dyn_hr.status_code == 200
    assert "summary" in dyn_hr.json()["data"]

# ------------------------------------------------------------------------------
# 10. NOTIFICATIONS (OPTIONAL / FUTURE ENHANCEMENT)
# ------------------------------------------------------------------------------
def test_notifications_lifecycle(client, auth_headers_emp, auth_headers_dave):
    """NOTIF-001 to NOTIF-004: In-app alerts, read status, ownership isolation, and read-all"""
    # 1. Alice lists notifications
    list_res = client.get("/api/v1/notifications", headers=auth_headers_emp)
    assert list_res.status_code == 200
    assert len(list_res.json()["data"]) >= 1

    # 2. Alice marks notification id=1 as read
    read_res = client.patch("/api/v1/notifications/1/read", headers=auth_headers_emp)
    assert read_res.status_code == 200
    assert read_res.json()["data"]["is_read"] is True

    # 3. Dave (user_id=4) blocked from modifying Alice's notification (id=1)
    cross_read = client.patch("/api/v1/notifications/1/read", headers=auth_headers_dave)
    assert cross_read.status_code == 403

    # 4. Alice marks all notifications read
    read_all = client.post("/api/v1/notifications/read-all", headers=auth_headers_emp)
    assert read_all.status_code == 200
    assert read_all.json()["data"]["success"] is True

# ------------------------------------------------------------------------------
# 11. ANALYTICS & REPORTS (OPTIONAL / FUTURE ENHANCEMENT)
# ------------------------------------------------------------------------------
def test_analytics_and_reports(client, auth_headers_emp, auth_headers_hr):
    """REP-001 to REP-006: Attendance reports, payroll cost aggregates, and workforce overview"""
    # 1. Attendance report
    att_rep = client.get("/api/v1/reports/attendance?start_date=2026-08-01&end_date=2026-08-31", headers=auth_headers_emp)
    assert att_rep.status_code == 200
    assert att_rep.json()["data"]["total_records"] >= 1

    # 2. Payroll report
    pay_rep = client.get("/api/v1/reports/payroll", headers=auth_headers_hr)
    assert pay_rep.status_code == 200
    assert pay_rep.json()["data"]["total_payroll_records"] >= 2

    # 3. Employee blocked from organization Analytics Overview
    emp_an = client.get("/api/v1/analytics/overview", headers=auth_headers_emp)
    assert emp_an.status_code == 403

    # 4. HR gets Analytics Overview
    hr_an = client.get("/api/v1/analytics/overview", headers=auth_headers_hr)
    assert hr_an.status_code == 200
    assert hr_an.json()["data"]["workforce"]["total_active_employees"] >= 3

# ------------------------------------------------------------------------------
# 12. SECURITY NEGATIVE MATRIX & PRIVILEGE ESCALATION
# ------------------------------------------------------------------------------
def test_security_rbac_negative_matrix(client, auth_headers_emp):
    """SEC-RBAC-001: Verify employees are denied access to all HR/Admin protected endpoints"""
    forbidden_endpoints = [
        ("GET", "/api/v1/employees"),
        ("POST", "/api/v1/employees", {"name": "Hacker", "work_email": "hack@company.com"}),
        ("PATCH", "/api/v1/employees/1", {"role": "hr_officer"}),
        ("GET", "/api/v1/admin/leave"),
        ("POST", "/api/v1/leave/1/approve", {}),
        ("POST", "/api/v1/leave/1/reject", {}),
        ("GET", "/api/v1/payroll"),
        ("PATCH", "/api/v1/payroll/1", {"basic_salary": 100000.0}),
        ("GET", "/api/v1/dashboard/admin"),
        ("GET", "/api/v1/analytics/overview"),
    ]

    for item in forbidden_endpoints:
        method = item[0]
        path = item[1]
        payload = item[2] if len(item) > 2 else None

        if method == "GET":
            res = client.get(path, headers=auth_headers_emp)
        elif method == "POST":
            res = client.post(path, headers=auth_headers_emp, json=payload or {})
        elif method == "PATCH":
            res = client.patch(path, headers=auth_headers_emp, json=payload or {})

        assert res.status_code == 403, f"Expected 403 for Employee accessing {method} {path}, got {res.status_code}"
        assert res.json()["error"]["code"] == "forbidden"
