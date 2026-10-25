from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.models.models import GovernmentScheme
from app.schemas.schemas import GovernmentSchemeOut, MatchRequest

router = APIRouter(prefix="/schemes", tags=["Government Scheme Finder"])


@router.get("", response_model=List[GovernmentSchemeOut])
async def list_schemes(
    department: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    query = select(GovernmentScheme)
    if department and department.lower() != "all":
        query = query.where(GovernmentScheme.department.ilike(f"%{department}%"))
    if search:
        query = query.where(
            or_(
                GovernmentScheme.scheme_name.ilike(f"%{search}%"),
                GovernmentScheme.description.ilike(f"%{search}%"),
                GovernmentScheme.benefits.ilike(f"%{search}%"),
            )
        )
    query = query.order_by(GovernmentScheme.scheme_name.asc())
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{scheme_id}", response_model=GovernmentSchemeOut)
async def get_scheme(scheme_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(GovernmentScheme).where(GovernmentScheme.id == scheme_id))
    scheme = result.scalars().first()
    if not scheme:
        raise NotFoundException("Government Scheme", scheme_id)
    return scheme


@router.post("/match", response_model=List[GovernmentSchemeOut])
async def match_schemes(
    criteria: MatchRequest,
    db: AsyncSession = Depends(get_db),
):
    query = select(GovernmentScheme)
    result = await db.execute(query)
    schemes = result.scalars().all()

    # Filter and rank based on education level and keywords
    matched = []
    edu = (criteria.education_level or "").lower()
    for s in schemes:
        elig = s.eligibility or {}
        elig_text = str(elig).lower()
        if edu and (edu in elig_text or "all" in elig_text):
            matched.append(s)
        elif not edu:
            matched.append(s)

    return matched if matched else schemes[:6]
