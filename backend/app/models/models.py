import uuid
from datetime import datetime, timezone
from typing import Optional, List, Any
from sqlalchemy import (
    Column,
    String,
    Text,
    Boolean,
    Integer,
    Numeric,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    JSON,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    display_name = Column(String(255), nullable=True)
    education_level = Column(String(100), nullable=True)
    career_goal = Column(Text, nullable=True)
    skills = Column(JSON, default=list)
    preferred_language = Column(String(20), default="English")
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    lifepaths = relationship("LifePath", back_populates="user", cascade="all, delete-orphan")
    saved_opportunities = relationship("SavedOpportunity", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    action_cards = relationship("ActionCard", back_populates="user", cascade="all, delete-orphan")
    accessibility = relationship("AccessibilityPreference", uselist=False, back_populates="user", cascade="all, delete-orphan")
    learning_records = relationship("LearningProgress", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), default="New Chat")
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user = relationship("Profile", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # user / assistant / system
    content = Column(Text, nullable=False)
    language = Column(String(20), default="English")
    created_at = Column(DateTime(timezone=True), default=utc_now)

    conversation = relationship("Conversation", back_populates="messages")


class LifePath(Base):
    __tablename__ = "lifepaths"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    career_goal = Column(Text, nullable=False)
    education_level = Column(String(100), nullable=True)
    current_skills = Column(JSON, default=list)
    study_hours_per_week = Column(Numeric(5, 2), default=7.0)
    preferred_language = Column(String(20), default="English")
    roadmap_data = Column(JSON, default=dict)
    status = Column(String(50), default="active")  # active, completed, paused
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user = relationship("Profile", back_populates="lifepaths")
    milestones = relationship("LifePathMilestone", back_populates="lifepath", cascade="all, delete-orphan", order_by="LifePathMilestone.sequence_number")


class LifePathMilestone(Base):
    __tablename__ = "lifepath_milestones"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    lifepath_id = Column(String(36), ForeignKey("lifepaths.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    sequence_number = Column(Integer, nullable=False)
    estimated_duration_days = Column(Integer, default=14)
    status = Column(String(50), default="pending")  # pending, in_progress, completed
    completed_at = Column(DateTime(timezone=True), nullable=True)

    lifepath = relationship("LifePath", back_populates="milestones")


class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False, index=True)
    organization = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False, index=True)  # Scholarship, Internship, Job, Free Course, Certification, Skill Training
    description = Column(Text, nullable=False)
    eligibility = Column(JSON, default=dict)
    required_skills = Column(JSON, default=list)
    location = Column(String(255), default="All India / Online")
    remote_available = Column(Boolean, default=True)
    application_deadline = Column(DateTime(timezone=True), nullable=True)
    official_url = Column(Text, nullable=False)
    source_url = Column(Text, nullable=True)
    last_verified_at = Column(DateTime(timezone=True), default=utc_now)
    verification_status = Column(String(50), default="Verified")  # Verified, Pending Verification, Possibly Outdated

    saved_by = relationship("SavedOpportunity", back_populates="opportunity", cascade="all, delete-orphan")


class SavedOpportunity(Base):
    __tablename__ = "saved_opportunities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    opportunity_id = Column(String(36), ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False, index=True)
    application_status = Column(String(50), default="Saved")  # Saved, In Progress, Applied, Shortlisted, Closed
    saved_at = Column(DateTime(timezone=True), default=utc_now)

    __table_args__ = (
        UniqueConstraint("user_id", "opportunity_id", name="uq_user_opportunity"),
    )

    user = relationship("Profile", back_populates="saved_opportunities")
    opportunity = relationship("Opportunity", back_populates="saved_by")


class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Integer, nullable=False)
    storage_path = Column(String(512), nullable=False)
    processing_status = Column(String(50), default="pending")  # pending, completed, failed
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("Profile", back_populates="documents")
    analyses = relationship("DocumentAnalysis", back_populates="document", cascade="all, delete-orphan")


class DocumentAnalysis(Base):
    __tablename__ = "document_analyses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    summary = Column(Text, nullable=False)
    simplified_text = Column(Text, nullable=False)
    extracted_information = Column(JSON, default=dict)  # deadlines, eligibility, required_documents, warnings
    action_plan = Column(JSON, default=list)  # step by step checklist
    language = Column(String(20), default="English")
    created_at = Column(DateTime(timezone=True), default=utc_now)

    document = relationship("Document", back_populates="analyses")


class ActionCard(Base):
    __tablename__ = "action_cards"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(String(20), default="Medium")  # High, Medium, Low
    status = Column(String(30), default="Not Started")  # Not Started, In Progress, Completed
    due_date = Column(DateTime(timezone=True), nullable=True)
    related_opportunity_id = Column(String(36), ForeignKey("opportunities.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user = relationship("Profile", back_populates="action_cards")
    opportunity = relationship("Opportunity")


class AccessibilityPreference(Base):
    __tablename__ = "accessibility_preferences"

    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), primary_key=True)
    preferred_language = Column(String(20), default="English")
    font_scale = Column(Numeric(3, 2), default=1.0)
    high_contrast = Column(Boolean, default=False)
    reduced_motion = Column(Boolean, default=False)
    text_to_speech = Column(Boolean, default=False)
    simplified_mode = Column(Boolean, default=False)

    user = relationship("Profile", back_populates="accessibility")


class LearningProgress(Base):
    __tablename__ = "learning_progress"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    topic = Column(String(255), nullable=False)
    progress_percentage = Column(Integer, default=0)
    completed_lessons = Column(JSON, default=list)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user = relationship("Profile", back_populates="learning_records")


class GovernmentScheme(Base):
    __tablename__ = "government_schemes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    scheme_name = Column(String(255), nullable=False, index=True)
    department = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    eligibility = Column(JSON, default=dict)
    benefits = Column(Text, nullable=False)
    required_documents = Column(JSON, default=list)
    application_process = Column(Text, nullable=False)
    official_url = Column(Text, nullable=False)
    last_verified_at = Column(DateTime(timezone=True), default=utc_now)
    verification_status = Column(String(50), default="Verified")


class CommunityResource(Base):
    __tablename__ = "community_resources"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    resource_category = Column(String(100), nullable=False)  # Education, Skills, Accessibility, Digital Literacy
    location = Column(String(255), default="National / Online")
    official_url = Column(Text, nullable=False)
    contact_information = Column(JSON, default=dict)
    verification_status = Column(String(50), default="Verified")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="info")  # info, reminder, achievement, deadline
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("Profile", back_populates="notifications")
