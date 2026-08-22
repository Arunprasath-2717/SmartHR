# -*- coding: utf-8 -*-
from sqlalchemy import String, Float, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

class Payroll(Base, TimestampMixin):
    __tablename__ = "payrolls"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id: Mapped[int] = mapped_column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    basic_salary: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    allowances: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    deductions: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    net_salary: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    payment_frequency: Mapped[str] = mapped_column(String(50), default="monthly", nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="USD", nullable=False)

    employee = relationship("Employee", back_populates="payroll")

    def calculate_net(self) -> float:
        self.net_salary = round((self.basic_salary or 0.0) + (self.allowances or 0.0) - (self.deductions or 0.0), 2)
        return self.net_salary
