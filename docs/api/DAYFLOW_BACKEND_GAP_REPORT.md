# Dayflow Backend PRD Gap Report & Alignment Analysis

## 1. Executive Summary

This report performs a comprehensive gap analysis of the current Dayflow FastAPI backend implementation against the uploaded **Dayflow PRD: "Dayflow - Human Resource Management System"**.

The purpose of this audit is to strictly align the backend architecture, implemented scope, user roles, endpoints, database schemas, and external service boundaries with the core functional requirements of the PRD, while properly isolating future enhancements and avoiding scope creep.

---

## 2. Current Architecture vs PRD-Required Architecture

### Current Architecture
- **Framework**: Python 3.11 + FastAPI + Uvicorn + SQLAlchemy 2.0 + Pydantic v2 + Alembic.
- **Database**: Supabase PostgreSQL.
- **Microservices**: Integrated Go AI Anomaly Service (`ai-service/` on port 8080) invoked in the synchronous leave creation path.
- **Roles in Code**: `employee`, `hr_officer`, and `admin` (3 roles).
- **Modules Active**: Auth, Profile, Employees, Attendance, Leave, Payroll, Dashboard, Notifications, Analytics/Reports.

### PRD-Required Architecture
- **Core Current Scope**:
  1. Authentication & Authorization (Sign up, Sign in, Session, Logout)
  2. Employee Profile Management (Personal, Job, Salary, Documents, Profile Picture)
  3. Employee Management (Admin/HR organizational CRUD)
  4. Attendance Management (Check-in, Check-out, Daily view, Weekly view, Statuses: Present, Absent, Half-day, Leave)
  5. Leave & Time-Off Management (Types: Paid, Sick, Unpaid; States: Pending, Approved, Rejected)
  6. Leave Approval Workflow (Admin/HR comments, approval, rejection)
  7. Payroll / Salary Management (Employee read-only view; Admin/HR salary structure updates)
  8. Dashboard Aggregation (Personalized Employee Dashboard & Organizational Admin/HR Dashboard)
- **Future Enhancements (Per PRD)**:
  - *Email & notification alerts*
  - *Analytics & reports dashboard*
- **Role Model**: 2 Functional Classes: `Employee` and `Admin / HR Officer` (`hr_officer`).
- **AI Anomaly Service**: Not in the core 5-page PRD; must remain an optional/resilient external integration boundary that does not block core leave workflows.

---

## 3. Core Functionality Status Matrix

| Module | PRD Requirement | Current Backend Status | Compliance Assessment |
| :--- | :--- | :--- | :--- |
| **Authentication** | Sign up, Sign in, Session, Logout | Login & Session exist; Signup & Logout need explicit endpoints | Minor Gap (Add `/auth/register` & `/auth/logout`) |
| **Profile** | View own profile; Edit address, phone, avatar | Whitelist was restricted to phone/emergency contact | Gap (Add `address`, `phone`, `profile_picture` to model & whitelist) |
| **Employee Mgmt** | Admin/HR view/edit employee records | Full CRUD implemented | COMPLIANT |
| **Attendance** | Check-in/out, Status, Daily/Weekly view; Statuses (Present, Absent, Half-day, Leave) | Check-in/out, Status, Pagination implemented | Minor Gap (Add explicit daily/weekly filter & PRD status field) |
| **Leave** | Paid, Sick, Unpaid; Pending -> Approved / Rejected | Validated types & states implemented | COMPLIANT |
| **Leave Approval** | Admin/HR Approve/Reject with comments | Implemented with conflict guards | COMPLIANT |
| **Payroll** | Employee read-only; Admin/HR update salary | Implemented with auto-net computation | COMPLIANT |
| **Dashboard** | Profile, Att, Leave summaries; HR overview | Implemented aggregation | COMPLIANT |
| **Notifications** | Listed under Future Enhancements | Implemented, but was in leave creation path | Scope Correction (Decouple from core leave path) |
| **Analytics/Reports** | Listed under Future Enhancements | Implemented in separate module | Scope Correction (Isolate as optional future module) |
| **AI Service** | Not part of Core PRD | Integrated in leave creation path | Scope Correction (Decouple from mandatory core path) |

---

## 4. Detailed Gap Identification

### 4.1 Role-Model Gaps
- **Issue**: Backend dependencies allowed a third distinct `admin` role in addition to `hr_officer`.
- **PRD Specification**: Two functional user classes: `Employee` and `Admin / HR Officer`.
- **Resolution**: Normalize all admin checks to `hr_officer` (with backward-compatible aliasing so existing tokens remain valid).

### 4.2 Authentication Gaps
- **Issue**: Only `POST /api/v1/auth/login` was exposed. Self-service employee registration (`POST /api/v1/auth/register`) and session termination (`POST /api/v1/auth/logout`) were missing from the public auth router.
- **PRD Specification**: Employees must be able to sign up, sign in, and logout.
- **Resolution**: Add `POST /api/v1/auth/register` and `POST /api/v1/auth/logout`.

### 4.3 Employee Profile Gaps
- **Issue**: The `Employee` model lacked explicit columns for `address`, `profile_picture`, and `documents`.
- **PRD Specification**: Employee profile contains personal details, job details, salary structure, documents, and profile picture. Employee editing is strictly limited to `address`, `phone`, and `profile_picture`.
- **Resolution**: Add `address`, `profile_picture`, and `documents` fields to `Employee` model and schemas; ensure `PATCH /api/v1/profile` permits `address`, `phone`, `work_phone`, `profile_picture`, and blocks unauthorized fields with `422 Unprocessable Entity`.

### 4.4 Attendance Gaps
- **Issue**: Attendance records only had timestamps and worked hours without a status classification field (`Present`, `Absent`, `Half-day`, `Leave`) and lacked explicit `daily` / `weekly` view query parameters.
- **PRD Specification**: Daily attendance view, weekly attendance view, and statuses: `Present`, `Absent`, `Half-day`, `Leave`.
- **Resolution**: Add `status` field to `Attendance` model and response schemas; add `view=daily|weekly`, `date`, `start_date`, and `end_date` filters to `GET /api/v1/attendance`.

### 4.5 Scope-Creep & Future Enhancement Boundaries
- **Notifications**: Move notifications to optional status; ensure leave creation and core workflows execute successfully regardless of notification persistence or dispatch status.
- **Analytics & Reports**: Clearly isolate `/reports/*` and `/analytics/*` as optional/future enhancement endpoints.
- **Go AI Service**: Make AI anomaly scoring non-blocking and completely optional in the leave creation transaction so the core HRMS workflow operates self-sufficiently.

---

## 5. Required Implementation Changes

1. **`app/models/employee.py` & `app/schemas/employee.py`**:
   - Add `address`, `profile_picture`, `documents` attributes.
2. **`app/models/attendance.py` & `app/schemas/attendance.py`**:
   - Add `status` (`Present`, `Absent`, `Half-day`, `Leave`).
3. **`app/api/v1/auth.py` & `app/schemas/auth.py`**:
   - Add `POST /api/v1/auth/register` and `POST /api/v1/auth/logout`.
4. **`app/api/v1/profile.py` & `app/schemas/profile.py`**:
   - Update `ProfileOut` and `ProfileUpdateIn` to support `address`, `phone`, `profile_picture`.
5. **`app/api/v1/attendance.py`**:
   - Add support for `view=daily|weekly`, `date`, `start_date`, `end_date`, and `status`.
6. **`app/api/v1/leave.py`**:
   - Ensure leave creation is purely standalone and decoupled from AI service availability or notification errors.
7. **`app/core/dependencies.py`**:
   - Standardize role checks to `employee` and `hr_officer`.
8. **`backend/tests/`**:
   - Update and expand test suites to cover registration, logout, profile address/picture editing, and daily/weekly attendance filtering.
