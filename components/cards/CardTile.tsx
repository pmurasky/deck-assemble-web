'use client';

import { useState } from 'react';
import { ManaCost } from './ManaCost';
import { ColorIdentityBadge } from './ColorIdentityBadge';
import { LegalityBadge } from './LegalityBadge';
import { AddToCollectionModal } from '@/components/collection/AddToCollectionModal';
import { useCollectionStore } from '@/lib/store/useCollectionStore';
import type { Card } from '@/types/card';

interface CardTileProps {
  card: Card;
  ownedQuantity?: number;
  regularOwnedQuantity?: number;
  foilOwnedQuantity?: number;
  onAddToDeck?: (card: Card) => void;
  onAddToCollection?: (card: Card, regularQuantity?: number, foilQuantity?: number) => void;
  className?: string;
}

export function CardTile({
  card,
  ownedQuantity,
  regularOwnedQuantity,
  foilOwnedQuantity,
  onAddToDeck,
  onAddToCollection,
  className = '',
}: CardTileProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [faceIndex, setFaceIndex] = useState(0);
  const { addCard: addCardToStore } = useCollectionStore();

  const faces = card.faces ?? [];
  const canFlip = faces.length >= 2;
  const activeImageUrl = faces.length > 0 ? (faces[faceIndex]?.imageUrl || card.imageUrl) : card.imageUrl;
  const activeName = faces.length > 0 ? (faces[faceIndex]?.name || card.name) : card.name;

  const handleConfirmAdd = async (regularQuantity: number, foilQuantity: number) => {
    if (onAddToCollection) {
      await onAddToCollection(card, regularQuantity, foilQuantity);
    } else {
      await addCardToStore(card, regularQuantity, foilQuantity);
    }
  };

  return (
    <>
      <div className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/90 p-4 transition-all duration-200 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-950/20 ${className}`}>
        {activeImageUrl ? (
          <div>
            <div className="relative w-full aspect-[2.5/3.5] rounded-lg overflow-hidden mb-3">
              <img 
                src={activeImageUrl} 
                alt={activeName} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {canFlip && (
                <>
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-zinc-950/80 border border-zinc-700/80 text-[10px] font-semibold text-zinc-300 backdrop-blur-xs flex items-center gap-1">
                    Two-Sided
                  </span>
                  <button
                    type="button"
                    onClick={() => setFaceIndex(faceIndex === 0 ? 1 : 0)}
                    aria-label={`Show ${faces[faceIndex === 0 ? 1 : 0]?.name ?? card.name}`}
                    className="absolute top-2 right-2 px-2 py-1 rounded-md bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-700/80 text-zinc-200 text-[11px] font-bold backdrop-blur-xs transition-all shadow-md active:scale-95 cursor-pointer z-10"
                  >
                    Flip card
                  </button>
                </>
              )}
            </div>
            <div className="flex items-start justify-between gap-2 px-0.5">
              <a href={`/cards/${card.id}`} className="font-bold text-zinc-100 text-sm group-hover:text-green-400 transition-colors line-clamp-1">
                {activeName}
              </a>
              <ManaCost manaCost={faces.length > 0 ? (faces[faceIndex]?.manaCost ?? card.manaCost) : card.manaCost} />
            </div>
          </div>
        ) : (
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
        )}

        <div className="mt-4 flex items-center justify-between border-t border-zinc-800/80 pt-3">
          {(() => {
            const regCount = regularOwnedQuantity ?? (card.regularOwnedQuantity ?? (ownedQuantity ?? (card.ownedQuantity ?? 0)));
            const foilCount = foilOwnedQuantity ?? (card.foilOwnedQuantity ?? 0);
            const hasReg = regCount > 0;
            const hasFoil = foilCount > 0;

            if (!hasReg && !hasFoil) return <span />;

            return (
              <div className="flex items-center gap-1.5 flex-wrap">
                {hasReg && (
                  <span className="text-xs font-semibold text-green-400 bg-green-950/50 border border-green-900/50 px-2 py-1 rounded-md">
                    Owned: {regCount}
                  </span>
                )}
                {hasFoil && (
                  <span className="text-xs font-bold text-amber-300 bg-amber-950/50 border border-amber-900/50 px-2 py-1 rounded-md flex items-center gap-1 shadow-[0_0_10px_rgba(245,158,11,0.15)]">
                    Foil: {foilCount}
                  </span>
                )}
              </div>
            );
          })()}

          <div className="flex gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="rounded-lg bg-zinc-800 px-2.5 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition-colors active:scale-95 touch-manipulation"
            >
              + Collection
            </button>
            {onAddToDeck && (
              <button
                type="button"
                onClick={() => onAddToDeck(card)}
                className="rounded-lg bg-green-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-green-500 transition-colors shadow-xs active:scale-95 touch-manipulation"
              >
                + Deck
              </button>
            )}
          </div>
        </div>
      </div>

      <AddToCollectionModal
        card={card}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmAdd}
      />
    </>
  );
}

