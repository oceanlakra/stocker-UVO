from token import OP
from sqlalchemy.orm import Session
from ..db import models  # Access your SQLAlchemy models
from ..schemas import user_schemas # Access your Pydantic schemas
from ..auth.jwt_handler import get_password_hash # For hashing password on creation
from typing import Optional

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: user_schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name
        # is_active and is_superuser will use defaults from model
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Add update_user and delete_user functions later if needed

#New function for handling user through Oauth
# New function for OAuth
def get_or_create_user_by_oauth(
    db: Session,
    email: str,
    full_name: Optional[str],
    provider_name: str, # "google" or "facebook"
    provider_user_id: str # The unique ID from the provider
) -> models.User:
    # Try to find user by provider ID first
    user: Optional[models.User] = None
    if provider_name == "google":
        user = db.query(models.User).filter(models.User.google_id == provider_user_id).first()
    # elif provider_name == "facebook":
    #     user = db.query(models.User).filter(models.User.facebook_id == provider_user_id).first()

    if user:
        return user # User found by provider ID

    # If not found by provider ID, try by email
    user = get_user_by_email(db, email=email)
    if user:
        # User exists with this email, link the provider ID
        if provider_name == "google" and not user.google_id:
            user.google_id = provider_user_id
        # elif provider_name == "facebook" and not user.facebook_id:
        #     user.facebook_id = provider_user_id
        # Potentially update full_name if it's missing or different
        if not user.full_name and full_name:
            user.full_name = full_name
        db.commit()
        db.refresh(user)
        return user

    # If user not found by email either, create a new user
    db_user_data = {
        "email": email,
        "full_name": full_name,
        # hashed_password will be None as they are OAuth users
    }
    if provider_name == "google":
        db_user_data["google_id"] = provider_user_id
    # elif provider_name == "facebook":
    #     db_user_data["facebook_id"] = provider_user_id
    
    new_user = models.User(**db_user_data)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user