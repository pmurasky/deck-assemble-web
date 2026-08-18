'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Sparkles, RefreshCw, ArrowLeftRight } from 'lucide-react';
import { requestDeckUpgradePlan } from '@/lib/api/decks';
import type {
  DeckUpgradePlanResponse,
  UpgradeSubstitutionResponse,
} from '@/types/builder';

export interface TopUpgradeSuggestionsPanelProps {
  deckId: number | string;
  onSwapSubstitution?: (sub: UpgradeSubstitutionResponse) => void;
  onSwap?: (sub: UpgradeSubstitutionResponse) => void;
}

interface SubstitutionRowProps {
  sub: UpgradeSubstitutionResponse;
  onSwap: (sub: UpgradeSubstitutionResponse) => void;
}

const SubstitutionRow: React.FC<SubstitutionRowProps> = ({ sub, onSwap }) => {
  const topReason = sub.reasons && sub.reasons.length > 0 ? sub.reasons[0] : null;

  return (
    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-violet-500/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="space-y-1 min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-rose-400 font-mono">-</span>
          <span className="font-mono text-rose-400 line-through truncate">{sub.removedName}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-medium shrink-0">
            {sub.removedOwnershipStatus}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-emerald-400 font-bold">+</span>
          <span className="text-sm font-bold text-emerald-400 truncate">{sub.addedName}</span>
          {sub.addedOwned ? (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold">
              Owned
            </span>
          ) : (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
              Not Owned
            </span>
          )}
          {sub.cost !== null && sub.cost !== undefined && (
            <span className="text-xs font-mono text-amber-300 font-semibold">
              ${sub.cost.toFixed(2)}
            </span>
          )}
          {topReason && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-950/80 border border-violet-500/30 text-violet-300 font-semibold">
              {topReason.sentence || topReason.explanation || topReason.description || (topReason.points ? `${topReason.code} (+${topReason.points})` : topReason.code)}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onSwap(sub)}
        aria-label={`Swap In ${sub.addedName}`}
        className="px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shrink-0 active:scale-95"
      >
        <ArrowLeftRight className="w-3.5 h-3.5" />
        <span>Swap In</span>
      </button>
    </div>
  );
};

const LoadingState: React.FC = () => (
  <div className="p-8 text-center space-y-2">
    <RefreshCw className="w-6 h-6 text-violet-400 animate-spin mx-auto" />
    <p className="text-xs text-slate-400 font-medium">Finding top card upgrades...</p>
  </div>
);

const ErrorState: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between gap-3">
    <span>{error}</span>
    <button
      type="button"
      onClick={onRetry}
      className="px-3 py-1 bg-rose-900/60 hover:bg-rose-800 rounded-lg text-xs font-semibold shrink-0"
    >
      Retry
    </button>
  </div>
);

const EmptyOptimalState: React.FC = () => (
  <div className="p-6 text-center rounded-xl bg-slate-950/60 border border-slate-800/80">
    <p className="text-xs text-slate-400 italic">
      Deck is already optimal — no high-priority card replacements found.
    </p>
  </div>
);

export const TopUpgradeSuggestionsPanel: React.FC<TopUpgradeSuggestionsPanelProps> = ({
  deckId,
  onSwapSubstitution,
  onSwap,
}) => {
  const [plan, setPlan] = useState<DeckUpgradePlanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setRetryCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (!deckId) return;

    requestDeckUpgradePlan(Number(deckId), {
      objective: 'IMPROVE_UNDER_BUDGET',
      maxChanges: 5,
    })
      .then((data) => {
        if (isMounted) {
          setPlan(data);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load upgrade suggestions');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [deckId, retryCount]);

  const handleSwap = (sub: UpgradeSubstitutionResponse) => {
    if (onSwapSubstitution) onSwapSubstitution(sub);
    if (onSwap) onSwap(sub);
  };

  const substitutions = plan?.substitutions?.slice(0, 5) ?? [];

  return (
    <div
      className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4"
      data-testid="top-upgrade-suggestions-panel"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-violet-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Top Upgrade Suggestions</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Top 5 cards most worth replacing with higher-value or owned alternatives.
          </p>
        </div>
      </div>

      {isLoading && <LoadingState />}
      {!isLoading && error && <ErrorState error={error} onRetry={handleRetry} />}
      {!isLoading && !error && substitutions.length === 0 && <EmptyOptimalState />}
      {!isLoading && !error && substitutions.length > 0 && (
        <div className="space-y-2.5">
          {substitutions.map((sub, idx) => (
            <SubstitutionRow
              key={`${sub.deckCardId}-${sub.addedPrintingId}-${idx}`}
              sub={sub}
              onSwap={handleSwap}
            />
          ))}
        </div>
      )}
    </div>
  );
};
