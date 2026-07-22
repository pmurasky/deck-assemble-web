'use client';

import React from 'react';
import { useDeckStore } from '@/lib/store/deck-store';
import { MOCK_CARDS } from '@/lib/mock-data/cards';
import { CardTile } from '@/components/cards/CardTile';
import { Zap, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export function RecommendationsClient() {
  const { cards, commander, addCard } = useDeckStore();

  if (!commander && cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
        <AlertCircle className="w-16 h-16 text-zinc-600 mb-4" />
        <h3 className="text-xl font-bold text-zinc-300">No active deck</h3>
        <p className="text-zinc-500 mt-2 mb-6 max-w-md text-center">
          You need an active deck to get recommendations. Head over to the Deck Builder to start brewing, or select a Commander to see what synergizes well with it.
        </p>
        <Link 
          href="/deck-builder"
          className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors"
        >
          Go to Deck Builder
        </Link>
      </div>
    );
  }

  // Recommendation Algorithm
  // 1. Omit cards already in the deck
  const deckCardIds = new Set(cards.map(c => c.card.id));
  let recommendations = MOCK_CARDS.filter(card => !deckCardIds.has(card.id));

  // 2. Filter by Commander's color identity if a commander is selected
  if (commander && commander.colorIdentity.length > 0) {
    const commanderColors = new Set(commander.colorIdentity);
    recommendations = recommendations.filter(card => {
      // A card can be included if ALL of its colors are in the commander's color identity.
      // Colorless cards (length 0) can go in any deck.
      if (card.colorIdentity.length === 0) return true;
      return card.colorIdentity.every(color => commanderColors.has(color));
    });
  }

  // 3. Simple sorting/scoring (Mock synergy)
  // - Prioritize cards that share types with the commander
  if (commander) {
    const commanderTypes = commander.typeLine.toLowerCase().split(/[ —-]+/);
    
    recommendations.sort((a, b) => {
      const aTypes = a.typeLine.toLowerCase();
      const bTypes = b.typeLine.toLowerCase();
      
      const aScore = commanderTypes.some(t => aTypes.includes(t)) ? 1 : 0;
      const bScore = commanderTypes.some(t => bTypes.includes(t)) ? 1 : 0;
      
      if (bScore !== aScore) {
        return bScore - aScore;
      }
      
      return a.id.localeCompare(b.id);
    });
  }


  // Limit to top 20 recommendations
  const topRecommendations = recommendations.slice(0, 20);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Zap className="text-yellow-400 w-8 h-8 fill-yellow-400" />
            Recommendations
          </h1>
          <p className="text-zinc-400 mt-2">
            AI-powered suggestions based on your active deck 
            {commander ? (
              <span> and your Commander <strong className="text-green-400">{commander.name}</strong></span>
            ) : ''}.
          </p>
        </div>
      </div>

      {topRecommendations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-500">No recommendations found. Try expanding your search or choosing a different Commander.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {topRecommendations.map(card => (
            <CardTile 
              key={card.id} 
              card={card} 
              onAddToDeck={addCard} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
