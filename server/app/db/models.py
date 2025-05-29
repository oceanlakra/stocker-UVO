from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship 
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
    history_entries = relationship("HistoryEntry", back_populates="user")
    # facebook_id = Column(String, unique=True, nullable=True, index=True)

class HistoryEntry(Base):
    __tablename__ = "history_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action_type = Column(String, index=True, nullable=False) # e.g., "ANALYSIS", "COMPARISON", "PREDICTION"
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    input_summary = Column(JSON, nullable=True) # Store a summary or key parts of the input
    output_summary = Column(JSON, nullable=True) # Store a summary or key parts of the output
    # Optional: Store a reference to more detailed results if they are persisted elsewhere
    # result_reference_id = Column(Integer, nullable=True) # e.g., ID of an analysis result table

    user = relationship("User", back_populates="history_entries")