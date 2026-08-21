import React from 'react';
import { Layers } from 'lucide-react';
import { PracticeHandCard } from './PracticeHandCard';
import type { PracticeCard } from '@/types/m3';

interface HandZoneProps {
  hand: PracticeCard[];
  castableSpells?: PracticeCard[];
  onPlay: (card: PracticeCard) => void;
}

export function HandZone({ hand, castableSpells, onPlay }: HandZoneProps) {
  const isCastable = (card: PracticeCard) =>
    Boolean(castableSpells?.some((c) => (c.printingId && c.printingId === card.printingId) || c.name === card.name));

  return (
    <div
      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2"
      data-testid="hand-zone"
    >
      <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <span className="flex items-center gap-1.5 text-violet-400">
          <Layers className="w-3.5 h-3.5" />
          Hand ({hand.length})
        </span>
      </div>

      {hand.length === 0 ? (
        <div className="h-16 flex items-center justify-center text-slate-600 text-xs italic border border-dashed border-slate-800 rounded-lg">
          Your hand is empty.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
          {hand.map((card, idx) => (
            <PracticeHandCard
              key={`${card.printingId ?? card.name}-${idx}`}
              card={card}
              onPlay={onPlay}
              isCastable={isCastable(card)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
