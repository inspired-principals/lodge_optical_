from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.clinical_control.adapters.http import router as clinical_control_router
from ..core.health import HealthService
from ..core.logging import get_logger
from ..modules.auth.router import router as auth_router
from ..modules.patient.router import router as patient_router
from ..modules.triage.router import router as triage_router
from .triage_admin_router import router as triage_admin_router

logger = get_logger(__name__)
router = APIRouter()

# Include module routers
router.include_router(auth_router)
router.include_router(patient_router)
router.include_router(triage_router)
router.include_router(triage_admin_router)
router.include_router(clinical_control_router)

try:
    from .payment_router import router as payment_router
    from .webhook_router import router as webhook_router

    router.include_router(payment_router)
    router.include_router(webhook_router)
except ImportError as exc:
    logger.warning(f"Optional payment routers not loaded: {exc}")

try:
    from .admin_router import router as admin_router

    router.include_router(admin_router)
except ImportError as exc:
    logger.warning(f"Optional admin router not loaded: {exc}")


@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """Health check endpoint"""
    logger.info("Health check requested")
    
    try:
        status = HealthService.get_system_status(db)
        
        if status["status"] == "error":
            raise HTTPException(status_code=503, detail="Service unavailable")
            
        return status
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Health check failed with unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
