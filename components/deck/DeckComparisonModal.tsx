import React from 'react';
import { X, GitCompare, Layers, ShieldCheck, DollarSign, Zap, Trophy } from 'lucide-react';
import { GeneratedDeck } from '@/types/builder';

interface DeckComparisonModalProps {
  decks: GeneratedDeck[];
  isOpen: boolean;
  onClose: () => void;
}

export const DeckComparisonModal: React.FC<DeckComparisonModalProps> = ({
  decks,
  isOpen,
  onClose,
}) => {
  if (!isOpen || decks.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="deck-comparison-modal-title"
      >
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-400">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h2 id="deck-comparison-modal-title" className="text-xl font-bold text-slate-100">
                Side-by-Side Deck Comparison
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Comparing {decks.length} generated deck strategies
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Grid Matrix */}
        <div className="p-6 overflow-x-auto overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck, idx) => (
              <div
                key={deck.id || idx}
                className="rounded-xl bg-slate-950 border border-slate-800 p-5 space-y-4 shadow-lg flex flex-col justify-between"
              >
                {/* Header info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-500/30 uppercase">
                      Option #{idx + 1}
                    </span>
                    <span className="text-xs text-slate-400">{deck.commander.name}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100">{deck.name}</h3>
                </div>

                {/* Metrics list */}
                <div className="space-y-2.5 text-xs py-3 border-y border-slate-800/80">
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Collection Coverage
                    </span>
                    <span className="font-bold text-emerald-400">{deck.ownedPercentage}% Owned</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded bg-slate-900">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-amber-400" />
                      Wishlist Cost
                    </span>
                    <span className="font-bold text-amber-300">${deck.wishlistTotalCost.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded bg-slate-900">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      Power Level
                    </span>
                    <span className="font-bold text-violet-300">Level {deck.powerLevel} / 10</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded bg-slate-900">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-indigo-400" />
                      Average Mana (CMC)
                    </span>
                    <span className="font-bold text-indigo-300">{deck.averageManaValue} CMC</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded bg-slate-900">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-slate-400" />
                      Total Deck Cards
                    </span>
                    <span className="font-bold text-slate-200">{deck.totalCards} cards</span>
                  </div>
                </div>

                {/* Color identity pips */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Color Identity:</span>
                  <div className="flex items-center gap-1">
                    {deck.commander.colorIdentity.map((c) => (
                      <span
                        key={c}
                        className="w-5 h-5 rounded-full text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
