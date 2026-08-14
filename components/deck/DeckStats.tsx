'use client';

import React, { useMemo } from 'react';
import { useDeckStore } from '@/lib/store/deck-store';
import { BarChart3, Palette } from 'lucide-react';

export function DeckStats() {
  const { cards } = useDeckStore();

  const { totalMana, totalCardsWithCost, colorCounts, manaCurveBars } = useMemo(() => {
    let manaSum = 0;
    let cardCount = 0;
    const colors: Record<string, number> = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
    const curveCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    cards.forEach(({ card, quantity }) => {
      // Exclude lands from average mana value (roughly via typeLine)
      if (!card.typeLine.includes('Land')) {
        const mv = card.manaValue || 0;
        manaSum += mv * quantity;
        cardCount += quantity;

        const bucket = Math.min(Math.max(Math.floor(mv), 0), 6);
        curveCounts[bucket] = (curveCounts[bucket] || 0) + quantity;
      }

      // Count color identity
      if (card.colorIdentity && card.colorIdentity.length > 0) {
        card.colorIdentity.forEach((color) => {
          if (colors[color] !== undefined) {
            colors[color] += quantity;
          }
        });
      } else if (!card.typeLine.includes('Land')) {
        colors.C += quantity;
      }
    });

    return {
      totalMana: manaSum,
      totalCardsWithCost: cardCount,
      colorCounts: colors,
      manaCurveBars: curveCounts,
    };
  }, [cards]);

  const avgManaValue = totalCardsWithCost > 0 ? (totalMana / totalCardsWithCost).toFixed(1) : '0.0';

  const maxColorCount = Math.max(...Object.values(colorCounts), 1);
  const maxCurveCount = Math.max(...Object.values(manaCurveBars), 1);

  return (
    <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 flex flex-col space-y-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2 text-zinc-100 font-bold text-base">
          <BarChart3 className="w-4 h-4 text-purple-400" />
          <h2>Deck Analytics</h2>
        </div>
        <div className="bg-zinc-950 px-3 py-1 rounded-xl border border-zinc-800 flex items-center gap-2">
          <span className="text-xs text-zinc-400">Avg. CMC</span>
          <span className="text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            {avgManaValue}
          </span>
        </div>
      </div>

      {/* Mana Curve Histogram */}
      <div className="space-y-3">
        <h3 className="font-semibold text-xs text-zinc-400 uppercase tracking-wider">Mana Curve</h3>
        <div className="bg-zinc-950/80 rounded-xl p-3 border border-zinc-800/80">
          <div className="flex items-end justify-between gap-1.5 h-24 pt-4 px-1">
            {[0, 1, 2, 3, 4, 5, 6].map((cmc) => {
              const count = manaCurveBars[cmc] || 0;
              const heightPercent = maxCurveCount > 0 ? Math.round((count / maxCurveCount) * 100) : 0;
              const label = cmc === 6 ? '6+' : String(cmc);
              return (
                <div key={cmc} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <span className="text-[10px] font-mono text-zinc-400 group-hover:text-purple-300 transition-colors">
                    {count > 0 ? count : ''}
                  </span>
                  <div className="w-full bg-zinc-900 rounded-t flex items-end overflow-hidden h-16">
                    <div
                      className="w-full bg-gradient-to-t from-purple-600 to-blue-500 rounded-t transition-all duration-500 group-hover:from-purple-500 group-hover:to-blue-400"
                      style={{ height: `${Math.max(heightPercent, count > 0 ? 12 : 0)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-zinc-500">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Color Distribution */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-zinc-400" />
          <h3 className="font-semibold text-xs text-zinc-400 uppercase tracking-wider">Color Distribution</h3>
        </div>
        <div className="space-y-2 pt-1">
          {Object.entries(colorCounts)
            .filter(([, count]) => count > 0)
            .map(([color, count]) => {
              const percentage = (count / maxColorCount) * 100;
              const bgColors: Record<string, string> = {
                W: 'bg-amber-100 text-zinc-900 border-amber-300',
                U: 'bg-blue-600 text-white border-blue-400',
                B: 'bg-zinc-800 text-zinc-200 border-zinc-600',
                R: 'bg-red-600 text-white border-red-400',
                G: 'bg-emerald-600 text-white border-emerald-400',
                C: 'bg-zinc-600 text-white border-zinc-500',
              };

              return (
                <div key={color} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold border ${bgColors[color]}`}>
                    {color}
                  </div>
                  <div className="flex-1 h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      className={`h-full ${bgColors[color].split(' ')[0]} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-6 text-right text-xs font-mono font-semibold text-zinc-400">{count}</div>
                </div>
              );
            })}

          {Object.values(colorCounts).every((v) => v === 0) && (
            <div className="text-zinc-600 italic text-xs text-center py-2">Add cards to see color distribution</div>
          )}
        </div>
      </div>
    </div>
  );
}
