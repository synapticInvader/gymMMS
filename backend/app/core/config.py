from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    environment: str = "development"
    supabase_url: str
    supabase_key: str
    sentry_dsn: str | None = None
    default_tenant_id: str | None = None

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()