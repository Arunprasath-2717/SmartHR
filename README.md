# Dayflow — Human Resource Management System

Dayflow is a full-stack Human Resource Management System designed to
simplify employee and HR operations through secure authentication,
attendance tracking, leave management, approvals, payroll access, and
role-based dashboards.

---

## 🚀 Overview

Dayflow provides separate experiences for:

- **Employee**
- **HR Officer**

The system follows a clear separation between the frontend,
backend, and database layers.

```text
┌──────────────────────────────┐
│      Next.js Frontend        │
│   React 19 + App Router      │
└──────────────┬───────────────┘
               │
               │ REST / JSON
               ▼
┌──────────────────────────────┐
│       FastAPI Backend        │
│        Python 3.11+          │
└──────────────┬───────────────┘
               │
               │ SQLAlchemy 2.x
               ▼
┌──────────────────────────────┐
│     Supabase PostgreSQL      │
└──────────────────────────────┘
