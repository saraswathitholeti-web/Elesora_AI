import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-primary-bg flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white">Privacy Policy</h1>
          <p className="text-xs text-content-muted">Last Updated: October 2026</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border-primary-border/40 space-y-6 text-xs text-content-secondary leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-white">1. Data Ownership & Protection</h3>
            <p>
              ELEYSORA AI enforces PostgreSQL Row Level Security (RLS). All user profiles, private AI conversations, uploaded documents, and custom learning roadmaps are completely isolated to the authenticated user.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-white">2. Document Privacy & Ephemeral OCR</h3>
            <p>
              Uploaded circulars, transcripts, and application forms are used strictly for real-time text parsing, summarization, and question answering. User files are stored in private buckets and are never utilized to train generalized commercial AI models.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-white">3. Third-Party Intelligence Providers</h3>
            <p>
              When utilizing Google Gemini API, text prompts are transmitted securely via TLS 1.3 encrypted connections. No sensitive account passwords or credentials are shared.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-white">4. User Deletion Rights</h3>
            <p>
              Users retain full sovereignty over their data. Deleting a conversation, document, or account immediately purges all associated database records.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};
