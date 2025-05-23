from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)
    full_name = Column(String, index=True, nullable=True)
    is_active = Column(Boolean, default=True, nullable=True)
    is_superuser = Column(Boolean, default=False, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    google_id = Column(String, unique=True, nullable=True, index=True)
    # facebook_id = Column(String, unique=True, nullable=True, index=True)
