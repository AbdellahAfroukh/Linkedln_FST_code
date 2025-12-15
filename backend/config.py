from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://postgres:sdoumi%4013@localhost:5432/linkedln_fst_db"

    # JWT Settings
    SECRET_KEY: str = "EnVRaDQSe2yjc2vTs-qJdELhQUDPihsM1FXkqFWbbW8"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # 2FA Settings
    OTP_ISSUER: str = "AcademicPlatform"
    
    # Scopus API Settings
    SCOPUS_API_KEY: str = "02f5462a7aabbf0ce9f3809929f02dab"
    SCOPUS_BASE_URL: str = "https://api.elsevier.com/content"
    
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