import os
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_NAME: str = "Travel Manager"
    APP_ENV: str = "development"
    APP_SECRET_KEY: str = "travel_manager_super_secret_key_change_in_production_32chars"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 hours
    ALGORITHM: str = "HS256"

    # Database
    POSTGRES_USER: str = "travel_user"
    POSTGRES_PASSWORD: str = "travel_secret_password"
    POSTGRES_DB: str = "travel_manager"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: Optional[str] = None

    # Storage
    UPLOAD_DIR: str = str(BASE_DIR / "uploads")
    BACKUP_DIR: str = str(BASE_DIR / "backups")
    MAX_UPLOAD_SIZE_MB: int = 25

    # AI & Integrations
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    GOOGLE_MAPS_API_KEY: Optional[str] = None
    WEATHER_API_KEY: Optional[str] = None

    # SMTP Email
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: str = "contato@travelmanager.local"
    EMAILS_FROM_NAME: str = "Travel Manager"

    # Web Push
    VAPID_PUBLIC_KEY: Optional[str] = None
    VAPID_PRIVATE_KEY: Optional[str] = None
    VAPID_CLAIM_EMAIL: str = "mailto:admin@travelmanager.local"

settings = Settings()

# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.BACKUP_DIR, exist_ok=True)
