import pytest

from app.core.config import Settings


def production_settings(**overrides):
    values = {
        "environment": "production",
        "database_url": "postgresql://postgres:password@example.com:5432/grillr",
        "cors_origins": ["https://app.example.com"],
        "jwt_secret": "production-jwt-secret",
        "supabase_jwt_secret": "production-supabase-secret",
        "rime_api_key": "test-rime-key",
        "auth_required": True,
        "auto_create_schema": False,
    }
    values.update(overrides)
    return values


def test_production_rejects_sqlite_database():
    with pytest.raises(ValueError, match="DATABASE_URL must use PostgreSQL"):
        Settings(**production_settings(database_url="sqlite:///./grillr.db"))


def test_production_rejects_development_jwt_secret():
    with pytest.raises(ValueError, match="JWT_SECRET must be changed"):
        Settings(**production_settings(jwt_secret="change-me-in-development"))


def test_production_rejects_localhost_cors_origin():
    with pytest.raises(ValueError, match="CORS_ORIGINS must be configured"):
        Settings(**production_settings(cors_origins=["http://localhost:3000"]))


def test_production_rejects_wildcard_cors_with_credentials():
    with pytest.raises(ValueError, match=r"cannot contain '\*'.*credentials"):
        Settings(**production_settings(cors_origins=["*"]))


def test_development_allows_development_defaults():
    settings = Settings(
        environment="development",
        database_url="sqlite:///./grillr.db",
        cors_origins=["http://localhost:3000"],
        jwt_secret="change-me-in-development",
        auth_required=False,
        auto_create_schema=True,
    )

    assert settings.is_production is False


def test_existing_production_security_validation_is_preserved():
    with pytest.raises(ValueError, match="AUTH_REQUIRED must be true outside development"):
        Settings(**production_settings(auth_required=False))

    with pytest.raises(ValueError, match="SUPABASE_JWT_SECRET is required outside development"):
        Settings(**production_settings(supabase_jwt_secret=None))

    with pytest.raises(ValueError, match="AUTO_CREATE_SCHEMA must be false outside development"):
        Settings(**production_settings(auto_create_schema=True))