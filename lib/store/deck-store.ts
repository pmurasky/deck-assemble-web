import { create } from 'zustand';
import { Card } from '@/types/card';

export interface DeckCard {
  card: Card;
  quantity: number;
}

export interface DeckMetadata {
  name: string;
  format: 'Commander' | 'Standard' | 'Modern' | 'Legacy';
}

interface DeckState {
  cards: DeckCard[];
  commander?: Card;
  metadata: DeckMetadata;
  
  // Actions
  addCard: (card: Card) => void;
  removeCard: (cardId: string) => void;
  setCommander: (card: Card) => void;
  updateMetadata: (metadata: Partial<DeckMetadata>) => void;
  clearDeck: () => void;
}

export const useDeckStore = create<DeckState>((set) => ({
  cards: [],
  metadata: {
    name: 'New Deck',
    format: 'Commander',
  },
  
  addCard: (card) => set((state) => {
    const existingCardIndex = state.cards.findIndex((c) => c.card.id === card.id);
    
    if (existingCardIndex >= 0) {
      const newCards = [...state.cards];
      newCards[existingCardIndex] = {
        ...newCards[existingCardIndex],
        quantity: newCards[existingCardIndex].quantity + 1,
      };
      return { cards: newCards };
    }
    
    return { cards: [...state.cards, { card, quantity: 1 }] };
  }),
  
  removeCard: (cardId) => set((state) => {
    const existingCardIndex = state.cards.findIndex((c) => c.card.id === cardId);
    
    if (existingCardIndex >= 0) {
      const newCards = [...state.cards];
      if (newCards[existingCardIndex].quantity > 1) {
        newCards[existingCardIndex] = {
          ...newCards[existingCardIndex],
          quantity: newCards[existingCardIndex].quantity - 1,
        };
        return { cards: newCards };
      } else {
        newCards.splice(existingCardIndex, 1);
        return { cards: newCards };
      }
    }
    
    return state;
  }),
  
  setCommander: (card) => set({ commander: card }),
  
  updateMetadata: (metadata) => set((state) => ({ 
    metadata: { ...state.metadata, ...metadata } 
  })),
  
  clearDeck: () => set({ cards: [], commander: undefined }),
}));
