'use client';

import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  X,
  RefreshCw,
  Layers,
  ArrowRightLeft,
  DollarSign,
} from 'lucide-react';
import { fetchDeckCardAlternatives } from '@/lib/api/decks';
import type { DeckCardAlternativeResponse } from '@/types/builder';

interface DeckCardAlternativesFlyoutProps {
  isOpen: boolean;
  onClose: () => void;
  deckId: number | string;
  deckCardId: number | string;
  cardName: string;
  onSwapCard?: (alternative: DeckCardAlternativeResponse) => void;
}

export function DeckCardAlternativesFlyout({
  isOpen,
  onClose,
  deckId,
  deckCardId,
  cardName,
  onSwapCard,
}: DeckCardAlternativesFlyoutProps) {
  const [alternatives, setAlternatives] = useState<DeckCardAlternativeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAlternatives = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchDeckCardAlternatives(Number(deckId), Number(deckCardId), 10, true);
      setAlternatives(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load card alternatives');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && deckId && deckCardId) {
      loadAlternatives();
    }
  }, [isOpen, deckId, deckCardId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 text-zinc-100 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Card Swap Alternatives</span>
            </div>
            <h2 className="text-xl font-black text-white mt-0.5">
              Alternatives for <span className="text-purple-300">{cardName}</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Ranked swap suggestions based on color synergy, mana curve, and collection ownership.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-3" />
            <p className="text-zinc-400 text-sm font-medium">Finding best alternatives...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-950/30 border border-red-800/40 rounded-xl text-red-300 text-sm flex items-center justify-between">
            <p>{error}</p>
            <button
              onClick={loadAlternatives}
              className="px-3 py-1 bg-red-900/60 hover:bg-red-800 rounded-lg text-xs font-semibold"
            >
              Retry
            </button>
          </div>
        ) : alternatives.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-zinc-800 rounded-xl">
            <Layers className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-zinc-300">No alternatives found</p>
            <p className="text-xs text-zinc-500 mt-1">This card is unique or no suitable replacements were found in the catalog.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alternatives.map((alt) => (
              <div
                key={alt.cardPrintingId}
                className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/90 hover:border-purple-500/40 transition-all flex items-center justify-between gap-4"
              >
                <div className="min-w-0 space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-extrabold text-white truncate">{alt.name}</span>
                    {alt.owned ? (
                      <span className="text-[10px] bg-emerald-950 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded font-bold">
                        Owned
                      </span>
                    ) : (
                      <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-bold">
                        Not Owned
                      </span>
                    )}
                    {alt.priceUsd !== null && alt.priceUsd !== undefined && (
                      <span className="text-xs font-mono text-amber-300 font-bold">
                        ${alt.priceUsd.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {alt.reasons && alt.reasons.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {alt.reasons.map((reason, rIdx) => (
                        <span
                          key={rIdx}
                          className="text-[10px] bg-purple-950/50 border border-purple-800/50 text-purple-300 px-2 py-0.5 rounded font-semibold"
                        >
                          {reason.code} (+{reason.points})
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Score</span>
                    <span className="text-base font-black text-purple-400">{Math.round(alt.total)}</span>
                  </div>

                  {onSwapCard && (
                    <button
                      type="button"
                      onClick={() => {
                        onSwapCard(alt);
                        onClose();
                      }}
                      aria-label={`Swap In ${alt.name}`}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Swap In</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
