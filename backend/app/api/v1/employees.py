# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.core.security import get_password_hash
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
from app.models.department import Department
from app.models.payroll import Payroll
from app.schemas.common import DataEnvelope, PaginatedDataEnvelope, PaginationMeta
from app.schemas.employee import EmployeeOut, EmployeeCreateIn, EmployeeUpdateIn
from typing import Optional, List, Dict, Any

router = APIRouter(tags=["Employees"])

@router.get("/employees", response_model=PaginatedDataEnvelope[EmployeeOut])
def list_employees(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    department_id: Optional[int] = None,
    search: Optional[str] = None,
    current_user: User = Depends(require_roles("hr_officer", "admin")),
    db: Session = Depends(get_db)
):
    """List employees with pagination and optional department/search filtering (HR only)."""
    query = db.query(Employee)

    if department_id:
        query = query.filter(Employee.department_id == department_id)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Employee.name.ilike(search_pattern),
                Employee.work_email.ilike(search_pattern),
                Employee.job_title.ilike(search_pattern)
            )
        )

    total = query.count()
    offset = (page - 1) * page_size
    employees = query.order_by(Employee.id.desc()).offset(offset).limit(page_size).all()

    data = [
        EmployeeOut(
            id=emp.id,
            user_id=emp.user_id,
            name=emp.name,
            work_email=emp.work_email,
            work_phone=emp.work_phone,
            job_title=emp.job_title,
            department_id=emp.department_id,
            department_name=emp.department.name if emp.department else None,
            emergency_contact=emp.emergency_contact,
            emergency_phone=emp.emergency_phone,
            role=emp.user.role if emp.user else "employee",
            active=emp.active
        )
        for emp in employees
    ]

    return {
        "data": data,
        "pagination": PaginationMeta.create(page, page_size, total)
    }

@router.post("/employees", response_model=DataEnvelope[EmployeeOut], status_code=201)
def create_employee(
    payload: EmployeeCreateIn,
    current_user: User = Depends(require_roles("hr_officer", "admin")),
    db: Session = Depends(get_db)
):
    """Create a new employee and provision user login account (HR only)."""
    email_clean = payload.work_email.strip().lower()
    existing_user = db.query(User).filter(User.email == email_clean).first()
    if existing_user:
        raise_conflict(f"User with email '{email_clean}' already exists")

    # 1. Create User
    new_user = User(
        email=email_clean,
        name=payload.name.strip(),
        password_hash=get_password_hash(payload.password or "TemporaryPassword123!"),
        role=payload.role or "employee",
        is_active=True
    )
    db.add(new_user)
    db.flush()

    # 2. Create Employee
    new_employee = Employee(
        user_id=new_user.id,
        name=payload.name.strip(),
        work_email=email_clean,
        work_phone=payload.work_phone,
        job_title=payload.job_title,
        department_id=payload.department_id,
        active=True
    )
    db.add(new_employee)
    db.flush()

    # 3. Initialize default Payroll record
    new_payroll = Payroll(
        employee_id=new_employee.id,
        basic_salary=0.0,
        allowances=0.0,
        deductions=0.0,
        net_salary=0.0,
        payment_frequency="monthly",
        currency="USD"
    )
    db.add(new_payroll)

    db.commit()
    db.refresh(new_employee)

    return {
        "data": EmployeeOut(
            id=new_employee.id,
            user_id=new_employee.user_id,
            name=new_employee.name,
            work_email=new_employee.work_email,
            work_phone=new_employee.work_phone,
            job_title=new_employee.job_title,
            department_id=new_employee.department_id,
            department_name=new_employee.department.name if new_employee.department else None,
            emergency_contact=new_employee.emergency_contact,
            emergency_phone=new_employee.emergency_phone,
            role=new_user.role,
            active=new_employee.active
        )
    }

@router.get("/employees/{id}", response_model=DataEnvelope[EmployeeOut])
def get_employee(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve specific employee details (Self or HR only; 403 on cross-user employee access)."""
    emp = db.query(Employee).filter(Employee.id == id).first()
    if not emp:
        raise_not_found("Employee not found")

    user_role = (current_user.role or "employee").lower()
    is_hr = user_role in {"hr_officer", "admin"}
    is_self = emp.user_id == current_user.id

    if not (is_hr or is_self):
        raise_forbidden("You are not authorized to view other employees' records")

    return {
        "data": EmployeeOut(
            id=emp.id,
            user_id=emp.user_id,
            name=emp.name,
            work_email=emp.work_email,
            work_phone=emp.work_phone,
            job_title=emp.job_title,
            department_id=emp.department_id,
            department_name=emp.department.name if emp.department else None,
            emergency_contact=emp.emergency_contact,
            emergency_phone=emp.emergency_phone,
            role=emp.user.role if emp.user else "employee",
            active=emp.active
        )
    }

@router.patch("/employees/{id}", response_model=DataEnvelope[EmployeeOut])
def update_employee(
    id: int,
    payload: EmployeeUpdateIn,
    current_user: User = Depends(require_roles("hr_officer", "admin")),
    db: Session = Depends(get_db)
):
    """Update employee details and department assignment (HR only)."""
    emp = db.query(Employee).filter(Employee.id == id).first()
    if not emp:
        raise_not_found("Employee not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(emp, field, val)

    db.commit()
    db.refresh(emp)

    return {
        "data": EmployeeOut(
            id=emp.id,
            user_id=emp.user_id,
            name=emp.name,
            work_email=emp.work_email,
            work_phone=emp.work_phone,
            job_title=emp.job_title,
            department_id=emp.department_id,
            department_name=emp.department.name if emp.department else None,
            emergency_contact=emp.emergency_contact,
            emergency_phone=emp.emergency_phone,
            role=emp.user.role if emp.user else "employee",
            active=emp.active
        )
    }
