'use client';

import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useDeckStore, type DeckCard } from '@/lib/store/deck-store';

export function DeckWorkspace() {
  const { cards, metadata, addCard, removeCard, isLoading } = useDeckStore();

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

  const totalCards = cards.reduce((sum, c) => sum + c.quantity, 0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/50">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-4" />
        <p className="text-zinc-500 font-medium">Loading deck...</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/50">
        <p className="text-zinc-500 font-medium">Your deck is empty</p>
        <p className="text-zinc-600 text-sm mt-2">Search for cards and add them here.</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-6 flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-end mb-6 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">{metadata.name}</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm font-semibold text-zinc-400 bg-zinc-800 px-3 py-1 rounded-full">
              {totalCards} Cards
            </span>
            <span className="text-sm font-semibold text-zinc-400 bg-zinc-800 px-3 py-1 rounded-full">
              {metadata.format}
            </span>
          </div>
        </div>
        
      </div>

      <div className="overflow-y-auto pr-2 space-y-6 flex-1 custom-scrollbar">
        {Object.entries(groupedCards).map(([type, typeCards]) => (
          <div key={type} className="space-y-2">
            <h3 className="font-semibold text-zinc-400 border-b border-zinc-800/50 pb-1 mb-3">
              {type} ({typeCards.reduce((sum, c) => sum + c.quantity, 0)})
            </h3>
            <ul className="space-y-2">
              {typeCards.map(({ deckCardId, card, quantity, deckSection }) => (
                <li key={deckCardId} className="flex items-center justify-between group hover:bg-zinc-800/50 p-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="text-zinc-500 font-mono text-xs w-6 text-right">x{quantity}</span>
                    <span className="text-zinc-200 font-medium truncate group-hover:text-green-400 transition-colors">
                      {card.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      type="button"
                      onClick={() => removeCard(deckCardId)}
                      className="w-6 h-6 rounded flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
                      aria-label="Remove one"
                    >
                      -
                    </button>
                    <button 
                      type="button"
                      onClick={() => addCard(card, deckSection)}
                      className="w-6 h-6 rounded flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
                      aria-label="Add one"
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
