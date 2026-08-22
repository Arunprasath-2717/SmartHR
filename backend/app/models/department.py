# -*- coding: utf-8 -*-
from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

class Department(Base, TimestampMixin):
    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)

    employees = relationship("Employee", back_populates="department")
