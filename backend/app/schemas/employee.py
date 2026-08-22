# -*- coding: utf-8 -*-
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date

class EmployeeCreateIn(BaseModel):
    name: str
    work_email: str
    work_phone: Optional[str] = None
    job_title: Optional[str] = None
    department_id: Optional[int] = None
    role: Optional[str] = "employee"
    password: Optional[str] = "TemporaryPassword123!"

class EmployeeUpdateIn(BaseModel):
    name: Optional[str] = None
    work_email: Optional[str] = None
    work_phone: Optional[str] = None
    job_title: Optional[str] = None
    department_id: Optional[int] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    active: Optional[bool] = None

class EmployeeOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    name: str
    work_email: Optional[str] = None
    work_phone: Optional[str] = None
    job_title: Optional[str] = None
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    role: Optional[str] = "employee"
    active: bool = True
