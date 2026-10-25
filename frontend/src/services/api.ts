import {
  UserProfile,
  AuthToken,
  Conversation,
  Message,
  LifePath,
  Opportunity,
  OpportunityMatch,
  DocumentItem,
  DocumentAnalysis,
  ActionCard,
  AccessibilityPreferences,
  GovernmentScheme,
  CommunityResource,
  DashboardOverview,
  Milestone,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('eleysora_auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('eleysora_auth_token', token);
    } else {
      localStorage.removeItem('eleysora_auth_token');
    }
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('eleysora_auth_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}/api/v1${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Request failed with status ${response.status}`);
      }

      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (err: any) {
      console.warn(`API request to ${endpoint} failed:`, err.message);
      throw err;
    }
  }

  // Auth
  async register(data: { email: string; password: string; display_name?: string; preferred_language?: string }): Promise<AuthToken> {
    const res = await this.request<AuthToken>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    return res;
  }

  async login(data: { email: string; password: string }): Promise<AuthToken> {
    const res = await this.request<AuthToken>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    return res;
  }

  async getProfile(): Promise<UserProfile> {
    return this.request<UserProfile>('/auth/me');
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return this.request<UserProfile>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Chat Assistant
  async createConversation(title?: string): Promise<Conversation> {
    return this.request<Conversation>('/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  }

  async getConversations(): Promise<Conversation[]> {
    return this.request<Conversation[]>('/chat/conversations');
  }

  async getConversation(id: string): Promise<Conversation> {
    return this.request<Conversation>(`/chat/conversations/${id}`);
  }

  async deleteConversation(id: string): Promise<void> {
    return this.request<void>(`/chat/conversations/${id}`, { method: 'DELETE' });
  }

  async sendMessage(conversationId: string, content: string, language?: string): Promise<Message> {
    return this.request<Message>(`/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, language }),
    });
  }

  // LifePath
  async generateLifePath(data: {
    career_goal: string;
    education_level?: string;
    current_skills?: string[];
    interests?: string[];
    study_hours_per_week?: number;
    budget_level?: string;
    preferred_language?: string;
    optional_challenges?: string;
  }): Promise<LifePath> {
    return this.request<LifePath>('/lifepath/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLifePaths(): Promise<LifePath[]> {
    return this.request<LifePath[]>('/lifepath');
  }

  async getLifePath(id: string): Promise<LifePath> {
    return this.request<LifePath>(`/lifepath/${id}`);
  }

  async updateMilestoneStatus(milestoneId: string, status: 'pending' | 'in_progress' | 'completed'): Promise<Milestone> {
    return this.request<Milestone>(`/lifepath/milestones/${milestoneId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async regenerateLifePath(id: string): Promise<LifePath> {
    return this.request<LifePath>(`/lifepath/${id}/regenerate`, { method: 'POST' });
  }

  async deleteLifePath(id: string): Promise<void> {
    return this.request<void>(`/lifepath/${id}`, { method: 'DELETE' });
  }

  // Opportunities
  async getOpportunities(params?: { category?: string; search?: string; remote_only?: boolean }): Promise<Opportunity[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.remote_only) query.append('remote_only', 'true');
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<Opportunity[]>(`/opportunities${queryString}`);
  }

  async getOpportunity(id: string): Promise<Opportunity> {
    return this.request<Opportunity>(`/opportunities/${id}`);
  }

  async matchOpportunities(criteria: {
    education_level?: string;
    skills?: string[];
    interests?: string[];
    category?: string;
  }): Promise<OpportunityMatch[]> {
    return this.request<OpportunityMatch[]>('/opportunities/match', {
      method: 'POST',
      body: JSON.stringify(criteria),
    });
  }

  async saveOpportunity(id: string): Promise<{ status: string }> {
    return this.request<{ status: string }>(`/opportunities/${id}/save`, { method: 'POST' });
  }

  async unsaveOpportunity(id: string): Promise<void> {
    return this.request<void>(`/opportunities/${id}/save`, { method: 'DELETE' });
  }

  async getSavedOpportunities(): Promise<Opportunity[]> {
    return this.request<Opportunity[]>('/opportunities/saved');
  }

  // Documents
  async uploadDocument(file: File): Promise<DocumentItem> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/api/v1/documents/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Upload failed');
    }

    return res.json();
  }

  async getDocuments(): Promise<DocumentItem[]> {
    return this.request<DocumentItem[]>('/documents');
  }

  async deleteDocument(id: string): Promise<void> {
    return this.request<void>(`/documents/${id}`, { method: 'DELETE' });
  }

  async analyzeDocument(id: string, language?: string): Promise<DocumentAnalysis> {
    const query = language ? `?language=${encodeURIComponent(language)}` : '';
    return this.request<DocumentAnalysis>(`/documents/${id}/analyze${query}`, { method: 'POST' });
  }

  async getDocumentAnalysis(id: string): Promise<DocumentAnalysis> {
    return this.request<DocumentAnalysis>(`/documents/${id}/analysis`);
  }

  async askDocumentQuestion(id: string, question: string, language?: string): Promise<{ answer: string; cited_page?: string }> {
    return this.request<{ answer: string; cited_page?: string }>(`/documents/${id}/ask`, {
      method: 'POST',
      body: JSON.stringify({ question, language }),
    });
  }

  // Barrier-to-Bridge
  async analyzeBarrier(data: { user_goal: string; reported_barrier: string; preferred_language?: string }): Promise<any> {
    return this.request<any>('/barriers/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async convertBarrierToActions(analysis: any): Promise<{ status: string; action_cards_created: number }> {
    return this.request<{ status: string; action_cards_created: number }>('/barriers/convert-to-actions', {
      method: 'POST',
      body: JSON.stringify(analysis),
    });
  }

  // Action Cards
  async getActionCards(status?: string): Promise<ActionCard[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.request<ActionCard[]>(`/action-cards${query}`);
  }

  async createActionCard(card: Partial<ActionCard>): Promise<ActionCard> {
    return this.request<ActionCard>('/action-cards', {
      method: 'POST',
      body: JSON.stringify(card),
    });
  }

  async updateActionCard(id: string, card: Partial<ActionCard>): Promise<ActionCard> {
    return this.request<ActionCard>(`/action-cards/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(card),
    });
  }

  async deleteActionCard(id: string): Promise<void> {
    return this.request<void>(`/action-cards/${id}`, { method: 'DELETE' });
  }

  // Accessibility
  async getAccessibility(): Promise<AccessibilityPreferences> {
    return this.request<AccessibilityPreferences>('/accessibility');
  }

  async updateAccessibility(pref: Partial<AccessibilityPreferences>): Promise<AccessibilityPreferences> {
    return this.request<AccessibilityPreferences>('/accessibility', {
      method: 'PATCH',
      body: JSON.stringify(pref),
    });
  }

  // Schemes
  async getSchemes(params?: { department?: string; search?: string }): Promise<GovernmentScheme[]> {
    const query = new URLSearchParams();
    if (params?.department) query.append('department', params.department);
    if (params?.search) query.append('search', params.search);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<GovernmentScheme[]>(`/schemes${queryString}`);
  }

  // Learning Hub
  async explainTopic(topic: string, level?: string, language?: string): Promise<any> {
    return this.request<any>('/learning/explain', {
      method: 'POST',
      body: JSON.stringify({ topic, level, language }),
    });
  }

  async generateQuiz(topic: string, number_of_questions?: number, language?: string): Promise<any> {
    return this.request<any>('/learning/quiz', {
      method: 'POST',
      body: JSON.stringify({ topic, number_of_questions, language }),
    });
  }

  async getLearningProgress(): Promise<any[]> {
    return this.request<any[]>('/learning/progress');
  }

  async updateLearningProgress(data: { topic: string; progress_percentage: number; completed_lesson?: string }): Promise<any> {
    return this.request<any>('/learning/progress', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Community
  async getCommunityResources(params?: { category?: string; search?: string }): Promise<CommunityResource[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<CommunityResource[]>(`/community/resources${queryString}`);
  }

  // Sustainability
  async getSustainabilityAdvice(area_of_interest: string, context?: string, language?: string): Promise<any> {
    return this.request<any>('/sustainability/advice', {
      method: 'POST',
      body: JSON.stringify({ area_of_interest, context, language }),
    });
  }

  // Dashboard
  async getDashboardOverview(): Promise<DashboardOverview> {
    return this.request<DashboardOverview>('/dashboard/overview');
  }
}

export const api = new ApiClient();
