import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Card } from '@/types/card';
import { DeckCard, DeckMetadata } from './deck-store';

export interface SavedDeck {
  id: string;
  cards: DeckCard[];
  commander?: Card;
  metadata: DeckMetadata;
  createdAt: string;
  updatedAt: string;
}

interface DecksListState {
  decks: SavedDeck[];
  saveDeck: (deck: Omit<SavedDeck, 'createdAt' | 'updatedAt'>) => void;
  deleteDeck: (id: string) => void;
  getDeckById: (id: string) => SavedDeck | undefined;
}

export const useDecksListStore = create<DecksListState>()(
  persist(
    (set, get) => ({
      decks: [],
      
      saveDeck: (deckData) => set((state) => {
        const now = new Date().toISOString();
        const existingDeckIndex = state.decks.findIndex(d => d.id === deckData.id);
        
        if (existingDeckIndex >= 0) {
          // Update existing
          const newDecks = [...state.decks];
          newDecks[existingDeckIndex] = {
            ...deckData,
            createdAt: state.decks[existingDeckIndex].createdAt,
            updatedAt: now
          };
          return { decks: newDecks };
        }
        
        // Create new
        return {
          decks: [
            ...state.decks,
            { ...deckData, createdAt: now, updatedAt: now }
          ]
        };
      }),

      deleteDeck: (id) => set((state) => ({
        decks: state.decks.filter(d => d.id !== id)
      })),
      
      getDeckById: (id) => {
        return get().decks.find(d => d.id === id);
      }
    }),
    {
      name: 'deck-assemble-decks-storage',
    }
  )
);
