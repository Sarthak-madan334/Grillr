from functools import lru_cache

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Grillr Interview Coach API"
    environment: str = "development"
    database_url: str = "sqlite:///./grillr.db"
    cors_origins: list[str] = ["http://localhost:3000"]
    jwt_secret: str = "change-me-in-development"
    openai_api_key: str | None = None
    supabase_jwt_secret: str | None = None
    supabase_url: str | None = None
    supabase_anon_key: str | None = None
    supabase_jwks_url: str | None = None
    rime_api_key: str | None = None
    groq_api_key: str | None = None
    groq_model: str = "llama-3.1-8b-instant"
    auth_required: bool = False
    sql_echo: bool = False
    auto_create_schema: bool = True
    log_level: str = "INFO"
    global_rate_limit: int = 100
    global_rate_window_seconds: int = 60
    auth_rate_limit: int = 10
    auth_rate_window_seconds: int = 60
    interview_creation_rate_limit: int = 5
    interview_creation_rate_window_seconds: int = 60
    answer_rate_limit: int = 20
    answer_rate_window_seconds: int = 60
    stt_timeout_seconds: float = 20.0
    user_rate_limit: int = 100
    user_rate_window_seconds: int = 60

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @property
    def effective_jwt_secret(self) -> str:
        return self.supabase_jwt_secret or self.jwt_secret

    @property
    def is_production(self) -> bool:
        return self.environment.lower() in {"production", "staging"}

    @model_validator(mode="after")
    def validate_deployment_settings(self) -> "Settings":
        if self.is_production:
            if not self.auth_required:
                raise ValueError("AUTH_REQUIRED must be true outside development")
            if not self.supabase_jwt_secret:
                raise ValueError("SUPABASE_JWT_SECRET is required outside development")
            if self.auto_create_schema:
                raise ValueError("AUTO_CREATE_SCHEMA must be false outside development")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
