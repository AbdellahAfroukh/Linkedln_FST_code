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
    CORS_ORIGINS: List[str] = ["http://localhost:5713", "http://localhost:8000", "http://localhost:5173"]
    
    # Scopus API
    SCOPUS_API_KEY: str = "01c3e1213a3b51108e1408c74d241015"
    SCOPUS_API_BASE_URL: str = "https://api.elsevier.com/content"
    
    # Application
    APP_NAME: str = "Academic Platform API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()