'use client';

import React, { useState, useEffect } from 'react';
import { useCollectionStore, CollectionItem } from '@/lib/store/useCollectionStore';
import { CardTile } from '@/components/cards/CardTile';
import { PackageOpen, Search, AlertCircle, Loader2, Trash2, Sparkles, Edit2, X } from 'lucide-react';
import Link from 'next/link';

export function CollectionClient() {
  const {
    items,
    updateQuantities,
    removeCard,
    getTotalCards,
    getTotalFoilCards,
    fetchCollection,
    isLoading,
    error,
  } = useCollectionStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<CollectionItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<CollectionItem | null>(null);

  // Edit modal state
  const [editRegular, setEditRegular] = useState(0);
  const [editFoil, setEditFoil] = useState(0);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  const openEditModal = (item: CollectionItem) => {
    setEditingItem(item);
    setEditRegular(item.regularQuantity);
    setEditFoil(item.foilQuantity);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setUpdatingId(editingItem.id);
    try {
      await updateQuantities(editingItem.id, editRegular, editFoil);
      setEditingItem(null);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmRemove = async () => {
    if (!deletingItem) return;
    setUpdatingId(deletingItem.id);
    try {
      await removeCard(deletingItem.id);
      setDeletingItem(null);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredItems = items.filter((item) =>
    item.card.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white">My Collection</h1>
          <p className="text-zinc-400 mt-2">
            Manage your physical cards. Total Cards:{' '}
            <span className="text-green-400 font-bold">{getTotalCards()}</span>
            {getTotalFoilCards() > 0 && (
              <span className="ml-2 text-amber-400 font-bold inline-flex items-center gap-1">
                (<Sparkles className="w-3.5 h-3.5" /> {getTotalFoilCards()} foil)
              </span>
            )}
          </p>
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

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-900 rounded-xl flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Grid */}
      {isLoading && items.length === 0 ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
        </div>
      ) : items.length === 0 ? (
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
          {filteredItems.map((item) => {
            const totalOwned = item.regularQuantity + item.foilQuantity;
            const hasFoil = item.foilQuantity > 0;

            return (
              <div key={item.id} className="relative group flex flex-col">
                <div
                  className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
                    hasFoil
                      ? 'ring-2 ring-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                      : ''
                  }`}
                >
                  <CardTile card={item.card} />

                  {/* Foil Shimmer Overlay */}
                  {hasFoil && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/10 via-purple-500/10 to-cyan-400/10 pointer-events-none" />
                  )}

                  {/* Quantity Badges Overlay */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    <span className="px-2 py-0.5 rounded-md bg-zinc-900/90 backdrop-blur border border-zinc-700 text-xs font-mono font-bold text-white shadow-xs">
                      ×{totalOwned}
                    </span>
                    {hasFoil && (
                      <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500/90 to-purple-600/90 text-xs font-mono font-bold text-amber-200 shadow-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        {item.foilQuantity} foil
                      </span>
                    )}
                  </div>

                  {/* Controls Overlay */}
                  <div className="absolute top-2 right-2 bg-zinc-900/95 backdrop-blur border border-zinc-700 rounded-lg p-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button
                      onClick={() => openEditModal(item)}
                      disabled={updatingId === item.id}
                      title="Edit quantities"
                      className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingItem(item)}
                      disabled={updatingId === item.id}
                      title="Remove card"
                      className="p-1.5 rounded-md hover:bg-red-900/70 text-zinc-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sub-bar showing Breakdown */}
                <div className="mt-2 flex items-center justify-between text-xs text-zinc-400 px-1 font-mono">
                  <span>Reg: {item.regularQuantity}</span>
                  <span className={hasFoil ? 'text-amber-400 font-semibold' : ''}>
                    Foil: {item.foilQuantity}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Quantities Dialog */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <button
              onClick={() => setEditingItem(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-extrabold text-white">Edit Collection Card</h3>
              <p className="text-sm text-zinc-400 mt-1 font-medium">{editingItem.card.name}</p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Regular Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  max="9999"
                  value={editRegular}
                  onChange={(e) => setEditRegular(Math.max(0, parseInt(e.target.value || '0', 10)))}
                  className="w-full mt-1 py-2 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-green-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Foil Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  max="9999"
                  value={editFoil}
                  onChange={(e) => setEditFoil(Math.max(0, parseInt(e.target.value || '0', 10)))}
                  className="w-full mt-1 py-2 px-3 bg-zinc-950 border border-amber-500/30 rounded-lg text-amber-300 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingId === editingItem.id}
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md bg-zinc-900 border border-red-900/50 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-extrabold text-red-400">Remove Card from Collection?</h3>
            <p className="text-sm text-zinc-300">
              Are you sure you want to remove <span className="font-bold text-white">{deletingItem.card.name}</span> from your collection?
            </p>
            <p className="text-xs text-zinc-400 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              This will delete all <span className="text-white font-bold">{deletingItem.regularQuantity} regular</span> and{' '}
              <span className="text-amber-400 font-bold">{deletingItem.foilQuantity} foil</span> copies from your collection.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                disabled={updatingId === deletingItem.id}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl disabled:opacity-50"
              >
                Delete Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

