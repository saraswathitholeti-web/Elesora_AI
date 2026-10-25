import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-primary-bg flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white">Terms of Use</h1>
          <p className="text-xs text-content-muted">Last Updated: October 2026</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border-primary-border/40 space-y-6 text-xs text-content-secondary leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-white">1. Platform Purpose & Educational Disclaimer</h3>
            <p>
              ELEYSORA AI is designed to assist learners in discovering educational opportunities, planning roadmaps, and understanding official guidelines. AI match scores and explanations represent advisory guidance and do NOT constitute legal guarantee of university admission, scholarship disbursement, or employment selection.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-white">2. Verification via TrustLens</h3>
            <p>
              Users must always verify deadlines and eligibility criteria through the provided official portal links before submitting applications or financial documents.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-white">3. Acceptable Use</h3>
            <p>
              Users agree not to upload malicious files, attempt prompt injections, or misuse the automated AI assistant for unlawful activities.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};
