import os
from pathlib import Path

from fastapi import HTTPException

from ..env import _BACKEND_DIR
from .llm_service import (
    DEFAULT_AI_GATEWAY_MODEL,
    DEFAULT_GEMINI_MODEL,
    DEFAULT_GROQ_MODEL,
    DEFAULT_OPENAI_MODEL,
    LlmService,
)

ENV_PATH = Path(_BACKEND_DIR) / ".env"

AI_PROVIDER_OPTIONS = {
    "openai": {
        "label": "OpenAI",
        "key": "OPENAI_API_KEY",
        "model_key": "OPENAI_MODEL",
        "models": [DEFAULT_OPENAI_MODEL, "gpt-4o"],
    },
    "vercel": {
        "label": "Vercel AI Gateway",
        "key": "AI_GATEWAY_API_KEY",
        "model_key": "AI_GATEWAY_MODEL",
        "models": [DEFAULT_AI_GATEWAY_MODEL, "anthropic/claude-3-5-sonnet-latest"],
    },
    "groq": {
        "label": "Groq",
        "key": "GROQ_API_KEY",
        "model_key": "GROQ_MODEL",
        "models": [DEFAULT_GROQ_MODEL, "llama-3.1-8b-instant"],
    },
    "gemini": {
        "label": "Gemini",
        "key": "GEMINI_API_KEY",
        "model_key": "GEMINI_MODEL",
        "models": [DEFAULT_GEMINI_MODEL, "gemini-2.0-flash"],
    },
}


class SettingsService:
    @staticmethod
    def ai_settings() -> dict:
        provider = LlmService.provider()
        return {
            "provider": provider,
            "model": LlmService.model(),
            "configured": LlmService.is_configured(),
            "options": [
                {
                    "id": provider_id,
                    "label": data["label"],
                    "configured": bool(os.getenv(data["key"], "").strip()),
                    "models": data["models"],
                }
                for provider_id, data in AI_PROVIDER_OPTIONS.items()
            ],
        }

    @staticmethod
    def update_ai_settings(provider: str, model: str | None) -> dict:
        provider = provider.strip().lower()
        if provider not in AI_PROVIDER_OPTIONS:
            raise HTTPException(status_code=400, detail="Unsupported AI provider")

        option = AI_PROVIDER_OPTIONS[provider]
        if not os.getenv(option["key"], "").strip():
            raise HTTPException(status_code=400, detail=f"{option['label']} API key is not configured")

        selected_model = (model or option["models"][0]).strip()
        SettingsService._update_env_values(
            {
                "LLM_PROVIDER": provider,
                str(option["model_key"]): selected_model,
            }
        )
        os.environ["LLM_PROVIDER"] = provider
        os.environ[str(option["model_key"])] = selected_model
        return SettingsService.ai_settings()

    @staticmethod
    def _update_env_values(values: dict[str, str]) -> None:
        lines = ENV_PATH.read_text(encoding="utf-8").splitlines() if ENV_PATH.exists() else []
        seen: set[str] = set()
        updated_lines = []

        for line in lines:
            stripped = line.strip()
            if not stripped or stripped.startswith("#") or "=" not in line:
                updated_lines.append(line)
                continue

            key = line.split("=", 1)[0].strip()
            if key in values:
                updated_lines.append(f"{key}={values[key]}")
                seen.add(key)
            else:
                updated_lines.append(line)

        for key, value in values.items():
            if key not in seen:
                updated_lines.append(f"{key}={value}")

        ENV_PATH.write_text("\n".join(updated_lines) + "\n", encoding="utf-8")
