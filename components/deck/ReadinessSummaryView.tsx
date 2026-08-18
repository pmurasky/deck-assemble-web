import React from 'react';
import { Gauge, Shield, CheckCircle2, DollarSign, Share2 } from 'lucide-react';

export interface DeckReadinessSummary {
  bracket?: number | null;
  bracketScore?: number | null;
  format?: string;
  formatCode?: string;
  ownershipPercentage?: number;
  deckValue?: number | string | Record<string, number>;
}

interface ReadinessSummaryViewProps {
  summary: DeckReadinessSummary;
  className?: string;
}

const BRACKET_NAMES: Record<number, string> = {
  1: 'Exhibition',
  2: 'Core',
  3: 'Upgraded',
  4: 'Optimized',
  5: 'cEDH',
};

function formatDeckValue(val?: number | string | Record<string, number>): string {
  if (!val) return '$0.00';
  if (typeof val === 'number') return `$${val.toFixed(2)}`;
  if (typeof val === 'string') return val.startsWith('$') ? val : `$${val}`;
  const firstEntry = Object.entries(val)[0];
  if (firstEntry) {
    return `$${Number(firstEntry[1]).toFixed(2)}`;
  }
  return '$0.00';
}

export function ReadinessSummaryView({ summary, className = '' }: ReadinessSummaryViewProps) {
  const bracket = summary.bracket ?? summary.bracketScore;
  const bracketLabel = bracket ? `Bracket ${bracket}` : 'Unrated';
  const bracketTier = bracket && BRACKET_NAMES[bracket] ? ` (${BRACKET_NAMES[bracket]})` : '';
  const formatName = summary.format || summary.formatCode || 'Commander';
  const ownership = summary.ownershipPercentage ?? 0;
  const valueDisplay = formatDeckValue(summary.deckValue);

  return (
    <div
      data-testid="readiness-summary-view"
      className={`bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-3 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
        <div className="flex items-center gap-2">
          <Share2 className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Deck Readiness Summary
          </h4>
        </div>
        <span className="text-[10px] text-zinc-400 font-mono">Pre-Game Pod Snapshot</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-zinc-900/90 border border-zinc-800 p-2.5 rounded-lg">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] uppercase font-semibold">
            <Gauge className="w-3 h-3 text-purple-400" />
            <span>Bracket</span>
          </div>
          <div className="text-xs font-bold text-white mt-1">
            {bracketLabel}
            {bracketTier && <span className="text-[10px] text-zinc-400 font-normal">{bracketTier}</span>}
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-2.5 rounded-lg">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] uppercase font-semibold">
            <Shield className="w-3 h-3 text-blue-400" />
            <span>Format</span>
          </div>
          <div className="text-xs font-bold text-white mt-1 capitalize">{formatName}</div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-2.5 rounded-lg">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] uppercase font-semibold">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Ownership</span>
          </div>
          <div className="text-xs font-bold text-emerald-400 mt-1">{ownership}% Owned</div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-2.5 rounded-lg">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] uppercase font-semibold">
            <DollarSign className="w-3 h-3 text-amber-400" />
            <span>Deck Value</span>
          </div>
          <div className="text-xs font-bold text-white mt-1">{valueDisplay}</div>
        </div>
      </div>
    </div>
  );
}
