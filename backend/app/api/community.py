from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.models.models import CommunityResource
from app.schemas.schemas import CommunityResourceOut

router = APIRouter(prefix="/community", tags=["Community Connect"])


@router.get("/resources", response_model=List[CommunityResourceOut])
async def list_community_resources(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    query = select(CommunityResource)
    if category and category.lower() != "all":
        query = query.where(CommunityResource.resource_category.ilike(f"%{category}%"))
    if search:
        query = query.where(
            or_(
                CommunityResource.organization_name.ilike(f"%{search}%"),
                CommunityResource.description.ilike(f"%{search}%"),
                CommunityResource.location.ilike(f"%{search}%"),
            )
        )
    query = query.order_by(CommunityResource.organization_name.asc())
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/resources/{resource_id}", response_model=CommunityResourceOut)
async def get_community_resource(resource_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CommunityResource).where(CommunityResource.id == resource_id))
    item = result.scalars().first()
    if not item:
        raise NotFoundException("Community Resource", resource_id)
    return item
