# Dayflow REST API Contract Specification (v1)

## 1. Overview & Architecture

Dayflow backend REST API provides enterprise Human Resource Management workflows, role-based authorization, attendance logging, leave processing with AI anomaly detection, salary breakdowns, dashboards, in-app notifications, and workforce analytics.

- **Base URL**: `http://localhost:8000/api/v1`
- **Interactive Documentation**: `http://localhost:8000/docs` (Swagger UI) & `http://localhost:8000/redoc` (ReDoc)
- **OpenAPI 3.1 JSON**: `http://localhost:8000/openapi.json`
- **Protocol**: HTTP/1.1 over TLS / HTTP REST
- **Data Serialization**: JSON (`application/json; charset=utf-8`)

---

## 2. Standard JSON Response Envelopes

### 2.1 Single Object Envelope
```json
{
  "data": {
    "id": 1,
    "name": "Alice Employee"
  }
}
```

### 2.2 Paginated List Envelope
```json
{
  "data": [
    { "id": 1, "name": "Alice Employee" }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

### 2.3 Error Envelope
```json
{
  "error": {
    "code": "unauthorized | forbidden | not_found | conflict | validation_error | bad_request | internal_server_error",
    "message": "Human readable explanation of the error",
    "details": null
  }
}
```

---

## 3. Authentication & Headers

- **Authentication Scheme**: JWT Bearer Token in `Authorization: Bearer <token>` header or `session_id` HTTP-only cookie.
- **Roles**:
  - `employee`: Standard employee self-service.
  - `hr_officer`: Human resources officer with organizational management access.
  - `admin`: System administrator inheriting all permissions.

---

## 4. Endpoints Inventory

### 4.1 Health Check & Metadata
- `GET /api/v1/health`
  - Auth: Public
  - Response: `{"data": {"status": "healthy", "service": "dayflow-api", "version": "v1"}}`
- `GET /`
  - Auth: Public
  - Response: API metadata & documentation paths

### 4.2 Authentication & Session
- `POST /api/v1/auth/login`
  - Body: `{"login": "user@company.com", "password": "Password123!"}`
  - Response: `{"data": {"access_token": "...", "token_type": "bearer", "user": {...}}}`
- `GET /api/v1/session`
  - Auth: Bearer Token
  - Response: `{"data": {"authenticated": true, "user_id": 1, "user_name": "...", "user_login": "...", "role": "..."}}`
- `GET /api/v1/me`
  - Auth: Bearer Token
  - Response: `{"data": {"id": 1, "name": "...", "login": "...", "role": "...", "employee_id": 1, "company_id": 1, "partner_id": 1}}`

### 4.3 Profile Management
- `GET /api/v1/profile`
  - Auth: Bearer Token (Current Employee)
  - Response: `{"data": {"id": 1, "name": "...", "work_email": "...", "work_phone": "...", "job_title": "...", "department_name": "...", "emergency_contact": "...", "emergency_phone": "...", "role": "..."}}`
- `PATCH /api/v1/profile`
  - Auth: Bearer Token (Current Employee)
  - Whitelist fields: `work_phone`, `emergency_contact`, `emergency_phone`
  - Response: `{"data": ProfileOut}`

### 4.4 Employee Directory
- `GET /api/v1/employees`
  - Auth: HR Officer or Admin
  - Query: `page`, `page_size`, `department_id`, `search`
  - Response: `PaginatedDataEnvelope[EmployeeOut]`
- `POST /api/v1/employees`
  - Auth: HR Officer or Admin
  - Body: `{"name": "...", "work_email": "...", "work_phone": "...", "job_title": "...", "department_id": 1, "role": "employee", "password": "..."}`
  - Response: `DataEnvelope[EmployeeOut]` (Status 201)
- `GET /api/v1/employees/{id}`
  - Auth: Self or HR/Admin (403 on cross-user)
  - Response: `DataEnvelope[EmployeeOut]`
- `PATCH /api/v1/employees/{id}`
  - Auth: HR Officer or Admin
  - Body: Partial employee fields
  - Response: `DataEnvelope[EmployeeOut]`

### 4.5 Attendance
- `POST /api/v1/attendance/check-in`
  - Auth: Bearer Token (Current Employee)
  - Response: `DataEnvelope[AttendanceOut]` (Status 201; 409 if already checked in)
- `POST /api/v1/attendance/check-out`
  - Auth: Bearer Token (Current Employee)
  - Response: `DataEnvelope[AttendanceOut]` (Status 200; 400 if not checked in)
- `GET /api/v1/attendance/status`
  - Auth: Bearer Token (Current Employee)
  - Response: `{"data": {"attendance_state": "checked_in" | "checked_out", "last_check_in": "...", "last_check_out": "...", "current_attendance_id": ...}}`
- `GET /api/v1/attendance`
  - Auth: Bearer Token (Self for employee; HR can filter by `employee_id`)
  - Query: `page`, `page_size`, `employee_id`
  - Response: `PaginatedDataEnvelope[AttendanceOut]`
- `GET /api/v1/attendance/{id}`
  - Auth: Self or HR/Admin (403 on cross-user)
  - Response: `DataEnvelope[AttendanceOut]`

### 4.6 Leave Management
- `POST /api/v1/leave`
  - Auth: Bearer Token (Current Employee)
  - Body: `{"leave_type": "paid" | "sick" | "unpaid", "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD", "remarks": "..."}`
  - Response: `DataEnvelope[LeaveOut]` (Status 201; attaches AI anomaly evaluation)
- `GET /api/v1/leave`
  - Auth: Bearer Token (Current Employee)
  - Query: `page`, `page_size`, `status`
  - Response: `PaginatedDataEnvelope[LeaveOut]`
- `GET /api/v1/admin/leave`
  - Auth: HR Officer or Admin
  - Query: `page`, `page_size`, `status`, `employee_id`
  - Response: `PaginatedDataEnvelope[LeaveOut]`
- `GET /api/v1/leave/{id}`
  - Auth: Self or HR/Admin (403 on cross-user)
  - Response: `DataEnvelope[LeaveOut]`
- `POST /api/v1/leave/{id}/approve`
  - Auth: HR Officer or Admin
  - Body (Optional): `{"comments": "..."}`
  - Response: `DataEnvelope[LeaveOut]` (Status 200; 409 if not pending)
- `POST /api/v1/leave/{id}/reject`
  - Auth: HR Officer or Admin
  - Body (Optional): `{"comments": "..."}`
  - Response: `DataEnvelope[LeaveOut]` (Status 200; 409 if not pending)

### 4.7 Payroll
- `GET /api/v1/payroll/me`
  - Auth: Bearer Token (Current Employee)
  - Response: `DataEnvelope[PayrollOut]`
- `GET /api/v1/payroll`
  - Auth: HR Officer or Admin
  - Query: `page`, `page_size`, `employee_id`
  - Response: `PaginatedDataEnvelope[PayrollOut]`
- `GET /api/v1/payroll/{id}`
  - Auth: Self or HR/Admin (403 on cross-user)
  - Response: `DataEnvelope[PayrollOut]`
- `PATCH /api/v1/payroll/{id}`
  - Auth: HR Officer or Admin
  - Body: `{"basic_salary": 5000.0, "allowances": 1000.0, "deductions": 500.0, "payment_frequency": "monthly"}`
  - Response: `DataEnvelope[PayrollOut]` (Automatically recalculates `net_salary`)

### 4.8 Dashboards
- `GET /api/v1/dashboard/employee`
  - Auth: Bearer Token (Current Employee)
  - Response: `DataEnvelope[EmployeeDashboardOut]`
- `GET /api/v1/dashboard/admin`
  - Auth: HR Officer or Admin
  - Response: `DataEnvelope[AdminDashboardOut]`
- `GET /api/v1/dashboard`
  - Auth: Bearer Token (Dynamic role-based dispatch)
  - Response: `DataEnvelope[Dict]`

### 4.9 Notifications
- `GET /api/v1/notifications`
  - Auth: Bearer Token (Current User)
  - Query: `page`, `page_size`, `unread_only`
  - Response: `PaginatedDataEnvelope[NotificationOut]`
- `PATCH /api/v1/notifications/{id}/read`
  - Auth: Bearer Token (Owner only; 403 on cross-user)
  - Response: `{"data": {"id": 1, "is_read": true}}`
- `POST /api/v1/notifications/read-all`
  - Auth: Bearer Token (Current User)
  - Response: `{"data": {"updated_count": 5, "success": true}}`

### 4.10 Analytics & Reports
- `GET /api/v1/reports/attendance`
  - Auth: Bearer Token (Employee self; HR can filter by `employee_id`)
  - Query: `start_date`, `end_date`, `employee_id`
  - Response: `DataEnvelope[AttendanceReportOut]`
- `GET /api/v1/reports/payroll`
  - Auth: Bearer Token (HR or Employee self)
  - Query: `employee_id`
  - Response: `DataEnvelope[PayrollReportOut]`
- `GET /api/v1/analytics/overview`
  - Auth: HR Officer or Admin
  - Response: `DataEnvelope[AnalyticsOverviewOut]`
