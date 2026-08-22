# -*- coding: utf-8 -*-
from datetime import datetime
from typing import Optional
from sqlalchemy import Float, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

class Attendance(Base, TimestampMixin):
    __tablename__ = "attendances"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id: Mapped[int] = mapped_column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    
    check_in: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    check_out: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    worked_hours: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    employee = relationship("Employee", back_populates="attendances")
