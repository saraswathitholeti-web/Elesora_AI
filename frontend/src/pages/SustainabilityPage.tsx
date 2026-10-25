import React, { useState } from 'react';
import {
  Leaf,
  Zap,
  Droplet,
  Trash2,
  Bike,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { api } from '../services/api';

export const SustainabilityPage: React.FC = () => {
  const { language, speak } = useAccessibility();

  const [selectedArea, setSelectedArea] = useState('electricity');
  const [adviceData, setAdviceData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const areas = [
    { id: 'electricity', name: 'Electricity & Energy', icon: Zap },
    { id: 'water', name: 'Water Conservation', icon: Droplet },
    { id: 'waste', name: 'Waste Reduction & Recycling', icon: Trash2 },
    { id: 'transport', name: 'Sustainable Commuting', icon: Bike },
  ];

  const handleFetchAdvice = async (areaId: string) => {
    setSelectedArea(areaId);
    setIsLoading(true);
    try {
      const res = await api.getSustainabilityAdvice(areaId, undefined, language);
      setAdviceData(res);
      speak(res.immediate_action);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Sustainability Assistant"
      subtitle="Practical, zero-cost daily eco-conservation guidance for responsible digital citizens."
    >
      <div className="space-y-8">
        {/* Area selection cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {areas.map((area) => {
            const Icon = area.icon;
            const isSelected = selectedArea === area.id;
            return (
              <button
                key={area.id}
                onClick={() => handleFetchAdvice(area.id)}
                className={`glass-panel p-5 rounded-3xl border text-left transition-all flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'border-status-success bg-status-success/10 shadow-glow'
                    : 'border-primary-border/40 hover:border-status-success/40'
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-status-success/20 text-status-success flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{area.name}</h4>
                  <p className="text-[11px] text-content-muted mt-0.5">Explore micro-habits</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Advice Presentation */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border-primary-border/40 space-y-6">
          <div className="flex items-center justify-between border-b border-primary-border/30 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-status-success">
                Environmental Stewardship
              </span>
              <h3 className="text-xl font-bold text-white mt-1 capitalize">
                {selectedArea} Practical Conservation Guidance
              </h3>
            </div>

            <button
              onClick={() => handleFetchAdvice(selectedArea)}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-status-success to-emerald-600 text-white text-xs font-bold shadow-glow hover:opacity-90 disabled:opacity-40"
            >
              {isLoading ? 'Generating...' : 'Refresh Eco Tips'}
            </button>
          </div>

          {/* Immediate Action Alert */}
          {adviceData?.immediate_action && (
            <div className="p-4 rounded-2xl bg-status-success/15 border border-status-success/40 text-xs text-content-primary flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-status-success shrink-0 mt-0.5" />
              <div>
                <strong className="text-status-success block mb-0.5">Immediate Micro-Action Today:</strong>
                <p className="leading-relaxed">{adviceData.immediate_action}</p>
              </div>
            </div>
          )}

          {/* Practical Tips Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(adviceData?.practical_tips || [
              {
                title: 'Eliminate Phantom Power',
                impact: 'Unplug idle laptop and smartphone chargers. Saves an estimated 5-10% of household standby draw.',
              },
              {
                title: 'Optimized Screen Brightness',
                impact: 'Reducing monitor brightness to 70% cuts display power usage by up to 20% while easing eye strain.',
              },
            ]).map((tip: any, idx: number) => (
              <div key={idx} className="p-5 rounded-2xl bg-primary-card/50 border border-primary-border/30 space-y-2 text-xs">
                <h5 className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
                  {tip.title}
                </h5>
                <p className="text-content-secondary leading-relaxed">{tip.impact}</p>
              </div>
            ))}
          </div>

          {/* Community impact disclaimer */}
          <div className="p-4 rounded-2xl bg-white/5 border border-primary-border/20 text-[11px] text-content-muted leading-relaxed">
            <strong>Community Perspective:</strong>{' '}
            {adviceData?.community_impact_note ||
              'Small individual adjustments in electricity and resource management compound into massive societal reductions in waste and emissions.'}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
