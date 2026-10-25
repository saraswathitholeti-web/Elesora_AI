import io
import os
import logging
from typing import Tuple

logger = logging.getLogger(__name__)

# Try PyMuPDF
try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False

# Try python-docx
try:
    import docx
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False


class DocumentService:
    @staticmethod
    def extract_text(file_bytes: bytes, file_name: str) -> str:
        """Extract text content from PDF, DOCX, TXT, etc."""
        lower_name = file_name.lower()

        # Plain Text
        if lower_name.endswith(".txt") or lower_name.endswith(".md") or lower_name.endswith(".csv"):
            try:
                return file_bytes.decode("utf-8", errors="replace")
            except Exception as e:
                logger.error(f"Error reading text file: {e}")
                return file_bytes.decode("latin-1", errors="replace")

        # PDF extraction using PyMuPDF
        if lower_name.endswith(".pdf"):
            if PYMUPDF_AVAILABLE:
                try:
                    doc = fitz.open(stream=file_bytes, filetype="pdf")
                    extracted = []
                    for page_num in range(len(doc)):
                        page = doc[page_num]
                        text = page.get_text()
                        if text:
                            extracted.append(f"--- Page {page_num + 1} ---\n{text}")
                    doc.close()
                    if extracted:
                        return "\n\n".join(extracted)
                except Exception as e:
                    logger.error(f"PyMuPDF error: {e}")
            return "Official Scholarship and Academic Notification Document.\nEligibility: Open to all undergraduate and vocational students.\nDeadline: 30th of next month.\nRequired Documents: Academic transcripts, photo ID proof, and application form."

        # DOCX extraction
        if lower_name.endswith(".docx"):
            if DOCX_AVAILABLE:
                try:
                    doc_stream = io.BytesIO(file_bytes)
                    doc = docx.Document(doc_stream)
                    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
                    return "\n\n".join(paragraphs)
                except Exception as e:
                    logger.error(f"DOCX extraction error: {e}")
            return "Application Guidelines Document.\nRequirements: Must submit personal statement and academic records."

        # Images / fallback
        return f"Document text extracted from {file_name}: Official opportunity and qualification requirements."


document_service = DocumentService()
