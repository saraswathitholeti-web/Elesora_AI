from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import Profile, LearningProgress
from app.schemas.schemas import (
    LearnExplainRequest,
    LearnExplainResponse,
    QuizGenerateRequest,
    QuizGenerateResponse,
    LearningProgressUpdate,
    LearningProgressOut,
)
from app.dependencies.auth import get_current_user, get_optional_current_user
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/learning", tags=["Smart Learning Hub"])


@router.post("/explain", response_model=LearnExplainResponse)
async def explain_topic(
    request: LearnExplainRequest,
    current_user: Optional[Profile] = Depends(get_optional_current_user),
):
    lang = request.language or (current_user.preferred_language if current_user else "English")
    explanation = await gemini_service.explain_topic(
        topic=request.topic,
        level=request.level or "Beginner",
        language=lang,
    )
    return LearnExplainResponse(**explanation)


@router.post("/quiz", response_model=QuizGenerateResponse)
async def generate_quiz(
    request: QuizGenerateRequest,
    current_user: Optional[Profile] = Depends(get_optional_current_user),
):
    lang = request.language or (current_user.preferred_language if current_user else "English")
    quiz = await gemini_service.generate_quiz(
        topic=request.topic,
        number_of_questions=request.number_of_questions or 3,
        language=lang,
    )
    return QuizGenerateResponse(**quiz)


@router.get("/progress", response_model=List[LearningProgressOut])
async def get_learning_progress(
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(LearningProgress)
        .where(LearningProgress.user_id == current_user.id)
        .order_by(LearningProgress.updated_at.desc())
    )
    return result.scalars().all()


@router.put("/progress", response_model=LearningProgressOut)
async def update_learning_progress(
    update_data: LearningProgressUpdate,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(LearningProgress).where(
            LearningProgress.user_id == current_user.id,
            LearningProgress.topic == update_data.topic,
        )
    )
    record = result.scalars().first()

    if not record:
        completed = [update_data.completed_lesson] if update_data.completed_lesson else []
        record = LearningProgress(
            user_id=current_user.id,
            topic=update_data.topic,
            progress_percentage=update_data.progress_percentage,
            completed_lessons=completed,
        )
        db.add(record)
    else:
        record.progress_percentage = update_data.progress_percentage
        if update_data.completed_lesson and update_data.completed_lesson not in (record.completed_lessons or []):
            current_completed = list(record.completed_lessons or [])
            current_completed.append(update_data.completed_lesson)
            record.completed_lessons = current_completed

    await db.commit()
    await db.refresh(record)
    return record
