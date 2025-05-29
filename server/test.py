import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta, timezone
from app.config import settings

# Simulate the same environment as your actual code
effective_symbol = "AAPL"
effective_history_days = 90  # Or use settings.DEFAULT_DAYS_MARKET_DATA

print(f"Testing market data fetching for {effective_symbol}...")

# Create the market data fetcher as in your code
class MarketDataFetcher:
    def get_stock_data(self, symbol: str = None, start_date_str: str = None, end_date_str: str = None) -> pd.DataFrame:
        """Fetches stock market data and calculates technical indicators."""
        target_symbol = symbol or settings.DEFAULT_STOCK_SYMBOL
        
        end_dt = datetime.now(timezone.utc) if end_date_str is None else datetime.fromisoformat(end_date_str.replace("Z", "+00:00"))
        if start_date_str is None:
            start_dt = end_dt - timedelta(days=settings.DEFAULT_DAYS_MARKET_DATA)
        else:
            start_dt = datetime.fromisoformat(start_date_str.replace("Z", "+00:00"))

        print(f"Fetching data for {target_symbol} from {start_dt.date()} to {end_dt.date()}")
        
        # Using the same approach as your code
        stock_ticker = yf.Ticker(target_symbol)
        df = stock_ticker.history(start=start_dt, end=end_dt)

        if df.empty:
            raise ValueError(f"No market data found for symbol {target_symbol} between {start_dt.date()} and {end_dt.date()}")

        print(f"Raw market data fetched. Shape: {df.shape}")
        print(f"First date: {df.index[0].date()}, Last date: {df.index[-1].date()}")
        
        # Add technical indicators as in your code
        df['Returns'] = df['Close'].pct_change()
        df['SMA_20'] = df['Close'].rolling(window=20).mean()
        df['SMA_50'] = df['Close'].rolling(window=50).mean()
        
        # Drop rows with NaNs from rolling calculations
        df = df.dropna()
        
        print(f"Market data after processing. Shape: {df.shape}")
        
        return df

# Create an instance and test fetching market data
md_fetcher = MarketDataFetcher()

# Calculate dates as in your code
end_dt_market = datetime.now(timezone.utc)
start_dt_market = end_dt_market - timedelta(days=effective_history_days)

try:
    market_df = md_fetcher.get_stock_data(
        symbol=effective_symbol,
        start_date_str=start_dt_market.strftime('%Y-%m-%d'),
        end_date_str=end_dt_market.strftime('%Y-%m-%d')
    )
    
    if market_df.empty:
        print("Market data is empty after processing")
    else:
        print("\nMarket data fetched successfully:")
        print(f"Shape: {market_df.shape}")
        print("\nFirst few rows:")
        print(market_df.head())
        print("\nLast few rows:")
        print(market_df.tail())
        
except Exception as e:
    print(f"Error fetching market data: {str(e)}")
    raise
