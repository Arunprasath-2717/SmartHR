# -*- coding: utf-8 -*-
from fastapi import APIRouter
from app.schemas.common import DataEnvelope
from typing import Dict, Any

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=DataEnvelope[Dict[str, Any]])
def get_health():
    """
    Health check endpoint for Dayflow API.
    Returns operational status, service name, and API version.
    """
    return {
        "data": {
            "status": "healthy",
            "service": "dayflow-api",
            "version": "v1"
        }
    }
