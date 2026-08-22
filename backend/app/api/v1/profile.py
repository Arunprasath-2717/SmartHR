# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, raise_validation_error, raise_not_found
from app.models.user import User
from app.models.employee import Employee
from app.schemas.common import DataEnvelope
from app.schemas.profile import ProfileOut
from typing import Dict, Any

router = APIRouter(tags=["Profile"])

# Strict PRD Whitelist: address, phone, profile_picture (plus contact info)
ALLOWED_PROFILE_FIELDS = {"address", "phone", "work_phone", "profile_picture", "emergency_contact", "emergency_phone"}
RESTRICTED_PROFILE_FIELDS = {"id", "name", "work_email", "job_title", "department_id", "role", "active", "documents"}

@router.get("/profile", response_model=DataEnvelope[ProfileOut])
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve profile of the currently authenticated employee."""
    emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if not emp:
        return {
            "data": {
                "id": current_user.id,
                "name": current_user.name,
                "work_email": current_user.email,
                "work_phone": None,
                "phone": None,
                "job_title": None,
                "department_id": None,
                "department_name": None,
                "address": None,
                "profile_picture": None,
                "documents": None,
                "emergency_contact": None,
                "emergency_phone": None,
                "role": current_user.role
            }
        }

    return {
        "data": {
            "id": emp.id,
            "name": emp.name,
            "work_email": emp.work_email or current_user.email,
            "work_phone": emp.work_phone,
            "phone": emp.work_phone,
            "job_title": emp.job_title,
            "department_id": emp.department_id,
            "department_name": emp.department.name if emp.department else None,
            "address": emp.address,
            "profile_picture": emp.profile_picture,
            "documents": emp.documents,
            "emergency_contact": emp.emergency_contact,
            "emergency_phone": emp.emergency_phone,
            "role": current_user.role
        }
    }

@router.patch("/profile", response_model=DataEnvelope[ProfileOut])
async def update_profile(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update allowed profile information (address, phone, profile picture) with whitelist enforcement."""
    try:
        body = await request.json()
    except Exception:
        body = {}

    # Reject attempt to modify restricted fields
    invalid_keys = set(body.keys()) - ALLOWED_PROFILE_FIELDS
    if invalid_keys:
        raise_validation_error(
            message=f"Modifying restricted field(s): {', '.join(sorted(invalid_keys))} is not permitted for employees",
            details=[{"field": k, "error": "restricted_field"} for k in sorted(invalid_keys)]
        )

    emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if not emp:
        raise_not_found("Employee profile not found for user")

    if "address" in body:
        emp.address = body["address"]
    if "phone" in body:
        emp.work_phone = body["phone"]
    if "work_phone" in body:
        emp.work_phone = body["work_phone"]
    if "profile_picture" in body:
        emp.profile_picture = body["profile_picture"]
    if "emergency_contact" in body:
        emp.emergency_contact = body["emergency_contact"]
    if "emergency_phone" in body:
        emp.emergency_phone = body["emergency_phone"]

    db.commit()
    db.refresh(emp)

    return {
        "data": {
            "id": emp.id,
            "name": emp.name,
            "work_email": emp.work_email or current_user.email,
            "work_phone": emp.work_phone,
            "phone": emp.work_phone,
            "job_title": emp.job_title,
            "department_id": emp.department_id,
            "department_name": emp.department.name if emp.department else None,
            "address": emp.address,
            "profile_picture": emp.profile_picture,
            "documents": emp.documents,
            "emergency_contact": emp.emergency_contact,
            "emergency_phone": emp.emergency_phone,
            "role": current_user.role
        }
    }
