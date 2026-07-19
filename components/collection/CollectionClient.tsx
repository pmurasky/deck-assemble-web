'use client';

import React, { useState, useEffect } from 'react';
import { useCollectionStore } from '@/lib/store/useCollectionStore';
import { CardTile } from '@/components/cards/CardTile';
import { PackageOpen, Search } from 'lucide-react';
import Link from 'next/link';

export function CollectionClient() {
  const { items, updateQuantity, getTotalCards } = useCollectionStore();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Hydration fix for local storage
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const filteredItems = items.filter(item => 
    item.card.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white">My Collection</h1>
          <p className="text-zinc-400 mt-2">Manage your physical cards. Total Cards: <span className="text-green-400 font-bold">{getTotalCards()}</span></p>
        </div>

        <div className="w-full md:w-96 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search your collection..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
          />
        </div>
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
          <PackageOpen className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-zinc-300">Your collection is empty</h3>
          <p className="text-zinc-500 mt-2 mb-6">Start browsing cards to add them to your collection.</p>
          <Link 
            href="/cards"
            className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors"
          >
            Browse Cards
          </Link>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-500">No cards match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredItems.map(({ card, quantity }) => (
            <div key={card.id} className="relative group">
              <CardTile card={card} />
              
              {/* Quantity Controls Overlay */}
              <div className="absolute top-2 right-2 bg-zinc-900/95 backdrop-blur border border-zinc-700 rounded-lg p-1 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    updateQuantity(card.id, quantity - 1);
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-zinc-700 text-zinc-300 transition-colors"
                >
                  -
                </button>
                <span className="font-mono text-sm min-w-[1.5rem] text-center text-white">{quantity}</span>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    updateQuantity(card.id, quantity + 1);
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-zinc-700 text-zinc-300 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
