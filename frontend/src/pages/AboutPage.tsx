import React from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Sparkles,
  ShieldCheck,
  Compass,
  Heart,
  Globe2,
  Users,
  Target,
  ArrowRight,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-primary-bg flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-electric-purple/20 border border-electric-purple/30 text-xs text-electric-purple font-bold">
            <Award className="w-4 h-4" />
            <span>Theme 3: Beyond the Screen — Build for a Smarter, More Inclusive Future</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            About ELEYSORA AI
          </h1>
          <p className="text-base text-electric-cyan font-bold tracking-wide">
            Beyond the Screen. Beyond Every Barrier. Where Intelligence Meets Inclusion.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border-primary-border/40 space-y-4 shadow-2xl">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-electric-cyan" />
            Our Core Mission
          </h3>
          <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
            Despite remarkable technological growth, millions of aspiring students, rural job seekers, and differently-abled individuals remain locked out of high-impact opportunities. The barrier is rarely a lack of motivation—it is the friction of impenetrable government jargon, English-only technical gatekeeping, unaffordable courses, and fragmented information.
          </p>
          <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
            ELEYSORA AI was created as an integrated, accessible full-stack platform that transforms information from passive static text into structured, actionable life outcomes: <strong>Discover → Understand → Plan → Act → Track.</strong>
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-3xl border-primary-border/40 space-y-3">
            <Globe2 className="w-8 h-8 text-electric-purple" />
            <h4 className="text-base font-bold text-white">Linguistic Inclusion</h4>
            <p className="text-xs text-content-secondary leading-relaxed">
              Native conversational support in English, Telugu, and Hindi bridges the regional gap, making technical and official knowledge universally understandable.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border-primary-border/40 space-y-3">
            <ShieldCheck className="w-8 h-8 text-status-success" />
            <h4 className="text-base font-bold text-white">ELEYSORA TrustLens</h4>
            <p className="text-xs text-content-secondary leading-relaxed">
              Every scholarship, scheme, and opportunity is rigorously cross-referenced against primary official sources to eliminate disinformation and false promises.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border-primary-border/40 space-y-3">
            <Users className="w-8 h-8 text-electric-cyan" />
            <h4 className="text-base font-bold text-white">Universal Accessibility</h4>
            <p className="text-xs text-content-secondary leading-relaxed">
              Engineered according to WCAG 2.2 AA standards with high-contrast modes, font-scaling, voice dictation, screen-reader compatibility, and simplified modes.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-6">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-electric-purple to-electric-cyan text-white font-extrabold text-sm shadow-glow hover:scale-105 transition-all"
          >
            <span>Experience ELEYSORA AI</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};
