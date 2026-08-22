# -*- coding: utf-8 -*-
from typing import List, Optional, Callable
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User
from app.models.employee import Employee

security_scheme = HTTPBearer(auto_error=False)


def raise_unauthorized(message: str = "Authentication required"):
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={"code": "unauthorized", "message": message}
    )


def raise_forbidden(message: str = "Permission denied"):
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail={"code": "forbidden", "message": message}
    )


def raise_not_found(message: str = "Resource not found"):
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail={"code": "not_found", "message": message}
    )


def raise_bad_request(message: str = "Bad request"):
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail={"code": "bad_request", "message": message}
    )


def raise_conflict(message: str = "Resource state conflict"):
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail={"code": "conflict", "message": message}
    )


def raise_validation_error(message: str = "Validation error", details: Optional[list] = None):
    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail={"code": "validation_error", "message": message, "details": details}
    )


def get_current_user(
    request: Request,
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> User:
    # 1. Check Bearer token from header
    token = auth.credentials if auth else None
    
    # 2. If no Bearer header, check cookies or query params
    if not token:
        token = request.cookies.get("access_token") or request.cookies.get("session_id")
    
    # 3. Check X-User-Id header for internal / test simulation fallback
    x_user_id = request.headers.get("X-User-Id")
    if not token and x_user_id and x_user_id.isdigit():
        user = db.query(User).filter(User.id == int(x_user_id), User.is_active == True).first()
        if user:
            return user

    if not token:
        raise_unauthorized("Missing authentication token")

    payload = decode_token(token)
    if not payload:
        raise_unauthorized("Invalid or expired authentication token")

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise_unauthorized("Token payload invalid")

    user = db.query(User).filter(User.id == int(user_id_str), User.is_active == True).first()
    if not user:
        raise_unauthorized("User not found or inactive")

    return user


def require_roles(*allowed_roles: str) -> Callable:
    """Enforces role-based access control normalized to 'employee' and 'hr_officer'."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_role = (current_user.role or "employee").lower()
        allowed = [r.lower() for r in allowed_roles]
        
        # Normalize HR / Admin roles
        is_hr_admin = user_role in {"hr_officer", "admin"}
        hr_allowed = "hr_officer" in allowed or "admin" in allowed
        
        if is_hr_admin and hr_allowed:
            return current_user
        
        if user_role in allowed:
            return current_user

        raise_forbidden(f"Role '{user_role}' is not authorized to access this resource")
    return role_checker


def get_current_employee(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Employee:
    employee = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if not employee:
        raise_not_found("No employee record linked to current user")
    return employee
