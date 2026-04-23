# backend/app/api/webhook_router.py
from fastapi import APIRouter, Request, HTTPException, Header, Depends
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.webhook_security import verify_square_signature
from ..core.event_bus import event_bus
from ..core.logging import get_logger

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])
logger = get_logger(__name__)


@router.post("/square")
async def square_webhook(
    request: Request, 
    db: Session = Depends(get_db),
    x_square_signature: str = Header(None)
):
    """
    Square webhook handler with signature verification.
    Pure event-driven - no business logic here.
    """
    raw_body = await request.body()
    
    # Verify signature - non-negotiable
    if not verify_square_signature(
        signature=x_square_signature,
        body=raw_body,
        url=str(request.url)
    ):
        logger.warning(
            "Invalid webhook signature",
            extra={
                "signature": x_square_signature,
                "url": str(request.url)
            }
        )
        raise HTTPException(status_code=403, detail="Invalid signature")
    
    try:
        body = await request.json()
        
        # Pure event-driven approach - just publish the event
        event_bus.publish("square.webhook.received", {
            "event_type": body.get("type"),
            "event_data": body,
            "signature": x_square_signature,
            "url": str(request.url)
        })
        
        logger.info(
            "Webhook received and published",
            extra={
                "event_type": body.get("type"),
                "event_id": body.get("event_id")
            }
        )
        
        return {"status": "processed"}
        
    except Exception as e:
        logger.error("Webhook processing failed", exc_info=e)
        
        event_bus.publish("square.webhook.error", {
            "error": str(e),
            "signature": x_square_signature,
            "url": str(request.url)
        })
        
        raise HTTPException(status_code=500, detail="Webhook processing failed")