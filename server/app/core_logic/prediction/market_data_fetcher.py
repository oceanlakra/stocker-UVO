# backend/app/core_logic/prediction/market_data_fetcher.py
import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta
from ...config import settings # For default symbol, days

class MarketDataFetcher:
    def get_stock_data(self, symbol: str = None, start_date_str: str = None, end_date_str: str = None) -> pd.DataFrame:
        """Fetches stock market data and calculates technical indicators."""
        target_symbol = symbol or settings.DEFAULT_STOCK_SYMBOL
        
        # Convert strings to datetime objects first, then format them back to strings for yfinance
        # This section needs careful review
        if start_date_str:
            start_dt_obj = datetime.fromisoformat(start_date_str.replace("Z", "+00:00")) # Parses ISO string to datetime object
        else:
            start_dt_obj = datetime.now() - timedelta(days=settings.DEFAULT_DAYS_MARKET_DATA)
        start_date_formatted_for_yf = start_dt_obj.strftime('%Y-%m-%d') # Format for yfinance
            
        if end_date_str:
            end_dt_obj = datetime.fromisoformat(end_date_str.replace("Z", "+00:00")) # Parses ISO string to datetime object
        else:
            end_dt_obj = datetime.now()
        end_date_formatted_for_yf = end_dt_obj.strftime('%Y-%m-%d') # Format for yfinance
            
        print(f"MarketDataFetcher: Using symbol='{target_symbol}', start='{start_date_formatted_for_yf}', end='{end_date_formatted_for_yf}' for .history()")
        
        stock_ticker = yf.Ticker(target_symbol)
        df = stock_ticker.history(start=start_date_formatted_for_yf, end=end_date_formatted_for_yf)

        if df.empty:
            # THE ERROR IS RAISED HERE.
            # THE VARIABLES `start_dt` and `end_dt` are NOT DEFINED IN THIS SCOPE if the original
            # `start_date_str` or `end_date_str` were None, because they would have been defined
            # inside the if/else blocks for formatting.
            # We should use the formatted strings or the _obj versions in the error message.
            # Original problematic line:
            # raise ValueError(f"No market data found for symbol {target_symbol} between {start_dt} and {end_dt}")
            # Corrected error message using the formatted strings that were actually passed to yfinance:
            raise ValueError(f"No market data found for symbol {target_symbol} between {start_date_formatted_for_yf} and {end_date_formatted_for_yf}")

        # ... TA calculations ...
        df['Returns'] = df['Close'].pct_change()
        df['SMA_20'] = df['Close'].rolling(window=20).mean()
        df['SMA_50'] = df['Close'].rolling(window=50).mean()
        df['RSI'] = self._calculate_rsi(df['Close'])
        df['MACD'] = self._calculate_macd(df['Close'])
        df['Volatility'] = df['Returns'].rolling(window=20).std()
        
        # CRITICAL: dropna() after TA calculations
        df_before_dropna_shape = df.shape
        processed_df = df.dropna()
        if processed_df.empty and not df.empty and df_before_dropna_shape[0] > 0 :
            print(f"WARNING: MarketDataFetcher - DataFrame became empty after dropna(). Original shape: {df_before_dropna_shape}, after TA and dropna: {processed_df.shape}")
            print("This usually means the history period was too short for the TA rolling windows.")
            # Forcing it to not be empty for debugging, but this data would be bad:
            # return df.fillna(0) 
            # Better to raise an error if dropna makes it empty and it wasn't already
            raise ValueError(f"Data for {target_symbol} became empty after TA calculations and dropna. Original rows: {df_before_dropna_shape[0]}. Increase history period.")

        return processed_df
        
    # ... _calculate_rsi and _calculate_macd methods ...
    @staticmethod
    def _calculate_rsi(prices: pd.Series, period: int = 14) -> pd.Series:
        # ... (implementation)
        delta = prices.diff()
        if delta.empty: return pd.Series(index=prices.index, dtype=float).fillna(50) # Handle empty delta
        gain = (delta.where(delta > 0, 0.0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0.0)).rolling(window=period).mean()
        
        # Avoid division by zero if loss is 0
        rs = gain / loss.replace(0, 0.000001) # Replace 0 loss with a tiny number
        rsi = 100 - (100 / (1 + rs))
        return rsi.fillna(50)

    @staticmethod
    def _calculate_macd(prices: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> pd.Series:
        # ... (implementation)
        if prices.empty: return pd.Series(index=prices.index, dtype=float).fillna(0)
        exp1 = prices.ewm(span=fast, adjust=False).mean()
        exp2 = prices.ewm(span=slow, adjust=False).mean()
        macd_line = exp1 - exp2
        return macd_line.fillna(0)