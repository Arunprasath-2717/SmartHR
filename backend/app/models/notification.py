# -*- coding: utf-8 -*-
from typing import Optional
from sqlalchemy import String, Text, Boolean, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

class Notification(Base, TimestampMixin):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    notification_type: Mapped[str] = mapped_column(String(50), default="info", nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    res_model: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    res_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    user = relationship("User", back_populates="notifications")
