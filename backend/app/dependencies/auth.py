from typing import Optional
from fastapi import Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import decode_token
from app.core.exceptions import UnauthorizedException
from app.models.models import Profile, AccessibilityPreference


async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
) -> Profile:
    if not authorization or not authorization.startswith("Bearer "):
        # For seamless developer onboarding/guest mode if no token provided in demo:
        # Check for demo/guest token or raise unauthorized
        raise UnauthorizedException("Authorization header missing or invalid format (Bearer token required)")

    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise UnauthorizedException("Invalid or expired token")

    # Supabase tokens usually have 'sub' as user_id. Local tokens may have 'sub' or 'user_id'
    user_id = payload.get("sub") or payload.get("user_id")
    if not user_id:
        raise UnauthorizedException("Token payload missing user identifier")

    result = await db.execute(select(Profile).where(Profile.id == user_id))
    profile = result.scalars().first()

    if not profile:
        # Create profile record on the fly for authenticated Supabase user
        email = payload.get("email") or f"user_{user_id[:6]}@eleysora.ai"
        display_name = payload.get("user_metadata", {}).get("display_name") or email.split("@")[0]
        profile = Profile(
            id=user_id,
            display_name=display_name,
            preferred_language=payload.get("user_metadata", {}).get("preferred_language", "English"),
        )
        db.add(profile)
        # Also create default accessibility preferences
        pref = AccessibilityPreference(user_id=user_id, preferred_language=profile.preferred_language)
        db.add(pref)
        await db.commit()
        await db.refresh(profile)

    return profile


async def get_optional_current_user(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
) -> Optional[Profile]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        return await get_current_user(authorization=authorization, db=db)
    except Exception:
        return None
