import React from 'react';
import { Sparkles } from 'lucide-react';
import { PracticeBattlefieldCard } from './PracticeBattlefieldCard';
import type { PracticeCard, PracticeSessionResponse } from '@/types/m3';

interface BattlefieldZoneProps {
  battlefield: PracticeSessionResponse['battlefield'];
  onToggleTap: (card: PracticeCard) => void;
}

export function BattlefieldZone({ battlefield, onToggleTap }: BattlefieldZoneProps) {
  return (
    <div
      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 min-h-[160px] space-y-2"
      data-testid="battlefield-zone"
    >
      <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <Sparkles className="w-3.5 h-3.5" />
          Battlefield ({battlefield.length})
        </span>
        <span className="text-[11px] normal-case text-slate-500">Click a permanent to tap/untap</span>
      </div>

      {battlefield.length === 0 ? (
        <div className="h-24 flex items-center justify-center text-slate-600 text-xs italic border border-dashed border-slate-800 rounded-lg">
          No permanents on battlefield. Play cards from your hand below.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2.5 pt-1">
          {battlefield.map((entry, idx) => (
            <PracticeBattlefieldCard
              key={`${entry.card.printingId ?? entry.card.name}-${idx}`}
              card={entry.card}
              tapped={entry.tapped}
              onToggleTap={onToggleTap}
            />
          ))}
        </div>
      )}
    </div>
  );
}
