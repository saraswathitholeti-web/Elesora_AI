import uuid
from datetime import timedelta
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import create_access_token
from app.core.exceptions import ValidationException, UnauthorizedException
from app.models.models import Profile, AccessibilityPreference
from app.schemas.schemas import UserRegister, UserLogin, Token, ProfileOut, ProfileUpdate
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: AsyncSession = Depends(get_db)):
    # Create or update profile
    user_id = str(uuid.uuid4())
    profile = Profile(
        id=user_id,
        display_name=user_data.display_name or user_data.email.split("@")[0],
        preferred_language=user_data.preferred_language or "English",
        skills=[],
    )
    db.add(profile)

    # Initialize accessibility preferences
    accessibility = AccessibilityPreference(
        user_id=user_id,
        preferred_language=profile.preferred_language,
    )
    db.add(accessibility)

    await db.commit()
    await db.refresh(profile)

    token = create_access_token(
        data={"sub": user_id, "email": user_data.email, "display_name": profile.display_name}
    )

    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user_id,
        email=user_data.email,
        display_name=profile.display_name,
    )


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    # Demo/local login support or Supabase session bridge
    # In a full Supabase Auth setup, frontend calls Supabase Auth and passes bearer token;
    # this endpoint provides complete local/offline capability as required by the spec.
    user_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, credentials.email))
    
    result = await db.execute(select(Profile).where(Profile.id == user_id))
    profile = result.scalars().first()

    if not profile:
        profile = Profile(
            id=user_id,
            display_name=credentials.email.split("@")[0].capitalize(),
            preferred_language="English",
            skills=["Python", "Problem Solving"],
        )
        db.add(profile)
        db.add(AccessibilityPreference(user_id=user_id))
        await db.commit()
        await db.refresh(profile)

    token = create_access_token(
        data={"sub": user_id, "email": credentials.email, "display_name": profile.display_name}
    )

    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user_id,
        email=credentials.email,
        display_name=profile.display_name,
    )


@router.get("/me", response_model=ProfileOut)
async def get_my_profile(current_user: Profile = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=ProfileOut)
async def update_my_profile(
    data: ProfileUpdate,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if data.display_name is not None:
        current_user.display_name = data.display_name
    if data.education_level is not None:
        current_user.education_level = data.education_level
    if data.career_goal is not None:
        current_user.career_goal = data.career_goal
    if data.skills is not None:
        current_user.skills = data.skills
    if data.preferred_language is not None:
        current_user.preferred_language = data.preferred_language

    await db.commit()
    await db.refresh(current_user)
    return current_user
