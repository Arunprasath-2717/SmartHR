# -*- coding: utf-8 -*-
from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import date

class LeaveCreateIn(BaseModel):
    leave_type: str
    start_date: date
    end_date: date
    remarks: Optional[str] = None

    @field_validator("leave_type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        clean = v.strip().lower()
        if clean not in {"paid", "sick", "unpaid"}:
            raise ValueError("leave_type must be one of: 'paid', 'sick', 'unpaid'")
        return clean

    @field_validator("end_date")
    @classmethod
    def validate_date_range(cls, end_date: date, values) -> date:
        start_date = values.data.get("start_date")
        if start_date and end_date < start_date:
            raise ValueError("start_date cannot be after end_date")
        return end_date

class LeaveDecisionIn(BaseModel):
    comments: Optional[str] = None

class LeaveOut(BaseModel):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    leave_type: str
    start_date: date
    end_date: date
    remarks: Optional[str] = None
    status: str
    approver_comments: Optional[str] = None
    ai_is_anomaly: bool = False
    ai_score: float = 0.0
    ai_risk_level: str = "low"
    ai_reasons: Optional[str] = None
    ai_evaluation_status: str = "fallback"
