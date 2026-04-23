#!/usr/bin/env python3
"""
Database initialization script for Lodge Optical Backend
"""
import sys
import os
from pathlib import Path

# Add the parent directory to the path so we can import from app
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, text
from app.core.config import settings
from app.core.database import Base
from app.modules.auth.models import Role, User, UserSession, SystemFlag
from app.modules.patient.models import Patient
from app.modules.triage.models import TriageSession, TriageRule, TriageSubmission
from app.modules.audit.models import AuditLog, RequestLog
from app.core.security import SecurityService
from app.engine.rules import DefaultRulesLoader
from app.core.logging import setup_logging, get_logger

# Setup logging
setup_logging()
logger = get_logger(__name__)


def create_database_tables():
    """Create all database tables"""
    try:
        engine = create_engine(settings.DATABASE_URL)
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        
        return engine
    except Exception as e:
        logger.error(f"Failed to create database tables: {str(e)}")
        raise


def create_default_roles(engine):
    """Create default roles"""
    from sqlalchemy.orm import sessionmaker
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if roles already exist
        existing_roles = db.query(Role).count()
        if existing_roles > 0:
            logger.info("Roles already exist, skipping creation")
            return
        
        # Create default roles
        roles = [
            {
                "name": "admin",
                "permissions": ["*"]  # Admin has all permissions
            },
            {
                "name": "staff",
                "permissions": [
                    "triage:read", "triage:write",
                    "patient:read", "patient:write"
                ]
            },
            {
                "name": "viewer",
                "permissions": ["triage:read", "patient:read"]
            }
        ]
        
        for role_data in roles:
            role = Role(
                name=role_data["name"],
                permissions=role_data["permissions"]
            )
            db.add(role)
        
        db.commit()
        logger.info("Default roles created successfully")
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to create default roles: {str(e)}")
        raise
    finally:
        db.close()


def create_system_flags(engine):
    """Create default system flags"""
    from sqlalchemy.orm import sessionmaker
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if system flags already exist
        existing_flags = db.query(SystemFlag).count()
        if existing_flags > 0:
            logger.info("System flags already exist, skipping creation")
            return
        
        # Create default system flags
        flags = [
            {
                "key": "system_enabled",
                "value": True,
                "description": "Master kill switch for the entire system"
            },
            {
                "key": "triage_enabled",
                "value": True,
                "description": "Enable/disable triage functionality"
            },
            {
                "key": "patient_registration_enabled",
                "value": True,
                "description": "Enable/disable new patient registration"
            }
        ]
        
        for flag_data in flags:
            flag = SystemFlag(
                key=flag_data["key"],
                value=flag_data["value"],
                description=flag_data["description"]
            )
            db.add(flag)
        
        db.commit()
        logger.info("Default system flags created successfully")
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to create system flags: {str(e)}")
        raise
    finally:
        db.close()


def create_admin_user(engine):
    """Create initial admin user"""
    from sqlalchemy.orm import sessionmaker
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if admin user already exists
        admin_role = db.query(Role).filter(Role.name == "admin").first()
        if not admin_role:
            logger.error("Admin role not found")
            return
        
        existing_admin = db.query(User).filter(User.role_id == admin_role.id).first()
        if existing_admin:
            logger.info("Admin user already exists, skipping creation")
            return
        
        # Create admin user
        admin_email = "admin@lodgeoptical.com"
        admin_password = "admin123"  # Should be changed immediately
        
        password_hash = SecurityService.hash_password(admin_password)
        
        admin_user = User(
            email=admin_email,
            password_hash=password_hash,
            role_id=admin_role.id,
            is_active=True
        )
        
        db.add(admin_user)
        db.commit()
        
        logger.info(f"Admin user created: {admin_email}")
        logger.warning("IMPORTANT: Change the default admin password immediately!")
        
        return admin_user.id
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to create admin user: {str(e)}")
        raise
    finally:
        db.close()


def load_default_triage_rules(engine, admin_user_id):
    """Load default triage rules"""
    from sqlalchemy.orm import sessionmaker
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if rules already exist
        existing_rules = db.query(TriageRule).count()
        if existing_rules > 0:
            logger.info("Triage rules already exist, skipping creation")
            return
        
        # Load default rules
        DefaultRulesLoader.load_default_rules(db, admin_user_id)
        logger.info("Default triage rules loaded successfully")
        
    except Exception as e:
        logger.error(f"Failed to load default triage rules: {str(e)}")
        raise
    finally:
        db.close()


def main():
    """Main initialization function"""
    logger.info("Starting database initialization...")
    
    try:
        # Create tables
        engine = create_database_tables()
        
        # Create default roles
        create_default_roles(engine)
        
        # Create system flags
        create_system_flags(engine)
        
        # Create admin user
        admin_user_id = create_admin_user(engine)
        
        # Load default triage rules
        if admin_user_id:
            load_default_triage_rules(engine, admin_user_id)
        
        logger.info("Database initialization completed successfully!")
        logger.info("Default admin credentials:")
        logger.info("  Email: admin@lodgeoptical.com")
        logger.info("  Password: admin123")
        logger.warning("CHANGE THE DEFAULT PASSWORD IMMEDIATELY!")
        
    except Exception as e:
        logger.error(f"Database initialization failed: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
