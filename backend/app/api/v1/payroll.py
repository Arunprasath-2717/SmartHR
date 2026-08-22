# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import (
    get_current_user,
    require_roles,
    raise_forbidden,
    raise_not_found,
    raise_validation_error
)
from app.models.user import User
from app.models.employee import Employee
from app.models.payroll import Payroll
from app.schemas.common import DataEnvelope, PaginatedDataEnvelope, PaginationMeta
from app.schemas.payroll import PayrollOut, PayrollUpdateIn
from typing import Optional, List, Dict, Any

router = APIRouter(tags=["Payroll"])

ALLOWED_SALARY_FIELDS = {"basic_salary", "allowances", "deductions", "payment_frequency", "currency"}
VALID_PAYMENT_FREQUENCIES = {"monthly", "biweekly", "weekly"}

@router.get("/payroll/me", response_model=DataEnvelope[PayrollOut])
def get_own_payroll(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve salary structure and payroll breakdown for the authenticated employee."""
    emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if not emp:
        raise_not_found("Employee profile not linked to user")

    payroll = db.query(Payroll).filter(Payroll.employee_id == emp.id).first()
    if not payroll:
        # Create default payroll structure
        payroll = Payroll(
            employee_id=emp.id,
            basic_salary=0.0,
            allowances=0.0,
            deductions=0.0,
            net_salary=0.0,
            payment_frequency="monthly",
            currency="USD"
        )
        db.add(payroll)
        db.commit()
        db.refresh(payroll)

    return {
        "data": PayrollOut(
            id=payroll.id,
            employee_id=payroll.employee_id,
            employee_name=emp.name,
            basic_salary=payroll.basic_salary,
            allowances=payroll.allowances,
            deductions=payroll.deductions,
            net_salary=payroll.net_salary,
            payment_frequency=payroll.payment_frequency,
            currency=payroll.currency
        )
    }

@router.get("/payroll", response_model=PaginatedDataEnvelope[PayrollOut])
def list_payrolls_admin(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    employee_id: Optional[int] = None,
    current_user: User = Depends(require_roles("hr_officer", "admin")),
    db: Session = Depends(get_db)
):
    """List payroll structures across all employees (HR only)."""
    query = db.query(Payroll)
    if employee_id:
        query = query.filter(Payroll.employee_id == employee_id)

    total = query.count()
    offset = (page - 1) * page_size
    payrolls = query.order_by(Payroll.id.desc()).offset(offset).limit(page_size).all()

    data = [
        PayrollOut(
            id=p.id,
            employee_id=p.employee_id,
            employee_name=p.employee.name if p.employee else None,
            basic_salary=p.basic_salary,
            allowances=p.allowances,
            deductions=p.deductions,
            net_salary=p.net_salary,
            payment_frequency=p.payment_frequency,
            currency=p.currency
        )
        for p in payrolls
    ]

    return {
        "data": data,
        "pagination": PaginationMeta.create(page, page_size, total)
    }

@router.get("/payroll/{id}", response_model=DataEnvelope[PayrollOut])
def get_payroll_record(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve single payroll breakdown (Self or HR only; 403 on cross-user access)."""
    payroll = db.query(Payroll).filter(Payroll.id == id).first()
    if not payroll:
        raise_not_found("Payroll record not found")

    user_role = (current_user.role or "employee").lower()
    is_hr = user_role in {"hr_officer", "admin"}
    is_self = payroll.employee and payroll.employee.user_id == current_user.id

    if not (is_hr or is_self):
        raise_forbidden("You are not authorized to view other employees' payroll details")

    return {
        "data": PayrollOut(
            id=payroll.id,
            employee_id=payroll.employee_id,
            employee_name=payroll.employee.name if payroll.employee else None,
            basic_salary=payroll.basic_salary,
            allowances=payroll.allowances,
            deductions=payroll.deductions,
            net_salary=payroll.net_salary,
            payment_frequency=payroll.payment_frequency,
            currency=payroll.currency
        )
    }

@router.patch("/payroll/{id}", response_model=DataEnvelope[PayrollOut])
def update_payroll_record(
    id: int,
    payload: PayrollUpdateIn,
    current_user: User = Depends(require_roles("hr_officer", "admin")),
    db: Session = Depends(get_db)
):
    """Update employee salary structure and automatically recalculate net salary (HR only)."""
    payroll = db.query(Payroll).filter(Payroll.id == id).first()
    if not payroll:
        # Fallback to employee_id lookup
        payroll = db.query(Payroll).filter(Payroll.employee_id == id).first()
        if not payroll:
            raise_not_found("Payroll record not found")

    update_data = payload.model_dump(exclude_unset=True)

    if "basic_salary" in update_data and (update_data["basic_salary"] is None or update_data["basic_salary"] < 0):
        raise_validation_error("basic_salary must be a non-negative number")

    if "allowances" in update_data and (update_data["allowances"] is None or update_data["allowances"] < 0):
        raise_validation_error("allowances must be a non-negative number")

    if "deductions" in update_data and (update_data["deductions"] is None or update_data["deductions"] < 0):
        raise_validation_error("deductions must be a non-negative number")

    if "payment_frequency" in update_data:
        freq = str(update_data["payment_frequency"]).lower()
        if freq not in VALID_PAYMENT_FREQUENCIES:
            raise_validation_error(f"payment_frequency must be one of: {', '.join(sorted(VALID_PAYMENT_FREQUENCIES))}")
        payroll.payment_frequency = freq

    if "currency" in update_data:
        payroll.currency = str(update_data["currency"]).upper()

    if "basic_salary" in update_data:
        payroll.basic_salary = float(update_data["basic_salary"])
    if "allowances" in update_data:
        payroll.allowances = float(update_data["allowances"])
    if "deductions" in update_data:
        payroll.deductions = float(update_data["deductions"])

    payroll.calculate_net()

    db.commit()
    db.refresh(payroll)

    return {
        "data": PayrollOut(
            id=payroll.id,
            employee_id=payroll.employee_id,
            employee_name=payroll.employee.name if payroll.employee else None,
            basic_salary=payroll.basic_salary,
            allowances=payroll.allowances,
            deductions=payroll.deductions,
            net_salary=payroll.net_salary,
            payment_frequency=payroll.payment_frequency,
            currency=payroll.currency
        )
    }
