#!/usr/bin/env python3
"""
Script to create additional admin users
"""
import sys
import os
from pathlib import Path
import getpass

# Add the parent directory to the path so we can import from app
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.modules.auth.models import Role, User
from app.core.security import SecurityService
from app.core.logging import setup_logging, get_logger

# Setup logging
setup_logging()
logger = get_logger(__name__)


def create_admin_user(email: str, password: str):
    """Create a new admin user"""
    try:
        engine = create_engine(settings.DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        try:
            # Get admin role
            admin_role = db.query(Role).filter(Role.name == "admin").first()
            if not admin_role:
                logger.error("Admin role not found. Run init_db.py first.")
                return False
            
            # Check if user already exists
            existing_user = db.query(User).filter(User.email == email).first()
            if existing_user:
                logger.error(f"User with email {email} already exists")
                return False
            
            # Create user
            password_hash = SecurityService.hash_password(password)
            
            user = User(
                email=email,
                password_hash=password_hash,
                role_id=admin_role.id,
                is_active=True
            )
            
            db.add(user)
            db.commit()
            
            logger.info(f"Admin user created successfully: {email}")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to create admin user: {str(e)}")
            return False
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Database connection failed: {str(e)}")
        return False


def main():
    """Main function"""
    print("Create New Admin User")
    print("====================")
    
    # Get email
    email = input("Enter admin email: ").strip()
    if not email:
        print("Email is required")
        sys.exit(1)
    
    # Get password
    password = getpass.getpass("Enter password: ")
    if len(password) < 8:
        print("Password must be at least 8 characters long")
        sys.exit(1)
    
    # Confirm password
    confirm_password = getpass.getpass("Confirm password: ")
    if password != confirm_password:
        print("Passwords do not match")
        sys.exit(1)
    
    # Create user
    if create_admin_user(email, password):
        print(f"Admin user {email} created successfully!")
    else:
        print("Failed to create admin user")
        sys.exit(1)


if __name__ == "__main__":
    main()