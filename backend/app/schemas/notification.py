# -*- coding: utf-8 -*-
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificationOut(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    notification_type: str
    is_read: bool
    res_model: Optional[str] = None
    res_id: Optional[int] = None
    created_at: datetime

class NotificationMarkReadOut(BaseModel):
    id: int
    is_read: bool
