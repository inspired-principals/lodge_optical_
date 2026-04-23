from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID


class UserLogin(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=8)


class UserCreate(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=8)
    role_id: int


class UserUpdate(BaseModel):
    email: Optional[str] = Field(None, min_length=3, max_length=255)
    is_active: Optional[bool] = None
    role_id: Optional[int] = None


class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    is_active: bool
    last_login: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class RoleCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    permissions: List[str]


class RoleResponse(BaseModel):
    id: int
    name: str
    permissions: List[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserSessionResponse(BaseModel):
    id: UUID
    device_info: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    is_active: bool
    expires_at: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True


class SystemFlagUpdate(BaseModel):
    value: bool
    description: Optional[str] = None


class SystemFlagResponse(BaseModel):
    key: str
    value: bool
    description: Optional[str] = None
    updated_by: Optional[int] = None
    updated_at: datetime
    
    class Config:
        from_attributes = True
