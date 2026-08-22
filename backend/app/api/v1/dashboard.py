# -*- coding: utf-8 -*-
from datetime import datetime, date, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import (
    get_current_user,
    require_roles,
    raise_forbidden,
    raise_not_found
)
from app.models.user import User
from app.models.employee import Employee
from app.models.department import Department
from app.models.attendance import Attendance
from app.models.leave import Leave
from app.models.payroll import Payroll
from app.schemas.common import DataEnvelope
from app.schemas.dashboard import EmployeeDashboardOut, AdminDashboardOut
from typing import Dict, Any

router = APIRouter(tags=["Dashboard"])

@router.get("/dashboard/employee", response_model=DataEnvelope[EmployeeDashboardOut])
def get_employee_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Aggregate personalized metrics for the authenticated employee."""
    emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    
    # 1. Profile Summary
    profile_data = {
        "id": emp.id if emp else current_user.id,
        "name": emp.name if emp else current_user.name,
        "work_email": emp.work_email if emp else current_user.email,
        "job_title": emp.job_title if emp else None,
        "department_name": emp.department.name if emp and emp.department else None,
        "role": current_user.role
    }

    # 2. Attendance Summary
    latest_att = db.query(Attendance).filter(Attendance.employee_id == emp.id).order_by(Attendance.check_in.desc()).first() if emp else None
    att_state = "checked_in" if latest_att and latest_att.check_out is None else "checked_out"
    
    attendance_data = {
        "attendance_state": att_state,
        "last_check_in": latest_att.check_in if latest_att else None,
        "last_check_out": latest_att.check_out if latest_att else None,
        "total_sessions": db.query(Attendance).filter(Attendance.employee_id == emp.id).count() if emp else 0
    }

    # 3. Leave Summary
    pending_leaves = db.query(Leave).filter(Leave.employee_id == emp.id, Leave.status == "pending").count() if emp else 0
    approved_leaves = db.query(Leave).filter(Leave.employee_id == emp.id, Leave.status == "approved").count() if emp else 0
    
    leave_data = {
        "pending_requests": pending_leaves,
        "approved_requests": approved_leaves,
        "total_requests": db.query(Leave).filter(Leave.employee_id == emp.id).count() if emp else 0
    }

    # 4. Payroll Summary
    payroll = db.query(Payroll).filter(Payroll.employee_id == emp.id).first() if emp else None
    payroll_data = {
        "net_salary": payroll.net_salary if payroll else 0.0,
        "payment_frequency": payroll.payment_frequency if payroll else "monthly",
        "currency": payroll.currency if payroll else "USD"
    } if payroll else None

    return {
        "data": {
            "profile": profile_data,
            "attendance": attendance_data,
            "leave": leave_data,
            "payroll": payroll_data
        }
    }

@router.get("/dashboard/admin", response_model=DataEnvelope[AdminDashboardOut])
def get_admin_dashboard(
    current_user: User = Depends(require_roles("hr_officer", "admin")),
    db: Session = Depends(get_db)
):
    """Aggregate enterprise-wide workforce and operations overview (HR only)."""
    # 1. Summary
    total_employees = db.query(Employee).filter(Employee.active == True).count()
    total_departments = db.query(Department).count()
    currently_checked_in = db.query(Attendance).filter(Attendance.check_out.is_(None)).count()
    pending_leaves = db.query(Leave).filter(Leave.status == "pending").count()

    summary_data = {
        "total_employees": total_employees,
        "total_departments": total_departments,
        "currently_checked_in": currently_checked_in,
        "pending_leaves": pending_leaves
    }

    # 2. Attendance Overview
    attendance_overview = {
        "currently_checked_in": currently_checked_in,
        "total_attendance_records": db.query(Attendance).count()
    }

    # 3. Leave Overview
    leave_overview = {
        "pending_count": pending_leaves,
        "approved_count": db.query(Leave).filter(Leave.status == "approved").count(),
        "rejected_count": db.query(Leave).filter(Leave.status == "rejected").count()
    }

    # 4. Payroll Overview
    payrolls = db.query(Payroll).all()
    total_payroll_cost = round(sum(p.net_salary for p in payrolls), 2)
    payroll_overview = {
        "total_payroll_count": len(payrolls),
        "total_net_payroll_cost": total_payroll_cost,
        "currency": payrolls[0].currency if payrolls else "USD"
    }

    return {
        "data": {
            "summary": summary_data,
            "attendance_overview": attendance_overview,
            "leave_overview": leave_overview,
            "payroll_overview": payroll_overview
        }
    }

@router.get("/dashboard", response_model=DataEnvelope[Dict[str, Any]])
def get_dynamic_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Dynamic dashboard: routes to admin overview for HR users, employee dashboard for employees."""
    user_role = (current_user.role or "employee").lower()
    if user_role in {"hr_officer", "admin"}:
        res = get_admin_dashboard(current_user=current_user, db=db)
        return {"data": res["data"]}
    else:
        res = get_employee_dashboard(current_user=current_user, db=db)
        return {"data": res["data"]}
