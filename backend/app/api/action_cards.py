from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.exceptions import NotFoundException, ForbiddenException
from app.models.models import Profile, ActionCard
from app.schemas.schemas import ActionCardCreate, ActionCardUpdate, ActionCardOut
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/action-cards", tags=["Smart Action Cards"])


@router.post("", response_model=ActionCardOut, status_code=status.HTTP_201_CREATED)
async def create_action_card(
    card_data: ActionCardCreate,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    card = ActionCard(
        user_id=current_user.id,
        title=card_data.title,
        description=card_data.description,
        priority=card_data.priority or "Medium",
        status=card_data.status or "Not Started",
        due_date=card_data.due_date,
        related_opportunity_id=card_data.related_opportunity_id,
    )
    db.add(card)
    await db.commit()
    await db.refresh(card)
    return card


@router.get("", response_model=List[ActionCardOut])
async def list_action_cards(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(ActionCard).where(ActionCard.user_id == current_user.id)
    if status_filter and status_filter.lower() != "all":
        query = query.where(ActionCard.status == status_filter)
    query = query.order_by(ActionCard.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{card_id}", response_model=ActionCardOut)
async def get_action_card(
    card_id: str,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ActionCard).where(ActionCard.id == card_id))
    card = result.scalars().first()
    if not card:
        raise NotFoundException("Action Card", card_id)
    if card.user_id != current_user.id:
        raise ForbiddenException()
    return card


@router.patch("/{card_id}", response_model=ActionCardOut)
async def update_action_card(
    card_id: str,
    update_data: ActionCardUpdate,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ActionCard).where(ActionCard.id == card_id))
    card = result.scalars().first()
    if not card:
        raise NotFoundException("Action Card", card_id)
    if card.user_id != current_user.id:
        raise ForbiddenException()

    if update_data.title is not None:
        card.title = update_data.title
    if update_data.description is not None:
        card.description = update_data.description
    if update_data.priority is not None:
        card.priority = update_data.priority
    if update_data.status is not None:
        card.status = update_data.status
    if update_data.due_date is not None:
        card.due_date = update_data.due_date
    if update_data.related_opportunity_id is not None:
        card.related_opportunity_id = update_data.related_opportunity_id

    await db.commit()
    await db.refresh(card)
    return card


@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_action_card(
    card_id: str,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ActionCard).where(ActionCard.id == card_id))
    card = result.scalars().first()
    if not card:
        raise NotFoundException("Action Card", card_id)
    if card.user_id != current_user.id:
        raise ForbiddenException()

    await db.delete(card)
    await db.commit()
    return None
