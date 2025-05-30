# backend/app/core_logic/comparison/data_loader.py
import pandas as pd
import os
from pathlib import Path
from typing import Optional, Dict
from ...config import settings

# Simple in-memory cache for DataFrames
_df_cache: Dict[str, pd.DataFrame] = {}

def load_historical_data(stock_symbol: str) -> Optional[pd.DataFrame]:
    """
    Loads historical intraday data for a given stock symbol from a CSV file.
    Implements a simple in-memory cache.
    Assumes CSV filenames match the stock symbol (e.g., AAPL.csv or needs a mapping).
    """
    stock_symbol_upper = stock_symbol.upper()

    if stock_symbol_upper in _df_cache:
        # print(f"Loading {stock_symbol_upper} from cache.")
        return _df_cache[stock_symbol_upper].copy() # Return a copy to prevent modification of cached df

    # Construct filename - this part needs to be robust based on your CSV naming
    # Option 1: Direct match (e.g., AAPL.csv)
    # filename = f"{stock_symbol_upper}.csv"
    # Option 2: Handling your specific filename "HEROMOTOCO_with_indicators_.csv"
    # This needs a more generic way if you have many stocks
    if stock_symbol_upper == "HEROMOTOCO": # Temporary specific handling
        filename = "HEROMOTOCO_with_indicators_.csv"
    else:
        # Generic fallback, assuming STOCK_SYMBOL.csv - this will likely fail for other stocks
        # TODO: Implement a robust way to map symbol to filename or standardize filenames
        filename = f"{stock_symbol_upper}.csv"
        print(f"Warning: Using generic filename {filename} for {stock_symbol_upper}. Ensure this file exists or update mapping.")


    # Get the absolute path to the backend directory
    # This assumes the script/app is run from a context where `Path(__file__).resolve().parents[X]` makes sense
    # For FastAPI, it's usually relative to where Uvicorn is started.
    # settings.HISTORICAL_DATA_PATH is relative to the backend project root.
    
    # Assuming backend root is where .env is, and uvicorn runs from there
    base_path = Path(".") # Current working directory (where uvicorn is run, typically 'backend/')
    file_path = base_path / settings.HISTORICAL_DATA_PATH / filename
    
    # Alternative if HISTORICAL_DATA_PATH is absolute or needs more robust pathing
    # project_root = Path(__file__).resolve().parents[3] # Adjust based on file location
    # file_path = project_root / settings.HISTORICAL_DATA_PATH / filename

    print(f"Attempting to load historical data from: {file_path.resolve()}")

    if not file_path.exists():
        print(f"Historical data file not found: {file_path}")
        return None

    try:
        df = pd.read_csv(file_path, parse_dates=["date"]) # Assuming 'date' column needs parsing
        df["date"] = pd.to_datetime(df["date"])  # Ensure datetime format
        
        # Basic preprocessing often needed:
        df.sort_values(by="date", inplace=True)
        df.drop_duplicates(subset=["date"], keep="first", inplace=True) # Ensure unique timestamps
        
        _df_cache[stock_symbol_upper] = df.copy() # Cache it
        print(f"Loaded and cached {stock_symbol_upper} from {filename}. Shape: {df.shape}")
        return df.copy()
    except Exception as e:
        print(f"Error loading historical data for {stock_symbol_upper} from {file_path}: {e}")
        return None

def clear_cache():
    """Clears the in-memory DataFrame cache."""
    global _df_cache
    _df_cache = {}
    print("Historical data cache cleared.")