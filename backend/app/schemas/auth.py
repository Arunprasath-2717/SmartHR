# -*- coding: utf-8 -*-
from pydantic import BaseModel, EmailStr
from typing import Optional

class LoginRequest(BaseModel):
    login: str  # Email or username
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None
    address: Optional[str] = None
    job_title: Optional[str] = None
    department_id: Optional[int] = None

class UserOut(BaseModel):
    id: int
    name: str
    login: str
    role: str
    is_active: bool

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class SessionUserOut(BaseModel):
    id: int
    name: str
    login: str
    role: str
    employee_id: Optional[int] = None
    company_id: int = 1
    partner_id: int = 1

class LogoutResponse(BaseModel):
    success: bool
    message: str
