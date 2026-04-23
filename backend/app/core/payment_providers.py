# backend/app/core/payment_providers.py
from abc import ABC, abstractmethod
from typing import Dict, Any
from .square_client import get_square_client
from .logging import get_logger

logger = get_logger(__name__)


class PaymentProvider(ABC):
    """
    Abstract payment provider interface.
    This is how we dominate multiple providers.
    """
    
    @abstractmethod
    def charge(self, source_id: str, amount: int, idempotency_key: str) -> Dict[str, Any]:
        """Process a payment charge"""
        pass
    
    @abstractmethod
    def get_payment(self, payment_id: str) -> Dict[str, Any]:
        """Retrieve payment details"""
        pass
    
    @abstractmethod
    def get_provider_name(self) -> str:
        """Get provider name for logging"""
        pass


class SquareProvider(PaymentProvider):
    """
    Square payment provider implementation.
    Clean, isolated, replaceable.
    """
    
    def __init__(self):
        self.client = get_square_client()
    
    def charge(self, source_id: str, amount: int, idempotency_key: str) -> Dict[str, Any]:
        """Process Square payment"""
        body = {
            "source_id": source_id,
            "idempotency_key": idempotency_key,
            "amount_money": {
                "amount": amount,
                "currency": "USD",
            },
        }
        
        response = self.client.payments.create_payment(body)
        
        if response.is_error():
            raise Exception(f"Square payment failed: {response.errors}")
        
        return response.body.get("payment")
    
    def get_payment(self, payment_id: str) -> Dict[str, Any]:
        """Get Square payment details"""
        response = self.client.payments.get_payment(payment_id)
        
        if response.is_error():
            raise Exception(f"Square get payment failed: {response.errors}")
        
        return response.body.get("payment")
    
    def get_provider_name(self) -> str:
        return "Square"


class StripeProvider(PaymentProvider):
    """
    Future Stripe provider for multi-provider dominance.
    Ready for when Square fails you.
    """
    
    def charge(self, source_id: str, amount: int, idempotency_key: str) -> Dict[str, Any]:
        # TODO: Implement Stripe integration
        raise NotImplementedError("Stripe provider not yet implemented")
    
    def get_payment(self, payment_id: str) -> Dict[str, Any]:
        # TODO: Implement Stripe integration
        raise NotImplementedError("Stripe provider not yet implemented")
    
    def get_provider_name(self) -> str:
        return "Stripe"


class PaymentProviderFactory:
    """
    Factory for payment providers with fallback capability.
    This is where provider switching happens.
    """
    
    @staticmethod
    def get_primary_provider() -> PaymentProvider:
        """Get primary payment provider"""
        return SquareProvider()
    
    @staticmethod
    def get_fallback_provider() -> PaymentProvider:
        """Get fallback payment provider"""
        # For now, return Square. Later, return Stripe.
        return SquareProvider()
    
    @staticmethod
    def get_provider_with_fallback() -> tuple[PaymentProvider, PaymentProvider]:
        """Get both primary and fallback providers"""
        return (
            PaymentProviderFactory.get_primary_provider(),
            PaymentProviderFactory.get_fallback_provider()
        )