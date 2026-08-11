import React, { useState, useEffect } from 'react';
import { ShieldCheck, DollarSign, Zap, Layers, GitCompare, ArrowUpRight, ArrowDownRight, PlusCircle, MinusCircle, RefreshCw, AlertCircle, Trophy } from 'lucide-react';
import { GeneratedDeck, DeckComparisonResponse, CardQuantityDiff } from '@/types/builder';
import { getDeckComparison } from '@/lib/api/decks';

export interface DeckComparisonViewProps {
  baseDeck: GeneratedDeck;
  otherDecks: GeneratedDeck[];
  onClose?: () => void;
}

export const DeckComparisonView: React.FC<DeckComparisonViewProps> = ({
  baseDeck,
  otherDecks,
  onClose,
}) => {
  const [comparisons, setComparisons] = useState<Record<string, DeckComparisonResponse>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDiffTab, setActiveDiffTab] = useState<'added' | 'removed' | 'changed'>('added');

  useEffect(() => {
    let isMounted = true;
    if (!otherDecks || otherDecks.length === 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const baseId = Number(baseDeck.id);
    const promises = otherDecks.map(async (other) => {
      const otherId = Number(other.id);
      if (isNaN(baseId) || isNaN(otherId) || baseId <= 0 || otherId <= 0) {
        // Fallback compute locally if IDs are non-numeric or draft
        return {
          otherDeckId: other.id,
          response: computeLocalFallbackComparison(baseDeck, other),
        };
      }
      try {
        const res = await getDeckComparison(baseId, otherId);
        return { otherDeckId: other.id, response: res };
      } catch {
        return {
          otherDeckId: other.id,
          response: computeLocalFallbackComparison(baseDeck, other),
        };
      }
    });

    Promise.all(promises)
      .then((results) => {
        if (isMounted) {
          const map: Record<string, DeckComparisonResponse> = {};
          results.forEach((r) => {
            map[r.otherDeckId] = r.response;
          });
          setComparisons(map);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load deck comparison data');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [baseDeck, otherDecks]);

  return (
    <div className="space-y-6" data-testid="deck-comparison-view">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-violet-950/80 border border-violet-500/30 text-violet-400">
            <GitCompare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
              Side-by-Side Deck Comparison
              {otherDecks.length > 1 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-600 text-white font-bold">
                  3-Way Pairwise
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparing Base: <span className="font-semibold text-slate-200">{baseDeck.name}</span> against {otherDecks.length} build variant{otherDecks.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
          >
            Close View
          </button>
        )}
      </div>

      {isLoading && (
        <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-400 flex items-center justify-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-violet-400" />
          <span className="text-sm font-medium">Fetching comparison deltas from backend...</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!isLoading && (
        <>
          {/* Side-by-Side Comparison Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Column 1: Base Deck */}
            <div className="rounded-2xl bg-slate-900 border-2 border-violet-500/40 p-5 space-y-4 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-violet-600 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                Base Build
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-violet-400">{baseDeck.commander.name}</span>
                <h3 className="text-lg font-black text-slate-100 leading-snug">{baseDeck.name}</h3>
              </div>

              {/* Metrics */}
              <div className="space-y-2.5 text-xs py-3 border-y border-slate-800/80">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Collection Owned %
                  </span>
                  <span className="font-bold text-emerald-400 text-sm">{baseDeck.ownedPercentage}%</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    Wishlist Total Cost
                  </span>
                  <span className="font-bold text-amber-300 text-sm">${baseDeck.wishlistTotalCost.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <Zap className="w-4 h-4 text-violet-400" />
                    Desired Power Level
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-violet-300">Desired Power Level: {baseDeck.powerLevel} / 10</span>
                    <span className="block text-[10px] text-slate-500">Caps game-changers</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    Build Score
                  </span>
                  <span className="font-bold text-slate-200">{baseDeck.buildScore ?? 85} / 100</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    Average CMC
                  </span>
                  <span className="font-bold text-indigo-300">{baseDeck.averageManaValue}</span>
                </div>
              </div>
            </div>

            {/* Comparison Columns (Option A, Option B) */}
            {otherDecks.map((otherDeck, idx) => {
              const comp = comparisons[otherDeck.id];
              const ownDelta = comp?.ownershipDelta ?? (otherDeck.ownedPercentage - baseDeck.ownedPercentage);
              const costDelta = comp?.missingCostDeltaByCurrency?.USD ?? (otherDeck.wishlistTotalCost - baseDeck.wishlistTotalCost);

              return (
                <div
                  key={otherDeck.id || idx}
                  className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-xl flex flex-col justify-between relative"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30 uppercase">
                        Variant #{idx + 1}
                      </span>
                      <span className="text-xs text-slate-400">{otherDeck.commander.name}</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-100 leading-snug">{otherDeck.name}</h3>
                  </div>

                  {/* Metrics with Deltas */}
                  <div className="space-y-2.5 text-xs py-3 border-y border-slate-800/80">
                    <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-slate-950">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          Collection Owned %
                        </span>
                        <span className="font-bold text-emerald-400 text-sm">{otherDeck.ownedPercentage}%</span>
                      </div>
                      <div className="flex items-center justify-end gap-1 text-[11px]">
                        {ownDelta >= 0 ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                            <ArrowUpRight className="w-3 h-3" />
                            +{ownDelta.toFixed(1)}% owned vs base
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold flex items-center gap-0.5">
                            <ArrowDownRight className="w-3 h-3" />
                            {ownDelta.toFixed(1)}% owned vs base
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-slate-950">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                          <DollarSign className="w-4 h-4 text-amber-400" />
                          Wishlist Cost
                        </span>
                        <span className="font-bold text-amber-300 text-sm">${otherDeck.wishlistTotalCost.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-end gap-1 text-[11px]">
                        {costDelta <= 0 ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                            <ArrowDownRight className="w-3 h-3" />
                            -${Math.abs(costDelta).toFixed(2)} vs base
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold flex items-center gap-0.5">
                            <ArrowUpRight className="w-3 h-3" />
                            +${costDelta.toFixed(2)} vs base
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950">
                      <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                        <Zap className="w-4 h-4 text-violet-400" />
                        Desired Power Level
                      </span>
                      <div className="text-right">
                        <span className="font-bold text-violet-300">Desired Power Level: {otherDeck.powerLevel} / 10</span>
                        <span className="block text-[10px] text-slate-500">Caps game-changers</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950">
                      <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        Build Score
                      </span>
                      <span className="font-bold text-slate-200">{otherDeck.buildScore ?? 85} / 100</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950">
                      <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                        <Layers className="w-4 h-4 text-indigo-400" />
                        Average CMC
                      </span>
                      <span className="font-bold text-indigo-300">{otherDeck.averageManaValue}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Card Differences Section */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-violet-400" />
                <span>Card Differences Breakdown</span>
              </h3>

              {/* Tabs for Card Diffs */}
              <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveDiffTab('added')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeDiffTab === 'added'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Added Cards
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDiffTab('removed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeDiffTab === 'removed'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Removed Cards
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDiffTab('changed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeDiffTab === 'changed'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Quantity Changed
                </button>
              </div>
            </div>

            {/* Render Diffs per comparison deck */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {otherDecks.map((otherDeck) => {
                const comp = comparisons[otherDeck.id];
                const items: CardQuantityDiff[] = comp
                  ? activeDiffTab === 'added'
                    ? comp.added
                    : activeDiffTab === 'removed'
                    ? comp.removed
                    : comp.quantityChanged
                  : [];

                return (
                  <div key={otherDeck.id} className="space-y-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-xs font-bold text-violet-300">{otherDeck.name}</span>
                      <span className="text-[11px] text-slate-400">
                        {items.length} card{items.length !== 1 ? 's' : ''} {activeDiffTab}
                      </span>
                    </div>

                    {items.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">No cards in this category.</p>
                    ) : (
                      <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {items.map((card, idx) => (
                          <li
                            key={card.cardId || idx}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              {activeDiffTab === 'added' && <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />}
                              {activeDiffTab === 'removed' && <MinusCircle className="w-3.5 h-3.5 text-rose-400" />}
                              {activeDiffTab === 'changed' && <RefreshCw className="w-3.5 h-3.5 text-amber-400" />}
                              <span className="font-semibold text-slate-200">{card.cardName}</span>
                              {card.typeLine && <span className="text-[10px] text-slate-500">({card.typeLine})</span>}
                            </div>
                            <span className="font-mono font-bold text-slate-300">
                              {card.baseQuantity} &rarr; {card.otherQuantity} ({card.delta > 0 ? `+${card.delta}` : card.delta})
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

function computeLocalFallbackComparison(base: GeneratedDeck, other: GeneratedDeck): DeckComparisonResponse {
  const ownDelta = other.ownedPercentage - base.ownedPercentage;
  const costDelta = other.wishlistTotalCost - base.wishlistTotalCost;

  const baseCardsMap = new Map(base.cards.map((c) => [c.card.name, c]));
  const otherCardsMap = new Map(other.cards.map((c) => [c.card.name, c]));

  const added: CardQuantityDiff[] = [];
  const removed: CardQuantityDiff[] = [];
  const quantityChanged: CardQuantityDiff[] = [];

  other.cards.forEach((otherRow) => {
    const baseRow = baseCardsMap.get(otherRow.card.name);
    if (!baseRow) {
      added.push({
        cardId: Number(otherRow.card.id) || 0,
        cardName: otherRow.card.name,
        manaCost: otherRow.card.manaCost,
        typeLine: otherRow.card.typeLine,
        baseQuantity: 0,
        otherQuantity: otherRow.quantity,
        delta: otherRow.quantity,
      });
    } else if (baseRow.quantity !== otherRow.quantity) {
      quantityChanged.push({
        cardId: Number(otherRow.card.id) || 0,
        cardName: otherRow.card.name,
        manaCost: otherRow.card.manaCost,
        typeLine: otherRow.card.typeLine,
        baseQuantity: baseRow.quantity,
        otherQuantity: otherRow.quantity,
        delta: otherRow.quantity - baseRow.quantity,
      });
    }
  });

  base.cards.forEach((baseRow) => {
    if (!otherCardsMap.has(baseRow.card.name)) {
      removed.push({
        cardId: Number(baseRow.card.id) || 0,
        cardName: baseRow.card.name,
        manaCost: baseRow.card.manaCost,
        typeLine: baseRow.card.typeLine,
        baseQuantity: baseRow.quantity,
        otherQuantity: 0,
        delta: -baseRow.quantity,
      });
    }
  });

  return {
    baseDeckId: Number(base.id) || 0,
    otherDeckId: Number(other.id) || 0,
    ownershipDelta: Number(ownDelta.toFixed(1)),
    missingCostDeltaByCurrency: { USD: Number(costDelta.toFixed(2)) },
    added,
    removed,
    quantityChanged,
  };
}
