# backend/app/core/payment_service.py
import uuid
import json
from decimal import Decimal
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from .logging import get_logger
from .payment_providers import PaymentProviderFactory
from .event_bus import event_bus
from ..models.payment import Payment
from ..models.audit_log import AuditLog

logger = get_logger(__name__)


class PaymentService:
    """
    Autonomous payment service with event-driven architecture.
    This is a financial control system, not just a payment processor.
    """
    
    def __init__(self, db: Session, user_id: Optional[str] = None):
        self.db = db
        self.user_id = user_id
        self.primary_provider, self.fallback_provider = PaymentProviderFactory.get_provider_with_fallback()
    
    def create_payment(self, source_id: str, amount: float) -> Dict[str, Any]:
        """
        Process a payment with full event-driven flow and provider fallback.
        """
        payment_id = str(uuid.uuid4())
        idempotency_key = str(uuid.uuid4())
        amount_cents = int(Decimal(str(amount)) * 100)
        
        # Create payment record FIRST (state before external call)
        payment = Payment(
            id=payment_id,
            idempotency_key=idempotency_key,
            source_id=source_id,
            amount=amount_cents,
            status="PENDING"
        )
        
        self.db.add(payment)
        self.db.commit()
        
        # Publish event
        event_bus.publish("payment.created", {
            "payment_id": payment_id,
            "source_id": source_id,
            "amount": amount,
            "status": "PENDING"
        })
        
        self._log_event("PAYMENT_CREATED", payment_id, {
            "source_id": source_id,
            "amount": amount,
            "status": "PENDING"
        })
        
        # Try primary provider first
        try:
            result = self._process_with_provider(
                self.primary_provider, 
                payment, 
                source_id, 
                amount_cents, 
                idempotency_key
            )
            return result
            
        except Exception as primary_error:
            logger.warning(
                f"Primary provider ({self.primary_provider.get_provider_name()}) failed, trying fallback",
                extra={
                    "payment_id": payment_id,
                    "primary_error": str(primary_error)
                }
            )
            
            # Try fallback provider
            try:
                result = self._process_with_provider(
                    self.fallback_provider,
                    payment,
                    source_id,
                    amount_cents,
                    idempotency_key + "_fallback"  # Different idempotency key
                )
                
                event_bus.publish("payment.fallback_success", {
                    "payment_id": payment_id,
                    "primary_provider": self.primary_provider.get_provider_name(),
                    "fallback_provider": self.fallback_provider.get_provider_name()
                })
                
                return result
                
            except Exception as fallback_error:
                # Both providers failed - mark for retry
                payment.status = "FAILED"
                payment.metadata = json.dumps({
                    "primary_error": str(primary_error),
                    "fallback_error": str(fallback_error)
                })
                self.db.commit()
                
                event_bus.publish("payment.both_providers_failed", {
                    "payment_id": payment_id,
                    "primary_error": str(primary_error),
                    "fallback_error": str(fallback_error)
                })
                
                # Trigger async retry
                self._mark_for_retry(payment)
                
                raise Exception("All payment providers failed")
    
    def _process_with_provider(self, provider, payment, source_id, amount_cents, idempotency_key):
        """Process payment with specific provider"""
        try:
            provider_payment = provider.charge(source_id, amount_cents, idempotency_key)
            
            # Success - update state
            payment.status = "COMPLETED"
            payment.square_payment_id = provider_payment.get("id")
            payment.metadata = json.dumps({
                "provider": provider.get_provider_name(),
                "provider_payment": provider_payment
            })
            self.db.commit()
            
            event_bus.publish("payment.completed", {
                "payment_id": payment.id,
                "provider": provider.get_provider_name(),
                "provider_payment_id": provider_payment.get("id"),
                "amount": amount_cents / 100
            })
            
            self._log_event("PAYMENT_COMPLETED", payment.id, {
                "provider": provider.get_provider_name(),
                "provider_payment_id": provider_payment.get("id"),
                "amount": amount_cents / 100
            })
            
            logger.info(
                "Payment successful",
                extra={
                    "payment_id": payment.id,
                    "provider": provider.get_provider_name(),
                    "provider_payment_id": provider_payment.get("id"),
                    "amount": amount_cents / 100
                }
            )
            
            return {
                "id": payment.id,
                "provider_payment_id": provider_payment.get("id"),
                "status": "COMPLETED",
                "amount": amount_cents / 100,
                "provider": provider.get_provider_name()
            }
            
        except Exception as e:
            # Provider failed
            event_bus.publish("payment.provider_failed", {
                "payment_id": payment.id,
                "provider": provider.get_provider_name(),
                "error": str(e)
            })
            
            self._log_event("PAYMENT_PROVIDER_FAILED", payment.id, {
                "provider": provider.get_provider_name(),
                "error": str(e)
            })
            
            raise
    
    def _mark_for_retry(self, payment):
        """Mark payment for async retry"""
        payment.status = "RETRY"
        self.db.commit()
        
        # Trigger async retry task
        from ..tasks.payment_tasks import retry_payment_task
        retry_payment_task.delay(payment.id)
        
        event_bus.publish("payment.marked_for_retry", {
            "payment_id": payment.id
        })
    
    def retry_single_payment(self, payment_id: str) -> bool:
        """
        Retry a single failed payment.
        Returns True if successful, False if still failed.
        """
        payment = self.db.query(Payment).filter(Payment.id == payment_id).first()
        if not payment:
            return False
        
        try:
            # Use original idempotency key to prevent double charge
            provider_payment = self.primary_provider.charge(
                payment.source_id,
                payment.amount,
                payment.idempotency_key
            )
            
            payment.status = "COMPLETED"
            payment.square_payment_id = provider_payment.get("id")
            payment.metadata = json.dumps({
                "provider": self.primary_provider.get_provider_name(),
                "provider_payment": provider_payment,
                "retry": True
            })
            self.db.commit()
            
            event_bus.publish("payment.retry_success", {
                "payment_id": payment_id,
                "provider_payment_id": provider_payment.get("id")
            })
            
            self._log_event("PAYMENT_RETRY_SUCCESS", payment_id, {
                "provider_payment_id": provider_payment.get("id")
            })
            
            return True
            
        except Exception as e:
            self._log_event("PAYMENT_RETRY_FAILED", payment_id, {
                "error": str(e)
            })
            
            logger.error("Payment retry failed", exc_info=e)
            return False
    
    def retry_failed_payments(self) -> int:
        """
        Retry all failed payments.
        Returns number of payments retried.
        """
        failed_payments = self.db.query(Payment).filter(
            Payment.status == "FAILED"
        ).all()
        
        retried_count = 0
        
        for payment in failed_payments:
            if self.retry_single_payment(payment.id):
                retried_count += 1
        
        event_bus.publish("bulk_retry.completed", {
            "total_failed": len(failed_payments),
            "retried_count": retried_count
        })
        
        return retried_count
    
    def reconcile_payments(self) -> int:
        """
        Reconcile pending payments with provider truth.
        Returns number of payments reconciled.
        """
        pending_payments = self.db.query(Payment).filter(
            Payment.status == "PENDING",
            Payment.square_payment_id.isnot(None)
        ).all()
        
        reconciled_count = 0
        
        for payment in pending_payments:
            try:
                provider_payment = self.primary_provider.get_payment(payment.square_payment_id)
                provider_status = provider_payment.get("status")
                
                if provider_status == "COMPLETED":
                    payment.status = "COMPLETED"
                    payment.metadata = json.dumps({
                        "provider_payment": provider_payment,
                        "reconciled": True
                    })
                    
                    event_bus.publish("payment.reconciled", {
                        "payment_id": payment.id,
                        "provider_status": provider_status,
                        "reconciled_from": "PENDING"
                    })
                    
                    self._log_event("PAYMENT_RECONCILED", payment.id, {
                        "provider_status": provider_status,
                        "reconciled_from": "PENDING"
                    })
                    
                    reconciled_count += 1
                    
                elif provider_status == "FAILED":
                    payment.status = "FAILED"
                    payment.metadata = json.dumps({
                        "provider_payment": provider_payment,
                        "reconciled": True
                    })
                    
                    event_bus.publish("payment.reconciled_failed", {
                        "payment_id": payment.id,
                        "provider_status": provider_status
                    })
                    
                    self._log_event("PAYMENT_RECONCILED_FAILED", payment.id, {
                        "provider_status": provider_status
                    })
                    
            except Exception as e:
                self._log_event("RECONCILIATION_ERROR", payment.id, {
                    "error": str(e)
                })
                logger.error("Reconciliation error", exc_info=e)
        
        self.db.commit()
        
        event_bus.publish("reconciliation.completed", {
            "reconciled_count": reconciled_count
        })
        
        return reconciled_count
    
    def _log_event(self, action: str, entity_id: str, metadata: Dict[str, Any]):
        """
        Log every action for complete audit trail.
        """
        log = AuditLog(
            id=str(uuid.uuid4()),
            action=action,
            entity_id=entity_id,
            entity_type="PAYMENT",
            user_id=self.user_id,
            metadata=json.dumps(metadata)
        )
        self.db.add(log)
        # Note: commit happens in calling method