from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID


class AuditLogCreate(BaseModel):
    request_id: UUID
    user_id: Optional[int] = None
    session_id: Optional[UUID] = None
    action: str
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    before_state: Optional[Dict[str, Any]] = None
    after_state: Optional[Dict[str, Any]] = None
    payload_hash: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class AuditLogResponse(BaseModel):
    id: int
    request_id: UUID
    user_id: Optional[int] = None
    action: str
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    state_diff: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class RequestLogCreate(BaseModel):
    request_id: UUID
    user_id: Optional[int] = None
    endpoint: str
    method: str
    status_code: Optional[int] = None
    response_time_ms: Optional[int] = None
    payload_size: Optional[int] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class RequestLogResponse(BaseModel):
    id: int
    request_id: UUID
    user_id: Optional[int] = None
    endpoint: str
    method: str
    status_code: Optional[int] = None
    response_time_ms: Optional[int] = None
    ip_address: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True