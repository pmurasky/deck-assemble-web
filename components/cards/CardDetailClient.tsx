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
import { BeginnerGuideSection } from './BeginnerGuideSection';
import { RefreshCw } from 'lucide-react';

export function CardDetailClient({ cardId }: { cardId: string }) {
  const { data: card, isLoading, error } = useQuery({
    queryKey: ['card', cardId],
    queryFn: () => getCardById(cardId),
  });

  const { addCard } = useDeckStore();
  const { addCard: addToCollectionStore, items: collectionItems, fetchCollection, collectionId } = useCollectionStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prevCardId, setPrevCardId] = useState(cardId);
  const [faceIndex, setFaceIndex] = useState(0);

  if (prevCardId !== cardId) {
    setPrevCardId(cardId);
    setFaceIndex(0);
  }

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

  const faces = card.faces ?? [];
  const canFlip = faces.length >= 2;
  const activeFace = faces.length > 0 ? faces[faceIndex] : null;

  const activeImageUrl = activeFace?.imageUrl || card.imageUrl;
  const activeName = activeFace?.name || card.name;
  const activeManaCost = activeFace?.manaCost !== undefined ? activeFace.manaCost : card.manaCost;
  const activeTypeLine = activeFace?.typeLine || card.typeLine;
  const activeOracleText = activeFace?.oracleText !== undefined ? activeFace.oracleText : card.oracleText;
  const activeFlavorText = activeFace?.flavorText !== undefined ? activeFace.flavorText : card.flavorText;
  const activePower = activeFace?.power !== undefined ? activeFace.power : card.power;
  const activeToughness = activeFace?.toughness !== undefined ? activeFace.toughness : card.toughness;

  const nextFaceIndex = faceIndex === 0 ? 1 : 0;
  const nextFaceName = faces[nextFaceIndex]?.name ?? card.name;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        <div className="flex flex-col items-center gap-4">
          {activeImageUrl ? (
            <img 
              src={activeImageUrl} 
              alt={activeName} 
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

          {canFlip && (
            <button
              type="button"
              onClick={() => setFaceIndex(nextFaceIndex)}
              aria-label={`Show ${nextFaceName}`}
              className="px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-sm border border-zinc-700 shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-green-400" />
              <span>Flip card ({nextFaceName})</span>
            </button>
          )}
        </div>

        <div className="flex flex-col space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <h1 className="text-4xl font-extrabold text-zinc-100 leading-tight">
                {activeName}
              </h1>
              <div className="pt-2"><ManaCost manaCost={activeManaCost} /></div>
            </div>
            
            <p className="text-lg text-zinc-400 font-medium pb-4 border-b border-zinc-800">
              {activeTypeLine}
            </p>
          </div>

          <div className="space-y-4 bg-zinc-900/50 p-6 rounded-xl border border-zinc-800/50">
            {activeOracleText && (
              <div className="whitespace-pre-line text-zinc-300 text-lg leading-relaxed">
                {activeOracleText}
              </div>
            )}
            
            {activeFlavorText && (
              <div className="italic text-zinc-500 border-l-2 border-zinc-700 pl-4 mt-4">
                &quot;{activeFlavorText}&quot;
              </div>
            )}
            
            {(activePower || activeToughness) && (
              <div className="flex justify-end pt-2">
                <span className="font-bold text-xl bg-zinc-950 px-4 py-2 rounded-lg border border-zinc-800 shadow-inner">
                  {activePower}/{activeToughness}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 pt-4 border-t border-zinc-800">
            <ColorIdentityBadge colors={card.colorIdentity} />
            <LegalityBadge format="Commander" status={card.legalities?.commander || 'not_legal'} />
          </div>

          <BeginnerGuideSection
            cardId={card.id}
            faceIndex={faceIndex}
            faceName={activeFace?.name}
          />

          <div className="flex gap-4 mt-auto pt-8">
            <button 
              type="button"
              onClick={() => addCard(card)}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] cursor-pointer"
            >
              ADD TO DECK
            </button>
            <button 
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl border border-zinc-700 transition-colors flex items-center justify-center gap-2 flex-wrap cursor-pointer"
            >
              + COLLECTION
              {(ownedItem?.regularQuantity || 0) > 0 && (
                <span className="text-xs font-semibold bg-zinc-950 px-2 py-1 rounded-md text-green-400">
                  Owned: {ownedItem?.regularQuantity}
                </span>
              )}
              {(ownedItem?.foilQuantity || 0) > 0 && (
                <span className="text-xs font-bold bg-zinc-950 px-2 py-1 rounded-md text-amber-300">
                  Foil: {ownedItem?.foilQuantity}
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
