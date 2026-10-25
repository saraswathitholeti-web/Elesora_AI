import React from 'react';
import { Settings, Shield, Bell, Key, LogOut } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <DashboardLayout
      title="Account Settings"
      subtitle="Manage session privacy, data access controls, and notification preferences."
    >
      <div className="max-w-3xl space-y-6">
        {/* Security & Access */}
        <div className="glass-panel p-6 rounded-3xl border-primary-border/40 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-electric-cyan" />
            Security & Privacy Safeguards
          </h4>
          <p className="text-xs text-content-secondary leading-relaxed">
            Your data is protected under PostgreSQL Row Level Security (RLS). Only your authenticated session can access your uploaded documents, private chats, and roadmaps.
          </p>
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-primary-card/50 border border-primary-border/30 text-xs">
            <div>
              <p className="font-bold text-white">Row Level Isolation</p>
              <p className="text-[11px] text-content-muted">Encrypted tokens verify identity on every request</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-status-success/15 text-status-success font-bold text-[10px]">
              Active & Enforced
            </span>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-panel p-6 rounded-3xl border-primary-border/40 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-electric-purple" />
            Alert Preferences
          </h4>
          <div className="space-y-2 text-xs">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-primary-card/40 border border-primary-border/30 cursor-pointer">
              <span className="text-content-primary">Upcoming Scholarship Deadline Alerts</span>
              <input type="checkbox" defaultChecked className="accent-electric-purple" />
            </label>
            <label className="flex items-center justify-between p-3 rounded-2xl bg-primary-card/40 border border-primary-border/30 cursor-pointer">
              <span className="text-content-primary">Daily LifePath Milestone Reminders</span>
              <input type="checkbox" defaultChecked className="accent-electric-purple" />
            </label>
          </div>
        </div>

        {/* Danger zone */}
        <div className="glass-panel p-6 rounded-3xl border-status-error/30 space-y-4">
          <h4 className="text-sm font-bold text-status-error flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Session Termination
          </h4>
          <p className="text-xs text-content-secondary">
            Sign out of your active session on this device.
          </p>
          <button
            onClick={logout}
            className="px-5 py-2.5 rounded-xl bg-status-error/20 border border-status-error/40 text-status-error font-bold text-xs hover:bg-status-error hover:text-white transition-all"
          >
            End Current Session
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};
