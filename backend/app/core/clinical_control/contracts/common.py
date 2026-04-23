from __future__ import annotations

from typing import Generic, TypeVar

from pydantic import BaseModel, Field


T = TypeVar("T")


class TenantContext(BaseModel):
    tenant_id: str = Field(..., min_length=1, max_length=100)
    user_id: str = Field(..., min_length=1, max_length=100)
    role: str = Field(..., min_length=1, max_length=100)
    request_id: str = Field(..., min_length=1, max_length=100)


class ResponseMeta(BaseModel):
    tenant_id: str
    request_id: str
    version: str = "v1"


class ResponseAudit(BaseModel):
    trace_id: str


class ResponseEnvelope(BaseModel, Generic[T]):
    meta: ResponseMeta
    data: T
    audit: ResponseAudit
