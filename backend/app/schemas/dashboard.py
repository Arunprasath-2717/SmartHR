# -*- coding: utf-8 -*-
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class EmployeeDashboardOut(BaseModel):
    profile: Dict[str, Any]
    attendance: Dict[str, Any]
    leave: Dict[str, Any]
    payroll: Optional[Dict[str, Any]] = None

class AdminDashboardOut(BaseModel):
    summary: Dict[str, Any]
    attendance_overview: Dict[str, Any]
    leave_overview: Dict[str, Any]
    payroll_overview: Dict[str, Any]
