from typing import Optional
from fastapi import APIRouter, Depends
from app.models.models import Profile
from app.schemas.schemas import SustainabilityAdviceRequest, SustainabilityAdviceResponse
from app.dependencies.auth import get_optional_current_user
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/sustainability", tags=["Sustainability Assistant"])


@router.post("/advice", response_model=SustainabilityAdviceResponse)
async def get_sustainability_advice(
    request: SustainabilityAdviceRequest,
    current_user: Optional[Profile] = Depends(get_optional_current_user),
):
    lang = request.language or (current_user.preferred_language if current_user else "English")
    advice = await gemini_service.get_sustainability_advice(
        area=request.area_of_interest,
        context=request.context,
        language=lang,
    )
    return SustainabilityAdviceResponse(**advice)
