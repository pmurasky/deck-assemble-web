import React from 'react';
import { Layers, Archive } from 'lucide-react';

interface DeckPileStatusProps {
  libraryCount: number;
  graveyardCount: number;
}

export function DeckPileStatus({ libraryCount, graveyardCount }: DeckPileStatusProps) {
  return (
    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 shadow-xs">
        <Layers className="w-3.5 h-3.5 text-amber-400" />
        <span className="font-semibold text-slate-300">{libraryCount} in library</span>
      </span>
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 shadow-xs">
        <Archive className="w-3.5 h-3.5 text-slate-500" />
        <span className="font-semibold text-slate-300">{graveyardCount} in graveyard</span>
      </span>
    </div>
  );
}
