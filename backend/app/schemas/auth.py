# -*- coding: utf-8 -*-
from pydantic import BaseModel, EmailStr
from typing import Optional

class LoginRequest(BaseModel):
    login: str  # Email or username
    password: str

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
