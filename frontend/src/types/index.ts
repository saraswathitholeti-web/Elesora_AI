export type Language = 'English' | 'Telugu' | 'Hindi';

export interface UserProfile {
  id: string;
  email?: string;
  display_name: string;
  education_level?: string;
  career_goal?: string;
  skills: string[];
  preferred_language: Language;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user_id: string;
  email?: string;
  display_name?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  language: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

export interface Milestone {
  id?: string;
  title: string;
  description: string;
  sequence_number: number;
  estimated_duration_days: number;
  status: 'pending' | 'in_progress' | 'completed';
  skills_covered?: string[];
  recommended_resources?: { name: string; type: string; url: string }[];
  suggested_project?: string;
}

export interface LifePath {
  id: string;
  user_id: string;
  career_goal: string;
  education_level?: string;
  current_skills: string[];
  study_hours_per_week: number;
  preferred_language: string;
  roadmap_data: {
    career_goal?: string;
    overview?: string;
    required_core_skills?: string[];
    learning_stages?: string[];
    estimated_total_months?: number;
    next_recommended_action?: string;
  };
  status: string;
  progress_percentage: number;
  milestones: Milestone[];
  created_at: string;
}

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  category: string;
  description: string;
  eligibility: Record<string, any>;
  required_skills: string[];
  location: string;
  remote_available: boolean;
  application_deadline?: string;
  official_url: string;
  source_url?: string;
  last_verified_at?: string;
  verification_status: 'Verified' | 'Pending Verification' | 'Possibly Outdated';
  is_saved?: boolean;
}

export interface OpportunityMatch {
  opportunity: Opportunity;
  match_score: number;
  matching_requirements: string[];
  missing_skills: string[];
  ai_explanation: string;
  recommended_next_steps: string[];
}

export interface DocumentItem {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  processing_status: string;
  created_at: string;
}

export interface DocumentAnalysis {
  id: string;
  document_id: string;
  summary: string;
  simplified_text: string;
  extracted_information: {
    deadlines?: string[];
    eligibility_requirements?: string[];
    required_documents?: string[];
    application_instructions?: string;
    warnings?: string[];
  };
  action_plan: { step: number; task: string; deadline?: string }[];
  language: string;
  created_at: string;
}

export interface ActionCard {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Not Started' | 'In Progress' | 'Completed';
  due_date?: string;
  related_opportunity_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AccessibilityPreferences {
  user_id: string;
  preferred_language: Language;
  font_scale: number;
  high_contrast: boolean;
  reduced_motion: boolean;
  text_to_speech: boolean;
  simplified_mode: boolean;
}

export interface GovernmentScheme {
  id: string;
  scheme_name: string;
  department: string;
  description: string;
  eligibility: Record<string, any>;
  benefits: string;
  required_documents: string[];
  application_process: string;
  official_url: string;
  last_verified_at?: string;
  verification_status: string;
}

export interface CommunityResource {
  id: string;
  organization_name: string;
  description: string;
  resource_category: string;
  location: string;
  official_url: string;
  contact_information: Record<string, any>;
  verification_status: string;
}

export interface DashboardOverview {
  active_lifepath?: {
    id: string;
    career_goal: string;
    progress_percentage: number;
    milestones_total: number;
    milestones_completed: number;
    next_action: string;
  };
  saved_opportunities_count: number;
  pending_actions_count: number;
  completed_actions_count: number;
  learning_topics_count: number;
  upcoming_deadlines: {
    title: string;
    type: string;
    deadline?: string;
    source: string;
  }[];
  ai_recommendations: {
    category: string;
    text: string;
  }[];
  recent_activity: {
    action: string;
    detail: string;
    timestamp: string;
  }[];
}
