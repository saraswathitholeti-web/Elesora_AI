import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Shield, Globe, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-primary-card/70 border-t border-primary-border/30 pt-16 pb-12 mt-20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-electric-purple to-electric-cyan p-0.5 shadow-glow">
                <div className="w-full h-full bg-primary-bg rounded-[10px] flex items-center justify-center">
                  <img src="/logo.svg" alt="ELEYSORA Logo" className="w-5 h-5" />
                </div>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">ELEYSORA AI</span>
            </Link>
            <p className="text-xs text-content-secondary leading-relaxed">
              <strong>Beyond the Screen. Beyond Every Barrier.</strong>
              <br />
              Intelligence for Everyone. Opportunities for All. Where Intelligence Meets Inclusion.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-electric-purple/10 border border-electric-purple/30 text-[11px] text-electric-purple font-semibold">
              <Award className="w-3.5 h-3.5" />
              Theme 3 — Beyond the Screen
            </div>
          </div>

          {/* Core Features */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-content-muted font-bold">Platform Engines</h4>
            <ul className="space-y-2 text-xs text-content-secondary">
              <li><Link to="/lifepath" className="hover:text-electric-cyan transition-colors">ELEYSORA LifePath (Career Roadmap)</Link></li>
              <li><Link to="/discover" className="hover:text-electric-cyan transition-colors">Opportunity Discovery & Matching</Link></li>
              <li><Link to="/assistant" className="hover:text-electric-cyan transition-colors">Multilingual AI Assistant</Link></li>
              <li><Link to="/documents" className="hover:text-electric-cyan transition-colors">Document Intelligence</Link></li>
              <li><Link to="/barrier-to-bridge" className="hover:text-electric-cyan transition-colors">Barrier-to-Bridge Solver</Link></li>
              <li><Link to="/action-cards" className="hover:text-electric-cyan transition-colors">Smart Action Cards</Link></li>
            </ul>
          </div>

          {/* Social Impact & Inclusion */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-content-muted font-bold">Inclusion & Resources</h4>
            <ul className="space-y-2 text-xs text-content-secondary">
              <li><Link to="/schemes" className="hover:text-electric-cyan transition-colors">Government Scheme Finder</Link></li>
              <li><Link to="/learning" className="hover:text-electric-cyan transition-colors">Smart Learning Hub</Link></li>
              <li><Link to="/community" className="hover:text-electric-cyan transition-colors">Community Connect Directory</Link></li>
              <li><Link to="/sustainability" className="hover:text-electric-cyan transition-colors">Sustainability Assistant</Link></li>
              <li><Link to="/accessibility" className="hover:text-electric-cyan transition-colors">Accessibility Center (WCAG 2.2)</Link></li>
            </ul>
          </div>

          {/* Trust & Ethics */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-content-muted font-bold">Trust & Integrity</h4>
            <p className="text-xs text-content-secondary leading-relaxed">
              ELEYSORA TrustLens validates opportunities against genuine primary sources. AI explanations do not guarantee legal eligibility.
            </p>
            <div className="flex flex-col gap-1.5 text-xs text-content-secondary pt-1">
              <Link to="/about" className="hover:text-electric-cyan transition-colors">About ELEYSORA AI</Link>
              <Link to="/privacy" className="hover:text-electric-cyan transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-electric-cyan transition-colors">Terms of Use</Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-primary-border/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-content-muted">
          <p>© {new Date().getFullYear()} ELEYSORA AI. Designed for Social Impact and Digital Inclusion.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
              API Services Active
            </span>
            <span>English • తెలుగు • हिंदी</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
