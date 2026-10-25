import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
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
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  const { user, logout } = useAuth();
  const { textToSpeech, setTextToSpeech, isSpeaking, stopSpeaking } = useAccessibility();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Assistant', path: '/assistant', icon: Bot },
    { name: 'LifePath Roadmap', path: '/lifepath', icon: Compass },
    { name: 'Opportunity Discovery', path: '/discover', icon: Search },
    { name: 'Document Intelligence', path: '/documents', icon: FileText },
    { name: 'Barrier-to-Bridge', path: '/barrier-to-bridge', icon: Sparkles },
    { name: 'Smart Action Cards', path: '/action-cards', icon: CheckSquare },
    { name: 'Government Schemes', path: '/schemes', icon: Landmark },
    { name: 'Smart Learning Hub', path: '/learning', icon: BookOpen },
    { name: 'Community Connect', path: '/community', icon: Users },
    { name: 'Sustainability Guide', path: '/sustainability', icon: Leaf },
    { name: 'Accessibility Center', path: '/accessibility', icon: Sliders },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-primary-bg flex flex-col lg:flex-row">
      {/* Mobile Top Header */}
      <div className="lg:hidden glass-panel border-b border-primary-border/40 p-4 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="ELEYSORA" className="w-7 h-7" />
          <span className="font-extrabold text-white text-lg">ELEYSORA AI</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-primary-card text-content-primary"
          aria-label="Toggle Dashboard Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 transform lg:transform-none lg:static transition-all duration-300 ease-in-out glass-panel border-r border-primary-border/30 flex flex-col justify-between ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        <div className="p-4 space-y-6">
          {/* Logo & Collapse */}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-purple to-electric-cyan p-0.5 shrink-0 shadow-glow">
                <div className="w-full h-full bg-primary-bg rounded-[10px] flex items-center justify-center">
                  <img src="/logo.svg" alt="Logo" className="w-6 h-6" />
                </div>
              </div>
              {!collapsed && (
                <div>
                  <h1 className="font-black text-lg tracking-tight text-white">ELEYSORA</h1>
                  <p className="text-[10px] text-content-muted uppercase tracking-wider">Inclusion Platform</p>
                </div>
              )}
            </Link>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-content-muted hover:text-white hover:bg-white/5"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-electric-purple text-white shadow-glow'
                      : 'text-content-secondary hover:text-white hover:bg-white/5'
                  }`}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer User Card */}
        <div className="p-4 border-t border-primary-border/20 space-y-3">
          {!collapsed ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-primary-card/50 border border-primary-border/30">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-electric-purple to-electric-cyan flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {user?.display_name?.charAt(0).toUpperCase() || 'E'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">{user?.display_name || 'Learner'}</p>
                  <p className="text-[10px] text-content-muted truncate">{user?.preferred_language || 'English'}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-content-muted hover:text-status-error transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={logout}
              className="w-full p-2 flex justify-center text-content-muted hover:text-status-error"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="h-16 glass-panel border-b border-primary-border/30 px-6 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h2 className="text-base font-bold text-white">{title || 'ELEYSORA AI Workspace'}</h2>
            {subtitle && <p className="text-xs text-content-muted">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-3">
            {/* TTS Button */}
            <button
              onClick={() => {
                if (isSpeaking) stopSpeaking();
                else setTextToSpeech(!textToSpeech);
              }}
              title={textToSpeech ? 'Text-to-speech enabled' : 'Enable text-to-speech'}
              className={`p-2 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${
                textToSpeech
                  ? 'bg-electric-cyan/20 text-electric-cyan border-electric-cyan/40 shadow-cyanGlow'
                  : 'bg-primary-card/50 text-content-muted border-primary-border/30 hover:text-white'
              }`}
            >
              {textToSpeech ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">Voice Aid</span>
            </button>

            {/* Accessibility Link */}
            <Link
              to="/accessibility"
              className="p-2 rounded-xl bg-primary-card/50 border border-primary-border/30 text-content-muted hover:text-white"
              title="Accessibility Center"
            >
              <Sliders className="w-4 h-4" />
            </Link>

            {/* Quick Home Link */}
            <Link
              to="/"
              className="px-3 py-1.5 rounded-xl bg-white/5 border border-primary-border/30 text-xs font-medium text-content-secondary hover:text-white"
            >
              Public Portal
            </Link>
          </div>
        </div>

        {/* Page Content Body */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};
