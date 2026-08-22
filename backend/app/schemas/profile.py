# -*- coding: utf-8 -*-
from pydantic import BaseModel
from typing import Optional

class ProfileOut(BaseModel):
    id: int
    name: str
    work_email: Optional[str] = None
    work_phone: Optional[str] = None
    phone: Optional[str] = None
    job_title: Optional[str] = None
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    address: Optional[str] = None
    profile_picture: Optional[str] = None
    documents: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    role: str

class ProfileUpdateIn(BaseModel):
    address: Optional[str] = None
    phone: Optional[str] = None
    work_phone: Optional[str] = None
    profile_picture: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
