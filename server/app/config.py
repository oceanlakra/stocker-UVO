from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    #Project Settings
    PROJECT_NAME: str
    
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
    GOOGLE_REDIRECT_URI: Optional[str] = None # For backend callback

    # # --- OAuth - Facebook ---
    # FACEBOOK_CLIENT_ID: Optional[str] = None
    # FACEBOOK_CLIENT_SECRET: Optional[str] = None
    # FACEBOOK_REDIRECT_URI: Optional[str] = None # For backend callback

    model_config = SettingsConfigDict(env_file=".env", extra="ignore") # Note: path to .env

settings = Settings()