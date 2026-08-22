# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, get_password_hash
from app.core.dependencies import get_current_user, raise_unauthorized, raise_conflict, raise_validation_error
from app.models.user import User
from app.models.employee import Employee
from app.models.payroll import Payroll
from app.schemas.common import DataEnvelope
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, SessionUserOut, LogoutResponse
from typing import Dict, Any, Optional

router = APIRouter(tags=["Authentication"])

@router.post("/auth/register", response_model=DataEnvelope[TokenResponse], status_code=201)
def register(payload: RegisterRequest, response: Response, db: Session = Depends(get_db)):
    """Self-service employee registration endpoint."""
    email_clean = payload.email.strip().lower()
    existing_user = db.query(User).filter(User.email == email_clean).first()
    if existing_user:
        raise_conflict(f"Account with email '{email_clean}' already exists")

    # 1. Create User
    new_user = User(
        email=email_clean,
        name=payload.name.strip(),
        password_hash=get_password_hash(payload.password),
        role="employee",
        is_active=True
    )
    db.add(new_user)
    db.flush()

    # 2. Create Employee Profile
    new_employee = Employee(
        user_id=new_user.id,
        name=payload.name.strip(),
        work_email=email_clean,
        work_phone=payload.phone,
        address=payload.address,
        job_title=payload.job_title or "Employee",
        department_id=payload.department_id,
        active=True
    )
    db.add(new_employee)
    db.flush()

    # 3. Create default Payroll
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
    db.refresh(new_user)

    access_token = create_access_token(subject=new_user.id, role=new_user.role)
    response.set_cookie(
        key="session_id",
        value=access_token,
        httponly=True,
        max_age=604800,
        samesite="lax"
    )

    return {
        "data": {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": new_user.id,
                "name": new_user.name,
                "login": new_user.email,
                "role": new_user.role,
                "is_active": new_user.is_active
            }
        }
    }

@router.post("/auth/login", response_model=DataEnvelope[TokenResponse])
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    """Authenticate user with email and password, returning JWT access token."""
    login_id = payload.login.strip().lower()
    user = db.query(User).filter(User.email == login_id, User.is_active == True).first()
    
    if not user or not verify_password(payload.password, user.password_hash):
        raise_unauthorized("Invalid email or password")
        
    access_token = create_access_token(subject=user.id, role=user.role)
    
    # Set cookie for browser session support
    response.set_cookie(
        key="session_id",
        value=access_token,
        httponly=True,
        max_age=604800,
        samesite="lax"
    )
    
    return {
        "data": {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "name": user.name,
                "login": user.email,
                "role": user.role,
                "is_active": user.is_active
            }
        }
    }

@router.post("/auth/logout", response_model=DataEnvelope[LogoutResponse])
def logout(response: Response, current_user: User = Depends(get_current_user)):
    """Logout current user and clear session cookies."""
    response.delete_cookie(key="session_id")
    response.delete_cookie(key="access_token")
    return {
        "data": {
            "success": True,
            "message": "Logged out successfully"
        }
    }

@router.get("/session", response_model=DataEnvelope[Dict[str, Any]])
def get_session(current_user: User = Depends(get_current_user)):
    """Verify active session and return basic authenticated user identity."""
    return {
        "data": {
            "authenticated": True,
            "user_id": current_user.id,
            "user_name": current_user.name,
            "user_login": current_user.email,
            "role": current_user.role
        }
    }

@router.get("/me", response_model=DataEnvelope[SessionUserOut])
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Return full user metadata, role resolution, and employee linkage for current user."""
    employee = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    return {
        "data": {
            "id": current_user.id,
            "name": current_user.name,
            "login": current_user.email,
            "role": current_user.role,
            "employee_id": employee.id if employee else None,
            "company_id": 1,
            "partner_id": 1
        }
    }
