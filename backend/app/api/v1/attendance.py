# -*- coding: utf-8 -*-
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import (
    get_current_user,
    get_current_employee,
    require_roles,
    raise_conflict,
    raise_bad_request,
    raise_forbidden,
    raise_not_found
)
from app.models.user import User
from app.models.employee import Employee
from app.models.attendance import Attendance
from app.schemas.common import DataEnvelope, PaginatedDataEnvelope, PaginationMeta
from app.schemas.attendance import AttendanceOut, AttendanceStatusOut
from typing import Optional, List, Dict, Any

router = APIRouter(tags=["Attendance"])

@router.post("/attendance/check-in", response_model=DataEnvelope[AttendanceOut], status_code=201)
def check_in(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record employee check-in. Rejects with 409 Conflict if already checked in."""
    emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if not emp:
        raise_not_found("Employee profile not linked to user")

    # Check for active check-in (check_out is None)
    active_att = db.query(Attendance).filter(
        Attendance.employee_id == emp.id,
        Attendance.check_out.is_(None)
    ).first()

    if active_att:
        raise_conflict("Cannot check in: an active check-in session already exists")

    now = datetime.now(timezone.utc)
    new_att = Attendance(
        employee_id=emp.id,
        check_in=now,
        check_out=None,
        worked_hours=0.0
    )
    db.add(new_att)
    db.commit()
    db.refresh(new_att)

    return {
        "data": AttendanceOut(
            id=new_att.id,
            employee_id=new_att.employee_id,
            employee_name=emp.name,
            check_in=new_att.check_in,
            check_out=new_att.check_out,
            worked_hours=new_att.worked_hours
        )
    }

@router.post("/attendance/check-out", response_model=DataEnvelope[AttendanceOut])
def check_out(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record employee check-out. Rejects with 400 Bad Request if no active check-in exists."""
    emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if not emp:
        raise_not_found("Employee profile not linked to user")

    active_att = db.query(Attendance).filter(
        Attendance.employee_id == emp.id,
        Attendance.check_out.is_(None)
    ).order_by(Attendance.check_in.desc()).first()

    if not active_att:
        raise_bad_request("Cannot check out: no active check-in found for employee")

    now = datetime.now(timezone.utc)
    active_att.check_out = now

    check_in_dt = active_att.check_in
    if check_in_dt.tzinfo is None:
        check_in_dt = check_in_dt.replace(tzinfo=timezone.utc)

    delta_seconds = (now - check_in_dt).total_seconds()
    active_att.worked_hours = round(max(0.0, delta_seconds / 3600.0), 2)

    db.commit()
    db.refresh(active_att)

    return {
        "data": AttendanceOut(
            id=active_att.id,
            employee_id=active_att.employee_id,
            employee_name=emp.name,
            check_in=active_att.check_in,
            check_out=active_att.check_out,
            worked_hours=active_att.worked_hours
        )
    }

@router.get("/attendance/status", response_model=DataEnvelope[AttendanceStatusOut])
def get_attendance_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current check-in state and timestamps for the authenticated employee."""
    emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if not emp:
        return {
            "data": {
                "attendance_state": "checked_out",
                "last_check_in": None,
                "last_check_out": None,
                "current_attendance_id": None
            }
        }

    latest = db.query(Attendance).filter(Attendance.employee_id == emp.id).order_by(Attendance.check_in.desc()).first()

    if not latest or latest.check_out is not None:
        return {
            "data": {
                "attendance_state": "checked_out",
                "last_check_in": latest.check_in if latest else None,
                "last_check_out": latest.check_out if latest else None,
                "current_attendance_id": None
            }
        }

    return {
        "data": {
            "attendance_state": "checked_in",
            "last_check_in": latest.check_in,
            "last_check_out": None,
            "current_attendance_id": latest.id
        }
    }

@router.get("/attendance", response_model=PaginatedDataEnvelope[AttendanceOut])
def list_attendance(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    employee_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List attendance records with pagination. Employees see own logs; HR can filter by employee."""
    user_role = (current_user.role or "employee").lower()
    is_hr = user_role in {"hr_officer", "admin"}

    query = db.query(Attendance)

    if not is_hr:
        emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
        if not emp:
            return {"data": [], "pagination": PaginationMeta.create(page, page_size, 0)}
        query = query.filter(Attendance.employee_id == emp.id)
    elif employee_id:
        query = query.filter(Attendance.employee_id == employee_id)

    total = query.count()
    offset = (page - 1) * page_size
    records = query.order_by(Attendance.check_in.desc()).offset(offset).limit(page_size).all()

    data = [
        AttendanceOut(
            id=r.id,
            employee_id=r.employee_id,
            employee_name=r.employee.name if r.employee else None,
            check_in=r.check_in,
            check_out=r.check_out,
            worked_hours=r.worked_hours
        )
        for r in records
    ]

    return {
        "data": data,
        "pagination": PaginationMeta.create(page, page_size, total)
    }

@router.get("/attendance/{id}", response_model=DataEnvelope[AttendanceOut])
def get_attendance_record(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve single attendance log (Self or HR only; 403 on cross-user access)."""
    rec = db.query(Attendance).filter(Attendance.id == id).first()
    if not rec:
        raise_not_found("Attendance record not found")

    user_role = (current_user.role or "employee").lower()
    is_hr = user_role in {"hr_officer", "admin"}
    is_self = rec.employee and rec.employee.user_id == current_user.id

    if not (is_hr or is_self):
        raise_forbidden("You are not authorized to view other employees' attendance records")

    return {
        "data": AttendanceOut(
            id=rec.id,
            employee_id=rec.employee_id,
            employee_name=rec.employee.name if rec.employee else None,
            check_in=rec.check_in,
            check_out=rec.check_out,
            worked_hours=rec.worked_hours
        )
    }
