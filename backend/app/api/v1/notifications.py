# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import (
    get_current_user,
    raise_forbidden,
    raise_not_found
)
from app.models.user import User
from app.models.notification import Notification
from app.schemas.common import DataEnvelope, PaginatedDataEnvelope, PaginationMeta
from app.schemas.notification import NotificationOut, NotificationMarkReadOut
from typing import Optional, List, Dict, Any

router = APIRouter(tags=["Notifications"])

@router.get("/notifications", response_model=PaginatedDataEnvelope[NotificationOut])
def list_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    unread_only: Optional[bool] = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve paginated in-app alerts and notifications for the authenticated user."""
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    if unread_only:
        query = query.filter(Notification.is_read == False)

    total = query.count()
    offset = (page - 1) * page_size
    notifications = query.order_by(Notification.created_at.desc()).offset(offset).limit(page_size).all()

    data = [
        NotificationOut(
            id=n.id,
            user_id=n.user_id,
            title=n.title,
            message=n.message,
            notification_type=n.notification_type,
            is_read=n.is_read,
            res_model=n.res_model,
            res_id=n.res_id,
            created_at=n.created_at
        )
        for n in notifications
    ]

    return {
        "data": data,
        "pagination": PaginationMeta.create(page, page_size, total)
    }

@router.patch("/notifications/{id}/read", response_model=DataEnvelope[NotificationMarkReadOut])
def mark_notification_read(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark single notification as read (Self only; 403 on cross-user access)."""
    notif = db.query(Notification).filter(Notification.id == id).first()
    if not notif:
        raise_not_found("Notification not found")

    if notif.user_id != current_user.id:
        raise_forbidden("You are not authorized to modify other users' notifications")

    notif.is_read = True
    db.commit()

    return {
        "data": {
            "id": notif.id,
            "is_read": True
        }
    }

@router.post("/notifications/read-all", response_model=DataEnvelope[Dict[str, Any]])
def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark all unread notifications for current user as read."""
    unread_count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})

    db.commit()

    return {
        "data": {
            "updated_count": unread_count,
            "success": True
        }
    }
