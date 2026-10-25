from typing import List, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.models import (
    Profile,
    LifePath,
    SavedOpportunity,
    Opportunity,
    ActionCard,
    LearningProgress,
)
from app.schemas.schemas import DashboardOverviewOut
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Personal Dashboard"])


@router.get("/overview", response_model=DashboardOverviewOut)
async def get_dashboard_overview(
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # 1. Active LifePath
    lp_res = await db.execute(
        select(LifePath)
        .where(LifePath.user_id == current_user.id)
        .options(selectinload(LifePath.milestones))
        .order_by(LifePath.created_at.desc())
    )
    latest_lp = lp_res.scalars().first()
    active_lifepath_dict = None
    if latest_lp:
        completed = sum(1 for m in latest_lp.milestones if m.status == "completed")
        total = len(latest_lp.milestones)
        pct = int((completed / total * 100)) if total > 0 else 0
        active_lifepath_dict = {
            "id": latest_lp.id,
            "career_goal": latest_lp.career_goal,
            "progress_percentage": pct,
            "milestones_total": total,
            "milestones_completed": completed,
            "next_action": latest_lp.roadmap_data.get("next_recommended_action", "Proceed with current milestone"),
        }

    # 2. Saved Opportunities count
    saved_count_res = await db.execute(
        select(func.count(SavedOpportunity.id)).where(SavedOpportunity.user_id == current_user.id)
    )
    saved_opps_count = saved_count_res.scalar() or 0

    # 3. Action Cards counts
    pending_cards_res = await db.execute(
        select(func.count(ActionCard.id)).where(
            ActionCard.user_id == current_user.id,
            ActionCard.status != "Completed",
        )
    )
    pending_cards_count = pending_cards_res.scalar() or 0

    completed_cards_res = await db.execute(
        select(func.count(ActionCard.id)).where(
            ActionCard.user_id == current_user.id,
            ActionCard.status == "Completed",
        )
    )
    completed_cards_count = completed_cards_res.scalar() or 0

    # 4. Learning Topics count
    learning_count_res = await db.execute(
        select(func.count(LearningProgress.id)).where(LearningProgress.user_id == current_user.id)
    )
    learning_topics_count = learning_count_res.scalar() or 0

    # 5. Upcoming Deadlines from Opportunities and Action Cards
    deadlines = []
    # From saved opportunities
    saved_opps_res = await db.execute(
        select(Opportunity)
        .join(SavedOpportunity)
        .where(
            SavedOpportunity.user_id == current_user.id,
            Opportunity.application_deadline.isnot(None),
        )
        .order_by(Opportunity.application_deadline.asc())
        .limit(3)
    )
    for opp in saved_opps_res.scalars().all():
        deadlines.append({
            "title": opp.title,
            "type": opp.category,
            "deadline": opp.application_deadline.isoformat() if opp.application_deadline else None,
            "source": opp.organization,
        })

    # From Action Cards with due_date
    cards_res = await db.execute(
        select(ActionCard)
        .where(
            ActionCard.user_id == current_user.id,
            ActionCard.due_date.isnot(None),
            ActionCard.status != "Completed",
        )
        .order_by(ActionCard.due_date.asc())
        .limit(3)
    )
    for card in cards_res.scalars().all():
        deadlines.append({
            "title": card.title,
            "type": "Action Task",
            "deadline": card.due_date.isoformat() if card.due_date else None,
            "source": f"Priority: {card.priority}",
        })

    # 6. AI Recommendations
    recommendations = [
        {
            "category": "LifePath Next Step",
            "text": f"Continue your roadmap towards '{current_user.career_goal or 'Technology Mastery'}'. 45 minutes of daily practice compounds into extraordinary results."
        },
        {
            "category": "Opportunity Match",
            "text": "Explore newly verified scholarships and remote internships in ELEYSORA Discover to fund your educational journey."
        },
        {
            "category": "Inclusion Support",
            "text": "Try Document Intelligence to simplify complex government or academic circulars in your preferred language."
        }
    ]

    # 7. Recent activity log
    recent_activity = [
        {"action": "Account Active", "detail": f"Signed in as {current_user.display_name}", "timestamp": "Just now"},
    ]
    if latest_lp:
        recent_activity.append({
            "action": "LifePath Generated",
            "detail": f"Goal set: {latest_lp.career_goal}",
            "timestamp": latest_lp.created_at.strftime("%b %d, %Y") if latest_lp.created_at else "Recently",
        })

    return DashboardOverviewOut(
        active_lifepath=active_lifepath_dict,
        saved_opportunities_count=saved_opps_count,
        pending_actions_count=pending_cards_count,
        completed_actions_count=completed_cards_count,
        learning_topics_count=learning_topics_count,
        upcoming_deadlines=deadlines,
        ai_recommendations=recommendations,
        recent_activity=recent_activity,
    )
