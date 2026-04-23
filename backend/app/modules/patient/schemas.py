from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import date, datetime


class EmergencyContact(BaseModel):
    name: str
    relationship: str
    phone: str
    email: Optional[str] = Field(None, min_length=3, max_length=255)


class PatientCreate(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    date_of_birth: Optional[date] = None
    email: Optional[str] = Field(None, min_length=3, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    medical_record_number: Optional[str] = Field(None, max_length=50)
    emergency_contact: Optional[EmergencyContact] = None


class PatientUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    date_of_birth: Optional[date] = None
    email: Optional[str] = Field(None, min_length=3, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    medical_record_number: Optional[str] = Field(None, max_length=50)
    emergency_contact: Optional[EmergencyContact] = None


class PatientResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    full_name: str
    date_of_birth: Optional[date] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    medical_record_number: Optional[str] = None
    emergency_contact: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class PatientListResponse(BaseModel):
    patients: list[PatientResponse]
    total: int
    page: int
    limit: int
    total_pages: int
