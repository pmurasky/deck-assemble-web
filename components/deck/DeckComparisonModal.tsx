import React from 'react';
import { X } from 'lucide-react';
import { GeneratedDeck } from '@/types/builder';
import { DeckComparisonView } from './DeckComparisonView';

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

  const baseDeck = decks[0];
  const otherDecks = decks.length > 1 ? decks.slice(1) : [decks[0]];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="deck-comparison-modal-title"
      >
        <div className="absolute top-4 right-4 z-10">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors bg-slate-950/60 backdrop-blur-md border border-slate-700/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[92vh]">
          <DeckComparisonView baseDeck={baseDeck} otherDecks={otherDecks} onClose={onClose} />
        </div>
      </div>
    </div>
  );
};
