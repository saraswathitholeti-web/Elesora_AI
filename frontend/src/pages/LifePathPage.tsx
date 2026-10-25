import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Compass,
  CheckCircle,
  Circle,
  Clock,
  Sparkles,
  RefreshCw,
  BookOpen,
  FolderGit2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Layers,
  ArrowRight,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { api } from '../services/api';
import { LifePath, Milestone } from '../types';

export const LifePathPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialGoal = searchParams.get('goal') || '';
  const { user } = useAuth();
  const { language, speak } = useAccessibility();

  const [activeLifePath, setActiveLifePath] = useState<LifePath | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showGeneratorForm, setShowGeneratorForm] = useState(!initialGoal);

  // Form State
  const [careerGoal, setCareerGoal] = useState(initialGoal || user?.career_goal || 'AI & Machine Learning Engineer');
  const [educationLevel, setEducationLevel] = useState(user?.education_level || 'B.Tech / Undergraduate');
  const [currentSkills, setCurrentSkills] = useState<string>(user?.skills?.join(', ') || 'Python, Problem Solving');
  const [studyHours, setStudyHours] = useState(7);
  const [budgetLevel, setBudgetLevel] = useState('Free / Low Cost');
  const [challenges, setChallenges] = useState('Limited financial budget and access to high-end hardware');

  useEffect(() => {
    loadUserLifePaths();
  }, []);

  useEffect(() => {
    if (initialGoal) {
      setCareerGoal(initialGoal);
      handleGenerate();
    }
  }, [initialGoal]);

  const loadUserLifePaths = async () => {
    try {
      const paths = await api.getLifePaths();
      if (paths.length > 0) {
        setActiveLifePath(paths[0]);
        setShowGeneratorForm(false);
      }
    } catch (err) {
      console.warn('Could not load existing lifepaths', err);
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!careerGoal.trim()) return;

    setIsLoading(true);
    try {
      const skillsArr = currentSkills.split(',').map((s) => s.trim()).filter(Boolean);
      const lp = await api.generateLifePath({
        career_goal: careerGoal,
        education_level: educationLevel,
        current_skills: skillsArr,
        study_hours_per_week: studyHours,
        budget_level: budgetLevel,
        preferred_language: language,
        optional_challenges: challenges,
      });
      setActiveLifePath(lp);
      setShowGeneratorForm(false);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    } catch (err: any) {
      console.error('Error generating roadmap', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMilestone = async (milestone: Milestone) => {
    if (!activeLifePath || !milestone.id) return;
    setIsUpdating(true);

    const nextStatus: 'pending' | 'completed' = milestone.status === 'completed' ? 'pending' : 'completed';
    try {
      await api.updateMilestoneStatus(milestone.id, nextStatus);

      // Trigger celebratory confetti if completing
      if (nextStatus === 'completed') {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
        speak(`Congratulations! You have completed: ${milestone.title}`);
      }

      // Update state locally
      const updatedMilestones = activeLifePath.milestones.map((m) =>
        m.id === milestone.id ? { ...m, status: nextStatus } : m
      );
      const completedCount = updatedMilestones.filter((m) => m.status === 'completed').length;
      const progress = Math.round((completedCount / updatedMilestones.length) * 100);

      setActiveLifePath({
        ...activeLifePath,
        milestones: updatedMilestones,
        progress_percentage: progress,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!activeLifePath) return;
    setIsLoading(true);
    try {
      const regenerated = await api.regenerateLifePath(activeLifePath.id);
      setActiveLifePath(regenerated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="ELEYSORA LifePath"
      subtitle="Signature personalized AI career roadmap generator with structured milestones and progress tracking."
    >
      <div className="space-y-8">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5 rounded-3xl border-primary-border/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-electric-purple to-indigo-600 flex items-center justify-center text-white shadow-glow shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">
                  {activeLifePath?.career_goal || 'AI Career Roadmap'}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-electric-cyan/20 text-electric-cyan border border-electric-cyan/30">
                  {activeLifePath?.education_level || 'Custom Path'}
                </span>
              </div>
              <p className="text-xs text-content-secondary mt-0.5">
                {activeLifePath?.roadmap_data?.overview || 'Personalized step-by-step guidance designed to overcome learning barriers.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowGeneratorForm(!showGeneratorForm)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl glass-panel border-primary-border text-xs font-bold text-content-primary hover:text-white hover:border-electric-cyan transition-all"
            >
              {showGeneratorForm ? 'Close Form' : 'New Goal / Edit'}
            </button>
            {activeLifePath && (
              <button
                onClick={handleRegenerate}
                disabled={isLoading}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-electric-purple text-white text-xs font-bold shadow-glow hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Regenerate</span>
              </button>
            )}
          </div>
        </div>

        {/* Generator Form Modal / Collapsible */}
        {showGeneratorForm && (
          <form
            onSubmit={handleGenerate}
            className="glass-panel p-6 sm:p-8 rounded-3xl border-primary-border/50 shadow-2xl space-y-6"
          >
            <div className="border-b border-primary-border/30 pb-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-electric-cyan" />
                Customize Your LifePath Blueprint
              </h4>
              <p className="text-xs text-content-secondary mt-1">
                Tell us about your background, available time, and constraints so Gemini can tailor a 100% barrier-free curriculum.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-content-secondary">Target Career Goal *</label>
                <input
                  type="text"
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  placeholder="e.g. AI Engineer, Full-Stack Developer, Cloud Architect"
                  required
                  className="w-full bg-primary-bg/80 border border-primary-border/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-electric-cyan"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-content-secondary">Current Education Level</label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full bg-primary-bg/80 border border-primary-border/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-electric-cyan"
                >
                  <option value="High School / 12th">High School / 12th Grade</option>
                  <option value="Diploma / Polytechnic">Diploma / Polytechnic</option>
                  <option value="B.Tech / Undergraduate">B.Tech / Undergraduate</option>
                  <option value="Postgraduate / Master's">Postgraduate / Master's</option>
                  <option value="Self-Taught / Career Switcher">Self-Taught / Career Switcher</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-content-secondary">Current Skills (comma separated)</label>
                <input
                  type="text"
                  value={currentSkills}
                  onChange={(e) => setCurrentSkills(e.target.value)}
                  placeholder="e.g. Python, Basic HTML, Math"
                  className="w-full bg-primary-bg/80 border border-primary-border/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-electric-cyan"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-content-secondary">
                  Weekly Study Hours ({studyHours} hours/week)
                </label>
                <input
                  type="range"
                  min="3"
                  max="35"
                  step="1"
                  value={studyHours}
                  onChange={(e) => setStudyHours(parseInt(e.target.value))}
                  className="w-full accent-electric-purple"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-content-secondary">Resource Budget Preference</label>
                <select
                  value={budgetLevel}
                  onChange={(e) => setBudgetLevel(e.target.value)}
                  className="w-full bg-primary-bg/80 border border-primary-border/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-electric-cyan"
                >
                  <option value="Free / Low Cost">100% Free / Open Access Only</option>
                  <option value="Low Cost (Under INR 2000)">Low Cost (Under ₹2,000 / $25)</option>
                  <option value="Flexible">Flexible Budget</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-content-secondary">Key Barriers / Obstacles Facing You</label>
                <input
                  type="text"
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  placeholder="e.g. Financial limits, English difficulty, rural internet speed"
                  className="w-full bg-primary-bg/80 border border-primary-border/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-electric-cyan"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowGeneratorForm(false)}
                className="px-5 py-2.5 rounded-xl glass-panel text-xs font-semibold text-content-secondary hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-electric-purple to-electric-cyan text-white text-xs font-bold shadow-glow hover:opacity-90 disabled:opacity-50"
              >
                {isLoading ? 'Synthesizing LifePath...' : 'Generate Personalized Pathway'}
              </button>
            </div>
          </form>
        )}

        {/* LifePath Overview Cards */}
        {activeLifePath && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border-primary-border/30 space-y-2">
              <span className="text-xs text-content-muted font-bold uppercase tracking-wider">Overall Progress</span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-white">{activeLifePath.progress_percentage}%</span>
                <span className="text-xs text-electric-cyan font-semibold">
                  {activeLifePath.milestones.filter((m) => m.status === 'completed').length} / {activeLifePath.milestones.length} Done
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-primary-bg overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-electric-purple to-electric-cyan transition-all duration-500 rounded-full"
                  style={{ width: `${activeLifePath.progress_percentage}%` }}
                />
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border-primary-border/30 space-y-2">
              <span className="text-xs text-content-muted font-bold uppercase tracking-wider">Estimated Timeline</span>
              <p className="text-2xl font-black text-white">
                {activeLifePath.roadmap_data?.estimated_total_months || 6} Months
              </p>
              <p className="text-[11px] text-content-secondary">
                At {activeLifePath.study_hours_per_week || 7} hours per week
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border-primary-border/30 space-y-2">
              <span className="text-xs text-content-muted font-bold uppercase tracking-wider">Required Core Skills</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {(activeLifePath.roadmap_data?.required_core_skills || ['Python', 'Data Structures', 'ML Algorithms']).slice(0, 3).map((sk) => (
                  <span key={sk} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-primary-border/40 text-content-secondary">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border-primary-border/30 space-y-2">
              <span className="text-xs text-content-muted font-bold uppercase tracking-wider">Next Step</span>
              <p className="text-xs font-semibold text-electric-cyan line-clamp-2">
                {activeLifePath.roadmap_data?.next_recommended_action || 'Complete current milestone exercises'}
              </p>
            </div>
          </div>
        )}

        {/* Roadmap Milestones Timeline */}
        {activeLifePath && (
          <div className="space-y-6">
            <h4 className="text-lg font-black text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-electric-purple" />
              Interactive Roadmap Milestones
            </h4>

            <div className="space-y-4">
              {activeLifePath.milestones.map((milestone, idx) => {
                const isCompleted = milestone.status === 'completed';
                return (
                  <div
                    key={milestone.id || idx}
                    className={`glass-panel p-6 rounded-3xl border transition-all duration-300 relative ${
                      isCompleted
                        ? 'border-status-success/40 bg-status-success/[0.03]'
                        : 'border-primary-border/40 glass-panel-hover'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      {/* Checkbox & Title */}
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => toggleMilestone(milestone)}
                          disabled={isUpdating}
                          className="mt-1 transition-transform active:scale-90"
                          title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-6 h-6 text-status-success" />
                          ) : (
                            <Circle className="w-6 h-6 text-content-muted hover:text-electric-cyan transition-colors" />
                          )}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-electric-purple">
                              Stage {milestone.sequence_number}
                            </span>
                            <span className="text-content-muted text-xs">•</span>
                            <span className="text-xs text-content-muted flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              ~{milestone.estimated_duration_days} Days
                            </span>
                          </div>
                          <h5 className={`text-base font-bold mt-1 ${isCompleted ? 'line-through text-content-muted' : 'text-white'}`}>
                            {milestone.title}
                          </h5>
                          <p className="text-xs text-content-secondary mt-1 leading-relaxed max-w-3xl">
                            {milestone.description}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-bold border ${
                            isCompleted
                              ? 'bg-status-success/10 text-status-success border-status-success/30'
                              : milestone.status === 'in_progress'
                              ? 'bg-electric-cyan/10 text-electric-cyan border-electric-cyan/30'
                              : 'bg-white/5 text-content-muted border-primary-border/30'
                          }`}
                        >
                          {isCompleted ? 'Completed' : milestone.status === 'in_progress' ? 'In Progress' : 'Pending'}
                        </span>
                      </div>
                    </div>

                    {/* Resources & Capstone Project */}
                    <div className="mt-5 pt-4 border-t border-primary-border/20 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Recommended Free Resources */}
                      <div className="space-y-2">
                        <span className="font-bold text-content-primary flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-electric-cyan" />
                          Curated Free Resources:
                        </span>
                        <div className="space-y-1">
                          {(milestone.recommended_resources && milestone.recommended_resources.length > 0
                            ? milestone.recommended_resources
                            : [
                                { name: 'Official Documentation & Guides', type: 'Docs', url: 'https://developer.mozilla.org' },
                                { name: 'FreeCodeCamp Interactive Exercises', type: 'Course', url: 'https://freecodecamp.org' },
                              ]
                          ).map((res, i) => (
                            <a
                              key={i}
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-2 rounded-xl bg-primary-card/40 border border-primary-border/30 hover:border-electric-cyan/40 hover:text-white transition-all text-content-secondary"
                            >
                              <span className="truncate mr-2 font-medium">{res.name}</span>
                              <ExternalLink className="w-3 h-3 shrink-0 text-electric-cyan" />
                            </a>
                          ))}
                        </div>
                      </div>

                      {/* Suggested Project */}
                      <div className="space-y-2">
                        <span className="font-bold text-content-primary flex items-center gap-1.5">
                          <FolderGit2 className="w-3.5 h-3.5 text-electric-purple" />
                          Suggested Milestone Project:
                        </span>
                        <div className="p-3 rounded-xl bg-primary-card/40 border border-primary-border/30 text-content-secondary leading-relaxed">
                          {milestone.suggested_project || 'Build a functioning modular project applying this stage concepts to showcase on GitHub.'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
