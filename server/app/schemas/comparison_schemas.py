# backend/app/schemas/comparison_schemas.py
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
import datetime

class OHLCDataPoint(BaseModel):
    date: datetime.datetime # Or str if you pass ISO strings from backend
    open: float
    high: float
    low: float
    close: float

class SimilarDayPattern(BaseModel):
    date: str # YYYY-MM-DD format
    similarity_score: float
    window_pattern_data: List[OHLCDataPoint]
    full_day_data: List[OHLCDataPoint]

class ComparisonInput(BaseModel):
    stock_symbol: str = Field(..., example="HEROMOTOCO")
    start_time: str = Field(
        default=None, # Will use default from config
        pattern=r"^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$", # HH:MM format validation
        example="09:15",
        description="Start time for the comparison window (HH:MM). Uses system default if None."
    )
    end_time: str = Field(
        default=None, # Will use default from config
        pattern=r"^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$",
        example="09:45",
        description="End time for the comparison window (HH:MM). Uses system default if None."
    )
    num_results: Optional[int] = Field(
        default=None, # Will use default from config
        ge=1, le=20, 
        example=5,
        description="Number of top similar patterns to return. Uses system default if None."
    )
    similarity_threshold: Optional[float] = Field(
        default=None, # Will use default from config
        ge=0.0, le=1.0, 
        example=0.90,
        description="Minimum cosine similarity threshold (0.0 to 1.0). Uses system default if None."
    )

    @validator('end_time')
    def end_time_after_start_time(cls, v, values):
        if 'start_time' in values and v is not None and values['start_time'] is not None:
            start = datetime.datetime.strptime(values['start_time'], '%H:%M').time()
            end = datetime.datetime.strptime(v, '%H:%M').time()
            if end <= start:
                raise ValueError('End time must be after start time.')
        return v

class ComparisonOutput(BaseModel):
    query_stock_symbol: str
    query_time_window: str # e.g., "09:15-09:45"
    query_date: str # Date for which the yfinance pattern was fetched (today)
    # today_query_pattern_data: List[OHLCDataPoint] # Optional: include today's window data in response
    similar_historical_patterns: List[SimilarDayPattern]
    message: Optional[str] = None