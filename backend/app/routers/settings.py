from fastapi import APIRouter, Depends

from ..auth import get_current_user
from ..models import User
from ..schemas import AiSettingsRead, AiSettingsUpdate
from ..services.settings_service import SettingsService

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/ai", response_model=AiSettingsRead)
async def get_ai_settings(current_user: User = Depends(get_current_user)) -> dict:
    return SettingsService.ai_settings()


@router.put("/ai", response_model=AiSettingsRead)
async def update_ai_settings(
    payload: AiSettingsUpdate,
    current_user: User = Depends(get_current_user),
) -> dict:
    return SettingsService.update_ai_settings(payload.provider, payload.model)
