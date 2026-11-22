import json
from typing import List, Union
from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Centralized application configuration managed via Pydantic Settings.
    Supports environment variables with sensible development defaults.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # Application Metadata
    APP_NAME: str = "Veda AI Backend API"
    APP_VERSION: str = "0.1.0"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # PostgreSQL Configuration
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "veda_ai_db"
    POSTGRES_USER: str = "veda_user"
    POSTGRES_PASSWORD: str = "veda_password"

    # Asynchronous Database URL
    DATABASE_URL: Union[str, None] = None

    # Cross-Origin Resource Sharing
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
    FRONTEND_URL: str = "http://localhost:5173"

    # Authentication & JWT Configuration
    JWT_SECRET_KEY: str = (
        "veda_ai_insecure_development_jwt_secret_key_change_in_production_min32chars"
    )
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    RESET_TOKEN_EXPIRE_HOURS: int = 1

    # Cookie Security Settings
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"
    COOKIE_DOMAIN: Union[str, None] = None
    COOKIE_PATH: str = "/api/v1/auth"

    # Email Service Configuration
    EMAIL_PROVIDER: str = "console"  # 'console' | 'mock' | 'smtp'
    SMTP_HOST: Union[str, None] = None
    SMTP_PORT: int = 587
    SMTP_USER: Union[str, None] = None
    SMTP_PASSWORD: Union[str, None] = None
    EMAILS_FROM_EMAIL: str = "noreply@veda.ai"

    # Astrology Engine Configuration (Batch 6D-1)
    ASTROLOGY_SYSTEM: str = "vedic"
    ASTROLOGY_ZODIAC_TYPE: str = "sidereal"
    ASTROLOGY_DEFAULT_AYANAMSHA: str = "lahiri"
    ASTROLOGY_DEFAULT_HOUSE_SYSTEM: str = "whole_sign"
    ASTROLOGY_NODE_TYPE: str = "true"  # 'true' (True Node) | 'mean' (Mean Node)
    SWISS_EPHEMERIS_PATH: Union[str, None] = None
    ASTROLOGY_REQUIRE_EPHEMERIS_FILES: bool = False
    ASTROLOGY_ALLOW_APPROXIMATE_TIME: bool = True

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return []

    @model_validator(mode="after")
    def assemble_database_url(self) -> "Settings":
        if not self.DATABASE_URL:
            self.DATABASE_URL = (
                f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
                f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
            )
        return self

    @model_validator(mode="after")
    def validate_production_security(self) -> "Settings":
        if self.is_production:
            if (
                "insecure" in self.JWT_SECRET_KEY.lower()
                or "development" in self.JWT_SECRET_KEY.lower()
                or len(self.JWT_SECRET_KEY) < 32
            ):
                raise ValueError(
                    "Production requires a strong, cryptographically random JWT_SECRET_KEY of at least 32 characters."
                )
            if self.DEBUG:
                raise ValueError("DEBUG mode must be False in production.")
            if not self.COOKIE_SECURE:
                raise ValueError("COOKIE_SECURE must be True in production.")
            if "*" in self.CORS_ORIGINS:
                raise ValueError(
                    "Wildcard '*' in CORS_ORIGINS is strictly prohibited when allow_credentials=True."
                )
        return self

    @property
    def is_production(self) -> bool:
        return self.APP_ENV.lower() == "production"

    @property
    def sync_database_url(self) -> str:
        """Synchronous connection string for Alembic CLI if required."""
        if self.DATABASE_URL and self.DATABASE_URL.startswith("postgresql+asyncpg://"):
            return self.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://", 1)
        return self.DATABASE_URL or ""


settings = Settings()

