from sqlalchemy.orm import Session
from sqlalchemy import text
from .logging import get_logger

logger = get_logger(__name__)


class HealthService:
    @staticmethod
    def check_database_connection(db: Session) -> bool:
        """Check if database connection is working"""
        try:
            db.execute(text("SELECT 1"))
            logger.info("Database health check passed")
            return True
        except Exception as e:
            logger.error(f"Database health check failed: {str(e)}")
            return False
    
    @staticmethod
    def get_system_status(db: Session) -> dict:
        """Get overall system health status"""
        db_healthy = HealthService.check_database_connection(db)
        
        status = {
            "status": "ok" if db_healthy else "error",
            "database": "connected" if db_healthy else "disconnected"
        }
        
        logger.info(f"System health check completed: {status['status']}")
        return status