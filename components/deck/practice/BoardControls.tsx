import React from 'react';
import { Play, RotateCcw } from 'lucide-react';

interface BoardControlsProps {
  turn: number;
  landPlayed: boolean;
  landsInPlay: number;
  onNextTurn: () => void;
  onReset: () => void;
}

export function BoardControls({
  turn,
  landPlayed,
  landsInPlay,
  onNextTurn,
  onReset,
}: BoardControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800">
      <div className="flex flex-wrap items-center gap-3">
        <div className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-sm shadow-xs">
          Turn {turn}
        </div>
        <div
          data-testid="land-drop-status"
          className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 ${
            landPlayed
              ? 'bg-slate-900 border-slate-700 text-slate-400'
              : 'bg-emerald-950/60 border-emerald-700/80 text-emerald-300'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${landPlayed ? 'bg-slate-500' : 'bg-emerald-400 animate-pulse'}`} />
          <span>{landPlayed ? 'Land Drop Used' : 'Land Drop Available'}</span>
        </div>
        <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
          Lands in play: <span className="font-bold text-amber-400">{landsInPlay}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onNextTurn}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Next Turn</span>
        </button>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all border border-slate-700 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
}
