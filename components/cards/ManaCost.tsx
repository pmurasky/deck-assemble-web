import React from 'react';

interface ManaCostProps {
  manaCost?: string;
  className?: string;
}

const colorMap: Record<string, string> = {
  W: 'bg-amber-100 text-amber-900 border-amber-300',
  U: 'bg-blue-600 text-white border-blue-400',
  B: 'bg-neutral-800 text-neutral-100 border-neutral-600',
  R: 'bg-red-600 text-white border-red-400',
  G: 'bg-emerald-600 text-white border-emerald-400',
  C: 'bg-stone-300 text-stone-800 border-stone-400',
};

export function ManaCost({ manaCost, className = '' }: ManaCostProps) {
  if (!manaCost) return null;

  const symbols = manaCost.match(/\{([^}]+)\}/g)?.map((s) => s.replace(/[{}]/g, '')) || [];

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {symbols.map((symbol, idx) => {
        const style = colorMap[symbol] || 'bg-zinc-700 text-zinc-100 border-zinc-500';
        return (
          <span
            key={idx}
            className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs font-bold shadow-xs ${style}`}
          >
            {symbol}
          </span>
        );
      })}
    </div>
  );
}
