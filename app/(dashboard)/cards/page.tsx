'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Filter, X } from 'lucide-react';
import type { CardFilters } from '@/components/cards/CardFilterPanel';
import { CardFilterPanel } from '@/components/cards/CardFilterPanel';
import { CardSearchBar } from '@/components/cards/CardSearchBar';
import { CardTile } from '@/components/cards/CardTile';
import { EmptyState } from '@/components/feedback/EmptyState';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { getLatestImport, getPrintings } from '@/lib/api/cards';
import { useDeckStore } from '@/lib/store/deck-store';
import { useCollectionStore } from '@/lib/store/useCollectionStore';

export default function CardBrowserPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [filters, setFilters] = useState<CardFilters>({
    colors: [],
    types: [],
    manaValue: 0,
  });

  const activeFilterCount =
    filters.colors.length +
    filters.types.length +
    (filters.minCmc !== undefined ? 1 : 0) +
    (filters.maxCmc !== undefined ? 1 : 0) +
    (filters.rarity ? 1 : 0) +
    (filters.ownership && filters.ownership !== 'all' ? 1 : 0);

  const typeQuery = filters.types.join(' ');

  const { data, isLoading, error } = useQuery({
    queryKey: ['printings', searchTerm, filters.colors, filters.types],
    queryFn: () => getPrintings({ q: searchTerm, type: typeQuery }),
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

  const filteredCards = data?.cards.filter((card) => {
    const matchesColor = filters.colors.length === 0 || filters.colors.some((c) => card.colors?.includes(c));
    const matchesType = filters.types.length === 0 || filters.types.some((t) => card.typeLine.toLowerCase().includes(t.toLowerCase()));
    return matchesColor && matchesType;
  }) ?? [];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-green-500 to-purple-500 bg-clip-text text-transparent">
          CARD CATALOG
        </h1>
        <div className="text-sm text-zinc-400 text-left sm:text-right">
          <div>
            {filteredCards.length}{' '}Cards Found
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
        {/* Desktop Sidebar Filters */}
        <div className="hidden md:flex flex-col space-y-6">
          <CardSearchBar onSearch={setSearchTerm} defaultValue={searchTerm} />
          <CardFilterPanel filters={filters} onFilterChange={setFilters} />
        </div>

        {/* Main Content & Mobile Filter Options */}
        <div className="col-span-1 md:col-span-3">
          <div className="md:hidden space-y-3 mb-6">
            <CardSearchBar onSearch={setSearchTerm} defaultValue={searchTerm} />
            
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-semibold text-zinc-200 hover:bg-zinc-800 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-purple-400" />
                <span>Filter Catalog Cards</span>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-600 text-xs font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              {isMobileFilterOpen ? <X className="w-4 h-4" /> : <span className="text-xs text-purple-400">Toggle →</span>}
            </button>

            {isMobileFilterOpen && (
              <div className="p-2 bg-zinc-950/90 border border-zinc-800 rounded-2xl shadow-xl">
                <CardFilterPanel filters={filters} onFilterChange={setFilters} />
              </div>
            )}
          </div>

          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <EmptyState
              title="Error loading cards"
              description={error instanceof Error ? error.message : 'Unable to load cards.'}
            />
          ) : filteredCards.length === 0 ? (
            <EmptyState
              title="No heroes found"
              description="Try adjusting your search terms or filters to find what you're looking for."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCards.map((card) => {
                const item = collectionItems.find((i) =>
                  card.printingId
                    ? i.cardPrintingId === card.printingId
                    : i.card.id === card.id
                );
                const regularOwnedQuantity = item?.regularQuantity || 0;
                const foilOwnedQuantity = item?.foilQuantity || 0;
                return (
                  <CardTile
                    key={card.printingId || card.id}
                    card={card}
                    onAddToDeck={addCard}
                    onAddToCollection={addToCollection}
                    regularOwnedQuantity={regularOwnedQuantity}
                    foilOwnedQuantity={foilOwnedQuantity}
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

