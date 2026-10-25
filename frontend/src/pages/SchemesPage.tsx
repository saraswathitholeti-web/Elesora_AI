import React, { useState, useEffect } from 'react';
import {
  Landmark,
  Search,
  ExternalLink,
  FileText,
  Gift,
  CheckCircle2,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { TrustBadge } from '../components/common/TrustBadge';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { api } from '../services/api';
import { GovernmentScheme } from '../types';

export const SchemesPage: React.FC = () => {
  const { speak } = useAccessibility();
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [isLoading, setIsLoading] = useState(false);

  const departments = [
    'All',
    'Ministry of Electronics and Information Technology (MeitY)',
    'Ministry of Skill Development and Entrepreneurship (MSDE)',
    'Ministry of Education, Govt of India',
  ];

  useEffect(() => {
    loadSchemes();
  }, [selectedDepartment]);

  const loadSchemes = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSchemes({
        department: selectedDepartment === 'All' ? undefined : selectedDepartment,
        search: searchQuery || undefined,
      });
      setSchemes(data);
    } catch (err) {
      console.warn(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadSchemes();
  };

  return (
    <DashboardLayout
      title="Government Scheme Finder"
      subtitle="Source-verified Indian educational, vocational, and technological welfare schemes."
    >
      <div className="space-y-6">
        {/* Search & Department Filters */}
        <div className="glass-panel p-5 rounded-3xl border-primary-border/40 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-content-muted absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scheme name, eligibility, benefits (e.g. NSP, PMKVY, SWAYAM)..."
                className="w-full bg-primary-bg/80 border border-primary-border/50 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-content-muted focus:outline-none focus:border-electric-cyan"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-electric-purple text-white text-xs font-bold shadow-glow hover:opacity-90"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedDepartment === dept
                    ? 'bg-electric-purple text-white shadow-glow'
                    : 'glass-panel text-content-secondary hover:text-white border-primary-border/40'
                }`}
              >
                {dept === 'All' ? 'All Ministries' : dept.split(',')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Schemes List */}
        <div className="space-y-6">
          {schemes.map((scheme) => (
            <div
              key={scheme.id}
              className="glass-panel p-6 sm:p-8 rounded-3xl border-primary-border/40 space-y-6"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-electric-cyan/20 text-electric-cyan border border-electric-cyan/30">
                    Official Government Initiative
                  </span>
                  <h3 className="text-xl font-bold text-white mt-2">{scheme.scheme_name}</h3>
                  <p className="text-xs text-content-secondary flex items-center gap-1.5 mt-1 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-electric-purple" />
                    {scheme.department}
                  </p>
                </div>

                <a
                  href={scheme.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-electric-purple to-indigo-600 text-white text-xs font-bold shadow-glow hover:opacity-90 flex items-center gap-1.5 shrink-0"
                >
                  <span>Official Application Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <p className="text-xs text-content-secondary leading-relaxed max-w-4xl">
                {scheme.description}
              </p>

              {/* Benefits & Application Process Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Benefits */}
                <div className="p-4 rounded-2xl bg-primary-card/50 border border-primary-border/30 space-y-2">
                  <span className="font-bold text-status-success flex items-center gap-1.5">
                    <Gift className="w-4 h-4" /> Entitlements & Financial Benefits
                  </span>
                  <p className="text-content-secondary leading-relaxed">{scheme.benefits}</p>
                </div>

                {/* Application Process */}
                <div className="p-4 rounded-2xl bg-primary-card/50 border border-primary-border/30 space-y-2">
                  <span className="font-bold text-electric-cyan flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Step-by-Step Application Process
                  </span>
                  <p className="text-content-secondary leading-relaxed">{scheme.application_process}</p>
                </div>
              </div>

              {/* Required Documents */}
              {scheme.required_documents && scheme.required_documents.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-electric-purple" />
                    Mandatory Submission Documents:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {scheme.required_documents.map((doc, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-3 py-1 rounded-xl bg-white/5 border border-primary-border/30 text-content-secondary"
                      >
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Trust & Source Footer */}
              <div className="pt-4 border-t border-primary-border/20">
                <TrustBadge
                  status={scheme.verification_status}
                  lastVerifiedAt={scheme.last_verified_at}
                  sourceUrl={scheme.official_url}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};
