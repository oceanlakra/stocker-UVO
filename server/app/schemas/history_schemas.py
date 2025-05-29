from pydantic import BaseModel
from typing import Optional, Any, Dict
import datetime

class HistoryEntryBase(BaseModel):
    action_type: str
    input_summary: Optional[Dict[str, Any]] = None
    output_summary: Optional[Dict[str, Any]] = None

class HistoryEntryCreate(HistoryEntryBase):
    user_id: int # Will be provided by the backend based on current_user

class HistoryEntryResponse(HistoryEntryBase):
    id: int
    user_id: int
    timestamp: datetime.datetime

    class Config:
        from_attributes = True