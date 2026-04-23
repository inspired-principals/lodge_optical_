# backend/app/core/event_listeners.py
from .event_bus import event_bus
from .database import SessionLocal
from .logging import get_logger

logger = get_logger(__name__)


def setup_event_listeners():
    """
    Setup all event listeners for the autonomous payment system.
    This is where the magic happens - everything reacts to events.
    """
    
    # Payment Event Listeners
    event_bus.subscribe("payment.completed", handle_payment_completed)
    event_bus.subscribe("payment.failed", handle_payment_failed)
    event_bus.subscribe("payment.both_providers_failed", handle_both_providers_failed)
    event_bus.subscribe("payment.fallback_success", handle_fallback_success)
    event_bus.subscribe("payment.retry_success", handle_retry_success)
    event_bus.subscribe("payment.anomaly.high_failure_rate", handle_high_failure_rate)
    
    # Webhook Event Listeners
    event_bus.subscribe("square.webhook.received", handle_square_webhook)
    event_bus.subscribe("square.webhook.error", handle_webhook_error)
    
    # System Event Listeners
    event_bus.subscribe("reconciliation.completed", handle_reconciliation_completed)
    event_bus.subscribe("payment.analytics.generated", handle_analytics_generated)
    
    logger.info("Event listeners initialized - system is now autonomous")


def handle_payment_completed(payload: dict):
    """Handle successful payment completion"""
    logger.info(
        "Payment completed successfully",
        extra={
            "payment_id": payload.get("payment_id"),
            "provider": payload.get("provider"),
            "amount": payload.get("amount")
        }
    )
    
    # TODO: Send success notification to user
    # TODO: Update inventory if applicable
    # TODO: Trigger fulfillment process


def handle_payment_failed(payload: dict):
    """Handle payment failure"""
    logger.warning(
        "Payment failed",
        extra={
            "payment_id": payload.get("payment_id"),
            "error": payload.get("error")
        }
    )
    
    # TODO: Send failure notification to user
    # TODO: Log for fraud analysis


def handle_both_providers_failed(payload: dict):
    """Handle critical failure - both providers failed"""
    logger.critical(
        "CRITICAL: Both payment providers failed",
        extra={
            "payment_id": payload.get("payment_id"),
            "primary_error": payload.get("primary_error"),
            "fallback_error": payload.get("fallback_error")
        }
    )
    
    # TODO: Send alert to operations team
    # TODO: Escalate to manual review
    # TODO: Check provider status


def handle_fallback_success(payload: dict):
    """Handle successful fallback provider usage"""
    logger.warning(
        "Primary provider failed, fallback succeeded",
        extra={
            "payment_id": payload.get("payment_id"),
            "primary_provider": payload.get("primary_provider"),
            "fallback_provider": payload.get("fallback_provider")
        }
    )
    
    # TODO: Alert operations about primary provider issues
    # TODO: Increment fallback usage metrics


def handle_retry_success(payload: dict):
    """Handle successful payment retry"""
    logger.info(
        "Payment retry successful",
        extra={
            "payment_id": payload.get("payment_id"),
            "retry_count": payload.get("retry_count")
        }
    )
    
    # TODO: Update retry success metrics
    # TODO: Analyze retry patterns


def handle_high_failure_rate(payload: dict):
    """Handle anomaly detection - high failure rate"""
    logger.critical(
        "ANOMALY DETECTED: High payment failure rate",
        extra={
            "failure_rate": payload.get("failure_rate"),
            "failed_count": payload.get("failed_count"),
            "total_count": payload.get("total_count")
        }
    )
    
    # TODO: Send immediate alert to operations
    # TODO: Trigger fraud investigation
    # TODO: Consider temporary payment suspension


def handle_square_webhook(payload: dict):
    """Handle Square webhook events"""
    event_type = payload.get("event_type")
    event_data = payload.get("event_data")
    
    logger.info(
        "Processing Square webhook",
        extra={
            "event_type": event_type,
            "event_id": event_data.get("event_id")
        }
    )
    
    # Handle specific webhook types
    if event_type == "payment.updated":
        _handle_payment_updated_webhook(event_data)
    elif event_type == "refund.updated":
        _handle_refund_updated_webhook(event_data)
    
    # TODO: Add more webhook handlers as needed


def _handle_payment_updated_webhook(event_data: dict):
    """Handle payment.updated webhook"""
    db = SessionLocal()
    
    try:
        payment_data = event_data.get("data", {}).get("object", {}).get("payment", {})
        square_payment_id = payment_data.get("id")
        
        if not square_payment_id:
            return
        
        # Find our payment record
        from ..models.payment import Payment
        payment = db.query(Payment).filter(
            Payment.square_payment_id == square_payment_id
        ).first()
        
        if payment:
            square_status = payment_data.get("status")
            
            if square_status == "COMPLETED" and payment.status != "COMPLETED":
                payment.status = "COMPLETED"
                
                event_bus.publish("webhook.payment.completed", {
                    "payment_id": payment.id,
                    "square_payment_id": square_payment_id,
                    "webhook_source": True
                })
                
            elif square_status == "FAILED" and payment.status != "FAILED":
                payment.status = "FAILED"
                
                event_bus.publish("webhook.payment.failed", {
                    "payment_id": payment.id,
                    "square_payment_id": square_payment_id,
                    "webhook_source": True
                })
            
            db.commit()
            
    except Exception as e:
        logger.error("Webhook payment update failed", exc_info=e)
    finally:
        db.close()


def _handle_refund_updated_webhook(event_data: dict):
    """Handle refund.updated webhook"""
    # TODO: Implement refund handling
    logger.info("Refund webhook received", extra={"event_data": event_data})


def handle_webhook_error(payload: dict):
    """Handle webhook processing errors"""
    logger.error(
        "Webhook processing error",
        extra={
            "error": payload.get("error"),
            "signature": payload.get("signature"),
            "url": payload.get("url")
        }
    )
    
    # TODO: Alert operations about webhook issues


def handle_reconciliation_completed(payload: dict):
    """Handle reconciliation completion"""
    reconciled_count = payload.get("reconciled_count", 0)
    
    logger.info(
        "Reconciliation completed",
        extra={"reconciled_count": reconciled_count}
    )
    
    if reconciled_count > 0:
        # TODO: Alert about discrepancies found and resolved
        pass


def handle_analytics_generated(payload: dict):
    """Handle payment analytics generation"""
    logger.info(
        "Payment analytics generated",
        extra={
            "period": payload.get("period"),
            "stats_count": len(payload.get("stats", []))
        }
    )
    
    # TODO: Store analytics in dashboard
    # TODO: Generate reports
    # TODO: Update business intelligence systems