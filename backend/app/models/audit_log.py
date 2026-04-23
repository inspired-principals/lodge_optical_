# backend/app/models/audit_log.py
from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.sql import func
from ..core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True)
    action = Column(String, nullable=False)
    entity_id = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    user_id = Column(String, nullable=True)
    metadata = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())