from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.exceptions import NotFoundException, ForbiddenException
from app.models.models import Profile, Conversation, Message
from app.schemas.schemas import ConversationCreate, ConversationOut, MessageCreate, MessageOut
from app.dependencies.auth import get_current_user
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/chat", tags=["AI Assistant"])


@router.post("/conversations", response_model=ConversationOut, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    conv_data: ConversationCreate,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    conv = Conversation(
        user_id=current_user.id,
        title=conv_data.title or "New Chat",
    )
    db.add(conv)
    await db.commit()
    await db.refresh(conv)

    # Return with empty messages
    return ConversationOut(
        id=conv.id,
        user_id=conv.user_id,
        title=conv.title,
        created_at=conv.created_at,
        updated_at=conv.updated_at,
        messages=[],
    )


@router.get("/conversations", response_model=List[ConversationOut])
async def list_conversations(
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == current_user.id)
        .options(selectinload(Conversation.messages))
        .order_by(Conversation.updated_at.desc())
    )
    return result.scalars().all()


@router.get("/conversations/{conversation_id}", response_model=ConversationOut)
async def get_conversation(
    conversation_id: str,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conversation)
        .where(Conversation.id == conversation_id)
        .options(selectinload(Conversation.messages))
    )
    conv = result.scalars().first()
    if not conv:
        raise NotFoundException("Conversation", conversation_id)
    if conv.user_id != current_user.id:
        raise ForbiddenException()
    return conv


@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: str,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Conversation).where(Conversation.id == conversation_id))
    conv = result.scalars().first()
    if not conv:
        raise NotFoundException("Conversation", conversation_id)
    if conv.user_id != current_user.id:
        raise ForbiddenException()

    await db.delete(conv)
    await db.commit()
    return None


@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageOut])
async def get_messages(
    conversation_id: str,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Conversation).where(Conversation.id == conversation_id))
    conv = result.scalars().first()
    if not conv:
        raise NotFoundException("Conversation", conversation_id)
    if conv.user_id != current_user.id:
        raise ForbiddenException()

    msg_result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
    )
    return msg_result.scalars().all()


@router.post("/conversations/{conversation_id}/messages", response_model=MessageOut)
async def send_message(
    conversation_id: str,
    message_data: MessageCreate,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conversation)
        .where(Conversation.id == conversation_id)
        .options(selectinload(Conversation.messages))
    )
    conv = result.scalars().first()
    if not conv:
        raise NotFoundException("Conversation", conversation_id)
    if conv.user_id != current_user.id:
        raise ForbiddenException()

    # Save user message
    user_msg = Message(
        conversation_id=conversation_id,
        role="user",
        content=message_data.content,
        language=message_data.language or current_user.preferred_language or "English",
    )
    db.add(user_msg)
    await db.flush()

    # Update conversation title if this is the first message
    if not conv.messages or len(conv.messages) == 0:
        words = message_data.content.strip().split()
        conv.title = " ".join(words[:6]) if words else "Conversation"

    # Prepare limited history (last 6 messages) for context
    history_messages = [
        {"role": m.role, "content": m.content}
        for m in (conv.messages[-5:] if conv.messages else [])
    ]
    history_messages.append({"role": "user", "content": message_data.content})

    # Call Gemini AI
    target_language = message_data.language or current_user.preferred_language or "English"
    ai_text = await gemini_service.generate_chat_response(
        messages=history_messages,
        language=target_language,
        context=f"User education: {current_user.education_level or 'Not specified'}, Career goal: {current_user.career_goal or 'Not specified'}"
    )

    # Save assistant message
    assistant_msg = Message(
        conversation_id=conversation_id,
        role="assistant",
        content=ai_text,
        language=target_language,
    )
    db.add(assistant_msg)
    await db.commit()
    await db.refresh(assistant_msg)

    return assistant_msg
