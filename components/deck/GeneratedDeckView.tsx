import React, { useState } from 'react';
import {
  Layers,
  DollarSign,
  Info,
  ArrowLeftRight,
  BookmarkPlus,
  Trash2,
  ShoppingCart,
  ShieldCheck,
  AlertTriangle,
  Zap,
  BarChart2,
  Sparkles,
  GitCompare,
  RefreshCw,
  Trophy,
  AlertCircle,
} from 'lucide-react';
import { GeneratedDeck, DeckCardRow, DeckRoleSection } from '@/types/builder';
import { OwnershipBadge } from './OwnershipBadge';

interface GeneratedDeckViewProps {
  deck: GeneratedDeck;
  onUpdateDeck: (updated: GeneratedDeck) => void;
  onOpenWishlist: () => void;
  onOpenCompare?: () => void;
}

const SECTIONS: { key: DeckRoleSection; label: string; legacyKeys: string[] }[] = [
  { key: 'Commander', label: 'Commander', legacyKeys: ['Commander', 'COMMANDER'] },
  { key: 'Main Deck', label: 'Main Deck', legacyKeys: ['Main Deck', 'MAIN_DECK'] },
  { key: 'Lands', label: 'Lands', legacyKeys: ['Lands'] },
  { key: 'Ramp', label: 'Ramp', legacyKeys: ['Ramp'] },
  { key: 'Draw', label: 'Draw', legacyKeys: ['Draw', 'Card Draw'] },
  { key: 'Removal', label: 'Removal', legacyKeys: ['Removal', 'Targeted Removal'] },
  { key: 'Board Wipes', label: 'Board Wipes', legacyKeys: ['Board Wipes'] },
  { key: 'Theme/Synergy', label: 'Theme/Synergy', legacyKeys: ['Theme/Synergy', 'Synergy'] },
];

export const GeneratedDeckView: React.FC<GeneratedDeckViewProps> = ({
  deck,
  onUpdateDeck,
  onOpenWishlist,
  onOpenCompare,
}) => {
  const [swappingCard, setSwappingCard] = useState<DeckCardRow | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  // Group cards by section with fallback matching
  const groupedCards = SECTIONS.reduce((acc, sectionInfo) => {
    acc[sectionInfo.label] = deck.cards.filter((c) =>
      sectionInfo.legacyKeys.includes(c.section)
    );
    return acc;
  }, {} as Record<string, DeckCardRow[]>);

  // Mana Curve calculation (0 to 6+)
  const manaCurve = [0, 1, 2, 3, 4, 5, 6].map((cmc) => {
    const count = deck.cards.filter((c) =>
      cmc === 6 ? c.card.manaValue >= 6 : c.card.manaValue === cmc
    ).length;
    return { cmc: cmc === 6 ? '6+' : cmc.toString(), count };
  });

  const maxCurveCount = Math.max(...manaCurve.map((m) => m.count), 1);

  const calculateDeckMetrics = (cards: DeckCardRow[]) => {
    const totalCards = cards.length;
    const ownedCards = cards.filter((c) => c.ownership === 'owned');
    const wishlistCards = cards.filter((c) => c.ownership === 'wishlist');
    const ownedCount = ownedCards.length;
    const wishlistCount = wishlistCards.length;
    const ownedPercentage = totalCards > 0 ? Math.round((ownedCount / totalCards) * 100) : 0;
    const wishlistTotalCost = wishlistCards.reduce((sum, c) => sum + (c.estimatedPrice || 0), 0);

    return {
      totalCards,
      ownedPercentage,
      ownedCardsCount: ownedCount,
      wishlistCardsCount: wishlistCount,
      wishlistTotalCost,
    };
  };

  const handleSyncOwnership = (cardId: string) => {
    const updatedCards = deck.cards.map((c) => {
      if (c.card.id === cardId) {
        const nextStatus = c.ownership === 'owned' ? ('wishlist' as const) : ('owned' as const);
        return { ...c, ownership: nextStatus };
      }
      return c;
    });

    const metrics = calculateDeckMetrics(updatedCards);
    onUpdateDeck({
      ...deck,
      cards: updatedCards,
      ...metrics,
    });
  };

  const handleRemoveCard = (cardId: string) => {
    const updatedCards = deck.cards.filter((c) => c.card.id !== cardId);
    const metrics = calculateDeckMetrics(updatedCards);

    onUpdateDeck({
      ...deck,
      cards: updatedCards,
      ...metrics,
    });
  };

  const handleSwapReplacement = (oldCardId: string, newCardRow: DeckCardRow) => {
    const updatedCards = deck.cards.map((c) => (c.card.id === oldCardId ? newCardRow : c));
    const metrics = calculateDeckMetrics(updatedCards);
    onUpdateDeck({ ...deck, cards: updatedCards, ...metrics });
    setSwappingCard(null);
  };

  const ownedCount = deck.ownedCardsCount ?? deck.cards.filter((c) => c.ownership === 'owned').length;
  const wishlistCount = deck.wishlistCardsCount ?? deck.cards.filter((c) => c.ownership === 'wishlist').length;
  const unfillableCount = deck.unfillableSlotsCount ?? 0;
  const buildScore = deck.buildScore ?? 92;

  return (
    <div className="space-y-6" data-testid="generated-deck-view">
      {/* Inline Legality Warnings */}
      {deck.legalityWarnings.map((warning, idx) => (
        <div
          key={idx}
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
            warning.severity === 'error'
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {warning.severity === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <div>
              <span className="font-semibold mr-2">{warning.rule}:</span>
              <span>{warning.message}</span>
            </div>
          </div>
        </div>
      ))}

      {/* Unfillable Slot Gaps Banner */}
      {deck.gaps && deck.gaps.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 flex items-center gap-2.5 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="font-semibold mr-1">Collection Gaps:</span>
            <span>{deck.gaps.join('; ')}</span>
          </div>
        </div>
      )}

      {/* Header Dashboard Metrics */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-violet-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generated Draft Deck</span>
              <span className="ml-2 px-2.5 py-0.5 rounded-full bg-violet-950 border border-violet-500/40 text-violet-300 font-bold text-[11px] flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-400" />
                Build Score: {buildScore} / 100
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-100 mt-1">{deck.name}</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Commander: <span className="text-slate-200 font-semibold">{deck.commander.name}</span>
              {deck.secondaryCommander && (
                <span className="ml-2 text-violet-300 font-medium">
                  + Partner: <span className="text-slate-200 font-semibold">{deck.secondaryCommander.name}</span>
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onOpenCompare && (
              <button
                type="button"
                onClick={onOpenCompare}
                className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <GitCompare className="w-4 h-4 text-indigo-400" />
                <span>Compare Decks</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenWishlist}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-amber-600/20"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>View Wishlist (${deck.wishlistTotalCost.toFixed(2)})</span>
            </button>
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Deck Size</span>
            <div className="text-lg font-black text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-400" />
              <span>{deck.totalCards} / 100</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Collection Coverage</span>
            <div className="text-lg font-black text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{ownedCount} cards ({deck.ownedPercentage}%)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Wishlist Count & Cost</span>
            <div className="text-lg font-black text-amber-300 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>{wishlistCount} cards (${deck.wishlistTotalCost.toFixed(2)})</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Unfillable Slot Gaps</span>
            <div className="text-lg font-black text-slate-200 flex items-center gap-2">
              <AlertCircle className={`w-4 h-4 ${unfillableCount > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>{unfillableCount} {unfillableCount === 1 ? 'gap' : 'gaps'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Avg Mana & Power</span>
            <div className="text-lg font-black text-indigo-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>{deck.averageManaValue} CMC | Lv {deck.powerLevel}</span>
            </div>
          </div>
        </div>

        {/* Mana Curve Visual Chart */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <BarChart2 className="w-4 h-4 text-violet-400" />
            <span>Mana Curve Breakdown</span>
          </div>
          <div className="flex items-end gap-3 h-20 pt-2 px-2 border-b border-slate-800">
            {manaCurve.map((m) => {
              const heightPct = Math.round((m.count / maxCurveCount) * 100);
              return (
                <div key={m.cmc} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[10px] text-slate-400 font-mono group-hover:text-violet-300">
                    {m.count}
                  </span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full bg-violet-600/80 rounded-t group-hover:bg-violet-400 transition-colors min-h-[4px]"
                  />
                  <span className="text-[11px] font-bold text-slate-400">{m.cmc}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Functional Sections Decklist */}
      <div className="space-y-6">
        {SECTIONS.map((sectionInfo) => {
          const cardsInSection = groupedCards[sectionInfo.label] || [];
          if (cardsInSection.length === 0) return null;

          return (
            <div key={sectionInfo.label} className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-500" />
                  <span>{sectionInfo.label}</span>
                  <span className="text-xs font-normal text-slate-500 font-mono">
                    ({cardsInSection.length})
                  </span>
                </h3>
              </div>

              <div className="divide-y divide-slate-800/60 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
                {cardsInSection.map((row) => (
                  <div
                    key={row.card.id}
                    className="relative flex items-center justify-between p-3.5 hover:bg-slate-850 transition-colors group"
                  >
                    {/* Left details */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs text-slate-500 font-bold w-5">
                        {row.quantity}x
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-100 group-hover:text-violet-300 transition-colors truncate">
                            {row.card.name}
                          </span>
                          <span className="font-mono text-xs text-slate-400">
                            {row.card.manaCost}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">{row.card.typeLine}</p>
                      </div>
                    </div>

                    {/* Right side: ownership badge, synergy score hover & action menu */}
                    <div className="flex items-center gap-4">
                      {/* Tooltip trigger for Synergy fit */}
                      <div
                        className="relative"
                        onMouseEnter={() => setHoveredCardId(row.card.id)}
                        onMouseLeave={() => setHoveredCardId(null)}
                      >
                        <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-violet-950/60 border border-violet-500/30 text-violet-300 cursor-help">
                          <Info className="w-3.5 h-3.5 text-violet-400" />
                          <span>{row.synergyScore}% Fit</span>
                        </div>

                        {/* Hover Synergy Tooltip */}
                        {hoveredCardId === row.card.id && (
                          <div className="absolute right-0 bottom-full mb-2 w-64 p-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 shadow-2xl z-40 pointer-events-none animate-in fade-in">
                            <span className="font-bold text-violet-400 block mb-1">
                              Why this card fits:
                            </span>
                            <span>{row.synergyReason}</span>
                          </div>
                        )}
                      </div>

                      {/* Accessible Ownership Badge */}
                      <OwnershipBadge status={row.ownership} price={row.estimatedPrice} />

                      {/* Row Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleSyncOwnership(row.card.id)}
                          aria-label={`Sync ownership for ${row.card.name}`}
                          title="Sync ownership state with collection"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-slate-800 transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setSwappingCard(row)}
                          aria-label={`Swap ${row.card.name}`}
                          title="Swap with owned alternative"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-violet-300 hover:bg-slate-800 transition-colors"
                        >
                          <ArrowLeftRight className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          aria-label={`Move ${row.card.name} to maybeboard`}
                          title="Move to Maybeboard"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                        >
                          <BookmarkPlus className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveCard(row.card.id)}
                          aria-label={`Remove card ${row.card.name}`}
                          title="Remove card"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Swap Modal Drawer */}
      {swappingCard && (
        <SwapCardDrawer
          cardRow={swappingCard}
          onClose={() => setSwappingCard(null)}
          onConfirmSwap={(replacement) => handleSwapReplacement(swappingCard.card.id, replacement)}
        />
      )}
    </div>
  );
};

interface SwapCardDrawerProps {
  cardRow: DeckCardRow;
  onClose: () => void;
  onConfirmSwap: (replacement: DeckCardRow) => void;
}

const SwapCardDrawer: React.FC<SwapCardDrawerProps> = ({ cardRow, onClose, onConfirmSwap }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
        <h3 className="text-lg font-bold text-slate-100">Swap {cardRow.card.name}</h3>
        <p className="text-xs text-slate-400">
          Select a ranked owned alternative from your collection to substitute in this deck.
        </p>

        <div className="space-y-2">
          {cardRow.alternatives && cardRow.alternatives.length > 0 ? (
            cardRow.alternatives.map((alt) => (
              <div
                key={alt.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-violet-500/50 transition-colors"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-200">{alt.name}</h4>
                  <p className="text-xs text-slate-400">{alt.typeLine} • {alt.manaCost}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onConfirmSwap({
                      ...cardRow,
                      card: alt,
                      ownership: 'owned',
                      estimatedPrice: 0,
                    })
                  }
                  className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
                >
                  Swap In
                </button>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-xs text-slate-500">
              No suitable owned alternatives found in inventory for this slot.
            </div>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
