# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, get_password_hash
from app.core.dependencies import get_current_user, raise_unauthorized
from app.models.user import User
from app.models.employee import Employee
from app.schemas.common import DataEnvelope
from app.schemas.auth import LoginRequest, TokenResponse, SessionUserOut
from typing import Dict, Any, Optional

router = APIRouter(tags=["Authentication"])

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
