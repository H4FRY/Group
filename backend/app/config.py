import os
from pathlib import Path

from . import env as _env  # noqa: F401 - load backend/.env before reading settings

BACKEND_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DATABASE_URL = f"sqlite+aiosqlite:///{BACKEND_DIR / 'app.db'}"


def get_database_url() -> str:
    return os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL).strip() or DEFAULT_DATABASE_URL


def get_cors_origins() -> list[str]:
    raw_origins = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    )
    return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]


def get_token_secret() -> str:
    return os.getenv("MINDPATH_TOKEN_SECRET", "mindpath-local-secret").strip()


def get_token_ttl_seconds() -> int:
    raw_value = os.getenv("MINDPATH_TOKEN_TTL_SECONDS", "").strip()
    if not raw_value:
        return 60 * 60 * 24
    try:
        return max(60, int(raw_value))
    except ValueError:
        return 60 * 60 * 24
