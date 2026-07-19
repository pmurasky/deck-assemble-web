import React from 'react';

interface LegalityBadgeProps {
  format: string;
  status: 'legal' | 'not_legal' | 'banned' | 'restricted' | string;
  className?: string;
}

export function LegalityBadge({ format, status, className = '' }: LegalityBadgeProps) {
  const isLegal = status.toLowerCase() === 'legal';
  const isBanned = status.toLowerCase() === 'banned';

  const badgeStyle = isLegal
    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
    : isBanned
      ? 'bg-red-950/80 text-red-300 border-red-700'
      : 'bg-zinc-800 text-zinc-400 border-zinc-700';

  const statusLabel = isLegal ? 'LEGAL' : status.toUpperCase().replace('_', ' ');

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold ${badgeStyle} ${className}`}>
      <span>{format}</span>
      <span className="text-[10px] opacity-75">•</span>
      <span>{statusLabel}</span>
    </div>
  );
}
