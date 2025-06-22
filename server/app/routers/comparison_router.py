# backend/app/routers/comparison_router.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import datetime as dt

from .. import schemas, crud, dependencies, config
from ..db.database import get_db
from ..core_logic.comparison import pattern_matcher # Core logic function
from ..schemas import comparison_schemas

router = APIRouter(
    prefix="/comparison",
    tags=["Intraday Pattern Comparison"],
    dependencies=[Depends(dependencies.get_current_active_user)] # Protect all routes
)

@router.post("/find-similar-patterns", response_model=comparison_schemas.ComparisonOutput)
async def find_similar_intraday_patterns(
    comparison_input: schemas.comparison_schemas.ComparisonInput,
    db: Session = Depends(get_db),
    current_user: schemas.user_schemas.User = Depends(dependencies.get_current_active_user)
):
    # Determine effective parameters, using defaults from config if not provided by user
    effective_start_time_str = comparison_input.start_time or config.settings.DEFAULT_COMPARISON_START_TIME
    effective_end_time_str = comparison_input.end_time or config.settings.DEFAULT_COMPARISON_END_TIME
    effective_n_results = comparison_input.num_results or config.settings.DEFAULT_COMPARISON_N_RESULTS
    effective_threshold = comparison_input.similarity_threshold if comparison_input.similarity_threshold is not None else config.settings.DEFAULT_COMPARISON_SIMILARITY_THRESHOLD

    try:
        # Convert time strings to time objects
        query_start_time_obj = dt.datetime.strptime(effective_start_time_str, '%H:%M').time()
        query_end_time_obj = dt.datetime.strptime(effective_end_time_str, '%H:%M').time()

        # --- FIX: Dynamically find the last trading day ---
        # This makes testing reliable and independent of market hours.
        query_date = dt.datetime.now(dt.timezone.utc).date()
        weekday = query_date.weekday() # Monday is 0, Sunday is 6

        if weekday == 5: # If today is Saturday
            query_date -= dt.timedelta(days=1) # Use Friday's date
        elif weekday == 6: # If today is Sunday
            query_date -= dt.timedelta(days=2) # Use Friday's date
        # This logic can be expanded to handle public holidays if needed.

        similar_results = pattern_matcher.find_similar_historical_patterns(
            stock_symbol=comparison_input.stock_symbol.upper(),
            query_start_time=query_start_time_obj,
            query_end_time=query_end_time_obj,
            similarity_threshold=effective_threshold,
            num_results=effective_n_results,
            query_date_override=query_date # Pass the adjusted date to the core logic
        )

        # Use the adjusted date for the response, for consistency
        response_query_date = query_date.isoformat()

        api_output = schemas.comparison_schemas.ComparisonOutput(
            query_stock_symbol=comparison_input.stock_symbol.upper(),
            query_time_window=f"{effective_start_time_str}-{effective_end_time_str}",
            query_date=response_query_date,
            similar_historical_patterns=similar_results
        )
        
        if not similar_results:
            api_output.message = "No sufficiently similar historical patterns found."

        # History Logging
        input_summary = comparison_input.model_dump(exclude_none=True)
        output_summary = {
            "patterns_found": len(similar_results),
            "threshold_used": effective_threshold,
            "results_requested": effective_n_results
        }
        history_entry = schemas.history_schemas.HistoryEntryCreate(
            user_id=current_user.id,
            action_type="PATTERN_COMPARISON",
            input_summary=input_summary,
            output_summary=output_summary
        )
        crud.history_crud.create_history_entry(db, entry=history_entry)

        return api_output

    except ValueError as ve: # Catch ValueErrors from core logic (e.g., no data)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except FileNotFoundError as fe: # If historical CSV is not found
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Historical data not found for symbol. {str(fe)}")
    except Exception as e:
        import traceback
        traceback.print_exc() # Log full error to server console
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error occurred during pattern comparison: {str(e)}")