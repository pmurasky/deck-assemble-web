'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCardById } from '@/lib/api/cards';
import { useDeckStore } from '@/lib/store/deck-store';
import { useCollectionStore } from '@/lib/store/useCollectionStore';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { AddToCollectionModal } from '@/components/collection/AddToCollectionModal';
import { ManaCost } from './ManaCost';
import { ColorIdentityBadge } from './ColorIdentityBadge';
import { LegalityBadge } from './LegalityBadge';

export function CardDetailClient({ cardId }: { cardId: string }) {
  const { data: card, isLoading, error } = useQuery({
    queryKey: ['card', cardId],
    queryFn: () => getCardById(cardId),
  });

  const { addCard } = useDeckStore();
  const { addCard: addToCollectionStore, items: collectionItems, fetchCollection, collectionId } = useCollectionStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    if (!collectionId) {
      fetchCollection();
    }
  }, [fetchCollection, collectionId]);

  const ownedItem = card
    ? collectionItems.find((item) =>
        card.printingId ? item.cardPrintingId === card.printingId : item.card.id === card.id
      )
    : null;

  const totalOwned = ownedItem ? ownedItem.regularQuantity + ownedItem.foilQuantity : 0;

  if (isLoading) {
    return <div className="container mx-auto py-8 px-4"><LoadingSkeleton /></div>;
  }

  if (error || !card) {
    return (
      <div className="container mx-auto py-8 px-4">
        <EmptyState 
          title="Card not found" 
          description={error ? (error as Error).message : "The requested card could not be found."} 
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        <div className="flex justify-center">
          {card.imageUrl ? (
            <img 
              src={card.imageUrl} 
              alt={card.name} 
              className="w-full max-w-md aspect-[2.5/3.5] rounded-2xl shadow-2xl object-cover"
            />
          ) : (
            <div className="w-full max-w-md aspect-[2.5/3.5] rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-blue-500/20 mix-blend-overlay"></div>
              <span className="text-zinc-600 font-bold text-xl uppercase tracking-widest relative z-10 group-hover:scale-110 transition-transform">
                Card Image
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <h1 className="text-4xl font-extrabold text-zinc-100 leading-tight">
                {card.name}
              </h1>
              <div className="pt-2"><ManaCost manaCost={card.manaCost} /></div>
            </div>
            
            <p className="text-lg text-zinc-400 font-medium pb-4 border-b border-zinc-800">
              {card.typeLine}
            </p>
          </div>

          <div className="space-y-4 bg-zinc-900/50 p-6 rounded-xl border border-zinc-800/50">
            {card.oracleText && (
              <div className="whitespace-pre-line text-zinc-300 text-lg leading-relaxed">
                {card.oracleText}
              </div>
            )}
            
            {card.flavorText && (
              <div className="italic text-zinc-500 border-l-2 border-zinc-700 pl-4 mt-4">
                &quot;{card.flavorText}&quot;
              </div>
            )}
            
            {(card.power || card.toughness) && (
              <div className="flex justify-end pt-2">
                <span className="font-bold text-xl bg-zinc-950 px-4 py-2 rounded-lg border border-zinc-800 shadow-inner">
                  {card.power}/{card.toughness}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 pt-4 border-t border-zinc-800">
            <ColorIdentityBadge colors={card.colorIdentity} />
            <LegalityBadge format="Commander" status={card.legalities?.commander || 'not_legal'} />
          </div>

          <div className="flex gap-4 mt-auto pt-8">
            <button 
              type="button"
              onClick={() => addCard(card)}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
            >
              ADD TO DECK
            </button>
            <button 
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl border border-zinc-700 transition-colors flex items-center justify-center gap-2"
            >
              + COLLECTION
              {totalOwned > 0 && (
                <span className="text-xs font-semibold bg-zinc-950 px-2 py-1 rounded-md text-zinc-400">
                  Owned: {totalOwned}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <AddToCollectionModal
        card={card}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={async (reg, foil) => {
          await addToCollectionStore(card, reg, foil);
        }}
      />
    </div>
  );
}

