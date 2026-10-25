-- ELEYSORA AI — PostgreSQL Schema (Supabase & Production)
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Linked to auth.users if Supabase Auth is active)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    display_name TEXT,
    education_level TEXT,
    career_goal TEXT,
    skills JSONB DEFAULT '[]'::jsonb,
    preferred_language TEXT DEFAULT 'English',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT DEFAULT 'New Chat',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    language TEXT DEFAULT 'English',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. LifePaths Table
CREATE TABLE IF NOT EXISTS lifepaths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    career_goal TEXT NOT NULL,
    education_level TEXT,
    current_skills JSONB DEFAULT '[]'::jsonb,
    study_hours_per_week NUMERIC(5, 2) DEFAULT 7.0,
    preferred_language TEXT DEFAULT 'English',
    roadmap_data JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. LifePath Milestones Table
CREATE TABLE IF NOT EXISTS lifepath_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lifepath_id UUID REFERENCES lifepaths(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    sequence_number INTEGER NOT NULL,
    estimated_duration_days INTEGER DEFAULT 14,
    status TEXT DEFAULT 'pending',
    completed_at TIMESTAMPTZ
);

-- 6. Opportunities Table
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    organization TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    eligibility JSONB DEFAULT '{}'::jsonb,
    required_skills JSONB DEFAULT '[]'::jsonb,
    location TEXT DEFAULT 'All India / Online',
    remote_available BOOLEAN DEFAULT TRUE,
    application_deadline TIMESTAMPTZ,
    official_url TEXT NOT NULL,
    source_url TEXT,
    last_verified_at TIMESTAMPTZ DEFAULT NOW(),
    verification_status TEXT DEFAULT 'Verified'
);

-- 7. Saved Opportunities Table
CREATE TABLE IF NOT EXISTS saved_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE NOT NULL,
    application_status TEXT DEFAULT 'Saved',
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_user_opportunity UNIQUE (user_id, opportunity_id)
);

-- 8. Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    storage_path TEXT NOT NULL,
    processing_status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Document Analyses Table
CREATE TABLE IF NOT EXISTS document_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
    summary TEXT NOT NULL,
    simplified_text TEXT NOT NULL,
    extracted_information JSONB DEFAULT '{}'::jsonb,
    action_plan JSONB DEFAULT '[]'::jsonb,
    language TEXT DEFAULT 'English',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Action Cards Table
CREATE TABLE IF NOT EXISTS action_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'Medium',
    status TEXT DEFAULT 'Not Started',
    due_date TIMESTAMPTZ,
    related_opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Accessibility Preferences Table
CREATE TABLE IF NOT EXISTS accessibility_preferences (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    preferred_language TEXT DEFAULT 'English',
    font_scale NUMERIC(3, 2) DEFAULT 1.0,
    high_contrast BOOLEAN DEFAULT FALSE,
    reduced_motion BOOLEAN DEFAULT FALSE,
    text_to_speech BOOLEAN DEFAULT FALSE,
    simplified_mode BOOLEAN DEFAULT FALSE
);

-- 12. Learning Progress Table
CREATE TABLE IF NOT EXISTS learning_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    topic TEXT NOT NULL,
    progress_percentage INTEGER DEFAULT 0,
    completed_lessons JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Government Schemes Table
CREATE TABLE IF NOT EXISTS government_schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_name TEXT NOT NULL,
    department TEXT NOT NULL,
    description TEXT NOT NULL,
    eligibility JSONB DEFAULT '{}'::jsonb,
    benefits TEXT NOT NULL,
    required_documents JSONB DEFAULT '[]'::jsonb,
    application_process TEXT NOT NULL,
    official_url TEXT NOT NULL,
    last_verified_at TIMESTAMPTZ DEFAULT NOW(),
    verification_status TEXT DEFAULT 'Verified'
);

-- 14. Community Resources Table
CREATE TABLE IF NOT EXISTS community_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_name TEXT NOT NULL,
    description TEXT NOT NULL,
    resource_category TEXT NOT NULL,
    location TEXT DEFAULT 'National / Online',
    official_url TEXT NOT NULL,
    contact_information JSONB DEFAULT '{}'::jsonb,
    verification_status TEXT DEFAULT 'Verified'
);

-- 15. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_lifepaths_user ON lifepaths(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_lp ON lifepath_milestones(lifepath_id);
CREATE INDEX IF NOT EXISTS idx_opps_category ON opportunities(category);
CREATE INDEX IF NOT EXISTS idx_saved_opps_user ON saved_opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_docs_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_actions_user ON action_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_actions_status ON action_cards(status);
