from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from math import ceil

from ...core.database import get_db
from ...middleware.auth import get_current_user, AuthDependency
from .schemas import PatientCreate, PatientUpdate, PatientResponse, PatientListResponse
from .service import PatientService
from .models import Patient
from ...modules.auth.models import User
from ...core.exceptions import ValidationError, DatabaseError
from ...core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/patients", tags=["patients"])

# Permission requirements
require_patient_read = AuthDependency("patient:read")
require_patient_write = AuthDependency("patient:write")


@router.post("/", response_model=PatientResponse)
async def create_patient(
    patient_data: PatientCreate,
    current_user: User = Depends(require_patient_write),
    db: Session = Depends(get_db)
):
    """Create a new patient"""
    try:
        patient = PatientService.create_patient(db, patient_data)
        return PatientResponse(
            id=patient.id,
            first_name=patient.first_name,
            last_name=patient.last_name,
            full_name=patient.full_name,
            date_of_birth=patient.date_of_birth,
            email=patient.email,
            phone=patient.phone,
            medical_record_number=patient.medical_record_number,
            emergency_contact=patient.emergency_contact,
            created_at=patient.created_at,
            updated_at=patient.updated_at
        )
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except DatabaseError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=PatientListResponse)
async def get_patients(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    current_user: User = Depends(require_patient_read),
    db: Session = Depends(get_db)
):
    """Get patients with pagination and search"""
    patients, total = PatientService.get_patients(db, page, limit, search)
    
    total_pages = ceil(total / limit) if total > 0 else 1
    
    patient_responses = [
        PatientResponse(
            id=patient.id,
            first_name=patient.first_name,
            last_name=patient.last_name,
            full_name=patient.full_name,
            date_of_birth=patient.date_of_birth,
            email=patient.email,
            phone=patient.phone,
            medical_record_number=patient.medical_record_number,
            emergency_contact=patient.emergency_contact,
            created_at=patient.created_at,
            updated_at=patient.updated_at
        )
        for patient in patients
    ]
    
    return PatientListResponse(
        patients=patient_responses,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )


@router.get("/search")
async def search_patients(
    name: str = Query(..., min_length=2),
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(require_patient_read),
    db: Session = Depends(get_db)
):
    """Search patients by name for autocomplete"""
    patients = PatientService.search_patients_by_name(db, name, limit)
    
    return [
        {
            "id": patient.id,
            "name": patient.full_name,
            "medical_record_number": patient.medical_record_number
        }
        for patient in patients
    ]


@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: int,
    current_user: User = Depends(require_patient_read),
    db: Session = Depends(get_db)
):
    """Get patient by ID"""
    patient = PatientService.get_patient_by_id(db, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return PatientResponse(
        id=patient.id,
        first_name=patient.first_name,
        last_name=patient.last_name,
        full_name=patient.full_name,
        date_of_birth=patient.date_of_birth,
        email=patient.email,
        phone=patient.phone,
        medical_record_number=patient.medical_record_number,
        emergency_contact=patient.emergency_contact,
        created_at=patient.created_at,
        updated_at=patient.updated_at
    )


@router.put("/{patient_id}", response_model=PatientResponse)
async def update_patient(
    patient_id: int,
    patient_data: PatientUpdate,
    current_user: User = Depends(require_patient_write),
    db: Session = Depends(get_db)
):
    """Update patient information"""
    try:
        patient = PatientService.update_patient(db, patient_id, patient_data)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        return PatientResponse(
            id=patient.id,
            first_name=patient.first_name,
            last_name=patient.last_name,
            full_name=patient.full_name,
            date_of_birth=patient.date_of_birth,
            email=patient.email,
            phone=patient.phone,
            medical_record_number=patient.medical_record_number,
            emergency_contact=patient.emergency_contact,
            created_at=patient.created_at,
            updated_at=patient.updated_at
        )
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except DatabaseError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{patient_id}")
async def delete_patient(
    patient_id: int,
    current_user: User = Depends(require_patient_write),
    db: Session = Depends(get_db)
):
    """Delete patient"""
    try:
        success = PatientService.delete_patient(db, patient_id)
        if not success:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        return {"message": "Patient deleted successfully"}
    except DatabaseError as e:
        raise HTTPException(status_code=500, detail=str(e))