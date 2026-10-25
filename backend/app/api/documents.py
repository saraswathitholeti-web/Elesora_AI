import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.exceptions import NotFoundException, ForbiddenException, ValidationException
from app.models.models import Profile, Document, DocumentAnalysis
from app.schemas.schemas import (
    DocumentOut,
    DocumentAnalysisOut,
    DocumentQuestionRequest,
    DocumentQuestionResponse,
)
from app.dependencies.auth import get_current_user
from app.services.document_service import document_service
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/documents", tags=["Document Intelligence"])

UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not file.filename:
        raise ValidationException("File must have a valid filename")

    content = await file.read()
    file_size = len(content)

    # 15MB limit check
    if file_size > 15 * 1024 * 1024:
        raise ValidationException("File size exceeds 15MB maximum limit")

    file_ext = os.path.splitext(file.filename)[1].lower()
    allowed_exts = [".pdf", ".docx", ".txt", ".md", ".png", ".jpg", ".jpeg"]
    if file_ext not in allowed_exts:
        raise ValidationException(f"Unsupported file format '{file_ext}'. Allowed formats: {', '.join(allowed_exts)}")

    # Store file locally (or Supabase Storage if configured)
    saved_filename = f"{uuid.uuid4()}_{file.filename}"
    saved_path = os.path.join(UPLOAD_DIR, saved_filename)
    with open(saved_path, "wb") as f:
        f.write(content)

    doc = Document(
        user_id=current_user.id,
        file_name=file.filename,
        file_type=file_ext,
        file_size=file_size,
        storage_path=saved_path,
        processing_status="uploaded",
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    return doc


@router.get("", response_model=List[DocumentOut])
async def list_documents(
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Document)
        .where(Document.user_id == current_user.id)
        .order_by(Document.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{document_id}", response_model=DocumentOut)
async def get_document(
    document_id: str,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalars().first()
    if not doc:
        raise NotFoundException("Document", document_id)
    if doc.user_id != current_user.id:
        raise ForbiddenException()
    return doc


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: str,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalars().first()
    if not doc:
        raise NotFoundException("Document", document_id)
    if doc.user_id != current_user.id:
        raise ForbiddenException()

    # Safely remove file on disk if exists
    if os.path.exists(doc.storage_path):
        try:
            os.remove(doc.storage_path)
        except Exception:
            pass

    await db.delete(doc)
    await db.commit()
    return None


@router.post("/{document_id}/analyze", response_model=DocumentAnalysisOut)
async def analyze_document(
    document_id: str,
    language: Optional[str] = Query("English"),
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Document)
        .where(Document.id == document_id)
        .options(selectinload(Document.analyses))
    )
    doc = result.scalars().first()
    if not doc:
        raise NotFoundException("Document", document_id)
    if doc.user_id != current_user.id:
        raise ForbiddenException()

    # Read file and extract text
    file_bytes = b""
    if os.path.exists(doc.storage_path):
        with open(doc.storage_path, "rb") as f:
            file_bytes = f.read()

    extracted_text = document_service.extract_text(file_bytes, doc.file_name)

    # Call Gemini analysis
    analysis_data = await gemini_service.simplify_document(
        document_text=extracted_text,
        file_name=doc.file_name,
        language=language or current_user.preferred_language or "English",
    )

    doc.processing_status = "completed"

    analysis = DocumentAnalysis(
        document_id=doc.id,
        summary=analysis_data.get("summary", ""),
        simplified_text=analysis_data.get("simplified_text", ""),
        extracted_information=analysis_data.get("extracted_information", {}),
        action_plan=analysis_data.get("action_plan", []),
        language=language or "English",
    )
    db.add(analysis)
    await db.commit()
    await db.refresh(analysis)

    return analysis


@router.get("/{document_id}/analysis", response_model=DocumentAnalysisOut)
async def get_document_analysis(
    document_id: str,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(DocumentAnalysis)
        .join(Document)
        .where(DocumentAnalysis.document_id == document_id, Document.user_id == current_user.id)
        .order_by(DocumentAnalysis.created_at.desc())
    )
    analysis = result.scalars().first()
    if not analysis:
        raise NotFoundException("Document Analysis for document", document_id)
    return analysis


@router.post("/{document_id}/ask", response_model=DocumentQuestionResponse)
async def ask_document_question(
    document_id: str,
    request: DocumentQuestionRequest,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalars().first()
    if not doc:
        raise NotFoundException("Document", document_id)
    if doc.user_id != current_user.id:
        raise ForbiddenException()

    file_bytes = b""
    if os.path.exists(doc.storage_path):
        with open(doc.storage_path, "rb") as f:
            file_bytes = f.read()

    extracted_text = document_service.extract_text(file_bytes, doc.file_name)

    qa_response = await gemini_service.answer_document_question(
        document_text=extracted_text,
        question=request.question,
        language=request.language or current_user.preferred_language or "English",
    )

    return DocumentQuestionResponse(**qa_response)
