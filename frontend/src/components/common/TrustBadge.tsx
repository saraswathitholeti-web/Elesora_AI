import React from 'react';
import { ShieldCheck, Clock, AlertTriangle, ExternalLink } from 'lucide-react';

interface TrustBadgeProps {
  status: 'Verified' | 'Pending Verification' | 'Possibly Outdated' | string;
  lastVerifiedAt?: string;
  sourceUrl?: string;
  compact?: boolean;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({
  status,
  lastVerifiedAt,
  sourceUrl,
  compact = false,
}) => {
  const isVerified = status.toLowerCase() === 'verified';
  const isPending = status.toLowerCase().includes('pending');

  const badgeColor = isVerified
    ? 'bg-status-success/10 text-status-success border-status-success/30'
    : isPending
    ? 'bg-status-warning/10 text-status-warning border-status-warning/30'
    : 'bg-status-error/10 text-status-error border-status-error/30';

  const Icon = isVerified ? ShieldCheck : isPending ? Clock : AlertTriangle;

  const formattedDate = lastVerifiedAt
    ? new Date(lastVerifiedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeColor}`}
        title={`ELEYSORA TrustLens Status: ${status} (Checked: ${formattedDate})`}
      >
        <Icon className="w-3.5 h-3.5" />
        {status}
      </span>
    );
  }

  return (
    <div className={`p-3 rounded-xl border ${badgeColor} backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs`}>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 shrink-0" />
        <div>
          <span className="font-semibold tracking-wide">ELEYSORA TrustLens: {status}</span>
          <span className="opacity-80 block sm:inline sm:ml-2">
            Verified on: {formattedDate}
          </span>
        </div>
      </div>
      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 underline hover:text-electric-cyan font-medium ml-auto"
        >
          Check Primary Source <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
};
