from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://postgres:1234@localhost:5433/LINKEDINFST"
    
    # JWT Settings
    SECRET_KEY: str = "EnVRaDQSe2yjc2vTs-qJdELhQUDPihsM1FXkqFWbbW8"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # 2FA Settings
    OTP_ISSUER: str = "AcademicPlatform"
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    # Application
    APP_NAME: str = "Academic Platform API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()