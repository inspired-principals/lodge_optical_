# backend/app/api/admin_router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.event_bus import event_bus
from ..core.logging import get_logger
from ..tasks.payment_tasks import retry_payment_task, reconciliation_task, payment_analytics_task

router = APIRouter(prefix="/admin", tags=["Admin"])
logger = get_logger(__name__)


@router.post("/payments/retry")
def retry_failed_payments(db: Session = Depends(get_db)):
    """
    Trigger autonomous retry of all failed payments.
    This spawns background workers for each payment.
    """
    try:
        from ..models.payment import Payment
        
        failed_payments = db.query(Payment).filter(Payment.status == "FAILED").all()
        
        # Spawn async retry tasks for each failed payment
        task_ids = []
        for payment in failed_payments:
            task = retry_payment_task.delay(payment.id)
            task_ids.append(task.id)
        
        event_bus.publish("admin.bulk_retry.initiated", {
            "failed_count": len(failed_payments),
            "task_count": len(task_ids)
        })
        
        logger.info(
            "Bulk retry initiated",
            extra={
                "failed_count": len(failed_payments),
                "task_count": len(task_ids)
            }
        )
        
        return {
            "success": True,
            "failed_count": len(failed_payments),
            "tasks_spawned": len(task_ids),
            "task_ids": task_ids,
            "message": f"Spawned {len(task_ids)} autonomous retry workers"
        }
        
    except Exception as e:
        logger.error("Bulk retry initiation failed", exc_info=e)
        raise HTTPException(status_code=500, detail="Retry initiation failed")


@router.post("/payments/reconcile")
def trigger_reconciliation(db: Session = Depends(get_db)):
    """
    Trigger autonomous reconciliation with payment providers.
    This verifies our truth against their truth.
    """
    try:
        # Spawn async reconciliation task
        task = reconciliation_task.delay()
        
        event_bus.publish("admin.reconciliation.initiated", {
            "task_id": task.id
        })
        
        logger.info(
            "Reconciliation initiated",
            extra={"task_id": task.id}
        )
        
        return {
            "success": True,
            "task_id": task.id,
            "message": "Autonomous reconciliation worker spawned"
        }
        
    except Exception as e:
        logger.error("Reconciliation initiation failed", exc_info=e)
        raise HTTPException(status_code=500, detail="Reconciliation initiation failed")


@router.post("/analytics/generate")
def trigger_analytics():
    """
    Trigger payment analytics and anomaly detection.
    This is your fraud detection engine.
    """
    try:
        # Spawn async analytics task
        task = payment_analytics_task.delay()
        
        event_bus.publish("admin.analytics.initiated", {
            "task_id": task.id
        })
        
        logger.info(
            "Analytics generation initiated",
            extra={"task_id": task.id}
        )
        
        return {
            "success": True,
            "task_id": task.id,
            "message": "Autonomous analytics worker spawned"
        }
        
    except Exception as e:
        logger.error("Analytics initiation failed", exc_info=e)
        raise HTTPException(status_code=500, detail="Analytics initiation failed")


@router.get("/payments/status")
def payment_system_status(db: Session = Depends(get_db)):
    """
    Get comprehensive payment system status.
    This is your control panel.
    """
    try:
        from ..models.payment import Payment
        from ..models.audit_log import AuditLog
        from sqlalchemy import func
        from datetime import datetime, timedelta
        
        # Payment counts by status
        payment_counts = dict(
            db.query(Payment.status, func.count(Payment.id))
            .group_by(Payment.status)
            .all()
        )
        
        # Recent activity (last 24 hours)
        since = datetime.utcnow() - timedelta(hours=24)
        recent_payments = db.query(Payment).filter(Payment.created_at >= since).count()
        recent_events = db.query(AuditLog).filter(AuditLog.created_at >= since).count()
        
        # Calculate health metrics
        total_payments = sum(payment_counts.values())
        failed_count = payment_counts.get("FAILED", 0)
        pending_count = payment_counts.get("PENDING", 0)
        retry_count = payment_counts.get("RETRY", 0)
        
        failure_rate = (failed_count / total_payments) if total_payments > 0 else 0
        needs_attention = failure_rate > 0.05 or retry_count > 10 or pending_count > 50
        
        # System health assessment
        if failure_rate > 0.2:
            health_status = "CRITICAL"
        elif failure_rate > 0.1 or needs_attention:
            health_status = "WARNING"
        else:
            health_status = "HEALTHY"
        
        status = {
            "system_health": health_status,
            "payment_counts": payment_counts,
            "metrics": {
                "total_payments": total_payments,
                "failure_rate": round(failure_rate * 100, 2),
                "recent_24h": {
                    "payments": recent_payments,
                    "events": recent_events
                }
            },
            "alerts": {
                "needs_attention": needs_attention,
                "high_failure_rate": failure_rate > 0.1,
                "pending_backlog": pending_count > 50,
                "retry_backlog": retry_count > 10
            },
            "capabilities": [
                "Autonomous retry with exponential backoff",
                "Multi-provider fallback (Square → Stripe)",
                "Real-time reconciliation",
                "Event-driven architecture",
                "Anomaly detection",
                "Complete audit trail"
            ]
        }
        
        event_bus.publish("admin.status.checked", {
            "health_status": health_status,
            "total_payments": total_payments,
            "failure_rate": failure_rate
        })
        
        return status
        
    except Exception as e:
        logger.error("Payment status check failed", exc_info=e)
        raise HTTPException(status_code=500, detail="Status check failed")


@router.get("/events/recent")
def get_recent_events(limit: int = 50, db: Session = Depends(get_db)):
    """
    Get recent system events for monitoring.
    """
    try:
        from ..models.audit_log import AuditLog
        
        recent_events = (
            db.query(AuditLog)
            .order_by(AuditLog.created_at.desc())
            .limit(limit)
            .all()
        )
        
        events = [
            {
                "id": event.id,
                "action": event.action,
                "entity_id": event.entity_id,
                "entity_type": event.entity_type,
                "created_at": event.created_at.isoformat(),
                "metadata": event.metadata
            }
            for event in recent_events
        ]
        
        return {
            "events": events,
            "count": len(events)
        }
        
    except Exception as e:
        logger.error("Recent events fetch failed", exc_info=e)
        raise HTTPException(status_code=500, detail="Events fetch failed")


@router.post("/system/emergency-stop")
def emergency_stop():
    """
    Emergency stop for the payment system.
    Use this when things go very wrong.
    """
    try:
        event_bus.publish("system.emergency_stop", {
            "timestamp": datetime.utcnow().isoformat(),
            "reason": "Manual emergency stop triggered"
        })
        
        logger.critical("🚨 EMERGENCY STOP TRIGGERED")
        
        return {
            "success": True,
            "message": "Emergency stop signal sent to all workers",
            "warning": "All payment processing has been halted"
        }
        
    except Exception as e:
        logger.error("Emergency stop failed", exc_info=e)
        raise HTTPException(status_code=500, detail="Emergency stop failed")
