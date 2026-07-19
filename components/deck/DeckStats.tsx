'use client';

import React, { useMemo } from 'react';
import { useDeckStore } from '@/lib/store/deck-store';

export function DeckStats() {
  const { cards } = useDeckStore();

  const { totalMana, totalCardsWithCost, colorCounts } = useMemo(() => {
    let manaSum = 0;
    let cardCount = 0;
    const colors: Record<string, number> = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };

    cards.forEach(({ card, quantity }) => {
      // Exclude lands from average mana value (roughly via typeLine)
      if (!card.typeLine.includes('Land')) {
        manaSum += (card.manaValue || 0) * quantity;
        cardCount += quantity;
      }

      // Count color identity
      if (card.colorIdentity && card.colorIdentity.length > 0) {
        card.colorIdentity.forEach(color => {
          if (colors[color] !== undefined) {
            colors[color] += quantity;
          }
        });
      } else if (!card.typeLine.includes('Land')) {
        colors.C += quantity;
      }
    });

    return { totalMana: manaSum, totalCardsWithCost: cardCount, colorCounts: colors };
  }, [cards]);

  const avgManaValue = totalCardsWithCost > 0 ? (totalMana / totalCardsWithCost).toFixed(1) : '0.0';

  const maxColorCount = Math.max(...Object.values(colorCounts), 1);

  return (
    <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-6 flex flex-col h-full space-y-6">
      <h2 className="text-2xl font-bold text-zinc-100 border-b border-zinc-800 pb-4">Deck Stats</h2>

      {/* Mana Curve / Stats */}
      <div className="space-y-4">
        <h3 className="font-semibold text-zinc-400">Mana Curve</h3>
        <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800/80 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              {avgManaValue}
            </div>
            <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">Avg. Mana Value</div>
          </div>
        </div>
      </div>

      {/* Color Distribution */}
      <div className="space-y-4 flex-1">
        <h3 className="font-semibold text-zinc-400">Color Distribution</h3>
        <div className="space-y-3 pt-2">
          {Object.entries(colorCounts).filter(([_, count]) => count > 0).map(([color, count]) => {
            const percentage = (count / maxColorCount) * 100;
            const bgColors: Record<string, string> = {
              W: 'bg-yellow-100',
              U: 'bg-blue-500',
              B: 'bg-zinc-800',
              R: 'bg-red-500',
              G: 'bg-green-500',
              C: 'bg-zinc-500'
            };
            
            const labels: Record<string, string> = {
              W: 'White', U: 'Blue', B: 'Black', R: 'Red', G: 'Green', C: 'Colorless'
            };

            return (
              <div key={color} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-inner text-xs font-bold ${bgColors[color]} ${color === 'W' ? 'text-black' : 'text-white'}`}>
                  {color}
                </div>
                <div className="flex-1 h-3 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                  <div 
                    className={`h-full ${bgColors[color]} transition-all duration-500`} 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-8 text-right text-sm font-mono text-zinc-400">{count}</div>
              </div>
            );
          })}
          
          {Object.values(colorCounts).every(v => v === 0) && (
             <div className="text-zinc-600 italic text-sm text-center py-4">Add cards to see color distribution</div>
          )}
        </div>
      </div>
    </div>
  );
}
