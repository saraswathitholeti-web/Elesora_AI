from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field, EmailStr


# ==========================================
# AUTH & PROFILE SCHEMAS
# ==========================================

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    display_name: Optional[str] = "Student / Learner"
    preferred_language: Optional[str] = "English"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: Optional[str] = None
    display_name: Optional[str] = None


class ProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    education_level: Optional[str] = None
    career_goal: Optional[str] = None
    skills: Optional[List[str]] = None
    preferred_language: Optional[str] = None


class ProfileOut(BaseModel):
    id: str
    display_name: Optional[str] = None
    education_level: Optional[str] = None
    career_goal: Optional[str] = None
    skills: List[str] = []
    preferred_language: str = "English"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==========================================
# CHAT ASSISTANT SCHEMAS
# ==========================================

class MessageCreate(BaseModel):
    content: str
    language: Optional[str] = "English"


class MessageOut(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    language: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationCreate(BaseModel):
    title: Optional[str] = "New Conversation"


class ConversationOut(BaseModel):
    id: str
    user_id: str
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageOut] = []

    class Config:
        from_attributes = True


# ==========================================
# LIFEPATH SCHEMAS
# ==========================================

class LifePathGenerateRequest(BaseModel):
    career_goal: str
    education_level: Optional[str] = "Undergraduate"
    current_skills: Optional[List[str]] = []
    interests: Optional[List[str]] = []
    study_hours_per_week: Optional[float] = 7.0
    budget_level: Optional[str] = "Free / Low Cost"
    preferred_language: Optional[str] = "English"
    optional_challenges: Optional[str] = None


class MilestoneSchema(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    sequence_number: int
    estimated_duration_days: int = 14
    status: str = "pending"  # pending, in_progress, completed
    skills_covered: List[str] = []
    recommended_resources: List[Dict[str, str]] = []
    suggested_project: Optional[str] = None


class LifePathRoadmapData(BaseModel):
    career_goal: str
    overview: str
    required_core_skills: List[str]
    learning_stages: List[str]
    estimated_total_months: int
    next_recommended_action: str
    milestones: List[MilestoneSchema]


class LifePathOut(BaseModel):
    id: str
    user_id: str
    career_goal: str
    education_level: Optional[str]
    current_skills: List[str] = []
    study_hours_per_week: float
    preferred_language: str
    roadmap_data: Dict[str, Any]
    status: str
    progress_percentage: int = 0
    milestones: List[MilestoneSchema] = []
    created_at: datetime

    class Config:
        from_attributes = True


class MilestoneStatusUpdate(BaseModel):
    status: str  # pending, in_progress, completed


# ==========================================
# OPPORTUNITY SCHEMAS
# ==========================================

class OpportunityOut(BaseModel):
    id: str
    title: str
    organization: str
    category: str
    description: str
    eligibility: Dict[str, Any] = {}
    required_skills: List[str] = []
    location: str
    remote_available: bool
    application_deadline: Optional[datetime] = None
    official_url: str
    source_url: Optional[str] = None
    last_verified_at: Optional[datetime] = None
    verification_status: str
    is_saved: Optional[bool] = False

    class Config:
        from_attributes = True


class MatchRequest(BaseModel):
    education_level: Optional[str] = None
    skills: List[str] = []
    interests: List[str] = []
    location_preference: Optional[str] = None
    category: Optional[str] = None


class OpportunityMatchResult(BaseModel):
    opportunity: OpportunityOut
    match_score: int  # 0 to 100 deterministic
    matching_requirements: List[str]
    missing_skills: List[str]
    ai_explanation: str
    recommended_next_steps: List[str]


class SavedOpportunityOut(BaseModel):
    id: str
    user_id: str
    opportunity_id: str
    application_status: str
    saved_at: datetime
    opportunity: Optional[OpportunityOut] = None

    class Config:
        from_attributes = True


# ==========================================
# DOCUMENT INTELLIGENCE SCHEMAS
# ==========================================

class DocumentOut(BaseModel):
    id: str
    user_id: str
    file_name: str
    file_type: str
    file_size: int
    processing_status: str
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentAnalysisOut(BaseModel):
    id: str
    document_id: str
    summary: str
    simplified_text: str
    extracted_information: Dict[str, Any]
    action_plan: List[Dict[str, Any]]
    language: str
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentQuestionRequest(BaseModel):
    question: str
    language: Optional[str] = "English"


class DocumentQuestionResponse(BaseModel):
    answer: str
    cited_page: Optional[str] = None
    language: str


# ==========================================
# BARRIER-TO-BRIDGE SCHEMAS
# ==========================================

class BarrierAnalyzeRequest(BaseModel):
    user_goal: str
    reported_barrier: str
    preferred_language: Optional[str] = "English"


class BarrierAnalyzeResponse(BaseModel):
    identified_goal: str
    reported_barrier: str
    barrier_category: str  # Financial, Language, Accessibility, Technical, Time
    possible_solutions: List[str]
    recommended_resources: List[Dict[str, str]]
    suggested_actions: List[Dict[str, Any]]
    bridge_action_plan: List[str]
    empowerment_message: str


# ==========================================
# ACTION CARDS SCHEMAS
# ==========================================

class ActionCardCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "Medium"  # High, Medium, Low
    status: Optional[str] = "Not Started"  # Not Started, In Progress, Completed
    due_date: Optional[datetime] = None
    related_opportunity_id: Optional[str] = None


class ActionCardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[datetime] = None
    related_opportunity_id: Optional[str] = None


class ActionCardOut(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str] = None
    priority: str
    status: str
    due_date: Optional[datetime] = None
    related_opportunity_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==========================================
# ACCESSIBILITY PREFERENCES SCHEMAS
# ==========================================

class AccessibilityUpdate(BaseModel):
    preferred_language: Optional[str] = None
    font_scale: Optional[float] = None
    high_contrast: Optional[bool] = None
    reduced_motion: Optional[bool] = None
    text_to_speech: Optional[bool] = None
    simplified_mode: Optional[bool] = None


class AccessibilityOut(BaseModel):
    user_id: str
    preferred_language: str = "English"
    font_scale: float = 1.0
    high_contrast: bool = False
    reduced_motion: bool = False
    text_to_speech: bool = False
    simplified_mode: bool = False

    class Config:
        from_attributes = True


# ==========================================
# GOVERNMENT SCHEMES SCHEMAS
# ==========================================

class GovernmentSchemeOut(BaseModel):
    id: str
    scheme_name: str
    department: str
    description: str
    eligibility: Dict[str, Any]
    benefits: str
    required_documents: List[str]
    application_process: str
    official_url: str
    last_verified_at: Optional[datetime] = None
    verification_status: str

    class Config:
        from_attributes = True


# ==========================================
# SMART LEARNING HUB SCHEMAS
# ==========================================

class LearnExplainRequest(BaseModel):
    topic: str
    level: Optional[str] = "Beginner"
    language: Optional[str] = "English"


class LearnExplainResponse(BaseModel):
    topic: str
    level: str
    simple_analogy: str
    core_concepts: List[Dict[str, str]]
    practical_example: str
    key_takeaways: List[str]
    quiz_ready_prompt: str


class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_option_index: int
    explanation: str


class QuizGenerateRequest(BaseModel):
    topic: str
    number_of_questions: Optional[int] = 3
    language: Optional[str] = "English"


class QuizGenerateResponse(BaseModel):
    topic: str
    questions: List[QuizQuestion]


class LearningProgressUpdate(BaseModel):
    topic: str
    progress_percentage: int
    completed_lesson: Optional[str] = None


class LearningProgressOut(BaseModel):
    id: str
    user_id: str
    topic: str
    progress_percentage: int
    completed_lessons: List[str]
    updated_at: datetime

    class Config:
        from_attributes = True


# ==========================================
# COMMUNITY & SUSTAINABILITY SCHEMAS
# ==========================================

class CommunityResourceOut(BaseModel):
    id: str
    organization_name: str
    description: str
    resource_category: str
    location: str
    official_url: str
    contact_information: Dict[str, Any]
    verification_status: str

    class Config:
        from_attributes = True


class SustainabilityAdviceRequest(BaseModel):
    area_of_interest: str  # electricity, water, waste, transport, general
    context: Optional[str] = None
    language: Optional[str] = "English"


class SustainabilityAdviceResponse(BaseModel):
    area: str
    practical_tips: List[Dict[str, str]]
    immediate_action: str
    community_impact_note: str


# ==========================================
# DASHBOARD SCHEMAS
# ==========================================

class DashboardOverviewOut(BaseModel):
    active_lifepath: Optional[Dict[str, Any]] = None
    saved_opportunities_count: int
    pending_actions_count: int
    completed_actions_count: int
    learning_topics_count: int
    upcoming_deadlines: List[Dict[str, Any]] = []
    ai_recommendations: List[Dict[str, str]] = []
    recent_activity: List[Dict[str, Any]] = []
