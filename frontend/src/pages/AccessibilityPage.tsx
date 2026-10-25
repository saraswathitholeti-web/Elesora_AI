import React from 'react';
import {
  Sliders,
  Type,
  SunMoon,
  Move,
  Volume2,
  BookOpen,
  Globe,
  Keyboard,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { Language } from '../types';

export const AccessibilityPage: React.FC = () => {
  const {
    language,
    setLanguage,
    fontScale,
    setFontScale,
    highContrast,
    setHighContrast,
    reducedMotion,
    setReducedMotion,
    textToSpeech,
    setTextToSpeech,
    simplifiedMode,
    setSimplifiedMode,
    speak,
  } = useAccessibility();

  const handleTestSpeech = () => {
    speak('ELEYSORA AI welcomes you to the Accessibility Center. All options here conform to WCAG 2.2 AA standards.');
  };

  return (
    <DashboardLayout
      title="Accessibility Center"
      subtitle="Tailor your visual, cognitive, and assistive reading experience according to WCAG 2.2 AA guidelines."
    >
      <div className="space-y-8 max-w-5xl">
        {/* Compliance statement banner */}
        <div className="glass-panel p-6 rounded-3xl border-electric-cyan/40 bg-electric-cyan/5 flex items-start gap-4 shadow-cyanGlow">
          <div className="w-10 h-10 rounded-2xl bg-electric-cyan text-primary-bg font-extrabold flex items-center justify-center shrink-0">
            AA
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Universal Inclusion Standard: WCAG 2.2 AA Compliant</span>
              <CheckCircle2 className="w-4 h-4 text-status-success" />
            </h4>
            <p className="text-xs text-content-secondary leading-relaxed">
              ELEYSORA AI ensures high text contrast, full keyboard navigation with visible focus indicators, screen-reader markup, and voice input fallbacks across English, Telugu, and Hindi.
            </p>
          </div>
        </div>

        {/* Accessibility Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Font Size Scaling */}
          <div className="glass-panel p-6 rounded-3xl border-primary-border/40 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-electric-purple/20 text-electric-purple flex items-center justify-center">
                <Type className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Font Size Scaling</h4>
                <p className="text-[11px] text-content-muted">Adjust typography scaling across the interface</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs text-content-secondary font-bold">
                <span>Default (100%)</span>
                <span>Current: {Math.round(fontScale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.9"
                max="1.3"
                step="0.05"
                value={fontScale}
                onChange={(e) => setFontScale(parseFloat(e.target.value))}
                className="w-full accent-electric-purple cursor-pointer"
                aria-label="Font scale adjustment"
              />
              <div className="flex justify-between text-[10px] text-content-muted">
                <span>90% Compact</span>
                <span>100% Standard</span>
                <span>115% Comfortable</span>
                <span>130% Large Print</span>
              </div>
            </div>
          </div>

          {/* 2. High Contrast Mode */}
          <div className="glass-panel p-6 rounded-3xl border-primary-border/40 space-y-4 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-electric-cyan/20 text-electric-cyan flex items-center justify-center">
                <SunMoon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">High Contrast Mode</h4>
                <p className="text-[11px] text-content-muted">Maximum contrast ratio for low-vision readers</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-content-secondary">
                {highContrast ? 'High Contrast Enabled (Pure Black / White)' : 'Standard Theme Active'}
              </span>
              <button
                onClick={() => setHighContrast(!highContrast)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  highContrast
                    ? 'bg-white text-black font-black'
                    : 'glass-panel text-content-secondary hover:text-white border-primary-border'
                }`}
                aria-pressed={highContrast}
              >
                {highContrast ? 'Disable Contrast' : 'Enable High Contrast'}
              </button>
            </div>
          </div>

          {/* 3. Reduced Motion */}
          <div className="glass-panel p-6 rounded-3xl border-primary-border/40 space-y-4 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-status-warning/20 text-status-warning flex items-center justify-center">
                <Move className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Reduced Motion</h4>
                <p className="text-[11px] text-content-muted">Eliminates dynamic transitions and background movement</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-content-secondary">
                {reducedMotion ? 'All animations disabled' : 'Subtle animations active'}
              </span>
              <button
                onClick={() => setReducedMotion(!reducedMotion)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  reducedMotion
                    ? 'bg-status-warning text-primary-bg'
                    : 'glass-panel text-content-secondary hover:text-white border-primary-border'
                }`}
                aria-pressed={reducedMotion}
              >
                {reducedMotion ? 'Motion Off' : 'Reduce Motion'}
              </button>
            </div>
          </div>

          {/* 4. Text-to-Speech Voice Aid */}
          <div className="glass-panel p-6 rounded-3xl border-primary-border/40 space-y-4 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-electric-purple/20 text-electric-purple flex items-center justify-center">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Text-to-Speech Aid</h4>
                <p className="text-[11px] text-content-muted">Auditory read-back for responses & documents</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleTestSpeech}
                className="text-xs text-electric-cyan underline font-semibold hover:opacity-80"
              >
                Play Voice Sample
              </button>
              <button
                onClick={() => setTextToSpeech(!textToSpeech)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  textToSpeech
                    ? 'bg-electric-cyan text-primary-bg'
                    : 'glass-panel text-content-secondary hover:text-white border-primary-border'
                }`}
                aria-pressed={textToSpeech}
              >
                {textToSpeech ? 'Audio Enabled' : 'Enable TTS'}
              </button>
            </div>
          </div>

          {/* 5. Simplified Mode */}
          <div className="glass-panel p-6 rounded-3xl border-primary-border/40 space-y-4 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-status-success/20 text-status-success flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Simplified Mode</h4>
                <p className="text-[11px] text-content-muted">Enhances letter-spacing and line heights for readability</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-content-secondary">
                {simplifiedMode ? 'Comfortable reading mode active' : 'Default layout'}
              </span>
              <button
                onClick={() => setSimplifiedMode(!simplifiedMode)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  simplifiedMode
                    ? 'bg-status-success text-primary-bg'
                    : 'glass-panel text-content-secondary hover:text-white border-primary-border'
                }`}
                aria-pressed={simplifiedMode}
              >
                {simplifiedMode ? 'Active' : 'Enable'}
              </button>
            </div>
          </div>

          {/* 6. Language Selection */}
          <div className="glass-panel p-6 rounded-3xl border-primary-border/40 space-y-4 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-electric-cyan/20 text-electric-cyan flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Default Interface Language</h4>
                <p className="text-[11px] text-content-muted">Select English, Telugu, or Hindi</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              {(['English', 'Telugu', 'Hindi'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    language === lang
                      ? 'bg-electric-purple text-white shadow-glow'
                      : 'glass-panel text-content-secondary hover:text-white border-primary-border'
                  }`}
                >
                  {lang === 'Telugu' ? 'తెలుగు' : lang === 'Hindi' ? 'हिंदी' : 'English'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Keyboard Navigation Helper */}
        <div className="glass-panel p-6 rounded-3xl border-primary-border/40 space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-electric-cyan" />
            Keyboard Navigation Accessibility Map
          </h4>
          <p className="text-xs text-content-secondary leading-relaxed">
            All interactive elements feature visible 2px cyan focus indicators. You can navigate the complete platform using standard accessible keyboard shortcuts:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
            <div className="p-3 rounded-xl bg-primary-card/50 border border-primary-border/30">
              <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-white">Tab</kbd>
              <span className="text-content-secondary ml-2">Move to next element</span>
            </div>
            <div className="p-3 rounded-xl bg-primary-card/50 border border-primary-border/30">
              <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-white">Shift + Tab</kbd>
              <span className="text-content-secondary ml-2">Move to previous element</span>
            </div>
            <div className="p-3 rounded-xl bg-primary-card/50 border border-primary-border/30">
              <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-white">Enter / Space</kbd>
              <span className="text-content-secondary ml-2">Activate link or button</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
