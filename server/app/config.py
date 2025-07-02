from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    #Project Settings
    PROJECT_NAME: str
    
    #Historical Data Path
    HISTORICAL_DATA_PATH: str = "data/filtered_csvs"
    # Defaults for Comparison API
    DEFAULT_COMPARISON_START_TIME: str = "09:15" 
    DEFAULT_COMPARISON_END_TIME: str = "09:45"   
    DEFAULT_COMPARISON_N_RESULTS: int = 5
    DEFAULT_COMPARISON_SIMILARITY_THRESHOLD: float = 0.90


    # Frontend URL
    FRONTEND_URL: str

    #Database Settings
    DATABASE_URL: str
    
    #JWT Settings
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    # REFRESH_TOKEN_EXPIRE_DAYS: int

    # --- OAuth - Google ---
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: Optional[str] = None 
    # Reddit API
    REDDIT_CLIENT_ID: str
    REDDIT_CLIENT_SECRET: str
    REDDIT_USER_AGENT: str

    # Prediction Defaults
    DEFAULT_STOCK_SYMBOL: str = "SPY"
    DEFAULT_DAYS_BACK_REDDIT: int = 30
    DEFAULT_DAYS_MARKET_DATA: int = 365
    DEFAULT_LSTM_SEQUENCE_LENGTH: int = 10
    DEFAULT_LSTM_EPOCHS: int = 50
    DEFAULT_LSTM_BATCH_SIZE: int = 32
    DEFAULT_LSTM_HIDDEN_SIZE: int = 128
    DEFAULT_LSTM_NUM_LAYERS: int = 3
    DEFAULT_PREDICTION_LR: float = 0.001
    DEFAULT_PREDICTION_TEST_SIZE: float = 0.1 
   
    model_config = SettingsConfigDict(env_file=".env", extra="ignore") 

settings = Settings()