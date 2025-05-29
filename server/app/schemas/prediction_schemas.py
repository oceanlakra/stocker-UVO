# backend/app/schemas/prediction_schemas.py
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import datetime

# --- Schemas for Model Training (Optional API Endpoint) ---
class ModelTrainInput(BaseModel):
    stock_symbol: str = Field(default=None, example="AAPL", description="Stock symbol to train model for. Uses default if None.")
    # For sentiment data fetching (used to create features)
    reddit_subreddits: List[str] = Field(default_factory=lambda: ["wallstreetbets", "stocks", "investing"])
    reddit_keywords: List[str] = Field(default_factory=list, description="Keywords related to the stock symbol. If empty, symbol will be used.")
    reddit_days_back: Optional[int] = Field(default=None, description="Days to fetch Reddit data. Uses default if None.")
    # For market data fetching
    market_data_days_back: Optional[int] = Field(default=None, description="Days to fetch market data. Uses default if None.")
    # Model training parameters
    epochs: Optional[int] = Field(default=None, ge=1, description="Number of training epochs. Uses default if None.")
    batch_size: Optional[int] = Field(default=None, ge=1, description="Batch size for training. Uses default if None.")
    sequence_length: Optional[int] = Field(default=None, ge=1, description="LSTM sequence length. Uses default if None.")
    learning_rate: Optional[float] = Field(default=None, gt=0, description="Learning rate. Uses default if None.")
    test_size: Optional[float] = Field(default=0.2, ge=0.1, le=0.5, description="Proportion of data for testing.")
    # target_shift_days: int = Field(default=1, ge=1, description="How many days ahead to predict the target for.") # This could be fixed in logic

class ModelTrainOutput(BaseModel):
    stock_symbol: str
    training_start_time: datetime.datetime
    training_duration_seconds: float
    message: str = "Model training and evaluation completed."
    classification_report: str # Or Dict if parsed
    confusion_matrix: List[List[int]] # e.g., [[TN, FP], [FN, TP]]
    # y_true: Optional[List[int]] = None # Potentially large
    # y_pred_probabilities: Optional[List[float]] = None # Potentially large
    feature_columns_used: List[str]
    # model_save_path: Optional[str] = None # If you implement model saving

class StockPredictInput(BaseModel):
    stock_symbol: Optional[str] = Field(
        default=None, 
        example="AAPL", 
        description="Stock symbol to predict for. Uses system default if not provided."
    )
    # Parameters to fetch LATEST data for forming the input sequence
    reddit_subreddits: Optional[List[str]] = Field( # <--- THIS FIELD IS PRESENT
        default=None, 
        example=["wallstreetbets", "stocks"],
        description="Subreddits for sentiment data. Uses system default list if None."
    )
    reddit_keywords: Optional[List[str]] = Field( # <<< THIS IS THE FIELD CAUSING THE ERROR. IT MUST EXIST.
        default=None, 
        example=["AAPL", "Tim Cook"],
        description="Keywords for Reddit search. If None and stock_symbol is provided, symbol might be used as a keyword."
    )
    data_history_days: Optional[int] = Field(
        default=None, 
        ge=60,
        le=730,
        description="Number of past days of data to fetch and train on for this prediction. Uses system default if None."
    )
    epochs: Optional[int] = Field(default=None, ge=1, le=50)
    sequence_length: Optional[int] = Field(default=None, ge=3, le=30)
    # model_id_or_version: Optional[str] = Field(default="latest", description="Identifier of the trained model to use.") # For later
    
class StockPredictOutput(BaseModel):
    stock_symbol: str
    prediction_for_date: datetime.date # The date the prediction is for (next business day)
    # Probability of the price going up (output of sigmoid)
    probability_positive_movement: float = Field(..., ge=0, le=1)
    prediction_label: str # e.g., "UP", "DOWN", "NEUTRAL"
    model_training_duration_seconds: Optional[float] = None # How long this ad-hoc training took
    data_used_for_training_period: Optional[str] = None # e.g., "2023-01-01 to 2023-12-31"
    message: Optional[str] = None