from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import Profile, AccessibilityPreference
from app.schemas.schemas import AccessibilityOut, AccessibilityUpdate
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/accessibility", tags=["Accessibility Center"])


@router.get("", response_model=AccessibilityOut)
async def get_accessibility_preferences(
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AccessibilityPreference).where(AccessibilityPreference.user_id == current_user.id)
    )
    pref = result.scalars().first()
    if not pref:
        pref = AccessibilityPreference(
            user_id=current_user.id,
            preferred_language=current_user.preferred_language or "English",
        )
        db.add(pref)
        await db.commit()
        await db.refresh(pref)
    return pref


@router.patch("", response_model=AccessibilityOut)
async def update_accessibility_preferences(
    update_data: AccessibilityUpdate,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AccessibilityPreference).where(AccessibilityPreference.user_id == current_user.id)
    )
    pref = result.scalars().first()
    if not pref:
        pref = AccessibilityPreference(user_id=current_user.id)
        db.add(pref)

    if update_data.preferred_language is not None:
        pref.preferred_language = update_data.preferred_language
        current_user.preferred_language = update_data.preferred_language
    if update_data.font_scale is not None:
        pref.font_scale = update_data.font_scale
    if update_data.high_contrast is not None:
        pref.high_contrast = update_data.high_contrast
    if update_data.reduced_motion is not None:
        pref.reduced_motion = update_data.reduced_motion
    if update_data.text_to_speech is not None:
        pref.text_to_speech = update_data.text_to_speech
    if update_data.simplified_mode is not None:
        pref.simplified_mode = update_data.simplified_mode

    await db.commit()
    await db.refresh(pref)
    return pref
