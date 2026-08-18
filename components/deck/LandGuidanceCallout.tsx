import React from 'react';
import { Compass, CheckCircle2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface LandGuidanceCalloutProps {
  currentCount: number;
  recommendedCount?: number | null;
  className?: string;
}

export function LandGuidanceCallout({
  currentCount,
  recommendedCount,
  className = '',
}: LandGuidanceCalloutProps) {
  if (recommendedCount === undefined || recommendedCount === null) {
    return null;
  }

  const diff = currentCount - recommendedCount;
  const isOptimal = diff === 0;
  const isUnder = diff < 0;

  return (
    <div
      data-testid="land-guidance-callout"
      className={`bg-zinc-950/90 border border-zinc-800/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}
    >
      <div className="flex items-center gap-2">
        <Compass className="w-4 h-4 text-purple-400 shrink-0" />
        <span className="text-xs font-bold text-zinc-200">Land Guidance</span>
        {isOptimal ? (
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded">
            <CheckCircle2 className="w-3 h-3" /> On Target
          </span>
        ) : isUnder ? (
          <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 rounded">
            <ArrowUpRight className="w-3 h-3" /> +{Math.abs(diff)} Recommended
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] text-blue-400 bg-blue-950/60 border border-blue-800/50 px-2 py-0.5 rounded">
            <ArrowDownRight className="w-3 h-3" /> -{diff} Recommended
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 font-mono text-xs">
        <span className="text-zinc-400">
          Current: <strong className="text-white font-bold">{currentCount}</strong>
        </span>
        <span className="text-zinc-600">/</span>
        <span className="text-purple-300">
          Recommended: <strong className="text-purple-400 font-bold">{recommendedCount}</strong>
        </span>
      </div>
    </div>
  );
}
