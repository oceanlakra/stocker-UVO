from sqlalchemy.orm import Session
from typing import List, Optional
from ..db import models
from ..schemas import history_schemas

def create_history_entry(db: Session, entry: history_schemas.HistoryEntryCreate) -> models.HistoryEntry:
    db_entry = models.HistoryEntry(
        user_id=entry.user_id,
        action_type=entry.action_type,
        input_summary=entry.input_summary,
        output_summary=entry.output_summary
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

def get_history_entries_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 20) -> List[models.HistoryEntry]:
    return db.query(models.HistoryEntry)\
             .filter(models.HistoryEntry.user_id == user_id)\
             .order_by(models.HistoryEntry.timestamp.desc())\
             .offset(skip)\
             .limit(limit)\
             .all()

def get_history_entry(db: Session, entry_id: int, user_id: int) -> Optional[models.HistoryEntry]:
    """Get a specific history entry for a user to ensure ownership."""
    return db.query(models.HistoryEntry)\
             .filter(models.HistoryEntry.id == entry_id, models.HistoryEntry.user_id == user_id)\
             .first()