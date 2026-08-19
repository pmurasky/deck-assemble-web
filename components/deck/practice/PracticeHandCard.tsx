import React from 'react';
import { ManaCost } from '@/components/cards/ManaCost';
import { KeywordHighlighter } from '@/components/ui/KeywordTooltip';
import type { PracticeCard } from '@/types/m3';

interface PracticeHandCardProps {
  card: PracticeCard;
  onPlay: (card: PracticeCard) => void;
}

export function PracticeHandCard({ card, onPlay }: PracticeHandCardProps) {
  return (
    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-violet-500/50 transition-colors flex flex-col justify-between gap-2.5">
      {card.imageUrl ? (
        <div className="space-y-2">
          <div className="relative w-full aspect-[2.5/3.5] rounded-lg overflow-hidden bg-slate-950 border border-slate-800/80">
            <img
              src={card.imageUrl}
              alt={card.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex items-center justify-between gap-1 text-xs px-0.5">
            <span className="font-bold text-slate-100 truncate">{card.name}</span>
            {card.manaCost && <ManaCost manaCost={card.manaCost} />}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between gap-1 text-xs">
            <span className="font-bold text-slate-100 truncate">{card.name}</span>
            {card.manaCost && <span className="font-mono text-amber-400 text-[11px]">{card.manaCost}</span>}
          </div>
          <div className="text-[10px] text-slate-400 truncate mt-0.5">
            <KeywordHighlighter text={card.typeLine || ''} />
          </div>
          {card.oracleText && (
            <div className="text-[10px] text-slate-300 line-clamp-2 mt-1 font-normal">
              <KeywordHighlighter text={card.oracleText} />
            </div>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={() => onPlay(card)}
        aria-label={`Play ${card.name}`}
        className="w-full py-1.5 rounded bg-violet-600 hover:bg-violet-500 text-white font-bold text-[11px] transition-all cursor-pointer shadow-xs active:scale-95"
      >
        Play to Board
      </button>
    </div>
  );
}
