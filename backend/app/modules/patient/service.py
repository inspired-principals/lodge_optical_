from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import Optional, List, Tuple
from .models import Patient
from .schemas import PatientCreate, PatientUpdate
from ...core.exceptions import ValidationError, DatabaseError
from ...core.logging import get_logger

logger = get_logger(__name__)


class PatientService:
    @staticmethod
    def get_or_create_triage_patient(
        db: Session,
        full_name: str,
        email: Optional[str] = None,
        phone: Optional[str] = None,
    ) -> Patient:
        """Resolve a patient record for public triage submissions."""
        normalized_email = email.strip().lower() if email else None
        normalized_phone = phone.strip() if phone else None

        patient = None
        if normalized_email:
            patient = db.query(Patient).filter(Patient.email == normalized_email).first()

        if not patient and normalized_phone:
            patient = db.query(Patient).filter(Patient.phone == normalized_phone).first()

        name_parts = [part for part in full_name.strip().split() if part]
        first_name = name_parts[0] if name_parts else "Unknown"
        last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else "Patient"

        if patient:
            patient.first_name = first_name
            patient.last_name = last_name
            patient.email = normalized_email or patient.email
            patient.phone = normalized_phone or patient.phone
            db.flush()
            return patient

        patient = Patient(
            first_name=first_name,
            last_name=last_name,
            email=normalized_email,
            phone=normalized_phone,
        )

        db.add(patient)
        db.flush()

        logger.info(f"Triage patient created: {patient.full_name} (ID: {patient.id})")
        return patient

    @staticmethod
    def create_patient(db: Session, patient_data: PatientCreate) -> Patient:
        """Create a new patient"""
        try:
            # Check if medical record number already exists
            if patient_data.medical_record_number:
                existing = db.query(Patient).filter(
                    Patient.medical_record_number == patient_data.medical_record_number
                ).first()
                if existing:
                    raise ValidationError("Medical record number already exists")
            
            # Convert emergency contact to dict if provided
            emergency_contact_dict = None
            if patient_data.emergency_contact:
                emergency_contact_dict = patient_data.emergency_contact.dict()
            
            patient = Patient(
                first_name=patient_data.first_name,
                last_name=patient_data.last_name,
                date_of_birth=patient_data.date_of_birth,
                email=patient_data.email,
                phone=patient_data.phone,
                medical_record_number=patient_data.medical_record_number,
                emergency_contact=emergency_contact_dict
            )
            
            db.add(patient)
            db.commit()
            db.refresh(patient)
            
            logger.info(f"Patient created: {patient.full_name} (ID: {patient.id})")
            return patient
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to create patient: {str(e)}")
            raise DatabaseError(f"Failed to create patient: {str(e)}")
    
    @staticmethod
    def get_patient_by_id(db: Session, patient_id: int) -> Optional[Patient]:
        """Get patient by ID"""
        return db.query(Patient).filter(Patient.id == patient_id).first()
    
    @staticmethod
    def get_patients(
        db: Session, 
        page: int = 1, 
        limit: int = 20, 
        search: Optional[str] = None
    ) -> Tuple[List[Patient], int]:
        """Get patients with pagination and search"""
        query = db.query(Patient)
        
        # Apply search filter
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Patient.first_name.ilike(search_term),
                    Patient.last_name.ilike(search_term),
                    Patient.email.ilike(search_term),
                    Patient.medical_record_number.ilike(search_term)
                )
            )
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * limit
        patients = query.offset(offset).limit(limit).all()
        
        return patients, total
    
    @staticmethod
    def update_patient(db: Session, patient_id: int, patient_data: PatientUpdate) -> Optional[Patient]:
        """Update patient information"""
        try:
            patient = db.query(Patient).filter(Patient.id == patient_id).first()
            if not patient:
                return None
            
            # Check medical record number uniqueness if being updated
            if (patient_data.medical_record_number and 
                patient_data.medical_record_number != patient.medical_record_number):
                existing = db.query(Patient).filter(
                    and_(
                        Patient.medical_record_number == patient_data.medical_record_number,
                        Patient.id != patient_id
                    )
                ).first()
                if existing:
                    raise ValidationError("Medical record number already exists")
            
            # Update fields
            update_data = patient_data.dict(exclude_unset=True)
            
            # Handle emergency contact conversion
            if 'emergency_contact' in update_data and update_data['emergency_contact']:
                if hasattr(update_data['emergency_contact'], 'dict'):
                    update_data['emergency_contact'] = update_data['emergency_contact'].dict()
            
            for field, value in update_data.items():
                setattr(patient, field, value)
            
            db.commit()
            db.refresh(patient)
            
            logger.info(f"Patient updated: {patient.full_name} (ID: {patient.id})")
            return patient
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to update patient {patient_id}: {str(e)}")
            raise DatabaseError(f"Failed to update patient: {str(e)}")
    
    @staticmethod
    def delete_patient(db: Session, patient_id: int) -> bool:
        """Delete patient"""
        try:
            patient = db.query(Patient).filter(Patient.id == patient_id).first()
            if not patient:
                return False
            
            db.delete(patient)
            db.commit()
            
            logger.info(f"Patient deleted: {patient.full_name} (ID: {patient.id})")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to delete patient {patient_id}: {str(e)}")
            raise DatabaseError(f"Failed to delete patient: {str(e)}")
    
    @staticmethod
    def search_patients_by_name(db: Session, name: str, limit: int = 10) -> List[Patient]:
        """Search patients by name for autocomplete"""
        search_term = f"%{name}%"
        return db.query(Patient).filter(
            or_(
                Patient.first_name.ilike(search_term),
                Patient.last_name.ilike(search_term)
            )
        ).limit(limit).all()
