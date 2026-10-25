# ELEYSORA AI — Database Architecture & Policies

This directory contains the database migration scripts, Supabase Row Level Security (RLS) policies, and reference seed data.

## Schema Overview

- **`profiles`**: User profiles with education level, skills, and language preference.
- **`conversations` & `messages`**: Multi-turn multilingual AI chats.
- **`lifepaths` & `lifepath_milestones`**: AI-generated structured career roadmaps with progress tracking.
- **`opportunities` & `saved_opportunities`**: Verified scholarships, internships, jobs, courses with TrustLens validation.
- **`documents` & `document_analyses`**: Secure file storage, summaries, simplified Telugu/Hindi/English translations, and extracted action items.
- **`action_cards`**: User tasks linked to opportunities or barrier resolutions.
- **`accessibility_preferences`**: High-contrast, font scaling, text-to-speech, and simplified mode persistence.
- **`government_schemes`**: Indian government assistance programs and verified application processes.
- **`community_resources`**: Directory of organizations aiding digital literacy and accessibility.
- **`learning_progress`**: Smart Learning Hub lesson tracking.

## Applying in Supabase

1. Open your Supabase project dashboard -> **SQL Editor**.
2. Run `migrations/01_initial_schema.sql`.
3. Run `policies/rls_policies.sql` to enforce user isolation.
4. Create a private bucket named `eleysora-documents` in **Storage**.
