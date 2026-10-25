import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Sparkles,
  MapPin,
  Calendar,
  Building,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { TrustBadge } from '../components/common/TrustBadge';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { api } from '../services/api';
import { Opportunity, OpportunityMatch } from '../types';

export const DiscoverPage: React.FC = () => {
  const { user } = useAuth();
  const { language, speak } = useAccessibility();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [matches, setMatches] = useState<OpportunityMatch[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [remoteOnly, setRemoteOnly] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'catalog' | 'matches' | 'saved'>('catalog');
  const [savedOpportunities, setSavedOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMatching, setIsMatching] = useState(false);

  const categories = [
    'All',
    'Scholarship',
    'Internship',
    'Free Course',
    'Certification',
    'Skill Training',
  ];

  useEffect(() => {
    loadOpportunities();
    if (user) {
      loadSavedOpportunities();
    }
  }, [selectedCategory, remoteOnly]);

  const loadOpportunities = async () => {
    setIsLoading(true);
    try {
      const data = await api.getOpportunities({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchQuery || undefined,
        remote_only: remoteOnly || undefined,
      });
      setOpportunities(data);
    } catch (err) {
      console.warn('Failed to load opportunities', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedOpportunities = async () => {
    try {
      const data = await api.getSavedOpportunities();
      setSavedOpportunities(data);
    } catch (err) {
      console.warn('Failed to load saved opportunities', err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadOpportunities();
  };

  const handleCalculateMatches = async () => {
    setIsMatching(true);
    setActiveTab('matches');
    try {
      const res = await api.matchOpportunities({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        skills: user?.skills || ['Python', 'Problem Solving'],
        education_level: user?.education_level || 'Undergraduate',
      });
      setMatches(res);
      speak(`Found ${res.length} matched opportunities based on your skills.`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsMatching(false);
    }
  };

  const handleToggleSave = async (opp: Opportunity) => {
    const isSaved = opp.is_saved || savedOpportunities.some((s) => s.id === opp.id);
    try {
      if (isSaved) {
        await api.unsaveOpportunity(opp.id);
        setSavedOpportunities((prev) => prev.filter((s) => s.id !== opp.id));
        setOpportunities((prev) =>
          prev.map((o) => (o.id === opp.id ? { ...o, is_saved: false } : o))
        );
      } else {
        await api.saveOpportunity(opp.id);
        setSavedOpportunities((prev) => [...prev, { ...opp, is_saved: true }]);
        setOpportunities((prev) =>
          prev.map((o) => (o.id === opp.id ? { ...o, is_saved: true } : o))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout
      title="Opportunity Discovery & TrustLens"
      subtitle="Source-verified scholarships, internships, and zero-cost certifications matched to your background."
    >
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="glass-panel p-5 rounded-3xl border-primary-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <form onSubmit={handleSearch} className="flex-1 w-full flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-content-muted absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scholarships, Google internships, Microsoft courses..."
                className="w-full bg-primary-bg/80 border border-primary-border/50 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-content-muted focus:outline-none focus:border-electric-cyan"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-electric-purple text-white text-xs font-bold shadow-glow hover:opacity-90 transition-all shrink-0"
            >
              Search
            </button>
          </form>

          {/* AI Match Button */}
          <button
            onClick={handleCalculateMatches}
            disabled={isMatching}
            className="w-full md:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-electric-purple to-electric-cyan text-white text-xs font-bold shadow-glow hover:opacity-95 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Sparkles className={`w-4 h-4 ${isMatching ? 'animate-spin' : ''}`} />
            <span>{isMatching ? 'Calculating Alignment...' : 'Calculate AI Match Scores'}</span>
          </button>
        </div>

        {/* Categories & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-electric-purple text-white shadow-glow'
                    : 'glass-panel text-content-secondary hover:text-white border-primary-border/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Remote Toggle & Tabs */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-medium text-content-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                className="rounded border-primary-border text-electric-purple focus:ring-electric-cyan accent-electric-purple"
              />
              <span>Remote / Online Only</span>
            </label>

            <div className="flex rounded-xl bg-primary-card/60 p-1 border border-primary-border/40 text-xs">
              <button
                onClick={() => setActiveTab('catalog')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  activeTab === 'catalog' ? 'bg-electric-purple text-white' : 'text-content-muted hover:text-white'
                }`}
              >
                All Opportunities ({opportunities.length})
              </button>
              <button
                onClick={() => setActiveTab('matches')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  activeTab === 'matches' ? 'bg-electric-purple text-white' : 'text-content-muted hover:text-white'
                }`}
              >
                AI Matches ({matches.length})
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  activeTab === 'saved' ? 'bg-electric-purple text-white' : 'text-content-muted hover:text-white'
                }`}
              >
                Saved ({savedOpportunities.length})
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Standard Opportunity Catalog */}
        {activeTab === 'catalog' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {opportunities.map((opp) => {
              const isSaved = opp.is_saved || savedOpportunities.some((s) => s.id === opp.id);
              return (
                <div
                  key={opp.id}
                  className="glass-panel glass-panel-hover p-6 rounded-3xl border-primary-border/40 flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-electric-purple/20 text-electric-purple border border-electric-purple/30 uppercase tracking-wide">
                          {opp.category}
                        </span>
                        <h4 className="text-base font-bold text-white mt-2 leading-snug">{opp.title}</h4>
                        <p className="text-xs text-electric-cyan font-semibold flex items-center gap-1.5 mt-1">
                          <Building className="w-3.5 h-3.5" />
                          {opp.organization}
                        </p>
                      </div>

                      <button
                        onClick={() => handleToggleSave(opp)}
                        className={`p-2.5 rounded-xl border transition-all ${
                          isSaved
                            ? 'bg-electric-purple text-white border-electric-purple shadow-glow'
                            : 'glass-panel text-content-muted hover:text-white border-primary-border/40'
                        }`}
                        title={isSaved ? 'Remove from Saved' : 'Save Opportunity'}
                      >
                        {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                    </div>

                    <p className="text-xs text-content-secondary leading-relaxed line-clamp-3">
                      {opp.description}
                    </p>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-content-muted">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-content-muted" />
                        {opp.location}
                      </span>
                      {opp.application_deadline && (
                        <span className="flex items-center gap-1 text-status-warning">
                          <Clock className="w-3 h-3" />
                          Due: {new Date(opp.application_deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Skills pills */}
                    {opp.required_skills && opp.required_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {opp.required_skills.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-primary-border/30 text-content-secondary"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* TrustLens Footer & Primary Link */}
                  <div className="pt-4 border-t border-primary-border/20 space-y-3">
                    <TrustBadge
                      status={opp.verification_status}
                      lastVerifiedAt={opp.last_verified_at}
                      sourceUrl={opp.source_url}
                    />

                    <a
                      href={opp.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-electric-purple to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-95 shadow-glow"
                    >
                      <span>Apply on Official Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: AI Matches */}
        {activeTab === 'matches' && (
          <div className="space-y-6">
            {matches.length === 0 ? (
              <div className="text-center py-16 glass-panel rounded-3xl border-primary-border/30 space-y-4">
                <Sparkles className="w-12 h-12 text-electric-cyan mx-auto" />
                <h4 className="text-base font-bold text-white">No Matches Computed Yet</h4>
                <p className="text-xs text-content-secondary max-w-sm mx-auto">
                  Click 'Calculate AI Match Scores' to analyze the opportunity database against your current skills and education.
                </p>
                <button
                  onClick={handleCalculateMatches}
                  className="px-6 py-2.5 rounded-xl bg-electric-purple text-white text-xs font-bold shadow-glow"
                >
                  Run Match Engine
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {matches.map((m, idx) => (
                  <div
                    key={idx}
                    className="glass-panel p-6 rounded-3xl border-primary-border/40 space-y-5 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Match Score Badge */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-electric-cyan uppercase">
                          {m.opportunity.category}
                        </span>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-electric-cyan/10 border border-electric-cyan/40 text-electric-cyan font-black text-xs shadow-cyanGlow">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{m.match_score}% Estimated Match</span>
                        </div>
                      </div>

                      <h4 className="text-base font-bold text-white">{m.opportunity.title}</h4>
                      <p className="text-xs text-content-secondary leading-relaxed bg-primary-card/50 p-3 rounded-xl border border-primary-border/30">
                        {m.ai_explanation}
                      </p>

                      {/* Matching Requirements */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-status-success uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Fulfills:
                        </span>
                        <ul className="text-xs text-content-secondary list-disc list-inside space-y-0.5">
                          {m.matching_requirements.map((req, i) => (
                            <li key={i}>{req}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Missing skills gap */}
                      {m.missing_skills.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-status-warning uppercase flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Recommended Skill Bridge:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {m.missing_skills.map((s, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-status-warning/10 text-status-warning border border-status-warning/30"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-primary-border/20 space-y-2">
                      <TrustBadge
                        status={m.opportunity.verification_status}
                        lastVerifiedAt={m.opportunity.last_verified_at}
                      />
                      <a
                        href={m.opportunity.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 rounded-xl bg-electric-purple text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-glow"
                      >
                        <span>View Official Application</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Saved Opportunities */}
        {activeTab === 'saved' && (
          <div className="space-y-6">
            {savedOpportunities.length === 0 ? (
              <div className="text-center py-16 glass-panel rounded-3xl border-primary-border/30 space-y-3">
                <Bookmark className="w-10 h-10 text-content-muted mx-auto" />
                <h4 className="text-base font-bold text-white">No Saved Opportunities</h4>
                <p className="text-xs text-content-secondary">
                  Bookmark scholarships or internships from the catalog to track deadlines and application status.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedOpportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="glass-panel p-6 rounded-3xl border-primary-border/40 space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-electric-purple uppercase">{opp.category}</span>
                        <button
                          onClick={() => handleToggleSave(opp)}
                          className="p-2 rounded-xl bg-status-error/10 text-status-error hover:bg-status-error hover:text-white transition-colors"
                          title="Remove bookmark"
                        >
                          <BookmarkCheck className="w-4 h-4" />
                        </button>
                      </div>
                      <h4 className="text-base font-bold text-white mt-2">{opp.title}</h4>
                      <p className="text-xs text-electric-cyan font-semibold mt-1">{opp.organization}</p>
                      <p className="text-xs text-content-secondary mt-2 line-clamp-2">{opp.description}</p>
                    </div>

                    <a
                      href={opp.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 rounded-xl bg-electric-purple text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-glow"
                    >
                      <span>Proceed with Application</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
