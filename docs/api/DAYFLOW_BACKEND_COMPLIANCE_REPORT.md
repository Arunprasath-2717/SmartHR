# Dayflow Backend Compliance Report

## 1. PRD Scope Classification

### Core Current Scope (Mandatory)
- **Authentication & Authorization**: Registration (`/auth/register`), Login (`/auth/login`), Logout (`/auth/logout`), Session verification (`/session`), Identity resolution (`/me`).
- **Employee Profile Management**: Profile retrieval (`/profile`), Whitelisted contact updates (`/profile`).
- **Employee Management**: HR directory listing (`/employees`), employee onboarding, employee record updates (`/employees/{id}`).
- **Attendance Management**: Check-in (`/attendance/check-in`), check-out (`/attendance/check-out`), status tracking (`/attendance/status`), daily & weekly views (`/attendance`), PRD statuses (`Present`, `Absent`, `Half-day`, `Leave`).
- **Leave & Time-Off Management**: Leave submission (`/leave`), own leave history (`/leave`), leave types (`Paid`, `Sick`, `Unpaid`), states (`Pending`, `Approved`, `Rejected`).
- **Leave Approval Workflow**: HR review (`/admin/leave`), approval (`/leave/{id}/approve`), rejection (`/leave/{id}/reject`) with approver comments.
- **Payroll / Salary Management**: Employee read-only view (`/payroll/me`), HR salary structure updates (`/payroll/{id}`) with net calculation.
- **Dashboard Aggregation**: Personalized Employee Dashboard (`/dashboard/employee`), Organizational HR Dashboard (`/dashboard/admin`), Dynamic Dashboard (`/dashboard`).

### Optional / Future Enhancements (Per PRD)
- **Email & Notification Alerts**: (`/notifications`) — isolated and non-blocking for core workflows.
- **Analytics & Reports Dashboard**: (`/reports/*`, `/analytics/*`) — isolated and non-blocking for core workflows.

### Conditional / External Boundaries
- **Go AI Anomaly Service**: Optional heuristic scoring integration (`POST /anomaly/score`) with 2.0s non-blocking fallback; never blocks core leave creation.

---

## 2. Architecture Compliance

- **Framework**: Python 3.11 + FastAPI + Uvicorn + SQLAlchemy 2.0 + Pydantic v2 + Alembic.
- **Database Engine**: Supabase PostgreSQL / SQLAlchemy Declarative Models.
- **Design Pattern**: Domain-Driven Routers (`app/api/v1/`), Request/Response Schemas (`app/schemas/`), Centralized Exception Handling (`app/main.py`), and RBAC Middleware (`app/core/dependencies.py`).
- **Architecture Verdict**: **COMPLIANT**

---

## 3. Role Compliance

- **Functional User Classes**:
  - `employee`: Standard employee self-service access.
  - `hr_officer`: Admin / HR Officer managing employees, attendance, leaves, and payroll.
- **Normalization**: Normalized role guards strictly reject unauthorized horizontal or vertical privilege attempts with `403 Forbidden`.
- **Role Model Verdict**: **COMPLIANT**

---

## 4. Authentication Compliance

- **Employee Registration**: Self-service registration (`POST /api/v1/auth/register`) provisions User account and Employee profile.
- **Employee Sign In**: Secure password verification via `bcrypt` returning standard JWT Bearer token and HTTP-only session cookie.
- **Session & Identity**: `GET /api/v1/session` and `GET /api/v1/me` return authenticated user identity and role mapping without exposing password hashes.
- **Logout**: `POST /api/v1/auth/logout` clears session cookies.
- **Authentication Verdict**: **COMPLIANT**

---

## 5. Profile Compliance

- **Profile Retrieval**: `GET /api/v1/profile` returns personal details, job details, department, address, phone, and avatar.
- **Whitelist Editing**: `PATCH /api/v1/profile` strictly permits only `address`, `phone`, `work_phone`, `profile_picture`, `emergency_contact`, `emergency_phone`.
- **Restricted Fields**: Modifying restricted fields (`role`, `job_title`, `department_id`, `work_email`, `name`, `active`) is rejected with `422 Unprocessable Entity`.
- **Profile Verdict**: **COMPLIANT**

---

## 6. Attendance Compliance

- **Check-in / Check-out**: `POST /attendance/check-in` (201 Created) and `POST /attendance/check-out` (200 OK) with duplicate check-in conflict guard (409 Conflict) and worked hours auto-calculation.
- **Daily / Weekly Views**: `GET /attendance?view=daily` and `GET /attendance?view=weekly` filter logs across target date ranges.
- **Statuses**: Supports PRD statuses (`Present`, `Absent`, `Half-day`, `Leave`).
- **Ownership Isolation**: Employees view only their own logs; HR can inspect all employees.
- **Attendance Verdict**: **COMPLIANT**

---

## 7. Leave Compliance

- **Leave Types**: Strictly validated to `paid`, `sick`, `unpaid`.
- **Date Range Validation**: Ensures `start_date <= end_date` (rejecting inversions with `422 Validation Error`).
- **State Machine**: Initial status is strictly `pending`.
- **Leave Retrieval**: Employees view own requests; HR views organizational requests.
- **Leave Verdict**: **COMPLIANT**

---

## 8. Approval Compliance

- **HR Approval / Rejection**: `POST /leave/{id}/approve` and `POST /leave/{id}/reject` transition leave state from `pending` -> `approved` or `rejected`.
- **Comments**: Approvers can add structured decision comments (`approver_comments`).
- **State Transition Guard**: Rejecting or approving non-pending requests returns `409 Conflict`.
- **RBAC Guard**: Employee approval attempts return `403 Forbidden`.
- **Approval Verdict**: **COMPLIANT**

---

## 9. Payroll Compliance

- **Employee Read-Only**: `GET /payroll/me` returns individual salary structure and net salary.
- **HR Management**: `GET /payroll` lists organization payrolls; `PATCH /payroll/{id}` updates basic salary, allowances, deductions, and payment frequency with automatic net salary recalculation.
- **Security Guard**: Employee attempts to modify payroll return `403 Forbidden`.
- **Payroll Verdict**: **COMPLIANT**

---

## 10. Dashboard Compliance

- **Employee Dashboard**: Aggregates Profile, Attendance, Leave requests, and Salary overview.
- **Admin/HR Dashboard**: Aggregates Employee list overview, attendance records, and leave approval backlog.
- **Dynamic Routing**: `GET /dashboard` routes to Admin or Employee view based on active token role.
- **Dashboard Verdict**: **COMPLIANT**

---

## 11. Security Compliance

- **401 Unauthorized**: Enforced for unauthenticated requests.
- **403 Forbidden**: Enforced on cross-employee data access and role violations.
- **422 Validation Error**: Enforced on invalid inputs and profile parameter tampering.
- **Information Leakage**: Zero passwords, hashes, SQL errors, or internal secrets exposed in API responses.
- **Security Verdict**: **COMPLIANT**

---

## 12. API Contract Compliance

- **JSON Envelopes**: Standardized across all endpoints (`{"data": ...}`, `{"data": [...], "pagination": ...}`, `{"error": ...}`).
- **OpenAPI Schema**: Fully synchronized with running FastAPI application and `/docs` Swagger UI.
- **Contract Verdict**: **COMPLIANT**

---

## 13. Remaining Gaps

**None.** All core functional requirements, role models, attendance views, profile whitelists, leave state machines, and payroll controls specified in the Dayflow PRD are implemented, tested, and validated.

---

## 14. Final Status

**COMPLIANT**
