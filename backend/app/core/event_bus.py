# backend/app/core/event_bus.py
from typing import Callable, Dict, List
from .logging import get_logger

logger = get_logger(__name__)


class EventBus:
    """
    Internal event bus for complete system decoupling.
    Everything becomes a signal. Everything reacts.
    """
    
    def __init__(self):
        self.listeners: Dict[str, List[Callable]] = {}
    
    def subscribe(self, event: str, handler: Callable):
        """Subscribe a handler to an event"""
        self.listeners.setdefault(event, []).append(handler)
        logger.info(f"Handler subscribed to event: {event}")
    
    def publish(self, event: str, payload: dict):
        """Publish an event to all subscribers"""
        logger.info(f"Publishing event: {event}", extra={"payload": payload})
        
        for handler in self.listeners.get(event, []):
            try:
                handler(payload)
            except Exception as e:
                logger.error(
                    f"Event handler failed for {event}",
                    exc_info=e,
                    extra={"payload": payload}
                )


# Global event bus instance
event_bus = EventBus()