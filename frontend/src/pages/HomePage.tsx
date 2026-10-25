import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Search,
  Bot,
  FileText,
  Sliders,
  CheckSquare,
  BookOpen,
  Landmark,
  Users,
  Leaf,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Globe2,
  Cpu,
  GraduationCap,
  Accessibility,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useAccessibility } from '../contexts/AccessibilityContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { language, speak } = useAccessibility();
  const [demoGoal, setDemoGoal] = useState('I want to become an AI engineer, but I need free learning resources.');

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (demoGoal.trim()) {
      navigate(`/lifepath?goal=${encodeURIComponent(demoGoal.trim())}`);
    }
  };

  const problemCards = [
    {
      title: 'Language Barriers',
      desc: 'Most advanced technical tutorials, scholarship portals, and official resources exist only in dense English.',
      icon: Globe2,
      tag: 'Multilingual AI Bridge',
    },
    {
      title: 'Educational Inequality',
      desc: 'Expensive bootcamps and paywalled courses block millions of motivated students from entering tech fields.',
      icon: GraduationCap,
      tag: 'Zero-Cost Paths',
    },
    {
      title: 'Career Uncertainty',
      desc: 'Students struggle to map their degree into modern skills required by competitive technology employers.',
      icon: Compass,
      tag: 'Dynamic LifePath',
    },
    {
      title: 'Accessibility Challenges',
      desc: 'Inaccessible websites, lack of screen-reader support, and rigid visual designs alienate differently-abled individuals.',
      icon: Accessibility,
      tag: 'WCAG 2.2 AA Standard',
    },
    {
      title: 'Complex Official Documents',
      desc: 'Government scholarship circulars and admission requirements are buried in impenetrable legal jargon.',
      icon: FileText,
      tag: 'Document Intelligence',
    },
    {
      title: 'Digital Exclusion',
      desc: 'Information remains scattered across hundreds of disconnected websites without actionable follow-through.',
      icon: Cpu,
      tag: 'Smart Action Cards',
    },
  ];

  const features = [
    {
      title: 'ELEYSORA LifePath',
      desc: 'Signature AI engine that drafts week-by-week personalized career roadmaps tailored to your study hours and budget.',
      icon: Compass,
      path: '/lifepath',
      color: 'from-purple-500 to-indigo-600',
    },
    {
      title: 'Opportunity Discovery',
      desc: 'Curated database of verified scholarships, internships, and free certifications with deterministic skill matching.',
      icon: Search,
      path: '/discover',
      color: 'from-cyan-400 to-blue-600',
    },
    {
      title: 'Multilingual Assistant',
      desc: 'Empathetic conversational AI conversing naturally in English, Telugu, and Hindi with voice input and text-to-speech.',
      icon: Bot,
      path: '/assistant',
      color: 'from-pink-500 to-purple-600',
    },
    {
      title: 'Document Intelligence',
      desc: 'Upload confusing PDFs or government circulars. Get instant simplified summaries, required document checklists, and Q&A.',
      icon: FileText,
      path: '/documents',
      color: 'from-emerald-400 to-teal-600',
    },
    {
      title: 'Barrier-to-Bridge Solver',
      desc: 'Input real-world obstacles (financial, language, disability). The AI constructs practical bridges and resource links.',
      icon: Sparkles,
      path: '/barrier-to-bridge',
      color: 'from-amber-400 to-orange-500',
    },
    {
      title: 'Smart Action Cards',
      desc: 'Convert any opportunity or AI recommendation into structured personal tasks with deadlines and priority tracking.',
      icon: CheckSquare,
      path: '/action-cards',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'TrustLens Verification',
      desc: 'Source-verified transparency engine stamping genuine opportunities and warning against outdated guidelines.',
      icon: ShieldCheck,
      path: '/discover',
      color: 'from-green-500 to-emerald-600',
    },
    {
      title: 'Government Scheme Finder',
      desc: 'Centralized directory of verified Indian welfare schemes (NSP, PMKVY, SWAYAM, Bhashini) with direct official links.',
      icon: Landmark,
      path: '/schemes',
      color: 'from-violet-500 to-purple-700',
    },
    {
      title: 'Smart Learning Hub',
      desc: 'Bite-sized topic explanations using analogies, followed by dynamic multiple-choice quizzes to reinforce mastery.',
      icon: BookOpen,
      path: '/learning',
      color: 'from-fuchsia-500 to-pink-600',
    },
    {
      title: 'Community Connect',
      desc: 'Verified support organizations, assistive technology labs, and peer study networks across India.',
      icon: Users,
      path: '/community',
      color: 'from-sky-400 to-indigo-500',
    },
    {
      title: 'Sustainability Guide',
      desc: 'Actionable daily energy, water, and waste conservation guidance for eco-conscious digital citizens.',
      icon: Leaf,
      path: '/sustainability',
      color: 'from-teal-400 to-green-600',
    },
    {
      title: 'Personal Dashboard',
      desc: 'Comprehensive overview tracking your LifePath timeline, saved opportunities, pending actions, and achievements.',
      icon: Cpu,
      path: '/dashboard',
      color: 'from-indigo-500 to-purple-600',
    },
  ];

  const workflowSteps = [
    { step: '01', title: 'DISCOVER', desc: 'Find scholarships, jobs, and schemes tailored to your exact profile.' },
    { step: '02', title: 'UNDERSTAND', desc: 'Demystify dense legal texts and circulars in your native language.' },
    { step: '03', title: 'PLAN', desc: 'Generate customized week-by-week LifePath learning milestones.' },
    { step: '04', title: 'ACT', desc: 'Transform AI recommendations into prioritized Smart Action Cards.' },
    { step: '05', title: 'TRACK', desc: 'Monitor your milestone completions and upcoming deadlines seamlessly.' },
  ];

  return (
    <div className="min-h-screen bg-primary-bg flex flex-col selection:bg-electric-purple selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 overflow-hidden border-b border-primary-border/20">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-electric-purple/20 blur-[130px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-electric-cyan/15 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border-electric-purple/40 text-xs font-semibold text-content-primary shadow-glow">
            <span className="w-2 h-2 rounded-full bg-electric-cyan animate-pulse" />
            <span>Theme 3 — Beyond the Screen: Build for a Smarter, More Inclusive Future</span>
          </div>

          {/* Headings */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white uppercase font-sans">
              BEYOND THE SCREEN.{' '}
              <span className="gradient-text block mt-2">BEYOND EVERY BARRIER.</span>
            </h1>
            <p className="text-xl sm:text-2xl font-bold text-electric-cyan tracking-wide font-sans">
              Intelligence for Everyone. Opportunities for All.
            </p>
            <p className="text-base sm:text-lg text-content-secondary max-w-2xl mx-auto leading-relaxed">
              ELEYSORA AI empowers students, job seekers, and underserved communities through accessible technology, personalized learning roadmaps, verified opportunities, and multilingual AI assistance.
            </p>
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-electric-purple to-indigo-600 text-white font-extrabold text-base shadow-glow hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#demo"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-panel border-primary-border/60 text-content-primary font-bold text-base hover:border-electric-cyan/60 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <span>Explore ELEYSORA</span>
            </a>
          </div>

          {/* Interactive Goal Demo Box */}
          <div id="demo" className="max-w-3xl mx-auto pt-10">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border-primary-border/60 shadow-2xl relative overflow-hidden text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-electric-cyan uppercase tracking-wider mb-3">
                <Sparkles className="w-4 h-4 text-electric-purple" />
                <span>Interactive Roadmap Generator</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mb-2">Tell ELEYSORA your goal...</h2>
              <p className="text-xs text-content-secondary mb-4">
                Enter your desired career or learning objective to preview a structured LifePath roadmap.
              </p>

              <form onSubmit={handleDemoSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={demoGoal}
                  onChange={(e) => setDemoGoal(e.target.value)}
                  placeholder="e.g. I want to become a Cloud Engineer with 1 hour daily study"
                  className="flex-1 bg-primary-bg/80 border border-primary-border/50 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-content-muted focus:outline-none focus:border-electric-cyan"
                />
                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-electric-purple to-electric-cyan text-white text-sm font-extrabold shadow-glow hover:opacity-95 transition-all shrink-0 flex items-center justify-center gap-2"
                >
                  <span>Generate My Roadmap</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Central Workflow Section: DISCOVER -> UNDERSTAND -> PLAN -> ACT -> TRACK */}
      <section className="py-20 border-b border-primary-border/20 bg-primary-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="text-xs uppercase font-extrabold tracking-widest text-electric-cyan">The ELEYSORA Flywheel</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">How ELEYSORA Works</h2>
            <p className="text-sm text-content-secondary">
              A continuous, empowering cycle transforming fragmented information into concrete life achievements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {workflowSteps.map((wf, idx) => (
              <div
                key={wf.step}
                className="glass-panel p-6 rounded-2xl border-primary-border/40 text-left relative group hover:border-electric-cyan/40 transition-all duration-300"
              >
                <span className="text-3xl font-black text-electric-purple/40 group-hover:text-electric-cyan/60 transition-colors">
                  {wf.step}
                </span>
                <h3 className="font-extrabold text-base text-white mt-2 mb-1">{wf.title}</h3>
                <p className="text-xs text-content-secondary leading-relaxed">{wf.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="py-24 border-b border-primary-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs uppercase font-extrabold tracking-widest text-status-warning">The Digital Divide</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              Technology Should Empower Everyone.
            </h2>
            <p className="text-sm sm:text-base text-content-secondary leading-relaxed">
              The digital divide is not merely about device ownership. It is about the ability to understand complex information, discover verified opportunities, and execute practical steps toward personal growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problemCards.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="glass-panel glass-panel-hover p-6 rounded-2xl border-primary-border/40 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-electric-purple/10 border border-electric-purple/30 flex items-center justify-center text-electric-purple">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{p.title}</h3>
                    <p className="text-xs text-content-secondary leading-relaxed">{p.desc}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-primary-border/20 flex items-center justify-between text-xs">
                    <span className="font-semibold text-electric-cyan">{p.tag}</span>
                    <CheckCircle2 className="w-4 h-4 text-status-success" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 border-b border-primary-border/20 bg-primary-card/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs uppercase font-extrabold tracking-widest text-electric-purple">Complete Platform Matrix</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              Explore the ELEYSORA Ecosystem
            </h2>
            <p className="text-sm sm:text-base text-content-secondary">
              Every feature connects directly to our real backend, database persistence, and Gemini intelligence engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <Link
                  key={f.title}
                  to={f.path}
                  className="glass-panel glass-panel-hover p-6 rounded-2xl border-primary-border/40 group flex flex-col justify-between block"
                >
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white shadow-glow group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-electric-cyan transition-colors">
                      {f.title}
                    </h3>
                    <p className="text-xs text-content-secondary leading-relaxed">{f.desc}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-primary-border/20 flex items-center gap-1.5 text-xs font-bold text-electric-purple group-hover:text-electric-cyan">
                    <span>Explore Feature</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Intended Social Impact Section */}
      <section className="py-24 border-b border-primary-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <span className="text-xs uppercase font-extrabold tracking-widest text-status-success">Measurable Purpose</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Built for Sustainable Social Impact
            </h2>
            <p className="text-sm text-content-secondary">
              Instead of superficial vanity metrics, ELEYSORA AI is architected to address real, systemic access hurdles across education, employment, and civic participation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="glass-panel p-6 rounded-2xl border-primary-border/30 space-y-3">
              <span className="text-xs font-extrabold uppercase text-electric-cyan tracking-wider">Inclusion Dimension 1</span>
              <h3 className="text-lg font-bold text-white">Linguistic Democracy</h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                By enabling conversational Telugu and Hindi alongside English, millions of non-metropolitan students can navigate high-level AI topics and scholarships without translation friction.
              </p>
            </div>
            <div className="glass-panel p-6 rounded-2xl border-primary-border/30 space-y-3">
              <span className="text-xs font-extrabold uppercase text-electric-purple tracking-wider">Inclusion Dimension 2</span>
              <h3 className="text-lg font-bold text-white">Actionable Mobility</h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Passive knowledge rarely translates to jobs. ELEYSORA's Smart Action Cards and LifePath milestones convert vague aspirations into structured daily habits.
              </p>
            </div>
            <div className="glass-panel p-6 rounded-2xl border-primary-border/30 space-y-3">
              <span className="text-xs font-extrabold uppercase text-status-success tracking-wider">Inclusion Dimension 3</span>
              <h3 className="text-lg font-bold text-white">Verified Trust & Equity</h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                TrustLens actively verifies source links to protect vulnerable applicants from fraudulent fee-charging schemes and outdated government circulars.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-electric-purple/20 via-primary-bg to-electric-cyan/20 blur-3xl -z-10" />
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            Your Future Should Have No Barriers.
          </h2>
          <p className="text-base sm:text-lg text-content-secondary max-w-xl mx-auto leading-relaxed">
            Join ELEYSORA AI today. Connect with intelligent roadmaps, discover life-changing opportunities, and build an inclusive future.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-electric-purple to-electric-cyan text-white font-extrabold text-base shadow-glow hover:scale-105 transition-all"
            >
              Start Your Journey
            </Link>
            <Link
              to="/assistant"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-panel border-primary-border/60 text-white font-bold text-base hover:border-electric-cyan/60"
            >
              Chat with AI Assistant
            </Link>
          </div>
        </div>
      </section>

      {/* Floating Assistant Trigger */}
      <Link
        to="/assistant"
        className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-gradient-to-tr from-electric-purple to-electric-cyan text-white shadow-2xl shadow-electric-purple/50 hover:scale-110 transition-transform flex items-center gap-2 group"
        aria-label="Open AI Assistant"
      >
        <Bot className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-bold pr-1">
          Chat with ELEYSORA
        </span>
      </Link>

      <Footer />
    </div>
  );
};
