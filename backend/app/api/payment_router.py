# backend/app/api/payment_router.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.payment_service import PaymentService

router = APIRouter(prefix="/payments", tags=["Payments"])


class PaymentRequest(BaseModel):
    sourceId: str
    amount: float


@router.post("/")
def create_payment(payload: PaymentRequest, db: Session = Depends(get_db)):
    """
    Process a payment.
    Thin router - no business logic, just HTTP handling.
    """
    service = PaymentService(db)
    
    try:
        result = service.create_payment(
            source_id=payload.sourceId,
            amount=payload.amount,
        )
        return {"success": True, "payment": result}
        
    except Exception:
        raise HTTPException(status_code=500, detail="Payment failed")