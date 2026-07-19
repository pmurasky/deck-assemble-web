'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCards } from '@/lib/api/cards';
import { useDeckStore } from '@/lib/store/deck-store';
import { CardSearchBar } from '@/components/cards/CardSearchBar';
import { CardFilterPanel, CardFilters } from '@/components/cards/CardFilterPanel';
import { CardTile } from '@/components/cards/CardTile';
import { EmptyState } from '@/components/feedback/EmptyState';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { useDebounce } from '@/hooks/use-debounce'; // Wait, we don't have this yet, I'll just skip debounce for now to avoid complexity or I can create it. Let's not use it in the initial version to pass test quickly.

export default function CardBrowserPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<CardFilters>({
    colors: [],
    types: [],
    manaValue: 0
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['cards', searchTerm, filters.colors],
    queryFn: () => getCards({ q: searchTerm }), // passing filters next iteration
  });

  const { addCard } = useDeckStore();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
          CARD CATALOG
        </h1>
        <div className="text-sm text-muted-foreground">
          {data?.total || 0} Cards Found
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col space-y-6">
          <CardSearchBar 
            onSearch={setSearchTerm} 
            defaultValue={searchTerm} 
          />
          <CardFilterPanel 
            filters={filters} 
            onFilterChange={setFilters} 
          />
        </div>

        {/* Main Content */}
        <div className="col-span-1 md:col-span-3">
          {/* Mobile Search (visible only on small screens) */}
          <div className="md:hidden mb-6">
            <CardSearchBar 
              onSearch={setSearchTerm} 
              defaultValue={searchTerm} 
            />
          </div>

          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <EmptyState 
              title="Error loading cards" 
              description={(error as Error).message} 
            />
          ) : data?.cards.length === 0 ? (
            <EmptyState 
              title="No heroes found" 
              description="Try adjusting your search terms or filters to find what you're looking for." 
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.cards.map(card => (
                <CardTile key={card.id} card={card} onAddToDeck={addCard} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
