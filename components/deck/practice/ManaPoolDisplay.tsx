import React from 'react';

interface ManaPoolDisplayProps {
  manaPool: Record<string, number>;
}

const MANA_PIP_COLORS: Record<string, string> = {
  W: 'bg-amber-100 text-amber-900 border-amber-300',
  white: 'bg-amber-100 text-amber-900 border-amber-300',
  U: 'bg-blue-600 text-white border-blue-400',
  blue: 'bg-blue-600 text-white border-blue-400',
  B: 'bg-neutral-800 text-neutral-100 border-neutral-600',
  black: 'bg-neutral-800 text-neutral-100 border-neutral-600',
  R: 'bg-red-600 text-white border-red-400',
  red: 'bg-red-600 text-white border-red-400',
  G: 'bg-emerald-600 text-white border-emerald-400',
  green: 'bg-emerald-600 text-white border-emerald-400',
  C: 'bg-stone-300 text-stone-800 border-stone-400',
  colorless: 'bg-stone-300 text-stone-800 border-stone-400',
  any: 'bg-purple-900 text-purple-200 border-purple-500',
};

const MANA_LABEL_MAP: Record<string, string> = {
  white: 'W',
  blue: 'U',
  black: 'B',
  red: 'R',
  green: 'G',
  colorless: 'C',
  any: 'Any',
};

export function ManaPoolDisplay({ manaPool }: ManaPoolDisplayProps) {
  const nonZeroEntries = Object.entries(manaPool).filter(([, count]) => count > 0);

  if (nonZeroEntries.length === 0) return null;

  return (
    <div
      data-testid="mana-pool"
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-xs"
    >
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-0.5">Mana Pool:</span>
      <div className="flex items-center gap-1.5 flex-wrap">
        {nonZeroEntries.map(([key, count]) => {
          const label = MANA_LABEL_MAP[key] ?? key;
          const color = MANA_PIP_COLORS[key] ?? 'bg-zinc-700 text-zinc-100 border-zinc-500';
          return (
            <span
              key={key}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-950 border border-slate-700"
            >
              <span
                className={`inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px] font-extrabold shadow-xs ${color}`}
              >
                {label}
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-200">{count}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
