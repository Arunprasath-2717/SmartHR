# -*- coding: utf-8 -*-
from pydantic import BaseModel
from typing import Dict, Any, List, Optional

class AttendanceReportOut(BaseModel):
    total_records: int
    total_worked_hours: float
    average_worked_hours: float
    records: List[Dict[str, Any]]

class PayrollReportOut(BaseModel):
    total_payroll_records: int
    total_basic_salary: float
    total_allowances: float
    total_deductions: float
    total_net_salary: float
    currency: str
    records: List[Dict[str, Any]]

class AnalyticsOverviewOut(BaseModel):
    workforce: Dict[str, Any]
    attendance: Dict[str, Any]
    leave: Dict[str, Any]
    payroll: Dict[str, Any]
