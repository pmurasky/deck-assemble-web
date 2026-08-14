'use client';

import { useMemo, useState } from 'react';
import { Loader2, Crown, Layers, Plus, Minus, Download, BarChart2, ShoppingCart, ArrowRightLeft, TrendingUp } from 'lucide-react';
import { useDeckStore, type DeckCard } from '@/lib/store/deck-store';
import { ExportDeckModal } from '@/components/export/ExportDeckModal';
import { DeckAnalysisPanel } from '@/components/deck/DeckAnalysisPanel';
import { DeckHistoryPanel } from '@/components/deck/DeckHistoryPanel';
import { DeckSimulationPanel } from '@/components/deck/DeckSimulationPanel';
import { DeckPublishingModal } from '@/components/deck/DeckPublishingModal';
import { DeckWishlistPanel } from '@/components/deck/DeckWishlistPanel';
import { DeckCardAlternativesFlyout } from '@/components/deck/DeckCardAlternativesFlyout';
import { DeckUpgradePlanModal } from '@/components/deck/DeckUpgradePlanModal';

export function DeckWorkspace() {
  const { id, cards, metadata, commander, addCard, removeCard, isLoading } = useDeckStore();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [alternativesTarget, setAlternativesTarget] = useState<{ deckCardId: number | string; name: string } | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSimOpen, setIsSimOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);

  const groupedCards = useMemo(() => {
    return cards.reduce((acc, deckCard) => {
      // Determine primary type (e.g., Creature, Instant, Land)
      const primaryType = deckCard.card.typeLine.split('—')[0].trim().split(' ')[0];
      if (!acc[primaryType]) {
        acc[primaryType] = [];
      }
      acc[primaryType].push(deckCard);
      return acc;
    }, {} as Record<string, DeckCard[]>);
  }, [cards]);

  const hasSeparateCommander = Boolean(
    commander && !cards.some((c) => c.card.id === commander.id)
  );
  const totalCards = cards.reduce((sum, c) => sum + c.quantity, 0) + (hasSeparateCommander ? 1 : 0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/50">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-4" />
        <p className="text-zinc-500 font-medium text-sm">Loading deck workspace...</p>
      </div>
    );
  }

  if (cards.length === 0 && !commander) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/50 p-6 text-center">
        <Layers className="w-12 h-12 text-zinc-700 mb-3" />
        <p className="text-zinc-400 font-bold">Your deck is empty</p>
        <p className="text-zinc-500 text-xs mt-1">Search for cards in the catalog to add them to your deck.</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 flex flex-col h-full overflow-hidden shadow-xl">
      <div className="flex justify-between items-start mb-4 pb-4 border-b border-zinc-800">
        <div className="space-y-1 max-w-[50%]">
          <h2 className="text-xl font-extrabold text-zinc-100 truncate tracking-tight">{metadata.name}</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-300 bg-zinc-800/80 px-2.5 py-0.5 rounded-lg border border-zinc-700/50">
              {totalCards} Cards
            </span>
            <span className="text-xs font-semibold text-purple-400 bg-purple-950/40 px-2.5 py-0.5 rounded-lg border border-purple-900/40">
              {metadata.format}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 rounded-xl text-xs font-bold transition-colors border border-zinc-700"
            title="Revision History"
          >
            History
          </button>
          <button
            type="button"
            onClick={() => setIsSimOpen(true)}
            className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 rounded-xl text-xs font-bold transition-colors border border-zinc-700"
            title="Run Simulations"
          >
            Simulate
          </button>
          <button
            type="button"
            onClick={() => setIsPublishOpen(true)}
            className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 rounded-xl text-xs font-bold transition-colors border border-zinc-700"
            title="Publish & Share Primer"
          >
            Share
          </button>
          <button
            type="button"
            onClick={() => setIsWishlistOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 rounded-xl text-xs font-bold transition-colors border border-zinc-700"
            title="Deck Wishlist"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Wishlist
          </button>
          <button
            type="button"
            onClick={() => setIsUpgradeOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 rounded-xl text-xs font-bold transition-colors border border-zinc-700"
            title="Deck Upgrade Plan"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Upgrade
          </button>
          <button
            type="button"
            onClick={() => setIsAnalysisOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-purple-300 rounded-xl text-xs font-bold transition-colors border border-zinc-700"
            title="Deck Analysis"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Analyze
          </button>
          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-purple-950/50"
            title="Export Deck"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      <div className="overflow-y-auto pr-1 space-y-5 flex-1 custom-scrollbar">
        {commander && (
          <div className="bg-gradient-to-r from-emerald-950/40 to-zinc-950/60 p-3.5 rounded-xl border border-emerald-800/50 shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Commander</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">
                x1
              </span>
            </div>
            <div className="flex items-center gap-3">
              {commander.imageUrl && (
                <img
                  src={commander.imageUrl}
                  alt={commander.name}
                  className="w-10 h-14 object-cover rounded border border-emerald-700/40 shadow"
                />
              )}
              <div className="overflow-hidden">
                <p className="text-sm font-extrabold text-emerald-200 truncate">{commander.name}</p>
                <p className="text-xs text-zinc-400 truncate">{commander.typeLine}</p>
              </div>
            </div>
          </div>
        )}

        {Object.entries(groupedCards).map(([type, typeCards]) => {
          const sectionTotal = typeCards.reduce((sum, c) => sum + c.quantity, 0);
          return (
            <div key={type} className="space-y-2">
              <div className="flex justify-between items-center border-b border-zinc-800/60 pb-1.5 mb-2">
                <h3 className="font-bold text-xs text-zinc-400 uppercase tracking-wider">{type}</h3>
                <span className="text-xs font-mono text-zinc-500 font-semibold">{sectionTotal}</span>
              </div>
              <ul className="space-y-1">
                {typeCards.map(({ deckCardId, card, quantity, deckSection }) => (
                  <li
                    key={deckCardId}
                    className="flex items-center justify-between group hover:bg-zinc-800/60 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="text-zinc-500 font-mono text-xs w-5 text-right font-bold">x{quantity}</span>
                      <span className="text-zinc-200 text-xs font-medium truncate group-hover:text-purple-300 transition-colors">
                        {card.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setAlternativesTarget({ deckCardId, name: card.name })}
                        className="w-6 h-6 sm:w-5 sm:h-5 rounded flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-purple-400 hover:text-purple-200 transition-colors active:scale-95"
                        title="Find Alternatives"
                        aria-label={`Alternatives for ${card.name}`}
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCard(deckCardId)}
                        className="w-6 h-6 sm:w-5 sm:h-5 rounded flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors active:scale-95"
                        aria-label="Remove one"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => addCard(card, deckSection)}
                        className="w-6 h-6 sm:w-5 sm:h-5 rounded flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors active:scale-95"
                        aria-label="Add one"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {id && (
        <ExportDeckModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          deckId={id}
          deckName={metadata.name}
        />
      )}

      {isAnalysisOpen && id && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-5xl w-full p-6 text-zinc-100 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-800">
              <div>
                <h3 className="text-xl font-bold text-white">Deck Analytics: {metadata.name}</h3>
                <p className="text-xs text-zinc-400">Detailed breakdown of mana curve, colors, ownership & combos</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAnalysisOpen(false)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
            <DeckAnalysisPanel deckId={id} />
          </div>
        </div>
      )}

      {isWishlistOpen && id && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-4xl w-full p-6 text-zinc-100 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <DeckWishlistPanel deckId={id} onBackToDeck={() => setIsWishlistOpen(false)} />
          </div>
        </div>
      )}

      {isHistoryOpen && id && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-3xl w-full p-6 text-zinc-100 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
            <DeckHistoryPanel deckId={id} currentRevision={1} />
          </div>
        </div>
      )}

      {isSimOpen && id && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-4xl w-full p-6 text-zinc-100 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => setIsSimOpen(false)}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
            <DeckSimulationPanel deckId={id} />
          </div>
        </div>
      )}

      {isPublishOpen && id && (
        <DeckPublishingModal
          deckId={id}
          isOpen={isPublishOpen}
          onClose={() => setIsPublishOpen(false)}
        />
      )}

      {isUpgradeOpen && id && (
        <DeckUpgradePlanModal
          deckId={id}
          isOpen={isUpgradeOpen}
          onClose={() => setIsUpgradeOpen(false)}
        />
      )}

      {alternativesTarget && id && (
        <DeckCardAlternativesFlyout
          isOpen={Boolean(alternativesTarget)}
          onClose={() => setAlternativesTarget(null)}
          deckId={id}
          deckCardId={alternativesTarget.deckCardId}
          cardName={alternativesTarget.name}
        />
      )}
    </div>
  );
}

