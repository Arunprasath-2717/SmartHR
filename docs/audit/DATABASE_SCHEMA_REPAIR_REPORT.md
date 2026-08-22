# Dayflow Database Schema & Migration Repair Report

## 1. Root Cause

During live integration validation, `POST /api/v1/auth/register` failed with HTTP 500 (`psycopg2.errors.UndefinedColumn: column "address" of relation "employees" does not exist`).

### Investigation Findings:
1. **Schema Drift**: The SQLAlchemy `Employee` model in `app/models/employee.py` and `Attendance` model in `app/models/attendance.py` had been updated to support PRD fields (`address`, `profile_picture`, `documents` on `employees` and `status` on `attendances`).
2. **Missing Migrations**: The live Supabase PostgreSQL database tables had been provisioned in an earlier phase before these columns existed.
3. **Misleading Startup Assumption**: FastAPI startup lifespan executed `Base.metadata.create_all(bind=engine)`, which in SQLAlchemy/PostgreSQL only creates non-existent tables and **never** alters or adds missing columns to existing tables, while logging a false success message.
4. **Empty Migration History**: The `backend/alembic/versions/` directory contained no migration scripts.

---

## 2. Schema Differences Identified

A direct comparison of SQLAlchemy 2.0 models against `information_schema.columns` on the live database revealed the following missing columns:

| Table | Model Defined Columns | Live Database Columns (Before Fix) | Missing in Database |
| :--- | :---: | :---: | :--- |
| **`employees`** | 18 | 15 | `address` (VARCHAR(500)), `profile_picture` (VARCHAR(1000)), `documents` (TEXT) |
| **`attendances`** | 8 | 7 | `status` (VARCHAR(50), server_default='Present') |
| **`users`** | 8 | 8 | *None (100% Match)* |
| **`departments`** | 4 | 4 | *None (100% Match)* |
| **`leaves`** | 15 | 15 | *None (100% Match)* |
| **`payrolls`** | 10 | 10 | *None (100% Match)* |
| **`notifications`**| 10 | 10 | *None (100% Match)* |

---

## 3. Migration Created

Created a non-destructive Alembic migration file:
`backend/alembic/versions/0001_add_missing_employee_and_attendance_columns.py`

### Migration Specification (Revision: `0001_schema_sync`):
- Added `address` (`sa.String(500)`, nullable=True) to `employees`.
- Added `profile_picture` (`sa.String(1000)`, nullable=True) to `employees`.
- Added `documents` (`sa.Text()`, nullable=True) to `employees`.
- Added `status` (`sa.String(50)`, nullable=False, server_default='Present') to `attendances`.
- Created index `ix_attendances_status` on `attendances(status)`.

---

## 4. Migration Applied

Executed standard Alembic upgrade command:
```bash
alembic upgrade head
```
Output:
```text
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade  -> 0001_schema_sync, add missing employee and attendance columns
```

Post-migration inspection via `information_schema.columns` confirmed **100% schema consistency** across all 7 domain tables.

---

## 5. Startup Lifespan Correction

Updated `lifespan` handler in `backend/app/main.py` to remove false claims of schema synchronization, replacing it with an active database connection check (`SELECT 1`).

---

## 6. Live API Verification Results (http://localhost:8000)

| Step | Operation | Method & Endpoint | Payload / Parameters | Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Step 9** | Employee Registration | `POST /api/v1/auth/register` | `name`, `email`, `password`, `phone`, `address`, `job_title` | `201 Created` (Persisted User + Employee + Payroll) | **PASS** |
| **Step 10** | Employee Sign In | `POST /api/v1/auth/login` | `login`, `password` | `200 OK` (Returned JWT access token) | **PASS** |
| **Step 11** | Verify Active Session | `GET /api/v1/session` | Bearer Token | `200 OK` (`authenticated: true`) | **PASS** |
| **Step 11** | Verify User Identity | `GET /api/v1/me` | Bearer Token | `200 OK` (Linked `employee_id` returned) | **PASS** |
| **Step 12** | Get Employee Profile | `GET /api/v1/profile` | Bearer Token | `200 OK` (Verified `address` field) | **PASS** |
| **Step 12** | Patch Employee Profile | `PATCH /api/v1/profile` | `address`, `phone`, `profile_picture` | `200 OK` (Updated & verified) | **PASS** |
| **Step 13** | Attendance Check-in | `POST /api/v1/attendance/check-in` | Bearer Token | `201 Created` (`status: Present`) | **PASS** |
| **Step 13** | Attendance Status | `GET /api/v1/attendance/status` | Bearer Token | `200 OK` (`state: checked_in`) | **PASS** |
| **Step 13** | Attendance Check-out | `POST /api/v1/attendance/check-out` | Bearer Token | `200 OK` (`status: Half-day`) | **PASS** |
| **Step 13** | Attendance History | `GET /api/v1/attendance` | Bearer Token | `200 OK` (Filtered history) | **PASS** |
| **Step 13** | Leave Submission | `POST /api/v1/leave` | `leave_type`, `dates`, `remarks` | `201 Created` (`status: pending`) | **PASS** |
| **Step 13** | Employee Dashboard | `GET /api/v1/dashboard/employee` | Bearer Token | `200 OK` (Aggregated KPIs) | **PASS** |
| **Step 13** | Employee Payroll View | `GET /api/v1/payroll/me` | Bearer Token | `200 OK` (Salary breakdown) | **PASS** |
| **Step 14** | HR Login | `POST /api/v1/auth/login` | `bob@company.com` | `200 OK` (HR Bearer Token) | **PASS** |
| **Step 14** | HR Employee Listing | `GET /api/v1/employees` | HR Token | `200 OK` (Listed all employees) | **PASS** |
| **Step 14** | HR Leave Review | `GET /api/v1/admin/leave` | HR Token | `200 OK` (Listed pending leaves) | **PASS** |
| **Step 14** | HR Leave Approval | `POST /api/v1/leave/{id}/approve`| `comments: "Approved by HR"` | `200 OK` (`status: approved`) | **PASS** |
| **Step 14** | HR Payroll Listing | `GET /api/v1/payroll` | HR Token | `200 OK` (Listed all payrolls) | **PASS** |

---

## 7. Security Results

- **Horizontal Data Isolation**: Employee A attempting to access Employee B records (`/employees/1`, `/payroll/2`, `/attendance/2`) returns strict `403 Forbidden`.
- **Vertical Privilege Boundaries**: Employee attempting administrative operations (`GET /employees`, `GET /admin/leave`, `POST /leave/{id}/approve`, `PATCH /payroll/{id}`) returns strict `403 Forbidden`.
- **Parameter Whitelisting**: Employee attempting to modify restricted profile fields (`role`, `job_title`, `work_email`) returns `422 Unprocessable Entity`.

---

## 8. Regression Suite Results

- **Test Framework**: Pytest 8.3.4 + `pytest-asyncio` + HTTPX TestClient.
- **Suites Executed**: 30
- **Passed**: 30 (100%)
- **Failed**: 0
- **Errors**: 0
- **Execution Time**: 28.41s

---

## 9. Remaining Issues

**None.** Zero database schema mismatches, zero migration errors, and zero API regressions remain.

---

## 10. Final Status

**READY FOR INTEGRATION**
