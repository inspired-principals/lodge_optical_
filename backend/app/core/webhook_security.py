# backend/app/core/webhook_security.py
import hmac
import hashlib
import base64
from .config import settings


def verify_square_signature(signature: str, body: bytes, url: str) -> bool:
    """
    Verify Square webhook signature to prevent spoofing.
    This is non-negotiable for financial security.
    """
    if not signature:
        return False
        
    message = url.encode("utf-8") + body
    key = settings.SQUARE_WEBHOOK_SIGNATURE_KEY.encode("utf-8")
    
    digest = hmac.new(key, message, hashlib.sha256).digest()
    expected_signature = base64.b64encode(digest).decode()
    
    return hmac.compare_digest(expected_signature, signature)