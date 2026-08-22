# -*- coding: utf-8 -*-
from typing import Generic, TypeVar, List, Optional, Any
from pydantic import BaseModel, ConfigDict
import math

T = TypeVar("T")

class PaginationMeta(BaseModel):
    page: int
    page_size: int
    total: int
    total_pages: int

    @classmethod
    def create(cls, page: int, page_size: int, total: int):
        safe_page_size = max(1, page_size) if page_size else 20
        safe_page = max(1, page) if page else 1
        total_count = max(0, total) if total else 0
        total_pages = max(1, math.ceil(total_count / safe_page_size)) if total_count > 0 else 1
        return cls(
            page=safe_page,
            page_size=safe_page_size,
            total=total_count,
            total_pages=total_pages
        )

class DataEnvelope(BaseModel, Generic[T]):
    data: T
    model_config = ConfigDict(arbitrary_types_allowed=True)

class PaginatedDataEnvelope(BaseModel, Generic[T]):
    data: List[T]
    pagination: PaginationMeta
    model_config = ConfigDict(arbitrary_types_allowed=True)

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Any] = None

class ErrorEnvelope(BaseModel):
    error: ErrorDetail
