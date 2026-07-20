'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import type { CardFilters } from '@/components/cards/CardFilterPanel';
import { CardFilterPanel } from '@/components/cards/CardFilterPanel';
import { CardSearchBar } from '@/components/cards/CardSearchBar';
import { CardTile } from '@/components/cards/CardTile';
import { EmptyState } from '@/components/feedback/EmptyState';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { getLatestImport, getSetPrintings } from '@/lib/api/cards';
import { useCollectionStore } from '@/lib/store/useCollectionStore';
import { useDeckStore } from '@/lib/store/deck-store';

export default function CardBrowserPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<CardFilters>({
    colors: [],
    types: [],
    manaValue: 0,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['cards', searchTerm, filters.colors],
    queryFn: () => getSetPrintings('msh', { q: searchTerm }),
  });

  const { data: latestImport } = useQuery({
    queryKey: ['latestImport'],
    queryFn: getLatestImport,
    staleTime: 300_000,
  });

  const { addCard } = useDeckStore();
  const { addCard: addToCollection, items: collectionItems, fetchCollection, collectionId } =
    useCollectionStore();

  useEffect(() => {
    if (!collectionId) {
      fetchCollection();
    }
  }, [fetchCollection, collectionId]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-green-500 to-purple-500 bg-clip-text text-transparent">
          CARD CATALOG
        </h1>
        <div className="text-sm text-muted-foreground text-right">
          <div>
            {data?.cards 
              ? data.cards.filter(card => filters.colors.length === 0 || filters.colors.some(c => card.colors?.includes(c))).length 
              : 0} 
            {' '}Cards Found
          </div>
          {latestImport && (
            <div className="text-xs">
              Card data last synced:{' '}
              {new Date(latestImport.completedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="hidden md:flex flex-col space-y-6">
          <CardSearchBar onSearch={setSearchTerm} defaultValue={searchTerm} />
          <CardFilterPanel filters={filters} onFilterChange={setFilters} />
        </div>

        <div className="col-span-1 md:col-span-3">
          <div className="md:hidden mb-6">
            <CardSearchBar onSearch={setSearchTerm} defaultValue={searchTerm} />
          </div>

          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <EmptyState
              title="Error loading cards"
              description={error instanceof Error ? error.message : 'Unable to load cards.'}
            />
          ) : data?.cards.length === 0 ? (
            <EmptyState
              title="No heroes found"
              description="Try adjusting your search terms or filters to find what you're looking for."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.cards
                .filter((card) => {
                  if (filters.colors.length === 0) return true;
                  // Allow card if it contains ANY of the selected colors
                  return filters.colors.some((c) => card.colors?.includes(c));
                })
                .map((card) => {
                  const ownedQuantity = collectionItems.find((item) =>
                    card.printingId
                      ? item.cardPrintingId === card.printingId
                      : item.card.id === card.id
                  )?.quantity || 0;
                  return (
                    <CardTile
                      key={card.printingId || card.id}
                      card={card}
                      onAddToDeck={addCard}
                      onAddToCollection={addToCollection}
                      ownedQuantity={ownedQuantity}
                    />
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
