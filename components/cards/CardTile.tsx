import React from 'react';
import { Card } from '@/types/card';
import { ManaCost } from './ManaCost';
import { ColorIdentityBadge } from './ColorIdentityBadge';
import { LegalityBadge } from './LegalityBadge';

interface CardTileProps {
  card: Card;
  ownedQuantity?: number;
  onAddToDeck?: (card: Card) => void;
  onAddToCollection?: (card: Card) => void;
  className?: string;
}

export function CardTile({
  card,
  ownedQuantity = 0,
  onAddToDeck,
  onAddToCollection,
  className = '',
}: CardTileProps) {
  return (
    <div className={`group relative flex flex-column justify-between overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/90 p-4 transition-all duration-200 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-950/20 ${className}`}>
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-zinc-100 text-sm group-hover:text-green-400 transition-colors">
            {card.name}
          </h3>
          <ManaCost manaCost={card.manaCost} />
        </div>

        <p className="text-xs text-zinc-400 italic">{card.typeLine}</p>

        {card.oracleText && (
          <p className="text-xs text-zinc-300 line-clamp-3 bg-zinc-950/50 p-2 rounded-md border border-zinc-800/80">
            {card.oracleText}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 pt-1">
          <ColorIdentityBadge colors={card.colorIdentity} />
          <LegalityBadge format="Commander" status={card.legalities.commander || 'not_legal'} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-zinc-800/80 pt-3">
        <span className="text-xs font-semibold text-zinc-400 bg-zinc-800/80 px-2 py-1 rounded-md">
          Owned: {ownedQuantity}
        </span>

        <div className="flex gap-1.5">
          {onAddToCollection && (
            <button
              onClick={() => onAddToCollection(card)}
              className="rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition-colors"
            >
              + Collection
            </button>
          )}
          {onAddToDeck && (
            <button
              onClick={() => onAddToDeck(card)}
              className="rounded-md bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-500 transition-colors shadow-xs"
            >
              + Deck
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
