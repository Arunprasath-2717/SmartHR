# -*- coding: utf-8 -*-
from datetime import datetime, date, timezone
from fastapi import APIRouter, Depends, Query
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
from app.schemas.analytics import AttendanceReportOut, PayrollReportOut, AnalyticsOverviewOut
from typing import Optional, List, Dict, Any

router = APIRouter(tags=["Analytics & Reports"])

@router.get("/reports/attendance", response_model=DataEnvelope[AttendanceReportOut])
def get_attendance_report(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    employee_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate attendance report with worked hours aggregates."""
    user_role = (current_user.role or "employee").lower()
    is_hr = user_role in {"hr_officer", "admin"}

    query = db.query(Attendance)

    if not is_hr:
        emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
        if not emp:
            return {"data": {"total_records": 0, "total_worked_hours": 0.0, "average_worked_hours": 0.0, "records": []}}
        query = query.filter(Attendance.employee_id == emp.id)
    elif employee_id:
        query = query.filter(Attendance.employee_id == employee_id)

    if start_date:
        query = query.filter(Attendance.check_in >= datetime.combine(start_date, datetime.min.time(), tzinfo=timezone.utc))
    if end_date:
        query = query.filter(Attendance.check_in <= datetime.combine(end_date, datetime.max.time(), tzinfo=timezone.utc))

    records = query.order_by(Attendance.check_in.desc()).all()
    total_hours = round(sum(r.worked_hours for r in records), 2)
    avg_hours = round(total_hours / len(records), 2) if records else 0.0

    record_items = [
        {
            "id": r.id,
            "employee_id": r.employee_id,
            "employee_name": r.employee.name if r.employee else None,
            "check_in": r.check_in.isoformat(),
            "check_out": r.check_out.isoformat() if r.check_out else None,
            "worked_hours": r.worked_hours
        }
        for r in records
    ]

    return {
        "data": {
            "total_records": len(records),
            "total_worked_hours": total_hours,
            "average_worked_hours": avg_hours,
            "records": record_items
        }
    }

@router.get("/reports/payroll", response_model=DataEnvelope[PayrollReportOut])
def get_payroll_report(
    employee_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate payroll report with cost aggregates."""
    user_role = (current_user.role or "employee").lower()
    is_hr = user_role in {"hr_officer", "admin"}

    query = db.query(Payroll)

    if not is_hr:
        emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
        if not emp:
            return {
                "data": {
                    "total_payroll_records": 0,
                    "total_basic_salary": 0.0,
                    "total_allowances": 0.0,
                    "total_deductions": 0.0,
                    "total_net_salary": 0.0,
                    "currency": "USD",
                    "records": []
                }
            }
        query = query.filter(Payroll.employee_id == emp.id)
    elif employee_id:
        query = query.filter(Payroll.employee_id == employee_id)

    payrolls = query.all()
    total_basic = round(sum(p.basic_salary for p in payrolls), 2)
    total_allowances = round(sum(p.allowances for p in payrolls), 2)
    total_deductions = round(sum(p.deductions for p in payrolls), 2)
    total_net = round(sum(p.net_salary for p in payrolls), 2)
    currency = payrolls[0].currency if payrolls else "USD"

    record_items = [
        {
            "id": p.id,
            "employee_id": p.employee_id,
            "employee_name": p.employee.name if p.employee else None,
            "basic_salary": p.basic_salary,
            "allowances": p.allowances,
            "deductions": p.deductions,
            "net_salary": p.net_salary,
            "payment_frequency": p.payment_frequency,
            "currency": p.currency
        }
        for p in payrolls
    ]

    return {
        "data": {
            "total_payroll_records": len(payrolls),
            "total_basic_salary": total_basic,
            "total_allowances": total_allowances,
            "total_deductions": total_deductions,
            "total_net_salary": total_net,
            "currency": currency,
            "records": record_items
        }
    }

@router.get("/analytics/overview", response_model=DataEnvelope[AnalyticsOverviewOut])
def get_analytics_overview(
    current_user: User = Depends(require_roles("hr_officer", "admin")),
    db: Session = Depends(get_db)
):
    """Retrieve comprehensive organizational analytics overview (HR only)."""
    # 1. Workforce
    total_active_employees = db.query(Employee).filter(Employee.active == True).count()
    total_departments = db.query(Department).count()

    # 2. Attendance
    currently_checked_in = db.query(Attendance).filter(Attendance.check_out.is_(None)).count()
    total_attendances = db.query(Attendance).count()

    # 3. Leave
    pending_leaves = db.query(Leave).filter(Leave.status == "pending").count()
    approved_leaves = db.query(Leave).filter(Leave.status == "approved").count()
    rejected_leaves = db.query(Leave).filter(Leave.status == "rejected").count()

    # 4. Payroll
    payrolls = db.query(Payroll).all()
    total_net_payroll = round(sum(p.net_salary for p in payrolls), 2)
    avg_net_salary = round(total_net_payroll / len(payrolls), 2) if payrolls else 0.0

    return {
        "data": {
            "workforce": {
                "total_active_employees": total_active_employees,
                "total_departments": total_departments
            },
            "attendance": {
                "currently_checked_in": currently_checked_in,
                "total_attendance_records": total_attendances
            },
            "leave": {
                "pending_requests": pending_leaves,
                "approved_requests": approved_leaves,
                "rejected_requests": rejected_leaves,
                "total_requests": pending_leaves + approved_leaves + rejected_leaves
            },
            "payroll": {
                "total_payroll_profiles": len(payrolls),
                "total_net_payroll_expenditure": total_net_payroll,
                "average_net_salary": avg_net_salary,
                "currency": payrolls[0].currency if payrolls else "USD"
            }
        }
    }
