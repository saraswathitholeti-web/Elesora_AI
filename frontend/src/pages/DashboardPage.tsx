import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Bookmark,
  CheckSquare,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { api } from '../services/api';
import { DashboardOverview } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { language, speak } = useAccessibility();

  const [dashboardData, setDashboardData] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      const data = await api.getDashboardOverview();
      setDashboardData(data);
    } catch (err) {
      console.warn('Could not load dashboard overview', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout
      title={`Welcome back, ${user?.display_name || 'Learner'}`}
      subtitle="Track your active LifePath, saved opportunities, daily action cards, and verified deadlines."
    >
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border-primary-border/40 relative overflow-hidden bg-gradient-to-r from-electric-purple/15 via-primary-card to-electric-cyan/10">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-electric-cyan flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-electric-purple" />
              Theme 3: Beyond the Screen
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Where Intelligence Meets Inclusion.
            </h3>
            <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
              Every step you take on ELEYSORA AI brings you closer to your goals. Access tailored AI roadmaps, verified opportunities, and simplified documents without barriers.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Link
                to="/lifepath"
                className="px-4 py-2 rounded-xl bg-electric-purple text-white text-xs font-bold shadow-glow hover:opacity-90 transition-all flex items-center gap-1.5"
              >
                <span>Continue LifePath</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/discover"
                className="px-4 py-2 rounded-xl glass-panel border-primary-border text-xs font-semibold text-content-primary hover:text-white"
              >
                Browse Opportunities
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Metric Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: LifePath Progress */}
          <div className="glass-panel p-5 rounded-3xl border-primary-border/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-content-muted">Active LifePath</span>
              <Compass className="w-4 h-4 text-electric-purple" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">
                {dashboardData?.active_lifepath?.progress_percentage ?? 0}%
              </p>
              <p className="text-xs text-content-secondary truncate mt-0.5">
                {dashboardData?.active_lifepath?.career_goal || 'Goal Not Configured'}
              </p>
            </div>
            <div className="w-full h-1.5 rounded-full bg-primary-bg overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-electric-purple to-electric-cyan rounded-full transition-all"
                style={{ width: `${dashboardData?.active_lifepath?.progress_percentage ?? 0}%` }}
              />
            </div>
          </div>

          {/* Card 2: Saved Opportunities */}
          <div className="glass-panel p-5 rounded-3xl border-primary-border/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-content-muted">Saved Opportunities</span>
              <Bookmark className="w-4 h-4 text-electric-cyan" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">
                {dashboardData?.saved_opportunities_count ?? 0}
              </p>
              <p className="text-xs text-content-secondary mt-0.5">
                Verified scholarships & internships
              </p>
            </div>
            <Link to="/discover" className="text-xs text-electric-cyan font-bold hover:underline block pt-0.5">
              View Bookmarks →
            </Link>
          </div>

          {/* Card 3: Action Cards */}
          <div className="glass-panel p-5 rounded-3xl border-primary-border/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-content-muted">Smart Action Cards</span>
              <CheckSquare className="w-4 h-4 text-status-success" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">
                  {dashboardData?.pending_actions_count ?? 0}
                </span>
                <span className="text-xs text-content-muted">Pending</span>
              </div>
              <p className="text-xs text-status-success font-semibold mt-0.5">
                {dashboardData?.completed_actions_count ?? 0} Tasks Completed
              </p>
            </div>
            <Link to="/action-cards" className="text-xs text-status-success font-bold hover:underline block pt-0.5">
              Open Task Board →
            </Link>
          </div>

          {/* Card 4: Learning Topics */}
          <div className="glass-panel p-5 rounded-3xl border-primary-border/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-content-muted">Learning Hub</span>
              <BookOpen className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">
                {dashboardData?.learning_topics_count ?? 0}
              </p>
              <p className="text-xs text-content-secondary mt-0.5">
                Active study subjects
              </p>
            </div>
            <Link to="/learning" className="text-xs text-amber-400 font-bold hover:underline block pt-0.5">
              Start Learning Quiz →
            </Link>
          </div>
        </div>

        {/* 2-Column Main Section: Left = Deadlines & Activity, Right = AI Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 cols): Upcoming Deadlines & Recent Activity */}
          <div className="lg:col-span-7 space-y-6">
            {/* Upcoming Deadlines */}
            <div className="glass-panel p-6 rounded-3xl border-primary-border/40 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-electric-cyan" />
                  Upcoming Deadlines
                </span>
                <Link to="/discover" className="text-xs text-electric-cyan hover:underline">
                  Find More
                </Link>
              </h4>

              {dashboardData?.upcoming_deadlines && dashboardData.upcoming_deadlines.length > 0 ? (
                <div className="space-y-2.5">
                  {dashboardData.upcoming_deadlines.map((dl, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-primary-card/50 border border-primary-border/30 flex items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <p className="font-bold text-white">{dl.title}</p>
                        <p className="text-content-muted text-[11px] mt-0.5">{dl.source} • {dl.type}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="px-2.5 py-1 rounded-lg bg-status-warning/15 text-status-warning font-semibold text-[11px]">
                          {dl.deadline ? new Date(dl.deadline).toLocaleDateString() : 'Upcoming'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-content-muted py-4 text-center">
                  No upcoming deadlines recorded. Save opportunities or set Action Card dates.
                </p>
              )}
            </div>

            {/* Recent Activity */}
            <div className="glass-panel p-6 rounded-3xl border-primary-border/40 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-status-success" />
                Recent Activity
              </h4>

              <div className="space-y-3">
                {(dashboardData?.recent_activity || [
                  { action: 'Session Started', detail: 'Signed in securely', timestamp: 'Just now' },
                ]).map((act, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs border-b border-primary-border/20 pb-2.5 last:border-0 last:pb-0">
                    <span className="w-2 h-2 rounded-full bg-electric-cyan mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-bold text-white">{act.action}</p>
                      <p className="text-content-secondary">{act.detail}</p>
                    </div>
                    <span className="text-[10px] text-content-muted">{act.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): AI Recommendations */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel p-6 rounded-3xl border-primary-border/40 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-electric-purple" />
                Personalized AI Recommendations
              </h4>

              <div className="space-y-3">
                {(dashboardData?.ai_recommendations || [
                  {
                    category: 'LifePath Next Step',
                    text: 'Master Python asynchronous programming and database interaction to strengthen backend competencies.',
                  },
                  {
                    category: 'Opportunity Match',
                    text: 'Explore Google Summer of Code and AICTE virtual internships in the Discover tab.',
                  },
                ]).map((rec, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-primary-card/50 border border-primary-border/30 space-y-1.5 text-xs"
                  >
                    <span className="text-[10px] font-bold text-electric-cyan uppercase tracking-wider">
                      {rec.category}
                    </span>
                    <p className="text-content-secondary leading-relaxed">{rec.text}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  to="/assistant"
                  className="w-full py-2.5 rounded-xl glass-panel border-primary-border text-center text-xs font-bold text-content-primary hover:text-white hover:border-electric-cyan transition-all block"
                >
                  Consult AI Assistant for Custom Plan →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
