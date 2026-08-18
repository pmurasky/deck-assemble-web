import React from 'react';
import { Flame } from 'lucide-react';

interface GameChangersSectionProps {
  gameChangers?: string[];
}

export function GameChangersSection({ gameChangers = [] }: GameChangersSectionProps) {
  const hasGameChangers = gameChangers.length > 0;

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-400" />
          <h4 className="text-base font-bold text-white">Game Changers</h4>
        </div>
        {hasGameChangers ? (
          <span className="text-[10px] uppercase font-semibold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
            {gameChangers.length} Flagged
          </span>
        ) : (
          <span className="text-[10px] uppercase font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
            Clean List
          </span>
        )}
      </div>

      {hasGameChangers ? (
        <div className="flex flex-wrap gap-2">
          {gameChangers.map((cardName) => (
            <span
              key={cardName}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs font-medium"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              {cardName}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-zinc-500 italic">No Game Changers flagged in this deck.</p>
      )}
    </div>
  );
}
