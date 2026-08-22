# -*- coding: utf-8 -*-
from pydantic import BaseModel
from typing import Optional

class PayrollOut(BaseModel):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    basic_salary: float
    allowances: float
    deductions: float
    net_salary: float
    payment_frequency: str
    currency: str

class PayrollUpdateIn(BaseModel):
    basic_salary: Optional[float] = None
    allowances: Optional[float] = None
    deductions: Optional[float] = None
    payment_frequency: Optional[str] = None
    currency: Optional[str] = None
