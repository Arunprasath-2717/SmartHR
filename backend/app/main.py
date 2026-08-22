# -*- coding: utf-8 -*-
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from app.core.config import settings
from app.core.database import engine, Base
import app.models  # Ensures all models are registered with Base metadata
from app.api.v1.router import api_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("dayflow.app")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database tables are created
    logger.info("Initializing Dayflow FastAPI application...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database schema verified and synchronized.")
    except Exception as e:
        logger.error("Database connection initialization failed: %s", str(e))
    yield
    # Shutdown
    logger.info("Shutting down Dayflow FastAPI application.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Dayflow - AI-Assisted Human Resource Management System REST API",
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# 1. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Centralized Exception Handlers (Standardizing Dayflow Error Envelope)
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    detail = exc.detail
    if isinstance(detail, dict):
        code = detail.get("code", "http_error")
        message = detail.get("message", str(detail))
        details = detail.get("details", None)
    else:
        status_to_code = {
            400: "bad_request",
            401: "unauthorized",
            403: "forbidden",
            404: "not_found",
            409: "conflict",
            422: "validation_error",
            500: "internal_server_error"
        }
        code = status_to_code.get(exc.status_code, "http_error")
        message = str(detail)
        details = None

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": code,
                "message": message,
                "details": details
            }
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field = " -> ".join(str(loc) for loc in err.get("loc", []))
        errors.append({
            "field": field,
            "error": err.get("msg", "invalid")
        })
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "validation_error",
                "message": "Invalid input format or missing required fields",
                "details": errors
            }
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled server exception on %s %s: %s", request.method, request.url.path, str(exc))
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "internal_server_error",
                "message": "An unexpected error occurred while processing the request",
                "details": None
            }
        }
    )

# 3. Mount v1 API Routers
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "Dayflow Backend API",
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/api/v1/health"
    }
