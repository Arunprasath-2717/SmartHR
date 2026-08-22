# -*- coding: utf-8 -*-
from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.auth import router as auth_router
from app.api.v1.profile import router as profile_router
from app.api.v1.employees import router as employees_router
from app.api.v1.attendance import router as attendance_router
from app.api.v1.leave import router as leave_router
from app.api.v1.payroll import router as payroll_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.analytics import router as analytics_router

api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(profile_router)
api_router.include_router(employees_router)
api_router.include_router(attendance_router)
api_router.include_router(leave_router)
api_router.include_router(payroll_router)
api_router.include_router(dashboard_router)
api_router.include_router(notifications_router)
api_router.include_router(analytics_router)
