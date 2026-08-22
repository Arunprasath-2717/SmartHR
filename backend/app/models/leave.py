# -*- coding: utf-8 -*-
from datetime import date
from typing import Optional
from sqlalchemy import String, Text, Boolean, Float, Integer, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

class Leave(Base, TimestampMixin):
    __tablename__ = "leaves"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id: Mapped[int] = mapped_column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)

    leave_type: Mapped[str] = mapped_column(String(50), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False, index=True)
    approver_comments: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # AI Anomaly Fields
    ai_is_anomaly: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    ai_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    ai_risk_level: Mapped[str] = mapped_column(String(20), default="low", nullable=False)
    ai_reasons: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ai_evaluation_status: Mapped[str] = mapped_column(String(20), default="fallback", nullable=False)

    employee = relationship("Employee", back_populates="leaves")
