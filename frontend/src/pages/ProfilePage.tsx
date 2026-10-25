import React, { useState } from 'react';
import { User, Mail, GraduationCap, Compass, Globe, Sparkles, Check } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { Language } from '../types';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { language, setLanguage } = useAccessibility();

  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [educationLevel, setEducationLevel] = useState(user?.education_level || 'B.Tech / Undergraduate');
  const [careerGoal, setCareerGoal] = useState(user?.career_goal || 'AI Engineer');
  const [skillsStr, setSkillsStr] = useState(user?.skills?.join(', ') || 'Python, Problem Solving, Git');
  const [preferredLang, setPreferredLang] = useState<Language>(user?.preferred_language || language);
  const [isSaved, setIsSaved] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const skills = skillsStr.split(',').map((s) => s.trim()).filter(Boolean);
      await updateProfile({
        display_name: displayName,
        education_level: educationLevel,
        career_goal: careerGoal,
        skills,
        preferred_language: preferredLang,
      });
      setLanguage(preferredLang);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DashboardLayout
      title="User Profile Management"
      subtitle="Keep your educational baseline and skills up to date for precise AI opportunity matching."
    >
      <div className="max-w-3xl glass-panel p-6 sm:p-8 rounded-3xl border-primary-border/40 shadow-2xl space-y-6">
        <div className="flex items-center gap-4 border-b border-primary-border/30 pb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-electric-purple to-electric-cyan flex items-center justify-center text-white text-2xl font-black shadow-glow">
            {displayName.charAt(0).toUpperCase() || 'E'}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{displayName || 'ELEYSORA Learner'}</h3>
            <p className="text-xs text-content-secondary mt-0.5">{user?.email || 'Registered User'}</p>
          </div>
        </div>

        {isSaved && (
          <div className="p-3 rounded-xl bg-status-success/15 border border-status-success/30 text-status-success text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>Profile details updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-content-secondary">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
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

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-content-secondary">Target Career Goal</label>
              <input
                type="text"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                placeholder="e.g. AI & Machine Learning Engineer"
                required
                className="w-full bg-primary-bg/80 border border-primary-border/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-electric-cyan"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-content-secondary">Your Current Skills (comma separated)</label>
              <input
                type="text"
                value={skillsStr}
                onChange={(e) => setSkillsStr(e.target.value)}
                placeholder="e.g. Python, Git, SQL, Problem Solving"
                className="w-full bg-primary-bg/80 border border-primary-border/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-electric-cyan"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-content-secondary">Preferred Language</label>
              <select
                value={preferredLang}
                onChange={(e) => setPreferredLang(e.target.value as Language)}
                className="w-full bg-primary-bg/80 border border-primary-border/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-electric-cyan"
              >
                <option value="English">English</option>
                <option value="Telugu">తెలుగు (Telugu)</option>
                <option value="Hindi">हिंदी (Hindi)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isUpdating}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-electric-purple to-electric-cyan text-white text-xs font-bold shadow-glow hover:opacity-90 disabled:opacity-50"
            >
              {isUpdating ? 'Saving Changes...' : 'Save Profile Details'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
