import React from 'react';
import { KeywordHighlighter } from '@/components/ui/KeywordTooltip';
import type { PracticeCard } from '@/types/m3';

interface PracticeBattlefieldCardProps {
  card: PracticeCard;
  tapped: boolean;
  onToggleTap: (card: PracticeCard) => void;
}

function BattlefieldCardArt({ card, tapped }: { card: PracticeCard; tapped: boolean }) {
  return (
    <div className="space-y-1.5">
      <div className="relative w-full aspect-[2.5/3.5] rounded-lg overflow-hidden bg-slate-950 border border-slate-800/80">
        <img
          src={card.imageUrl!}
          alt={card.name}
          className={`w-full h-full object-cover transition-transform ${tapped ? 'rotate-6' : ''}`}
          loading="lazy"
        />
      </div>
      <div className="text-xs font-bold truncate px-0.5">{card.name}</div>
    </div>
  );
}

function BattlefieldCardText({ card }: { card: PracticeCard }) {
  return (
    <div>
      <div className="text-xs font-bold truncate">{card.name}</div>
      <div className="text-[10px] text-slate-400 truncate">
        <KeywordHighlighter text={card.typeLine || ''} />
      </div>
      {card.oracleText && (
        <div className="text-[10px] text-slate-300 line-clamp-2 mt-1 font-normal">
          <KeywordHighlighter text={card.oracleText} />
        </div>
      )}
    </div>
  );
}

export function PracticeBattlefieldCard({ card, tapped, onToggleTap }: PracticeBattlefieldCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggleTap(card);
    }
  };

  const statusClass = tapped
    ? 'bg-slate-900/40 border-slate-800 text-slate-500 rotate-6 opacity-75'
    : 'bg-slate-900 border-emerald-500/40 text-slate-100 shadow-md';

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${card.name} (${tapped ? 'Tapped' : 'Untapped'})`}
      onClick={() => onToggleTap(card)}
      onKeyDown={handleKeyDown}
      className={`p-2.5 rounded-lg border text-left transition-all max-w-[170px] flex flex-col justify-between cursor-pointer ${statusClass}`}
    >
      {card.imageUrl ? <BattlefieldCardArt card={card} tapped={tapped} /> : <BattlefieldCardText card={card} />}
      <div className="mt-2 text-[10px] font-mono font-semibold text-emerald-400 px-0.5">
        {tapped ? 'Tapped' : 'Untapped'}
      </div>
    </div>
  );
}
