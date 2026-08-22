# -*- coding: utf-8 -*-
from datetime import date
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import (
    get_current_user,
    require_roles,
    raise_forbidden,
    raise_not_found,
    raise_conflict,
    raise_validation_error
)
from app.models.user import User
from app.models.employee import Employee
from app.models.leave import Leave
from app.models.notification import Notification
from app.services.ai_service import ai_client
from app.schemas.common import DataEnvelope, PaginatedDataEnvelope, PaginationMeta
from app.schemas.leave import LeaveCreateIn, LeaveDecisionIn, LeaveOut
from typing import Optional, List, Dict, Any

router = APIRouter(tags=["Leave"])

@router.post("/leave", response_model=DataEnvelope[LeaveOut], status_code=201)
def submit_leave_request(
    payload: LeaveCreateIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit a leave request.
    Core HRMS leave workflow is fully standalone and resilient.
    Optional AI scoring evaluation is non-blocking with automatic fallback.
    """
    if payload.start_date > payload.end_date:
        raise_validation_error("start_date cannot be after end_date")

    emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if not emp:
        raise_not_found("Employee profile not linked to user")

    duration_days = (payload.end_date - payload.start_date).days + 1

    # 1. Create Core Leave Record
    new_leave = Leave(
        employee_id=emp.id,
        leave_type=payload.leave_type,
        start_date=payload.start_date,
        end_date=payload.end_date,
        remarks=payload.remarks,
        status="pending",
        ai_is_anomaly=False,
        ai_score=0.0,
        ai_risk_level="low",
        ai_reasons="AI evaluation optional",
        ai_evaluation_status="fallback"
    )
    db.add(new_leave)
    db.flush()

    # 2. Non-blocking AI evaluation call (Optional integration boundary)
    try:
        ai_result = ai_client.score_leave_anomaly(
            leave_id=new_leave.id,
            employee_id=emp.id,
            leave_type=payload.leave_type,
            start_date=str(payload.start_date),
            end_date=str(payload.end_date),
            duration_days=duration_days,
            remarks=payload.remarks or ""
        )
        new_leave.ai_is_anomaly = ai_result.get("is_anomaly", False)
        new_leave.ai_score = ai_result.get("score", 0.0)
        new_leave.ai_risk_level = ai_result.get("risk_level", "low")
        new_leave.ai_reasons = ai_result.get("reasons", "")
        new_leave.ai_evaluation_status = ai_result.get("evaluation_status", "fallback")
    except Exception:
        # Guarantee core transaction success even if AI client raises an unexpected error
        pass

    # 3. Optional Notification generation (Protected so notification errors never fail leave)
    try:
        hr_users = db.query(User).filter(User.role.in_(["hr_officer", "admin"]), User.is_active == True).all()
        for hr_user in hr_users:
            notif = Notification(
                user_id=hr_user.id,
                title="New Leave Request Submitted",
                message=f"Employee {emp.name} submitted a {payload.leave_type} leave request ({payload.start_date} to {payload.end_date}).",
                notification_type="info",
                res_model="dayflow.leave",
                res_id=new_leave.id
            )
            db.add(notif)
    except Exception:
        pass

    db.commit()
    db.refresh(new_leave)

    return {
        "data": LeaveOut(
            id=new_leave.id,
            employee_id=new_leave.employee_id,
            employee_name=emp.name,
            leave_type=new_leave.leave_type,
            start_date=new_leave.start_date,
            end_date=new_leave.end_date,
            remarks=new_leave.remarks,
            status=new_leave.status,
            approver_comments=new_leave.approver_comments,
            ai_is_anomaly=new_leave.ai_is_anomaly,
            ai_score=new_leave.ai_score,
            ai_risk_level=new_leave.ai_risk_level,
            ai_reasons=new_leave.ai_reasons,
            ai_evaluation_status=new_leave.ai_evaluation_status
        )
    }

@router.get("/leave", response_model=PaginatedDataEnvelope[LeaveOut])
def list_own_leaves(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List leave requests submitted by the authenticated employee."""
    emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if not emp:
        return {"data": [], "pagination": PaginationMeta.create(page, page_size, 0)}

    query = db.query(Leave).filter(Leave.employee_id == emp.id)
    if status:
        query = query.filter(Leave.status == status.lower())

    total = query.count()
    offset = (page - 1) * page_size
    leaves = query.order_by(Leave.start_date.desc()).offset(offset).limit(page_size).all()

    data = [
        LeaveOut(
            id=l.id,
            employee_id=l.employee_id,
            employee_name=emp.name,
            leave_type=l.leave_type,
            start_date=l.start_date,
            end_date=l.end_date,
            remarks=l.remarks,
            status=l.status,
            approver_comments=l.approver_comments,
            ai_is_anomaly=l.ai_is_anomaly,
            ai_score=l.ai_score,
            ai_risk_level=l.ai_risk_level,
            ai_reasons=l.ai_reasons,
            ai_evaluation_status=l.ai_evaluation_status
        )
        for l in leaves
    ]

    return {
        "data": data,
        "pagination": PaginationMeta.create(page, page_size, total)
    }

@router.get("/admin/leave", response_model=PaginatedDataEnvelope[LeaveOut])
def list_all_leaves_admin(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    employee_id: Optional[int] = None,
    current_user: User = Depends(require_roles("hr_officer", "admin")),
    db: Session = Depends(get_db)
):
    """List organizational leave requests across all employees with filters (HR only)."""
    query = db.query(Leave)
    if status:
        query = query.filter(Leave.status == status.lower())
    if employee_id:
        query = query.filter(Leave.employee_id == employee_id)

    total = query.count()
    offset = (page - 1) * page_size
    leaves = query.order_by(Leave.start_date.desc()).offset(offset).limit(page_size).all()

    data = [
        LeaveOut(
            id=l.id,
            employee_id=l.employee_id,
            employee_name=l.employee.name if l.employee else None,
            leave_type=l.leave_type,
            start_date=l.start_date,
            end_date=l.end_date,
            remarks=l.remarks,
            status=l.status,
            approver_comments=l.approver_comments,
            ai_is_anomaly=l.ai_is_anomaly,
            ai_score=l.ai_score,
            ai_risk_level=l.ai_risk_level,
            ai_reasons=l.ai_reasons,
            ai_evaluation_status=l.ai_evaluation_status
        )
        for l in leaves
    ]

    return {
        "data": data,
        "pagination": PaginationMeta.create(page, page_size, total)
    }

@router.get("/leave/{id}", response_model=DataEnvelope[LeaveOut])
def get_leave_request(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve single leave request details (Self or HR only; 403 on cross-user access)."""
    leave = db.query(Leave).filter(Leave.id == id).first()
    if not leave:
        raise_not_found("Leave request not found")

    user_role = (current_user.role or "employee").lower()
    is_hr = user_role in {"hr_officer", "admin"}
    is_self = leave.employee and leave.employee.user_id == current_user.id

    if not (is_hr or is_self):
        raise_forbidden("You are not authorized to view other employees' leave requests")

    return {
        "data": LeaveOut(
            id=leave.id,
            employee_id=leave.employee_id,
            employee_name=leave.employee.name if leave.employee else None,
            leave_type=leave.leave_type,
            start_date=leave.start_date,
            end_date=leave.end_date,
            remarks=leave.remarks,
            status=leave.status,
            approver_comments=leave.approver_comments,
            ai_is_anomaly=leave.ai_is_anomaly,
            ai_score=leave.ai_score,
            ai_risk_level=leave.ai_risk_level,
            ai_reasons=leave.ai_reasons,
            ai_evaluation_status=leave.ai_evaluation_status
        )
    }

@router.post("/leave/{id}/approve", response_model=DataEnvelope[LeaveOut])
def approve_leave_request(
    id: int,
    payload: Optional[LeaveDecisionIn] = None,
    current_user: User = Depends(require_roles("hr_officer", "admin")),
    db: Session = Depends(get_db)
):
    """Approve a pending leave request (HR only). Rejects double approval with 409 Conflict."""
    leave = db.query(Leave).filter(Leave.id == id).first()
    if not leave:
        raise_not_found("Leave request not found")

    if leave.status != "pending":
        raise_conflict(f"Cannot approve leave request in '{leave.status}' status (must be pending)")

    leave.status = "approved"
    if payload and payload.comments:
        leave.approver_comments = payload.comments

    # Optional in-app notification to employee
    try:
        if leave.employee and leave.employee.user_id:
            notif = Notification(
                user_id=leave.employee.user_id,
                title="Leave Request Approved",
                message=f"Your {leave.leave_type} leave request ({leave.start_date} to {leave.end_date}) was approved.",
                notification_type="success",
                res_model="dayflow.leave",
                res_id=leave.id
            )
            db.add(notif)
    except Exception:
        pass

    db.commit()
    db.refresh(leave)

    return {
        "data": LeaveOut(
            id=leave.id,
            employee_id=leave.employee_id,
            employee_name=leave.employee.name if leave.employee else None,
            leave_type=leave.leave_type,
            start_date=leave.start_date,
            end_date=leave.end_date,
            remarks=leave.remarks,
            status=leave.status,
            approver_comments=leave.approver_comments,
            ai_is_anomaly=leave.ai_is_anomaly,
            ai_score=leave.ai_score,
            ai_risk_level=leave.ai_risk_level,
            ai_reasons=leave.ai_reasons,
            ai_evaluation_status=leave.ai_evaluation_status
        )
    }

@router.post("/leave/{id}/reject", response_model=DataEnvelope[LeaveOut])
def reject_leave_request(
    id: int,
    payload: Optional[LeaveDecisionIn] = None,
    current_user: User = Depends(require_roles("hr_officer", "admin")),
    db: Session = Depends(get_db)
):
    """Reject a pending leave request (HR only). Rejects double rejection with 409 Conflict."""
    leave = db.query(Leave).filter(Leave.id == id).first()
    if not leave:
        raise_not_found("Leave request not found")

    if leave.status != "pending":
        raise_conflict(f"Cannot reject leave request in '{leave.status}' status (must be pending)")

    leave.status = "rejected"
    if payload and payload.comments:
        leave.approver_comments = payload.comments

    # Optional in-app notification to employee
    try:
        if leave.employee and leave.employee.user_id:
            notif = Notification(
                user_id=leave.employee.user_id,
                title="Leave Request Rejected",
                message=f"Your {leave.leave_type} leave request ({leave.start_date} to {leave.end_date}) was rejected.",
                notification_type="danger",
                res_model="dayflow.leave",
                res_id=leave.id
            )
            db.add(notif)
    except Exception:
        pass

    db.commit()
    db.refresh(leave)

    return {
        "data": LeaveOut(
            id=leave.id,
            employee_id=leave.employee_id,
            employee_name=leave.employee.name if leave.employee else None,
            leave_type=leave.leave_type,
            start_date=leave.start_date,
            end_date=leave.end_date,
            remarks=leave.remarks,
            status=leave.status,
            approver_comments=leave.approver_comments,
            ai_is_anomaly=leave.ai_is_anomaly,
            ai_score=leave.ai_score,
            ai_risk_level=leave.ai_risk_level,
            ai_reasons=leave.ai_reasons,
            ai_evaluation_status=leave.ai_evaluation_status
        )
    }
