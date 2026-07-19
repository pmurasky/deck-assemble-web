'use client';

import React, { useState, useEffect } from 'react';
import { useDecksListStore } from '@/lib/store/useDecksListStore';
import { useDeckStore } from '@/lib/store/deck-store';
import { BookOpen, Edit2, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function DecksListClient() {
  const { decks, deleteDeck } = useDecksListStore();
  const { loadDeck, clearDeck } = useDeckStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Hydration fix for local storage
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleEditDeck = (deck: any) => {
    loadDeck(deck.id, deck.cards, deck.commander, deck.metadata);
    router.push('/deck-builder');
  };

  const handleNewDeck = () => {
    clearDeck();
    router.push('/deck-builder');
  };

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white">My Decks</h1>
          <p className="text-zinc-400 mt-2">Manage your saved decks. Total Decks: <span className="text-purple-400 font-bold">{decks.length}</span></p>
        </div>

        <div>
          <button
            onClick={handleNewDeck}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Deck
          </button>
        </div>
      </div>

      {/* Grid */}
      {decks.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
          <BookOpen className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-zinc-300">You don't have any saved decks</h3>
          <p className="text-zinc-500 mt-2 mb-6">Head over to the Deck Builder to start brewing your first deck.</p>
          <button 
            onClick={handleNewDeck}
            className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors"
          >
            Go to Deck Builder
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => {
            const totalCards = deck.cards.reduce((sum, item) => sum + item.quantity, 0);
            return (
              <div key={deck.id} className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 relative group hover:border-purple-500/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">{deck.metadata.name}</h3>
                    <p className="text-sm text-zinc-400">{deck.metadata.format}</p>
                  </div>
                  <div className="bg-zinc-950 px-3 py-1 rounded-lg border border-zinc-800">
                    <span className="text-sm font-bold text-zinc-300">{totalCards} Cards</span>
                  </div>
                </div>

                {deck.commander ? (
                  <div className="mb-6 pb-6 border-b border-zinc-800/50">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Commander</p>
                    <p className="text-sm font-medium text-green-400">{deck.commander.name}</p>
                  </div>
                ) : (
                  <div className="mb-6 pb-6 border-b border-zinc-800/50">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Commander</p>
                    <p className="text-sm text-zinc-600 italic">None selected</p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-zinc-500">
                    Updated {new Date(deck.updatedAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditDeck(deck)}
                      className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                      title="Edit Deck"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this deck?')) {
                          deleteDeck(deck.id);
                        }
                      }}
                      className="p-2 bg-red-950/30 hover:bg-red-900/50 text-red-400 rounded-lg transition-colors border border-red-900/30"
                      title="Delete Deck"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
