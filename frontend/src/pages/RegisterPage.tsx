import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Lock, Mail, User, AlertCircle, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Language } from '../types';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<Language>('English');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setErrorMsg(null);
    setIsLoading(true);

    try {
      await register(email, password, displayName || undefined, preferredLanguage);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-bg flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 py-16">
        <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl border-primary-border/50 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-electric-purple to-electric-cyan p-0.5 mx-auto shadow-glow">
              <div className="w-full h-full bg-primary-bg rounded-[14px] flex items-center justify-center">
                <img src="/logo.svg" alt="ELEYSORA" className="w-7 h-7" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-white">Join ELEYSORA AI</h2>
            <p className="text-xs text-content-secondary">
              Create your account to break learning barriers and discover life-changing opportunities.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-status-error/15 border border-status-error/30 text-status-error text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-content-secondary">Full Name / Display Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  required
                  className="w-full bg-primary-bg/80 border border-primary-border/50 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-content-muted focus:outline-none focus:border-electric-cyan"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-content-secondary">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-primary-bg/80 border border-primary-border/50 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-content-muted focus:outline-none focus:border-electric-cyan"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-content-secondary">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full bg-primary-bg/80 border border-primary-border/50 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-content-muted focus:outline-none focus:border-electric-cyan"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-content-secondary">Preferred Assistant Language</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value as Language)}
                  className="w-full bg-primary-bg/80 border border-primary-border/50 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-electric-cyan"
                >
                  <option value="English">English</option>
                  <option value="Telugu">తెలుగు (Telugu)</option>
                  <option value="Hindi">हिंदी (Hindi)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-electric-purple to-electric-cyan text-white text-xs font-bold shadow-glow hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Creating Account...' : 'Get Started with ELEYSORA'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-content-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-electric-cyan font-bold hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
