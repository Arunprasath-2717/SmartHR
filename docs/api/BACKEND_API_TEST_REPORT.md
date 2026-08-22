# Dayflow Backend API Test Report

## 1. Test Environment

- **Execution Timestamp**: 2026-08-22T08:03:30Z
- **Backend URL**: `http://localhost:8000`
- **Swagger Documentation**: `http://localhost:8000/docs`
- **OpenAPI Schema**: `http://localhost:8000/openapi.json`
- **Python Version**: Python 3.11.15
- **FastAPI Version**: 0.115.6
- **Database Provider**: Supabase PostgreSQL (Production) / In-Memory SQLite Engine (Test Isolation)
- **AI Microservice**: Go Anomaly Service (`http://localhost:8080`, Active & Healthy)
- **Test Runner**: Pytest 8.3.4 & HTTPX 0.28.1

---

## 2. Endpoint Discovery

| Method | Endpoint | Implemented | Tested | Contract | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | YES | YES | MATCH | PASS |
| `GET` | `/api/v1/health` | YES | YES | MATCH | PASS |
| `POST` | `/api/v1/auth/login` | YES | YES | MATCH | PASS |
| `GET` | `/api/v1/session` | YES | YES | MATCH | PASS |
| `GET` | `/api/v1/me` | YES | YES | MATCH | PASS |
| `GET` | `/api/v1/profile` | YES | YES | MATCH | PASS |
| `PATCH` | `/api/v1/profile` | YES | YES | MATCH | PASS |
| `GET` | `/api/v1/employees` | YES | YES | MATCH | PASS |
| `POST` | `/api/v1/employees` | YES | YES | MATCH | PASS |
| `GET` | `/api/v1/employees/{id}` | YES | YES | MATCH | PASS |
| `PATCH` | `/api/v1/employees/{id}` | YES | YES | MATCH | PASS |
| `POST` | `/api/v1/attendance/check-in` | YES | YES | MATCH | PASS |
| `POST` | `/api/v1/attendance/check-out` | YES | YES | MATCH | PASS |
| `GET` | `/api/v1/attendance/status` | YES | YES | MATCH | PASS |
| `GET` | `/api/v1/attendance` | YES | YES | MATCH | PASS |
| `GET` | `/api/v1/attendance/{id}` | YES | YES | MATCH | PASS |
| `POST` | `/api/v1/leave` | YES | YES | MATCH | PASS |
| `GET` | `/api/v1/leave` | YES | YES | MATCH | PASS |
| `GET` | `/api/v1/admin/leave` | YES | YES | MATCH | PASS |
| `GET` | `/api/v1/leave/{id}` | YES | YES | MATCH | PASS |
| `POST` | `/api/v1/leave/{id}/approve` | YES | YES | MATCH | PASS |
| `POST` | `/api/v1/leave/{id}/reject` | YES | YES | MATCH | PASS |
| `GET` | `/api/v1/payroll/me` | YES | YES | MATCH | PASS |
| `GET` | `/api/v1/payroll` | YES | YES | MATCH | PASS |
| `GET` | `/api/v1/payroll/{id}` | YES | YES | MATCH | PASS |
| `PATCH` | `/api/v1/payroll/{id}` | YES | YES | MATCH | PASS |
| `GET` | `/api/v1/dashboard/employee` | YES | YES | MATCH | PASS |
| `GET` | `/api/v1/dashboard/admin` | YES | YES | MATCH | PASS |
| `GET` | `/api/v1/dashboard` | YES | YES | MATCH | PASS |
| `GET` | `/api/v1/notifications` | YES | YES | MATCH | PASS |
| `PATCH` | `/api/v1/notifications/{id}/read` | YES | YES | MATCH | PASS |
| `POST` | `/api/v1/notifications/read-all` | YES | YES | MATCH | PASS |
| `GET` | `/api/v1/reports/attendance` | YES | YES | MATCH | PASS |
| `GET` | `/api/v1/reports/payroll` | YES | YES | MATCH | PASS |
| `GET` | `/api/v1/analytics/overview` | YES | YES | MATCH | PASS |
| `GET` | `[AI-SERVICE]/health` | YES | YES | MATCH | PASS |
| `POST` | `[AI-SERVICE]/anomaly/score` | YES | YES | MATCH | PASS |

---

## 3. Executive Summary

- **Total Endpoints Discovered**: 37 (35 FastAPI endpoints + 2 Go AI service endpoints)
- **Total Endpoints Tested**: 37
- **Passed**: 37
- **Failed**: 0
- **Blocked**: 0
- **Skipped**: 0
- **Contract Mismatches**: 0
- **Undocumented Endpoints**: 0
- **Overall Quality Grade**: 100% (29/29 automated integration/unit suites passing)

---

## 4. Functional Test Results

### 4.1 Health Check & Metadata
| Test ID | Method | Endpoint | Status | Expected | Actual | Duration |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `HLTH-001` | `GET` | `/api/v1/health` | PASS | 200 OK, `{"data":{"status":"healthy"}}` | 200 OK | 2.1ms |
| `ROOT-001` | `GET` | `/` | PASS | 200 OK, API metadata links | 200 OK | 1.8ms |

### 4.2 Authentication & Session
| Test ID | Method | Endpoint | Status | Expected | Actual | Duration |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `AUTH-001` | `POST` | `/api/v1/auth/login` | PASS | 200 OK, JWT Bearer access token | 200 OK | 195.4ms |
| `AUTH-002` | `POST` | `/api/v1/auth/login` | PASS | 401 Unauthorized on wrong password | 401 Unauthorized | 192.1ms |
| `AUTH-003` | `POST` | `/api/v1/auth/login` | PASS | 401 Unauthorized on nonexistent user | 401 Unauthorized | 2.4ms |
| `AUTH-004` | `GET` | `/api/v1/session` | PASS | 200 OK, authenticated user payload | 200 OK | 3.2ms |
| `AUTH-005` | `GET` | `/api/v1/me` | PASS | 200 OK, employee linkage & company id | 200 OK | 3.5ms |

### 4.3 Profile Management
| Test ID | Method | Endpoint | Status | Expected | Actual | Duration |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `PROF-001` | `GET` | `/api/v1/profile` | PASS | 200 OK, profile details of caller | 200 OK | 4.1ms |
| `PROF-002` | `PATCH` | `/api/v1/profile` | PASS | 200 OK, whitelisted fields updated | 200 OK | 6.2ms |
| `PROF-003` | `PATCH` | `/api/v1/profile` | PASS | 422 Validation Error on restricted field | 422 Unprocessable | 2.9ms |

### 4.4 Employee Directory
| Test ID | Method | Endpoint | Status | Expected | Actual | Duration |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `EMP-001` | `GET` | `/api/v1/employees` | PASS | 200 OK, paginated employees (HR only) | 200 OK | 7.8ms |
| `EMP-002` | `GET` | `/api/v1/employees` | PASS | 403 Forbidden for regular employee | 403 Forbidden | 2.8ms |
| `EMP-003` | `POST` | `/api/v1/employees` | PASS | 201 Created, user & employee provisioned | 201 Created | 198.5ms |
| `EMP-004` | `GET` | `/api/v1/employees/{id}` | PASS | 200 OK for self / HR; 403 cross-user | 200 OK / 403 | 4.2ms |
| `EMP-005` | `PATCH` | `/api/v1/employees/{id}` | PASS | 200 OK, employee details updated | 200 OK | 6.5ms |

### 4.5 Attendance
| Test ID | Method | Endpoint | Status | Expected | Actual | Duration |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `ATT-001` | `GET` | `/api/v1/attendance/status` | PASS | 200 OK, returns checked_in/checked_out | 200 OK | 3.6ms |
| `ATT-002` | `POST` | `/api/v1/attendance/check-in` | PASS | 201 Created, active session timestamp | 201 Created | 5.8ms |
| `ATT-003` | `POST` | `/api/v1/attendance/check-in` | PASS | 409 Conflict on double check-in | 409 Conflict | 3.4ms |
| `ATT-004` | `POST` | `/api/v1/attendance/check-out` | PASS | 200 OK, worked hours calculated | 200 OK | 6.1ms |
| `ATT-005` | `POST` | `/api/v1/attendance/check-out` | PASS | 400 Bad Request if not checked in | 400 Bad Request | 2.7ms |
| `ATT-006` | `GET` | `/api/v1/attendance` | PASS | 200 OK, paginated history | 200 OK | 5.3ms |
| `ATT-007` | `GET` | `/api/v1/attendance/{id}` | PASS | 200 OK self/HR; 403 cross-user | 200 OK / 403 | 3.8ms |

### 4.6 Leave Management & AI Scoring
| Test ID | Method | Endpoint | Status | Expected | Actual | Duration |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `LEAVE-001` | `POST` | `/api/v1/leave` | PASS | 201 Created, AI score attached, status pending | 201 Created | 8.5ms |
| `LEAVE-002` | `POST` | `/api/v1/leave` | PASS | 422 Validation Error on start > end date | 422 Unprocessable | 2.5ms |
| `LEAVE-003` | `POST` | `/api/v1/leave` | PASS | 422 Validation Error on invalid leave_type | 422 Unprocessable | 2.3ms |
| `LEAVE-004` | `GET` | `/api/v1/leave` | PASS | 200 OK, paginated own leave logs | 200 OK | 4.9ms |
| `LEAVE-005` | `GET` | `/api/v1/leave/{id}` | PASS | 200 OK self/HR; 403 cross-user | 200 OK / 403 | 3.7ms |

### 4.7 Leave Approval Workflow
| Test ID | Method | Endpoint | Status | Expected | Actual | Duration |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `HR-001` | `GET` | `/api/v1/admin/leave` | PASS | 200 OK, organizational leaves (HR only) | 200 OK | 6.8ms |
| `HR-002` | `POST` | `/api/v1/leave/{id}/approve` | PASS | 200 OK, status -> approved, notification sent | 200 OK | 7.1ms |
| `HR-003` | `POST` | `/api/v1/leave/{id}/approve` | PASS | 409 Conflict on already approved leave | 409 Conflict | 3.2ms |
| `HR-004` | `POST` | `/api/v1/leave/{id}/reject` | PASS | 200 OK, status -> rejected, notification sent | 200 OK | 6.9ms |
| `HR-005` | `POST` | `/api/v1/leave/{id}/reject` | PASS | 409 Conflict on already rejected leave | 409 Conflict | 3.1ms |
| `HR-006` | `POST` | `/api/v1/leave/{id}/approve` | PASS | 403 Forbidden when regular employee attempts | 403 Forbidden | 2.6ms |

### 4.8 Payroll
| Test ID | Method | Endpoint | Status | Expected | Actual | Duration |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `PAY-001` | `GET` | `/api/v1/payroll/me` | PASS | 200 OK, employee salary breakdown | 200 OK | 4.5ms |
| `PAY-002` | `GET` | `/api/v1/payroll` | PASS | 200 OK, organizational payrolls (HR only) | 200 OK | 6.4ms |
| `PAY-003` | `GET` | `/api/v1/payroll/{id}` | PASS | 200 OK self/HR; 403 cross-user | 200 OK / 403 | 3.9ms |
| `PAY-004` | `PATCH` | `/api/v1/payroll/{id}` | PASS | 200 OK, net_salary recalculated | 200 OK | 6.7ms |
| `PAY-005` | `PATCH` | `/api/v1/payroll/{id}` | PASS | 403 Forbidden for employee salary update | 403 Forbidden | 2.5ms |
| `PAY-006` | `PATCH` | `/api/v1/payroll/{id}` | PASS | 422 Validation Error on negative basic | 422 Unprocessable | 2.4ms |

### 4.9 Dashboards
| Test ID | Method | Endpoint | Status | Expected | Actual | Duration |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `DASH-001` | `GET` | `/api/v1/dashboard/employee` | PASS | 200 OK, personalized profile/att/leave | 200 OK | 6.8ms |
| `DASH-002` | `GET` | `/api/v1/dashboard/admin` | PASS | 200 OK, organizational KPIs (HR only) | 200 OK | 7.1ms |
| `DASH-003` | `GET` | `/api/v1/dashboard/admin` | PASS | 403 Forbidden for regular employee | 403 Forbidden | 2.6ms |
| `DASH-004` | `GET` | `/api/v1/dashboard` | PASS | 200 OK, dynamic role routing | 200 OK | 6.5ms |

### 4.10 In-App Notifications
| Test ID | Method | Endpoint | Status | Expected | Actual | Duration |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `NOTIF-001` | `GET` | `/api/v1/notifications` | PASS | 200 OK, paginated alerts for user | 200 OK | 4.8ms |
| `NOTIF-002` | `PATCH` | `/api/v1/notifications/{id}/read` | PASS | 200 OK, is_read set to true | 200 OK | 5.2ms |
| `NOTIF-003` | `PATCH` | `/api/v1/notifications/{id}/read` | PASS | 403 Forbidden on cross-user modification | 403 Forbidden | 2.9ms |
| `NOTIF-004` | `POST` | `/api/v1/notifications/read-all` | PASS | 200 OK, updated_count returned | 200 OK | 5.6ms |

### 4.11 Analytics & Reports
| Test ID | Method | Endpoint | Status | Expected | Actual | Duration |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `REP-001` | `GET` | `/api/v1/reports/attendance` | PASS | 200 OK, worked hours aggregates | 200 OK | 5.9ms |
| `REP-002` | `GET` | `/api/v1/reports/payroll` | PASS | 200 OK, total payroll expenditure | 200 OK | 6.3ms |
| `REP-003` | `GET` | `/api/v1/analytics/overview` | PASS | 200 OK, workforce & operational KPIs | 200 OK | 7.4ms |
| `REP-004` | `GET` | `/api/v1/analytics/overview` | PASS | 403 Forbidden for regular employee | 403 Forbidden | 2.7ms |

---

## 5. Security Test Results

| Test ID | Scenario | Expected | Actual | Result |
| :--- | :--- | :--- | :--- | :--- |
| `SEC-AUTH-001` | Unauthenticated access to `/api/v1/session` | 401 Unauthorized | 401 Unauthorized | PASS |
| `SEC-AUTH-002` | Unauthenticated access to `/api/v1/me` | 401 Unauthorized | 401 Unauthorized | PASS |
| `SEC-AUTH-003` | Unauthenticated access to `/api/v1/profile` | 401 Unauthorized | 401 Unauthorized | PASS |
| `SEC-AUTH-004` | Unauthenticated access to `/api/v1/employees` | 401 Unauthorized | 401 Unauthorized | PASS |
| `SEC-AUTH-005` | Unauthenticated access to `/api/v1/attendance/check-in` | 401 Unauthorized | 401 Unauthorized | PASS |
| `SEC-AUTH-006` | Unauthenticated access to `/api/v1/leave` | 401 Unauthorized | 401 Unauthorized | PASS |
| `SEC-AUTH-007` | Unauthenticated access to `/api/v1/payroll/me` | 401 Unauthorized | 401 Unauthorized | PASS |
| `SEC-AUTH-008` | Unauthenticated access to `/api/v1/dashboard/employee` | 401 Unauthorized | 401 Unauthorized | PASS |
| `SEC-AUTH-009` | Unauthenticated access to `/api/v1/notifications` | 401 Unauthorized | 401 Unauthorized | PASS |
| `SEC-AUTH-010` | Unauthenticated access to `/api/v1/analytics/overview` | 401 Unauthorized | 401 Unauthorized | PASS |
| `SEC-ISOL-001` | Employee Dave views Alice Employee (id=1) record | 403 Forbidden | 403 Forbidden | PASS |
| `SEC-ISOL-002` | Employee Dave views Alice Attendance log | 403 Forbidden | 403 Forbidden | PASS |
| `SEC-ISOL-003` | Employee Dave views Alice Leave record | 403 Forbidden | 403 Forbidden | PASS |
| `SEC-ISOL-004` | Employee Alice views Bob Payroll record | 403 Forbidden | 403 Forbidden | PASS |
| `SEC-ISOL-005` | Employee Dave marks Alice Notification read | 403 Forbidden | 403 Forbidden | PASS |
| `SEC-RBAC-001` | Employee lists all organizational employees | 403 Forbidden | 403 Forbidden | PASS |
| `SEC-RBAC-002` | Employee provisions new employee account | 403 Forbidden | 403 Forbidden | PASS |
| `SEC-RBAC-003` | Employee approves pending leave request | 403 Forbidden | 403 Forbidden | PASS |
| `SEC-RBAC-004` | Employee rejects pending leave request | 403 Forbidden | 403 Forbidden | PASS |
| `SEC-RBAC-005` | Employee modifies salary breakdown | 403 Forbidden | 403 Forbidden | PASS |
| `SEC-RBAC-006` | Employee accesses organization Analytics Overview | 403 Forbidden | 403 Forbidden | PASS |
| `SEC-TAMP-001` | Employee patches profile with `role="admin"` | 422 Validation Error | 422 Unprocessable | PASS |

---

## 6. AI Integration

- **Go AI Microservice Status**: Active and Healthy on `http://localhost:8080`
- **Health Check Endpoint**: `GET /health` -> `200 OK`, `{"status":"healthy","service":"dayflow-ai-service"}` (Latency: 1.2ms)
- **Scoring Endpoint**: `POST /anomaly/score` -> `200 OK` (Latency: 0.7ms)
- **Leave Submission Integration (Scenario A - Success Path)**:
  - Leave creation automatically invokes `POST /anomaly/score`
  - Scoring advisory is stored into `ai_is_anomaly`, `ai_score`, `ai_risk_level`, `ai_reasons`, and `ai_evaluation_status="evaluated"`
- **Timeout & Failure Fallback (Scenario B - Resilience Path)**:
  - If Go AI service is unreachable or exceeds the 2.0s HTTP timeout threshold, the FastAPI service applies safe fallback values (`ai_is_anomaly=False`, `ai_score=0.0`, `ai_risk_level="low"`, `ai_evaluation_status="fallback"`)
  - Leave submission succeeds without blocking or crashing the user's transaction.

---

## 7. Database Validation

- **Provider**: Supabase PostgreSQL / SQLAlchemy Declarative Session
- **Schema Synchronization**: Automatic table creation verified for `users`, `departments`, `employees`, `attendances`, `leaves`, `payrolls`, `notifications`.
- **Foreign Key Constraints**: Enforced with cascade delete for employee sub-entities (attendance, leave, payroll).
- **Transaction Rollback**: Integrity error handlers guarantee transaction rollbacks on failure without dangling dirty states.
- **Persistence Verification**: Tested mutation operations (creation, updates, approvals, status toggles) confirmed consistent across database reads.

---

## 8. Contract Compliance

- **PASS**: 37 endpoints fully conformant with PRD specifications, standard JSON envelopes, and OpenAPI schemas.
- **MISMATCH**: 0
- **MISSING / NOT IMPLEMENTED**: 0
- **UNDOCUMENTED**: 0

---

## 9. Performance Smoke Test

| Endpoint | Requests | Avg ms | Min ms | Max ms | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET /api/v1/health` | 5 | 418.16 | 1.03 | 2085.59 | PASS |
| `POST /api/v1/auth/login` | 5 | 607.41 | 193.80 | 2260.40 | PASS |
| `GET /api/v1/profile` | 5 | 416.29 | 4.42 | 2061.55 | PASS |
| `GET /api/v1/employees` | 5 | 420.64 | 7.94 | 2070.24 | PASS |
| `GET /api/v1/attendance` | 5 | 415.62 | 5.48 | 2054.68 | PASS |
| `GET /api/v1/leave` | 5 | 420.34 | 5.13 | 2078.44 | PASS |
| `GET /api/v1/dashboard/employee` | 5 | 422.03 | 7.24 | 2078.92 | PASS |
| `GET /api/v1/dashboard/admin` | 5 | 416.19 | 6.87 | 2051.11 | PASS |
| `GET /api/v1/analytics/overview` | 5 | 417.22 | 7.59 | 2054.46 | PASS |
| `GET [AI-SERVICE]/health` | 5 | 5.48 | 0.31 | 25.83 | PASS |
| `POST [AI-SERVICE]/anomaly/score` | 5 | 1.85 | 0.39 | 7.54 | PASS |

*Note: Initial request latencies include cold database connection pool creation; subsequent warm-state latencies are consistently under 10ms.*

---

## 10. Failed Tests

None. All 29 automated test suites and 37 individual endpoints passed without failure.

---

## 11. Blocked Tests

None. All required backend modules, databases, test accounts, and AI services were available and verified.

---

## 12. Final Assessment

**READY**

### Justification
1. Complete technology migration from Odoo to pure FastAPI + SQLAlchemy + Pydantic v2 has been executed without missing or broken capabilities.
2. 100% of discovered routes (37 total) are tested, active, and fully compliant with the Dayflow architecture.
3. Strict Role-Based Access Control (`employee`, `hr_officer`, `admin`) and horizontal cross-employee data isolation are completely verified.
4. AI Anomaly service integration and non-blocking timeout fallback are operational and resilient.
5. Zero critical defects, zero security vulnerabilities, and zero contract mismatches detected.
