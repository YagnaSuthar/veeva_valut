from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    DATABASE_URL: str = Field(..., description="Async PostgreSQL database URL")
    SECRET_KEY: str = Field(..., min_length=32, description="Secret key for JWT signing")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # SMTP Configuration
    SMTP_HOST: str = Field(..., description="SMTP server host (e.g., smtp.gmail.com)")
    SMTP_PORT: int = Field(..., description="SMTP server port (e.g., 587 for TLS)")
    SMTP_USERNAME: str = Field(..., description="SMTP username (usually email address)")
    SMTP_PASSWORD: str = Field(..., description="SMTP password or app password")
    FROM_EMAIL: str = Field(..., description="Sender email address")
    SMTP_USE_TLS: bool = True

    class Config:
        env_file = (".env", "app/.env")
        env_file_encoding = "utf-8"


settings = Settings()
