# -*- coding: utf-8 -*-
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

db_url = settings.get_database_url()

engine = create_engine(
    db_url,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    future=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    future=True
)

from app.models.base import Base


def get_db():
    """Dependency that yields a database session and ensures clean closure."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
