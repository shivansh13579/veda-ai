import pytest
from app.core.config import Settings
from app.core.exceptions import AppException, DatabaseConnectionError, NotFoundError, BadRequestError


def test_settings_defaults():
    """Verify default configurations adhere to specification."""
    s = Settings()
    assert s.APP_NAME == "Veda AI Backend API"
    assert s.API_V1_PREFIX == "/api/v1"
    assert s.POSTGRES_PORT == 5432
    assert "postgresql+asyncpg://" in s.DATABASE_URL
    assert "postgresql://" in s.sync_database_url


def test_cors_string_parsing():
    """Verify CORS origins string is parsed safely into a list."""
    s = Settings(CORS_ORIGINS="http://localhost:5173,http://example.com")
    assert "http://localhost:5173" in s.CORS_ORIGINS
    assert "http://example.com" in s.CORS_ORIGINS


def test_cors_json_parsing():
    """Verify JSON-formatted CORS origins string is parsed into a list."""
    s = Settings(CORS_ORIGINS='["http://alpha.com", "http://beta.com"]')
    assert s.CORS_ORIGINS == ["http://alpha.com", "http://beta.com"]


def test_database_url_assembly():
    """Verify explicit components assemble a valid asyncpg URL."""
    s = Settings(
        _env_file=None,
        DATABASE_URL=None,
        POSTGRES_USER="test_usr",
        POSTGRES_PASSWORD="test_pwd",
        POSTGRES_HOST="pg_host",
        POSTGRES_PORT=5433,
        POSTGRES_DB="test_db",
    )
    assert s.DATABASE_URL == "postgresql+asyncpg://test_usr:test_pwd@pg_host:5433/test_db"
    assert s.sync_database_url == "postgresql://test_usr:test_pwd@pg_host:5433/test_db"


def test_custom_exceptions():
    """Verify standardized exception properties."""
    exc = DatabaseConnectionError(details={"host": "localhost"})
    assert exc.status_code == 503
    assert exc.error_code == "DATABASE_UNAVAILABLE"
    assert exc.details["host"] == "localhost"

    nf = NotFoundError("Missing item")
    assert nf.status_code == 404
    assert nf.error_code == "RESOURCE_NOT_FOUND"

    br = BadRequestError("Invalid parameter")
    assert br.status_code == 400
    assert br.error_code == "BAD_REQUEST"
