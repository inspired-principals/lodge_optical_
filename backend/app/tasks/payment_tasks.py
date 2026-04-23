# backend/app/tasks/payment_tasks.py
from celery import current_task
from ..core.celery_app import celery_app
from ..core.database import SessionLocal
from ..core.payment_service import PaymentService
from ..core.event_bus import event_bus
from ..core.logging import get_logger

logger = get_logger(__name__)


@celery_app.task(bind=True, max_retries=5)
def retry_payment_task(self, payment_id: str):
    """
    Autonomous payment retry with exponential backoff.
    This is the engine that never gives up.
    """
    db = SessionLocal()
    
    try:
        service = PaymentService(db)
        success = service.retry_single_payment(payment_id)
        
        if success:
            event_bus.publish("payment.retry.success", {
                "payment_id": payment_id,
                "retry_count": self.request.retries
            })
            logger.info(
                "Payment retry successful",
                extra={
                    "payment_id": payment_id,
                    "retry_count": self.request.retries
                }
            )
        else:
            # Still failed, but don't retry anymore
            event_bus.publish("payment.retry.exhausted", {
                "payment_id": payment_id,
                "retry_count": self.request.retries
            })
            
    except Exception as exc:
        logger.error(
            "Payment retry failed",
            exc_info=exc,
            extra={
                "payment_id": payment_id,
                "retry_count": self.request.retries
            }
        )
        
        # Exponential backoff: 2^retry_count seconds
        countdown = 2 ** self.request.retries
        
        event_bus.publish("payment.retry.failed", {
            "payment_id": payment_id,
            "retry_count": self.request.retries,
            "next_retry_in": countdown
        })
        
        raise self.retry(exc=exc, countdown=countdown)
    
    finally:
        db.close()


@celery_app.task
def reconciliation_task():
    """
    Autonomous reconciliation job.
    Runs periodically to verify truth with providers.
    """
    db = SessionLocal()
    
    try:
        service = PaymentService(db)
        reconciled_count = service.reconcile_payments()
        
        event_bus.publish("reconciliation.completed", {
            "reconciled_count": reconciled_count
        })
        
        logger.info(
            "Reconciliation completed",
            extra={"reconciled_count": reconciled_count}
        )
        
        return reconciled_count
        
    except Exception as exc:
        logger.error("Reconciliation task failed", exc_info=exc)
        
        event_bus.publish("reconciliation.failed", {
            "error": str(exc)
        })
        
        raise
    
    finally:
        db.close()


@celery_app.task
def payment_analytics_task():
    """
    Generate payment analytics and detect anomalies.
    This is where fraud detection starts.
    """
    db = SessionLocal()
    
    try:
        from ..models.payment import Payment
        from sqlalchemy import func
        from datetime import datetime, timedelta
        
        # Get payment stats for last 24 hours
        since = datetime.utcnow() - timedelta(hours=24)
        
        stats = db.query(
            Payment.status,
            func.count(Payment.id).label('count'),
            func.sum(Payment.amount).label('total_amount')
        ).filter(
            Payment.created_at >= since
        ).group_by(Payment.status).all()
        
        analytics = {
            "period": "24h",
            "stats": [
                {
                    "status": stat.status,
                    "count": stat.count,
                    "total_amount": stat.total_amount or 0
                }
                for stat in stats
            ]
        }
        
        event_bus.publish("payment.analytics.generated", analytics)
        
        # Simple anomaly detection
        failed_count = sum(s["count"] for s in analytics["stats"] if s["status"] == "FAILED")
        total_count = sum(s["count"] for s in analytics["stats"])
        
        if total_count > 0:
            failure_rate = failed_count / total_count
            if failure_rate > 0.1:  # More than 10% failure rate
                event_bus.publish("payment.anomaly.high_failure_rate", {
                    "failure_rate": failure_rate,
                    "failed_count": failed_count,
                    "total_count": total_count
                })
        
        return analytics
        
    except Exception as exc:
        logger.error("Payment analytics task failed", exc_info=exc)
        raise
    
    finally:
        db.close()