import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Heart,
  ShieldCheck,
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { TrustBadge } from '../components/common/TrustBadge';
import { api } from '../services/api';
import { CommunityResource } from '../types';

export const CommunityPage: React.FC = () => {
  const [resources, setResources] = useState<CommunityResource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    'All',
    'Accessibility & Inclusion',
    'Skill Development & Accessibility',
    'Digital Literacy & Open Education',
  ];

  useEffect(() => {
    loadResources();
  }, [selectedCategory]);

  const loadResources = async () => {
    setIsLoading(true);
    try {
      const data = await api.getCommunityResources({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchQuery || undefined,
      });
      setResources(data);
    } catch (err) {
      console.warn(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadResources();
  };

  return (
    <DashboardLayout
      title="Community Connect Directory"
      subtitle="Connecting you with verified non-profits, accessible learning centers, and disability support foundations."
    >
      <div className="space-y-6">
        {/* Search & Categories */}
        <div className="glass-panel p-5 rounded-3xl border-primary-border/40 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-content-muted absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search organization name, audiobooks, screen reader training, location..."
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
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-electric-purple text-white shadow-glow'
                    : 'glass-panel text-content-secondary hover:text-white border-primary-border/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res) => (
            <div
              key={res.id}
              className="glass-panel p-6 rounded-3xl border-primary-border/40 space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-electric-purple/20 text-electric-purple border border-electric-purple/30 uppercase tracking-wider">
                  {res.resource_category}
                </span>

                <h4 className="text-base font-bold text-white leading-snug">{res.organization_name}</h4>
                <p className="text-xs text-content-muted flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-electric-cyan shrink-0" />
                  {res.location}
                </p>

                <p className="text-xs text-content-secondary leading-relaxed line-clamp-3">
                  {res.description}
                </p>

                {/* Contact info box */}
                {res.contact_information && (
                  <div className="p-3.5 rounded-2xl bg-primary-card/50 border border-primary-border/30 text-[11px] text-content-secondary space-y-1">
                    {res.contact_information.helpline && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-status-success" />
                        <span>{res.contact_information.helpline}</span>
                      </p>
                    )}
                    {res.contact_information.email && (
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-electric-cyan" />
                        <span>{res.contact_information.email}</span>
                      </p>
                    )}
                    {res.contact_information.services && (
                      <p className="text-content-muted pt-0.5">
                        <strong>Services:</strong> {res.contact_information.services}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-primary-border/20 space-y-2">
                <TrustBadge status={res.verification_status} />
                <a
                  href={res.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-electric-purple text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 shadow-glow"
                >
                  <span>Visit Official Site</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};
