from pydantic_settings import BaseSettings, SettingsConfigDict

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

    model_config = SettingsConfigDict(env_file=".env", extra="ignore") # Note: path to .env

settings = Settings()