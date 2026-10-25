from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.models import Profile, ActionCard
from app.schemas.schemas import BarrierAnalyzeRequest, BarrierAnalyzeResponse
from app.dependencies.auth import get_optional_current_user, get_current_user
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/barriers", tags=["Barrier-to-Bridge Intelligence"])


@router.post("/analyze", response_model=BarrierAnalyzeResponse)
async def analyze_barrier(
    request: BarrierAnalyzeRequest,
    current_user: Profile = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db),
):
    pref_lang = request.preferred_language or (current_user.preferred_language if current_user else "English")
    analysis = await gemini_service.analyze_barrier(
        user_goal=request.user_goal,
        reported_barrier=request.reported_barrier,
        language=pref_lang,
    )
    return BarrierAnalyzeResponse(**analysis)


@router.post("/convert-to-actions", status_code=status.HTTP_201_CREATED)
async def convert_barrier_to_action_cards(
    analysis: BarrierAnalyzeResponse,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Automatically convert AI-suggested bridge actions into user's personal Action Cards."""
    created_count = 0
    for action in analysis.suggested_actions:
        card = ActionCard(
            user_id=current_user.id,
            title=action.get("title", "Overcome Barrier Step"),
            description=f"Action identified to overcome {analysis.barrier_category}: {analysis.reported_barrier}",
            priority=action.get("priority", "High"),
            status="Not Started",
        )
        db.add(card)
        created_count += 1

    await db.commit()
    return {"status": "success", "action_cards_created": created_count}
