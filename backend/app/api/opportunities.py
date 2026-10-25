from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.models.models import Profile, Opportunity, SavedOpportunity
from app.schemas.schemas import (
    OpportunityOut,
    MatchRequest,
    OpportunityMatchResult,
    SavedOpportunityOut,
)
from app.dependencies.auth import get_current_user, get_optional_current_user
from app.services.matcher_service import matcher_service

router = APIRouter(prefix="/opportunities", tags=["Opportunities"])


@router.get("", response_model=List[OpportunityOut])
async def list_opportunities(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    remote_only: Optional[bool] = Query(None),
    current_user: Optional[Profile] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Opportunity)

    if category and category.lower() != "all":
        query = query.where(Opportunity.category.ilike(f"%{category}%"))
    if search:
        query = query.where(
            or_(
                Opportunity.title.ilike(f"%{search}%"),
                Opportunity.organization.ilike(f"%{search}%"),
                Opportunity.description.ilike(f"%{search}%"),
            )
        )
    if remote_only is True:
        query = query.where(Opportunity.remote_available == True)

    query = query.order_by(Opportunity.last_verified_at.desc())
    result = await db.execute(query)
    opportunities = result.scalars().all()

    # Determine saved status if user is authenticated
    saved_ids = set()
    if current_user:
        saved_res = await db.execute(
            select(SavedOpportunity.opportunity_id).where(SavedOpportunity.user_id == current_user.id)
        )
        saved_ids = set(saved_res.scalars().all())

    output = []
    for opp in opportunities:
        opp_out = OpportunityOut.model_validate(opp)
        opp_out.is_saved = opp.id in saved_ids
        output.append(opp_out)

    return output


@router.get("/saved", response_model=List[OpportunityOut])
async def get_saved_opportunities(
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Opportunity)
        .join(SavedOpportunity)
        .where(SavedOpportunity.user_id == current_user.id)
        .order_by(SavedOpportunity.saved_at.desc())
    )
    opportunities = result.scalars().all()
    output = []
    for opp in opportunities:
        opp_out = OpportunityOut.model_validate(opp)
        opp_out.is_saved = True
        output.append(opp_out)
    return output


@router.get("/{opportunity_id}", response_model=OpportunityOut)
async def get_opportunity(
    opportunity_id: str,
    current_user: Optional[Profile] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Opportunity).where(Opportunity.id == opportunity_id))
    opp = result.scalars().first()
    if not opp:
        raise NotFoundException("Opportunity", opportunity_id)

    opp_out = OpportunityOut.model_validate(opp)
    if current_user:
        saved_res = await db.execute(
            select(SavedOpportunity).where(
                SavedOpportunity.user_id == current_user.id,
                SavedOpportunity.opportunity_id == opportunity_id,
            )
        )
        opp_out.is_saved = saved_res.scalars().first() is not None
    return opp_out


@router.post("/match", response_model=List[OpportunityMatchResult])
async def match_opportunities(
    criteria: MatchRequest,
    current_user: Optional[Profile] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Retrieve active opportunities
    query = select(Opportunity)
    if criteria.category and criteria.category.lower() != "all":
        query = query.where(Opportunity.category.ilike(f"%{criteria.category}%"))

    result = await db.execute(query)
    opportunities = result.scalars().all()

    # Also merge user profile info if logged in
    if current_user:
        if not criteria.skills and current_user.skills:
            criteria.skills = current_user.skills
        if not criteria.education_level and current_user.education_level:
            criteria.education_level = current_user.education_level

    matches = [matcher_service.calculate_match(opp, criteria) for opp in opportunities]
    # Sort by highest match score
    matches.sort(key=lambda x: x.match_score, reverse=True)
    return matches[:12]


@router.post("/{opportunity_id}/save", status_code=status.HTTP_201_CREATED)
async def save_opportunity(
    opportunity_id: str,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify existence
    opp = await db.execute(select(Opportunity).where(Opportunity.id == opportunity_id))
    if not opp.scalars().first():
        raise NotFoundException("Opportunity", opportunity_id)

    # Check if already saved
    existing = await db.execute(
        select(SavedOpportunity).where(
            SavedOpportunity.user_id == current_user.id,
            SavedOpportunity.opportunity_id == opportunity_id,
        )
    )
    if existing.scalars().first():
        return {"status": "already_saved", "opportunity_id": opportunity_id}

    saved = SavedOpportunity(
        user_id=current_user.id,
        opportunity_id=opportunity_id,
        application_status="Saved",
    )
    db.add(saved)
    await db.commit()
    return {"status": "saved", "opportunity_id": opportunity_id}


@router.delete("/{opportunity_id}/save", status_code=status.HTTP_204_NO_CONTENT)
async def unsave_opportunity(
    opportunity_id: str,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SavedOpportunity).where(
            SavedOpportunity.user_id == current_user.id,
            SavedOpportunity.opportunity_id == opportunity_id,
        )
    )
    saved = result.scalars().first()
    if saved:
        await db.delete(saved)
        await db.commit()
    return None
