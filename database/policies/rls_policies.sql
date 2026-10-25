-- ELEYSORA AI — Row Level Security (RLS) Policies for Supabase

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lifepaths ENABLE ROW LEVEL SECURITY;
ALTER TABLE lifepath_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE accessibility_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE government_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: Users can view and update only their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 2. Conversations: Owner access only
CREATE POLICY "Users can manage own conversations"
    ON conversations FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3. Messages: Owner access via conversation
CREATE POLICY "Users can manage messages in their conversations"
    ON messages FOR ALL
    USING (EXISTS (
        SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid()
    ));

-- 4. LifePaths: Owner access only
CREATE POLICY "Users can manage own lifepaths"
    ON lifepaths FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. LifePath Milestones: Owner access via lifepaths
CREATE POLICY "Users can manage own milestones"
    ON lifepath_milestones FOR ALL
    USING (EXISTS (
        SELECT 1 FROM lifepaths WHERE lifepaths.id = lifepath_milestones.lifepath_id AND lifepaths.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM lifepaths WHERE lifepaths.id = lifepath_milestones.lifepath_id AND lifepaths.user_id = auth.uid()
    ));

-- 6. Opportunities: Publicly readable by all (authenticated or anonymous), modified only by admin / service role
CREATE POLICY "Public opportunities readable by all"
    ON opportunities FOR SELECT
    USING (true);

-- 7. Saved Opportunities: Owner access only
CREATE POLICY "Users can manage own saved opportunities"
    ON saved_opportunities FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 8. Documents & Analyses: Private user documents
CREATE POLICY "Users can manage own documents"
    ON documents FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own document analyses"
    ON document_analyses FOR ALL
    USING (EXISTS (
        SELECT 1 FROM documents WHERE documents.id = document_analyses.document_id AND documents.user_id = auth.uid()
    ));

-- 9. Action Cards: Private user tasks
CREATE POLICY "Users can manage own action cards"
    ON action_cards FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 10. Accessibility Preferences
CREATE POLICY "Users can manage own accessibility preferences"
    ON accessibility_preferences FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 11. Learning Progress
CREATE POLICY "Users can manage own learning progress"
    ON learning_progress FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 12. Government Schemes & Community Resources: Public readable
CREATE POLICY "Public schemes readable by all"
    ON government_schemes FOR SELECT
    USING (true);

CREATE POLICY "Public community resources readable by all"
    ON community_resources FOR SELECT
    USING (true);

-- 13. Notifications
CREATE POLICY "Users can view own notifications"
    ON notifications FOR ALL
    USING (auth.uid() = user_id);
