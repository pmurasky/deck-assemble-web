import React from 'react';

interface ColorIdentityBadgeProps {
  colors: string[];
  className?: string;
}

const COLOR_NAMES: Record<string, string> = {
  W: 'White',
  U: 'Blue',
  B: 'Black',
  R: 'Red',
  G: 'Green',
  C: 'Colorless',
};

const COLOR_STYLES: Record<string, string> = {
  W: 'bg-amber-100 text-amber-900 border-amber-300',
  U: 'bg-blue-900/60 text-blue-200 border-blue-700',
  B: 'bg-zinc-800 text-zinc-200 border-zinc-700',
  R: 'bg-red-900/60 text-red-200 border-red-700',
  G: 'bg-emerald-900/60 text-emerald-200 border-emerald-700',
  C: 'bg-stone-800 text-stone-300 border-stone-700',
};

export function ColorIdentityBadge({ colors, className = '' }: ColorIdentityBadgeProps) {
  if (!colors || colors.length === 0) {
    return (
      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium bg-stone-800 text-stone-300 border-stone-700 ${className}`}>
        Colorless
      </span>
    );
  }

  return (
    <div className={`inline-flex flex-wrap gap-1 ${className}`}>
      {colors.map((code) => {
        const name = COLOR_NAMES[code] || code;
        const style = COLOR_STYLES[code] || 'bg-zinc-800 text-zinc-300 border-zinc-700';
        return (
          <span
            key={code}
            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${style}`}
          >
            {name}
          </span>
        );
      })}
    </div>
  );
}
