import yfinance as yf

# Example: Reliance Industries
ticker = yf.Ticker("HEROMOTOCO.NS")

# Get intraday 5-minute interval data (valid for last 60 days max)
data = ticker.history(interval="5m", period="1d")  # You can use 1d, 5d, 7d, 30d, etc.

print(data.head())