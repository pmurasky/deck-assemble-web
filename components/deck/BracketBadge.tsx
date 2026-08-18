import React from 'react';
import { Gauge } from 'lucide-react';

interface BracketBadgeProps {
  bracket?: number | null;
  className?: string;
}

const BRACKET_LABELS: Record<number, { name: string; color: string; border: string; bg: string; text: string }> = {
  1: { name: 'Exhibition', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  2: { name: 'Core', color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  3: { name: 'Upgraded', color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10', text: 'text-purple-400' },
  4: { name: 'Optimized', color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-400' },
  5: { name: 'cEDH', color: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/10', text: 'text-red-400' },
};

export function BracketBadge({ bracket, className = '' }: BracketBadgeProps) {
  const meta = bracket && BRACKET_LABELS[bracket] ? BRACKET_LABELS[bracket] : {
    name: 'Unrated',
    color: 'text-zinc-400',
    border: 'border-zinc-700/50',
    bg: 'bg-zinc-800/20',
    text: 'text-zinc-400',
  };

  return (
    <div className={`bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 ${className}`}>
      <div className={`p-3 rounded-xl border ${meta.bg} ${meta.border} ${meta.color}`}>
        <Gauge className="w-6 h-6" />
      </div>
      <div>
        <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Commander Bracket</span>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className={`text-xl font-extrabold ${meta.text}`}>
            {bracket ? `Bracket ${bracket}` : 'Unrated'}
          </span>
          {bracket ? <span className="text-xs text-zinc-400">({meta.name})</span> : null}
        </div>
      </div>
    </div>
  );
}
