'use client';

import { useEffect } from 'react';
import { useDecksListStore, type SavedDeck } from '@/lib/store/useDecksListStore';
import { useDeckStore } from '@/lib/store/deck-store';
import { BookOpen, Edit2, Trash2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function DecksListClient() {
  const { decks, deleteDeck, fetchDecks, isLoading, error } = useDecksListStore();
  const { loadDeck, clearDeck, fetchDeckCards } = useDeckStore();
  const router = useRouter();

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  const handleEditDeck = async (deck: SavedDeck) => {
    loadDeck(deck.id, deck.cards, deck.commander, deck.metadata);
    await fetchDeckCards(deck.id);
    router.push('/deck-builder');
  };

  const handleNewDeck = () => {
    clearDeck();
    router.push('/deck-builder');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-green-500 to-purple-500 bg-clip-text text-transparent">
            MY DECKS
          </h1>
          <p className="text-zinc-400 mt-1 text-sm">Manage your custom MTG decks and Commander brews</p>
        </div>
        <button
          type="button"
          onClick={handleNewDeck}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-950/40"
        >
          <Plus className="w-5 h-5" />
          Create New Deck
        </button>
      </div>

      {error ? (
        <div className="p-4 bg-red-950/30 border border-red-800 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      ) : isLoading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 font-medium">Loading decks...</p>
        </div>
      ) : decks.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
          <BookOpen className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-zinc-300">You don&apos;t have any saved decks</h3>
          <p className="text-zinc-500 mt-2 mb-6">Head over to the Deck Builder to start brewing your first deck.</p>
          <button 
            type="button"
            onClick={handleNewDeck}
            className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors"
          >
            Go to Deck Builder
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => {
            const totalCards = deck.cardCount ?? deck.cards.reduce((sum, item) => sum + item.quantity, 0);
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

                {deck.commanderName || deck.commander ? (
                  <div className="mb-6 pb-6 border-b border-zinc-800/50">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Commander</p>
                    <p className="text-sm font-medium text-green-400">{deck.commanderName || deck.commander?.name}</p>
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
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
