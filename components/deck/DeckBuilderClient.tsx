'use client';

import React, { useState, useEffect } from 'react';
import { CardSearchBar } from '@/components/cards/CardSearchBar';
import { CardFilterPanel } from '@/components/cards/CardFilterPanel';
import { DeckWorkspace } from '@/components/deck/DeckWorkspace';
import { DeckStats } from '@/components/deck/DeckStats';
import { FormatValidator } from '@/components/deck/FormatValidator';
import { CardTile } from '@/components/cards/CardTile';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useDeckStore } from '@/lib/store/deck-store';
import { Card } from '@/types/card';

export function DeckBuilderClient() {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { addCard } = useDeckStore();

  useEffect(() => {
    // Simple fetch for the catalog side
    const fetchCards = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/v1/cards?q=${searchQuery}`);
        const data = await res.json();
        setCards(data.data || []);
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
    <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-4rem)] flex gap-6">
      {/* Left Panel: Catalog (Search & Results) */}
      <div className="w-1/2 flex flex-col gap-4 h-full">
        <h1 className="text-3xl font-bold text-white mb-2">Card Catalog</h1>
        <div className="flex flex-col gap-4">
          <CardSearchBar 
            onSearch={setSearchQuery} 
            placeholder="Search cards to add..." 
          />
          {/* We would wire this up properly later, for now just a UI placeholder */}
          <CardFilterPanel onFilterChange={() => {}} />
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mt-4">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
               <LoadingSkeleton count={4} />
            </div>
          ) : cards.length === 0 ? (
            <EmptyState 
              title="No cards found" 
              message="Try adjusting your search query."
            />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {cards.map((card) => (
                <div key={card.id} className="relative group">
                  <CardTile card={card} />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                    <button 
                      onClick={() => addCard(card)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all"
                    >
                      Add to Deck
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Deck Builder Workspace */}
      <div className="w-1/2 flex flex-col gap-4 h-full">
        <div className="flex-1 min-h-0">
          <DeckWorkspace />
        </div>
        <div className="h-64 flex gap-4 shrink-0">
          <div className="flex-1">
            <DeckStats />
          </div>
        </div>
        <div className="shrink-0">
          <FormatValidator />
        </div>
      </div>
    </div>
  );
}
