# -*- coding: utf-8 -*-
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AttendanceOut(BaseModel):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    check_in: datetime
    check_out: Optional[datetime] = None
    worked_hours: float

class AttendanceStatusOut(BaseModel):
    attendance_state: str  # "checked_in" or "checked_out"
    last_check_in: Optional[datetime] = None
    last_check_out: Optional[datetime] = None
    current_attendance_id: Optional[int] = None
