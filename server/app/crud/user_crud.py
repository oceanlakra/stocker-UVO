from sqlalchemy.orm import Session
from ..db import models  # Access your SQLAlchemy models
from ..schemas import user_schemas # Access your Pydantic schemas
from ..auth.jwt_handler import get_password_hash # For hashing password on creation

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