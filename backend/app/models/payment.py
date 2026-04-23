# backend/app/models/payment.py
from sqlalchemy import Column, String, Integer, DateTime, Text
from sqlalchemy.sql import func
from ..core.database import Base


class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(String, primary_key=True)
    idempotency_key = Column(String, unique=True, nullable=False)
    source_id = Column(String, nullable=False)
    amount = Column(Integer, nullable=False)  # Amount in cents
    currency = Column(String, default="USD")
    status = Column(String, nullable=False)  # PENDING, COMPLETED, FAILED, RETRY
    square_payment_id = Column(String, nullable=True)
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Metadata for debugging/reconciliation
    metadata = Column(Text, nullable=True)