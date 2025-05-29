# backend/app/core_logic/prediction/feature_engineering.py
import pandas as pd
import numpy as np
from sklearn.preprocessing import RobustScaler # Or MinMaxScaler
from ...config import settings # For sequence_length

def prepare_prediction_features(sentiment_df: pd.DataFrame, market_df: pd.DataFrame, target_shift_days: int = 1) -> pd.DataFrame:
    """
    Combines sentiment and market data, creates features, and target.
    """
    if market_df.empty:
        raise ValueError("Market data cannot be empty for feature preparation.")

    # Ensure datetime index for market_df
    if not isinstance(market_df.index, pd.DatetimeIndex):
        market_df.index = pd.to_datetime(market_df.index)

    # Resample sentiment data to daily frequency if it's not already
    # Assuming sentiment_df has 'datetime_utc' and 'sentiment_score', 'score', 'num_comments'
    if not sentiment_df.empty and 'datetime_utc' in sentiment_df.columns:
        daily_sentiment = sentiment_df.set_index('datetime_utc').resample('D').agg(
            sentiment_score_mean=('sentiment_score', 'mean'),
            reddit_score_sum=('score', 'sum'),
            num_comments_sum=('num_comments', 'sum')
        ).fillna(0)
        
        combined_df = pd.merge(market_df, daily_sentiment, left_index=True, right_index=True, how='left').fillna(0)
    else: # No sentiment data or missing required columns
        combined_df = market_df.copy()
        combined_df['sentiment_score_mean'] = 0.0
        combined_df['reddit_score_sum'] = 0
        combined_df['num_comments_sum'] = 0


    # Feature Engineering (adapt from your original prepare_features)
    combined_df['log_volume'] = np.log1p(combined_df['Volume'])
    combined_df['sentiment_strength'] = combined_df['sentiment_score_mean'].abs()
    combined_df['price_momentum_5d'] = combined_df['Returns'].rolling(window=5).mean()
    combined_df['sentiment_ma_5d'] = combined_df['sentiment_score_mean'].rolling(window=5).mean()
    combined_df['sentiment_std_5d'] = combined_df['sentiment_score_mean'].rolling(window=5).std()

    # Create target variable (1 if next day's return is positive, 0 otherwise)
    combined_df['target'] = np.where(combined_df['Returns'].shift(-target_shift_days) > 0.0005, 1, 0) # Small threshold to avoid noise
    
    # Drop NaNs created by rolling windows or target shift
    combined_df.dropna(subset=['target'], inplace=True) # Must have a target
    combined_df.fillna(0, inplace=True) # Fill any other NaNs with 0 after critical drops

    # Define features to be used by the model
    # Ensure these features exist in combined_df after engineering
    feature_columns = [
        'Returns', 'log_volume', 'sentiment_score_mean', 'sentiment_strength',
        'sentiment_ma_5d', 'sentiment_std_5d', 'RSI', 'MACD', 'Volatility', 'price_momentum_5d',
        'SMA_20', 'SMA_50' # Added from market_data_fetcher
    ]
    
    # Ensure all feature columns are present, add them with 0 if missing (or handle more robustly)
    for col in feature_columns:
        if col not in combined_df.columns:
            combined_df[col] = 0.0
    
    # Select only the specified features and target
    final_df = combined_df[feature_columns + ['target']].copy()
    return final_df


def scale_features(features_df: pd.DataFrame, scaler=None) -> tuple[pd.DataFrame, RobustScaler]:
    """Scales features using RobustScaler. Returns scaled DataFrame and fitted scaler."""
    if scaler is None:
        scaler = RobustScaler()
        scaled_values = scaler.fit_transform(features_df)
    else:
        scaled_values = scaler.transform(features_df)
    
    return pd.DataFrame(scaled_values, columns=features_df.columns, index=features_df.index), scaler


def create_lstm_sequences(data: pd.DataFrame, target_series: pd.Series, sequence_length: int = None) -> tuple[np.ndarray, np.ndarray]:
    """Creates sequences for LSTM input."""
    seq_len = sequence_length or settings.DEFAULT_LSTM_SEQUENCE_LENGTH
    
    sequences = []
    target_values = []
    
    # Ensure data and target_series have compatible indices if they are separate
    # For simplicity, assuming 'data' contains features and 'target_series' is aligned
    
    feature_values = data.values
    
    for i in range(len(feature_values) - seq_len):
        seq = feature_values[i : i + seq_len]
        target = target_series.iloc[i + seq_len] # Target is for the day AFTER the sequence
        sequences.append(seq)
        target_values.append(target)
        
    return np.array(sequences), np.array(target_values)