import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Lightbulb,
  BookOpen,
  CheckSquare,
  HeartHandshake,
  CheckCircle2,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { api } from '../services/api';

export const BarrierToBridgePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, speak } = useAccessibility();

  const [userGoal, setUserGoal] = useState('I want to learn coding and become an AI engineer');
  const [reportedBarrier, setReportedBarrier] = useState(
    'I cannot afford expensive bootcamps and I struggle with technical English'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [isSavingActions, setIsSavingActions] = useState(false);
  const [savedSuccessNotice, setSavedSuccessNotice] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userGoal.trim() || !reportedBarrier.trim()) return;

    setIsLoading(true);
    setSavedSuccessNotice(null);
    try {
      const result = await api.analyzeBarrier({
        user_goal: userGoal,
        reported_barrier: reportedBarrier,
        preferred_language: language,
      });
      setAnalysis(result);
      speak(result.empowerment_message);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToActions = async () => {
    if (!analysis) return;
    setIsSavingActions(true);
    try {
      const res = await api.convertBarrierToActions(analysis);
      setSavedSuccessNotice(`Successfully created ${res.action_cards_created} Smart Action Cards!`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingActions(false);
    }
  };

  return (
    <DashboardLayout
      title="Barrier-to-Bridge Intelligence"
      subtitle="A unique AI problem-solving engine transforming real-world constraints into concrete pathways."
    >
      <div className="space-y-8">
        {/* Input Panel */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border-primary-border/40 shadow-2xl space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-electric-cyan uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-electric-purple" />
            <span>Problem-Solving Matrix</span>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-status-success" />
                  What is your goal or aspiration? *
                </label>
                <input
                  type="text"
                  value={userGoal}
                  onChange={(e) => setUserGoal(e.target.value)}
                  placeholder="e.g. Master Machine Learning, land an internship, apply for university"
                  required
                  className="w-full bg-primary-bg/80 border border-primary-border/50 rounded-2xl px-4 py-3 text-xs text-white placeholder-content-muted focus:outline-none focus:border-electric-cyan"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-status-error" />
                  What obstacle or barrier are you facing? *
                </label>
                <input
                  type="text"
                  value={reportedBarrier}
                  onChange={(e) => setReportedBarrier(e.target.value)}
                  placeholder="e.g. No money for paid courses, English difficulty, lack of high-end PC"
                  required
                  className="w-full bg-primary-bg/80 border border-primary-border/50 rounded-2xl px-4 py-3 text-xs text-white placeholder-content-muted focus:outline-none focus:border-electric-cyan"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-content-muted">
                ELEYSORA analyzes financial, linguistic, accessibility, and infrastructural bottlenecks.
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-electric-purple to-electric-cyan text-white text-xs font-extrabold shadow-glow hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <span>{isLoading ? 'Synthesizing Bridge...' : 'Build My Bridge'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Results Presentation */}
        {analysis && (
          <div className="space-y-6">
            {/* Empowerment Message */}
            <div className="glass-panel p-6 rounded-3xl border-electric-purple/40 bg-gradient-to-r from-electric-purple/10 via-transparent to-electric-cyan/10 shadow-glow flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-electric-purple text-white flex items-center justify-center shrink-0">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-electric-cyan">
                  {analysis.barrier_category || 'Identified Obstacle'}
                </span>
                <p className="text-sm font-semibold text-white leading-relaxed">
                  "{analysis.empowerment_message}"
                </p>
              </div>
            </div>

            {/* Bridge Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Possible Solutions */}
              <div className="glass-panel p-6 rounded-3xl border-primary-border/40 space-y-4">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-electric-cyan" />
                  Viable Bridge Solutions
                </h4>
                <ul className="space-y-2.5">
                  {(analysis.possible_solutions || []).map((sol: string, idx: number) => (
                    <li
                      key={idx}
                      className="p-3 rounded-2xl bg-primary-card/50 border border-primary-border/30 text-xs text-content-primary leading-relaxed flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                      <span>{sol}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card 2: Recommended Zero-Cost Resources */}
              <div className="glass-panel p-6 rounded-3xl border-primary-border/40 space-y-4">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-electric-purple" />
                  Recommended Access Channels
                </h4>
                <div className="space-y-2.5">
                  {(analysis.recommended_resources || []).map((res: any, idx: number) => (
                    <a
                      key={idx}
                      href={res.url || 'https://google.com'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-primary-card/50 border border-primary-border/30 hover:border-electric-cyan text-xs text-content-primary transition-all group"
                    >
                      <div>
                        <p className="font-bold text-white group-hover:text-electric-cyan transition-colors">
                          {res.title}
                        </p>
                        <span className="text-[10px] text-content-muted">{res.type}</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-electric-cyan shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Plan & Task Conversion */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border-primary-border/40 space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-status-success" />
                    Bridge Execution Plan
                  </h4>
                  <p className="text-xs text-content-secondary mt-1">
                    Convert these recommended actions directly into tracked personal tasks.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleSaveToActions}
                    disabled={isSavingActions}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-electric-purple to-indigo-600 text-white text-xs font-bold shadow-glow hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>{isSavingActions ? 'Saving Tasks...' : 'Add to My Action Cards'}</span>
                  </button>

                  <button
                    onClick={() => navigate('/lifepath')}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl glass-panel border-primary-border text-xs font-bold text-content-primary hover:text-white hover:border-electric-cyan transition-all"
                  >
                    View LifePath
                  </button>
                </div>
              </div>

              {savedSuccessNotice && (
                <div className="p-3 rounded-xl bg-status-success/10 border border-status-success/30 text-status-success text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{savedSuccessNotice}</span>
                </div>
              )}

              {/* Action items list */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(analysis.suggested_actions || []).map((action: any, i: number) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-primary-card/50 border border-primary-border/30 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-electric-purple/20 text-electric-purple uppercase">
                        {action.priority || 'High'} Priority
                      </span>
                      <span className="text-[10px] text-content-muted">{action.timeline || 'Immediate'}</span>
                    </div>
                    <p className="font-semibold text-white leading-relaxed">{action.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
