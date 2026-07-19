import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Card } from '@/types/card';

export interface CollectionItem {
  card: Card;
  quantity: number;
}

interface CollectionState {
  items: CollectionItem[];
  addCard: (card: Card) => void;
  removeCard: (cardId: string) => void;
  updateQuantity: (cardId: string, quantity: number) => void;
  clearCollection: () => void;
  getTotalCards: () => number;
}

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addCard: (card) => set((state) => {
        const existingItem = state.items.find(item => item.card.id === card.id);
        if (existingItem) {
          return {
            items: state.items.map(item => 
              item.card.id === card.id 
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          };
        }
        return {
          items: [...state.items, { card, quantity: 1 }]
        };
      }),

      removeCard: (cardId) => set((state) => ({
        items: state.items.filter(item => item.card.id !== cardId)
      })),

      updateQuantity: (cardId, quantity) => set((state) => {
        if (quantity <= 0) {
          return { items: state.items.filter(item => item.card.id !== cardId) };
        }
        return {
          items: state.items.map(item => 
            item.card.id === cardId 
              ? { ...item, quantity }
              : item
          )
        };
      }),

      clearCollection: () => set({ items: [] }),

      getTotalCards: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      }
    }),
    {
      name: 'deck-assemble-collection-storage',
    }
  )
);
