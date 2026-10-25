import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Globe,
  Sliders,
  Sparkles,
  User,
  LogOut,
  Menu,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { Language } from '../../types';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, textToSpeech, setTextToSpeech, isSpeaking, stopSpeaking } = useAccessibility();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'LifePath', path: '/lifepath' },
    { name: 'Discover', path: '/discover' },
    { name: 'AI Assistant', path: '/assistant' },
    { name: 'Schemes', path: '/schemes' },
    { name: 'Learning', path: '/learning' },
    { name: 'About', path: '/about' },
  ];

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setLangMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-primary-border/40 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-electric-cyan rounded-lg p-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-purple via-indigo-600 to-electric-cyan p-0.5 shadow-glow group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-primary-bg rounded-[10px] flex items-center justify-center">
              <img src="/logo.svg" alt="ELEYSORA Logo" className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-white font-sans">ELEYSORA</span>
              <span className="text-xs px-1.5 py-0.5 rounded font-bold bg-electric-cyan/20 text-electric-cyan border border-electric-cyan/30">
                AI
              </span>
            </div>
            <p className="text-[10px] text-content-muted -mt-0.5 tracking-wider uppercase font-medium">Beyond Every Barrier</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-primary-card/60 p-1.5 rounded-full border border-primary-border/30" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive(link.path)
                  ? 'bg-electric-purple text-white shadow-glow'
                  : 'text-content-secondary hover:text-white hover:bg-white/5'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {/* TTS Quick Toggle */}
          <button
            onClick={() => {
              if (isSpeaking) {
                stopSpeaking();
              } else {
                setTextToSpeech(!textToSpeech);
              }
            }}
            title={textToSpeech ? 'Text-to-speech enabled' : 'Enable text-to-speech'}
            className={`p-2 rounded-xl border transition-all ${
              textToSpeech
                ? 'bg-electric-cyan/20 text-electric-cyan border-electric-cyan/40 shadow-cyanGlow'
                : 'bg-primary-card/50 text-content-muted border-primary-border/30 hover:text-white'
            }`}
            aria-label="Text to speech toggle"
          >
            {textToSpeech ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Accessibility Quick Link */}
          <Link
            to="/accessibility"
            title="Accessibility Center"
            className="p-2 rounded-xl bg-primary-card/50 border border-primary-border/30 text-content-secondary hover:text-white hover:border-electric-purple/50 transition-all"
            aria-label="Accessibility settings"
          >
            <Sliders className="w-4 h-4" />
          </Link>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-card/50 border border-primary-border/30 text-xs font-semibold text-content-primary hover:border-electric-cyan/50 transition-all"
              aria-expanded={langMenuOpen}
              aria-label="Select language"
            >
              <Globe className="w-3.5 h-3.5 text-electric-cyan" />
              <span>{language}</span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-36 glass-panel rounded-xl shadow-2xl p-1.5 z-50 border border-primary-border/60">
                {(['English', 'Telugu', 'Hindi'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      language === lang
                        ? 'bg-electric-purple text-white'
                        : 'text-content-secondary hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {lang === 'Telugu' ? 'తెలుగు (Telugu)' : lang === 'Hindi' ? 'हिंदी (Hindi)' : 'English'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Auth Buttons */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-electric-purple to-indigo-600 text-white text-xs font-bold shadow-glow hover:opacity-95 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={logout}
                title="Sign out"
                className="p-2 rounded-xl bg-primary-card/50 border border-primary-border/30 text-content-muted hover:text-status-error hover:border-status-error/40 transition-all"
                aria-label="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-content-primary hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-electric-purple to-electric-cyan text-white text-xs font-bold shadow-glow hover:opacity-90 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl bg-primary-card border border-primary-border/40 text-content-primary"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-panel border-t border-primary-border/40 px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive(link.path)
                    ? 'bg-electric-purple text-white'
                    : 'text-content-secondary hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-primary-border/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-electric-cyan" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-primary-card text-xs text-white border border-primary-border/50 rounded-lg p-1.5"
              >
                <option value="English">English</option>
                <option value="Telugu">తెలుగు</option>
                <option value="Hindi">हिंदी</option>
              </select>
            </div>
            <Link
              to="/accessibility"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-electric-cyan underline font-medium"
            >
              Accessibility Options
            </Link>
          </div>

          <div className="pt-2">
            {isAuthenticated ? (
              <div className="flex gap-2">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center rounded-xl bg-electric-purple text-white text-sm font-semibold"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-primary-card border border-primary-border text-status-error text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center rounded-xl bg-primary-card border border-primary-border text-white text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center rounded-xl bg-electric-purple text-white text-sm font-semibold"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
