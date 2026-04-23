from sqlalchemy import Column, Integer, String, Date, JSON, DateTime
from sqlalchemy.sql import func
from ...core.database import Base


class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    date_of_birth = Column(Date)
    email = Column(String(255), index=True)
    phone = Column(String(20))
    medical_record_number = Column(String(50), unique=True, index=True)
    emergency_contact = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"