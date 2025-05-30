# backend/app/core_logic/comparison/pattern_matcher.py
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import yfinance as yf
from datetime import datetime, time as dt_time, date as dt_date, timedelta, timezone
from typing import List, Tuple, Dict, Any
from .data_loader import load_historical_data

def _normalize_ohlc_pattern(df_slice: pd.DataFrame) -> np.ndarray:
    """Normalizes OHLC columns of a DataFrame slice and flattens."""
    if df_slice.empty or not all(col in df_slice.columns for col in ["open", "high", "low", "close"]):
        return np.array([])
    scaler = MinMaxScaler()
    # Ensure we are normalizing only numeric OHLC columns
    ohlc_data = df_slice[["open", "high", "low", "close"]].values
    if ohlc_data.size == 0: # If all values were NaN and dropped for example
        return np.array([])
    return scaler.fit_transform(ohlc_data).flatten()

def _filter_by_time_window(df: pd.DataFrame, start_time_obj: dt_time, end_time_obj: dt_time) -> pd.DataFrame:
    """Filters a DataFrame for rows within a specific time window."""
    if df.empty or "date" not in df.columns: # Assuming 'date' is datetime column
        return pd.DataFrame()
    
    # Ensure 'date' column is datetime
    if not pd.api.types.is_datetime64_any_dtype(df['date']):
        df['date'] = pd.to_datetime(df['date'])

    # Create a temporary time column for filtering if it doesn't exist
    if 'time' not in df.columns:
         df_temp = df.copy()
         df_temp['time'] = df_temp['date'].dt.time
         return df_temp[(df_temp['time'] >= start_time_obj) & (df_temp['time'] <= end_time_obj)].drop(columns=['time'])
    else: # if 'time' column already exists (e.g. from your CSV)
         return df[(df['time'] >= start_time_obj) & (df['time'] <= end_time_obj)]


def find_similar_historical_patterns(
    stock_symbol: str,
    query_start_time: dt_time, # Python time object
    query_end_time: dt_time,   # Python time object
    similarity_threshold: float,
    num_results: int
) -> List[Dict[str, Any]]:
    """
    Finds historical intraday patterns similar to today's pattern for a given stock
    within a specified time window.
    """
    # 1. Load historical data for the stock
    df_historical_full = load_historical_data(stock_symbol)
    if df_historical_full is None or df_historical_full.empty:
        raise ValueError(f"No historical data found for symbol {stock_symbol}.")

    # Add 'time' column if not present from CSV
    if 'time' not in df_historical_full.columns and 'date' in df_historical_full.columns:
        df_historical_full['time'] = pd.to_datetime(df_historical_full['date']).dt.time
    
    # 2. Fetch "today's" data (query pattern) using yfinance for 5-min interval
    # We need data for today up to query_end_time
    today_date = datetime.now(timezone.utc).date()
    # yfinance intraday often needs start and end datetimes for the current day
    # Fetch a bit more to ensure we cover the window, e.g., from market open
    yf_start_dt = datetime.combine(today_date, dt_time(hour=0, minute=0), tzinfo=timezone.utc) # Start of today UTC
    yf_end_dt = datetime.combine(today_date, dt_time(hour=23, minute=59), tzinfo=timezone.utc) # End of today UTC
    
    print(f"Fetching yfinance data for {stock_symbol} on {today_date} from {yf_start_dt} to {yf_end_dt}")
    # For 5-min data, interval='5m'. yfinance often requires start/end to be within last 60 days for <1d intervals.
    # If query_end_time is far in future, this might be empty.
    # For intraday, it's common to fetch data for the "current" trading day.
    # Let's assume the user provides a time window for the *current* trading day.
    
    # Ensure we're fetching data for a period that yfinance supports for 5m interval
    # Typically, the start date can't be more than 60 days in the past for intervals < 1d.
    # For "today's" pattern, we only need today's data.
    
    # Define a narrow period for yfinance for today.
    # Get the current time and go back a bit to ensure we have data if we are mid-day.
    now_utc = datetime.now(timezone.utc)
    yf_query_start = (now_utc - timedelta(days=1)).strftime('%Y-%m-%d') # Start from yesterday to be safe
    yf_query_end = (now_utc + timedelta(days=1)).strftime('%Y-%m-%d')   # End tomorrow to be safe

    df_today_full_day = yf.download(stock_symbol, start=yf_query_start, end=yf_query_end, interval="5m", progress=False)
    
    if df_today_full_day.empty:
        raise ValueError(f"Could not fetch today's 5-min data for {stock_symbol} via yfinance.")

    # Filter yfinance data to today only and convert index to 'date' column
    df_today_full_day = df_today_full_day[df_today_full_day.index.date == today_date].reset_index()
    df_today_full_day.rename(columns={'Datetime': 'date', 'Open':'open', 'High':'high', 'Low':'low', 'Close':'close', 'Volume':'volume'}, inplace=True) # Align column names
    if 'date' not in df_today_full_day.columns:
         raise ValueError("yfinance data missing 'date' (Datetime) column after processing.")

    df_today_window = _filter_by_time_window(df_today_full_day, query_start_time, query_end_time)

    if df_today_window.empty:
        raise ValueError(f"No data found for {stock_symbol} in today's yfinance data for the window {query_start_time}-{query_end_time}.")

    today_pattern_normalized = _normalize_ohlc_pattern(df_today_window)
    if today_pattern_normalized.size == 0:
        raise ValueError("Today's pattern (query pattern) is empty or could not be normalized.")

    # 3. Process historical data
    df_historical_windowed = _filter_by_time_window(df_historical_full, query_start_time, query_end_time)
    
    # Group by date to get individual historical trading days within the window
    # Ensure 'date' column is datetime64[ns] for dt accessor
    df_historical_windowed['date_only'] = pd.to_datetime(df_historical_windowed['date']).dt.date
    historical_day_groups = df_historical_windowed.groupby('date_only')

    similar_patterns_data = []

    for hist_date, group_df in historical_day_groups:
        if hist_date == today_date: # Skip comparing today with itself if it's in historical
            continue

        hist_pattern_normalized = _normalize_ohlc_pattern(group_df)
        
        if hist_pattern_normalized.size == today_pattern_normalized.size and today_pattern_normalized.size > 0:
            # Compute Cosine Similarity
            dot_product = np.dot(today_pattern_normalized, hist_pattern_normalized)
            norm_today = np.linalg.norm(today_pattern_normalized)
            norm_hist = np.linalg.norm(hist_pattern_normalized)
            
            if norm_today == 0 or norm_hist == 0: # Avoid division by zero if a pattern is all zeros
                similarity = 0.0
            else:
                similarity = dot_product / (norm_today * norm_hist)
            
            if similarity >= similarity_threshold:
                # Get full day data for this historical similar day
                full_day_hist_df = df_historical_full[pd.to_datetime(df_historical_full['date']).dt.date == hist_date]
                
                similar_patterns_data.append({
                    "date": hist_date.isoformat(),
                    "similarity_score": float(similarity),
                    "window_pattern_data": group_df[["date", "open", "high", "low", "close"]].to_dict(orient="records"),
                    "full_day_data": full_day_hist_df[["date", "open", "high", "low", "close"]].to_dict(orient="records")
                })

    # Sort by highest similarity and take top N
    similar_patterns_data.sort(key=lambda x: x["similarity_score"], reverse=True)
    
    return similar_patterns_data[:num_results]