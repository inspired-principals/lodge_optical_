# backend/app/core/square_client.py
from square.client import Client
from .config import settings


def get_square_client() -> Client:
    """
    Factory function to create Square client instance.
    Clean, stateless, and replaceable.
    """
    return Client(
        access_token=settings.SQUARE_ACCESS_TOKEN,
        environment=(
            "production" if settings.SQUARE_ENVIRONMENT == "production" else "sandbox"
        ),
    )