from pydantic_settings import BaseSettings
from typing import List
from pathlib import Path

# Get the directory where this config file is located
BASE_DIR = Path(__file__).resolve().parent

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # JWT Settings
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # 2FA Settings
    OTP_ISSUER: str = "AcademicPlatform"
    
    # Email Settings
    SMTP_USER: str
    SMTP_PASSWORD: str
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    FRONTEND_URL: str = "http://localhost:5173"
    EMAIL_VERIFICATION_EXPIRY_HOURS: int = 24
    
    # CORS
    CORS_ORIGINS: str  # Will be parsed into a list
    
    # Scopus API
    SCOPUS_API_KEY: str
    SCOPUS_API_BASE_URL: str = "https://api.elsevier.com/content"
    
    # Application
    APP_NAME: str = "Academic Platform API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    class Config:
        env_file = str(BASE_DIR / ".env")
        case_sensitive = True
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS_ORIGINS string into a list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


settings = Settings()