'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CardSearchBar } from '@/components/cards/CardSearchBar';
import { CardFilterPanel, CardFilters } from '@/components/cards/CardFilterPanel';
import { DeckWorkspace } from '@/components/deck/DeckWorkspace';
import { DeckStats } from '@/components/deck/DeckStats';
import { FormatValidator } from '@/components/deck/FormatValidator';
import { CardTile } from '@/components/cards/CardTile';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useDeckStore } from '@/lib/store/deck-store';
import type { Card } from '@/types/card';

export function DeckBuilderClient() {
  const searchParams = useSearchParams();
  const deckId = searchParams?.get('deckId');

  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CardFilters>({
    colors: [],
    types: [],
    manaValue: 0
  });
  
  const { id: activeDeckId, cards: activeCards, commander: activeCommander, isLoading: isDeckLoading, fetchDeckCards, addCard } = useDeckStore();

  useEffect(() => {
    if (deckId && (deckId !== activeDeckId || (activeCards.length === 0 && !activeCommander && !isDeckLoading))) {
      fetchDeckCards(deckId);
    }
  }, [deckId, activeDeckId, activeCards.length, activeCommander, isDeckLoading, fetchDeckCards]);

  useEffect(() => {
    // Simple fetch for the catalog side
    const fetchCards = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/v1/cards?q=${searchQuery}`);
        const data = await res.json();
        setCards(data.data?.cards || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Add a small debounce
    const timeoutId = setTimeout(() => {
      fetchCards();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-6 h-[calc(100vh-4rem)] flex flex-col gap-4">
      {/* Header Bar with Deck Legality Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">DECK BUILDER STUDIO</h1>
          <p className="text-xs text-zinc-400">Construct, analyze, and validate your custom Magic & Marvel Commander decks.</p>
        </div>
        <div className="shrink-0">
          <FormatValidator />
        </div>
      </div>

      {/* 3-Column Studio Grid Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 overflow-hidden">
        {/* Column 1: Filters & Search (3 cols ~25%) */}
        <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <CardSearchBar onSearch={setSearchQuery} placeholder="Search catalog cards..." />
          <CardFilterPanel filters={filters} onFilterChange={setFilters} />
        </div>

        {/* Column 2: Card Catalog Grid Showcase (5 cols ~42%) */}
        <div className="lg:col-span-5 flex flex-col h-full overflow-hidden bg-zinc-950/60 rounded-2xl border border-zinc-800 p-4">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-zinc-800/80">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Card Catalog ({cards.length} results)
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-64 bg-zinc-900/60 border border-zinc-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : cards.length === 0 ? (
              <EmptyState title="No cards found" description="Try adjusting your search query or filters." />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {cards.map((card) => (
                  <div key={card.printingId ?? card.id} className="relative group">
                    <CardTile card={card} />
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2 items-center justify-center rounded-xl p-3 backdrop-blur-xs">
                      <button
                        type="button"
                        onClick={() => addCard(card)}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-3 rounded-xl shadow-lg transition-all text-xs"
                      >
                        + Add to Deck
                      </button>
                      {card.typeLine.toLowerCase().includes('legendary') && (
                        <button
                          type="button"
                          onClick={() => useDeckStore.getState().setCommander(card)}
                          className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-1.5 px-3 rounded-xl shadow transition-all text-xs"
                        >
                          Set as Commander
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Deck Workspace & Deck Analytics (4 cols ~33%) */}
        <div className="lg:col-span-4 flex flex-col gap-4 h-full overflow-hidden">
          <div className="flex-1 min-h-0">
            <DeckWorkspace />
          </div>
          <div className="h-72 shrink-0 overflow-y-auto custom-scrollbar">
            <DeckStats />
          </div>
        </div>
      </div>
    </div>
  );
}
