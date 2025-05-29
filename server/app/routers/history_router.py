from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..schemas import history_schemas
from .. import schemas, crud, dependencies
from ..db.database import get_db

router = APIRouter(
    prefix="/history",
    tags=["User History"],
    dependencies=[Depends(dependencies.get_current_active_user)] # All history routes require login
)

@router.get("/", response_model=List[history_schemas.HistoryEntryResponse])
def read_user_history(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: schemas.user_schemas.User = Depends(dependencies.get_current_active_user)
):
    """
    Retrieve history entries for the current authenticated user.
    """
    history_entries = crud.history_crud.get_history_entries_by_user(
        db, user_id=current_user.id, skip=skip, limit=limit
    )
    return history_entries

@router.get("/{entry_id}", response_model=history_schemas.HistoryEntryResponse)
def read_specific_history_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.user_schemas.User = Depends(dependencies.get_current_active_user)
):
    """
    Retrieve a specific history entry for the current authenticated user.
    """
    db_entry = crud.history_crud.get_history_entry(db, entry_id=entry_id, user_id=current_user.id)
    if db_entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="History entry not found")
    return db_entry

# Note: History creation will happen within the analysis/comparison/prediction routers