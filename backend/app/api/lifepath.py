from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.exceptions import NotFoundException, ForbiddenException
from app.models.models import Profile, LifePath, LifePathMilestone
from app.schemas.schemas import (
    LifePathGenerateRequest,
    LifePathOut,
    MilestoneSchema,
    MilestoneStatusUpdate,
)
from app.dependencies.auth import get_current_user
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/lifepath", tags=["LifePath"])


def _calculate_lifepath_progress(milestones: List[LifePathMilestone]) -> int:
    if not milestones:
        return 0
    completed = sum(1 for m in milestones if m.status == "completed")
    return int((completed / len(milestones)) * 100)


def _format_lifepath_out(lp: LifePath) -> LifePathOut:
    progress = _calculate_lifepath_progress(lp.milestones)
    milestone_schemas = [
        MilestoneSchema(
            id=m.id,
            title=m.title,
            description=m.description or "",
            sequence_number=m.sequence_number,
            estimated_duration_days=m.estimated_duration_days,
            status=m.status,
            skills_covered=lp.roadmap_data.get("milestones", [{}])[min(i, len(lp.roadmap_data.get("milestones", [])) - 1)].get("skills_covered", []) if isinstance(lp.roadmap_data, dict) else [],
            recommended_resources=lp.roadmap_data.get("milestones", [{}])[min(i, len(lp.roadmap_data.get("milestones", [])) - 1)].get("recommended_resources", []) if isinstance(lp.roadmap_data, dict) else [],
            suggested_project=lp.roadmap_data.get("milestones", [{}])[min(i, len(lp.roadmap_data.get("milestones", [])) - 1)].get("suggested_project") if isinstance(lp.roadmap_data, dict) else None,
        )
        for i, m in enumerate(lp.milestones)
    ]
    return LifePathOut(
        id=lp.id,
        user_id=lp.user_id,
        career_goal=lp.career_goal,
        education_level=lp.education_level,
        current_skills=lp.current_skills or [],
        study_hours_per_week=float(lp.study_hours_per_week or 7.0),
        preferred_language=lp.preferred_language,
        roadmap_data=lp.roadmap_data or {},
        status=lp.status,
        progress_percentage=progress,
        milestones=milestone_schemas,
        created_at=lp.created_at,
    )


@router.post("/generate", response_model=LifePathOut, status_code=status.HTTP_201_CREATED)
async def generate_lifepath(
    request: LifePathGenerateRequest,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Update user profile with latest goal and skills if provided
    current_user.career_goal = request.career_goal
    if request.education_level:
        current_user.education_level = request.education_level
    if request.current_skills:
        current_user.skills = list(set((current_user.skills or []) + request.current_skills))

    # Call AI
    roadmap = await gemini_service.generate_lifepath(
        career_goal=request.career_goal,
        education_level=request.education_level or "Undergraduate",
        current_skills=request.current_skills or [],
        study_hours_per_week=request.study_hours_per_week or 7.0,
        preferred_language=request.preferred_language or current_user.preferred_language or "English",
        budget=request.budget_level or "Free / Low Cost",
        challenges=request.optional_challenges,
    )

    # Save LifePath
    lifepath = LifePath(
        user_id=current_user.id,
        career_goal=request.career_goal,
        education_level=request.education_level,
        current_skills=request.current_skills,
        study_hours_per_week=request.study_hours_per_week,
        preferred_language=request.preferred_language or "English",
        roadmap_data=roadmap,
        status="active",
    )
    db.add(lifepath)
    await db.flush()

    # Save milestones
    for m in roadmap.get("milestones", []):
        milestone = LifePathMilestone(
            lifepath_id=lifepath.id,
            title=m.get("title", "Milestone"),
            description=m.get("description", ""),
            sequence_number=m.get("sequence_number", 1),
            estimated_duration_days=m.get("estimated_duration_days", 14),
            status=m.get("status", "pending"),
        )
        db.add(milestone)

    await db.commit()

    # Reload with milestones
    result = await db.execute(
        select(LifePath)
        .where(LifePath.id == lifepath.id)
        .options(selectinload(LifePath.milestones))
    )
    saved_lp = result.scalars().first()
    return _format_lifepath_out(saved_lp)


@router.get("", response_model=List[LifePathOut])
async def list_lifepaths(
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(LifePath)
        .where(LifePath.user_id == current_user.id)
        .options(selectinload(LifePath.milestones))
        .order_by(LifePath.created_at.desc())
    )
    lps = result.scalars().all()
    return [_format_lifepath_out(lp) for lp in lps]


@router.get("/{lifepath_id}", response_model=LifePathOut)
async def get_lifepath(
    lifepath_id: str,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(LifePath)
        .where(LifePath.id == lifepath_id)
        .options(selectinload(LifePath.milestones))
    )
    lp = result.scalars().first()
    if not lp:
        raise NotFoundException("LifePath", lifepath_id)
    if lp.user_id != current_user.id:
        raise ForbiddenException()
    return _format_lifepath_out(lp)


@router.patch("/milestones/{milestone_id}", response_model=MilestoneSchema)
async def update_milestone_status(
    milestone_id: str,
    update_data: MilestoneStatusUpdate,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(LifePathMilestone)
        .join(LifePath)
        .where(LifePathMilestone.id == milestone_id, LifePath.user_id == current_user.id)
    )
    milestone = result.scalars().first()
    if not milestone:
        raise NotFoundException("Milestone", milestone_id)

    milestone.status = update_data.status
    if update_data.status == "completed":
        milestone.completed_at = datetime.now(timezone.utc)
    else:
        milestone.completed_at = None

    await db.commit()
    await db.refresh(milestone)

    return MilestoneSchema(
        id=milestone.id,
        title=milestone.title,
        description=milestone.description or "",
        sequence_number=milestone.sequence_number,
        estimated_duration_days=milestone.estimated_duration_days,
        status=milestone.status,
    )


@router.post("/{lifepath_id}/regenerate", response_model=LifePathOut)
async def regenerate_lifepath(
    lifepath_id: str,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(LifePath)
        .where(LifePath.id == lifepath_id)
        .options(selectinload(LifePath.milestones))
    )
    lp = result.scalars().first()
    if not lp:
        raise NotFoundException("LifePath", lifepath_id)
    if lp.user_id != current_user.id:
        raise ForbiddenException()

    # Regenerate roadmap
    roadmap = await gemini_service.generate_lifepath(
        career_goal=lp.career_goal,
        education_level=lp.education_level or "Undergraduate",
        current_skills=lp.current_skills or [],
        study_hours_per_week=float(lp.study_hours_per_week or 7.0),
        preferred_language=lp.preferred_language,
    )
    lp.roadmap_data = roadmap

    # Remove old milestones and insert new
    for m in lp.milestones:
        await db.delete(m)

    for m in roadmap.get("milestones", []):
        milestone = LifePathMilestone(
            lifepath_id=lp.id,
            title=m.get("title", "Milestone"),
            description=m.get("description", ""),
            sequence_number=m.get("sequence_number", 1),
            estimated_duration_days=m.get("estimated_duration_days", 14),
            status="pending",
        )
        db.add(milestone)

    await db.commit()

    reloaded = await db.execute(
        select(LifePath)
        .where(LifePath.id == lifepath_id)
        .options(selectinload(LifePath.milestones))
    )
    return _format_lifepath_out(reloaded.scalars().first())


@router.delete("/{lifepath_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lifepath(
    lifepath_id: str,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(LifePath).where(LifePath.id == lifepath_id))
    lp = result.scalars().first()
    if not lp:
        raise NotFoundException("LifePath", lifepath_id)
    if lp.user_id != current_user.id:
        raise ForbiddenException()

    await db.delete(lp)
    await db.commit()
    return None
