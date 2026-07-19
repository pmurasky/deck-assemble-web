import { create } from 'zustand';
import { toCard } from '@/lib/api/catalog';
import type { Card } from '@/types/card';

interface ApiResponse<T> {
  data: T;
}

interface ApiCollection {
  id: number;
  defaultCollection: boolean;
}

interface ApiCollectionCard {
  id: number;
  cardPrintingId: number;
  regularQuantity: number;
  foilQuantity: number;
  card: Parameters<typeof toCard>[0];
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Collection request failed';
}

async function responseData<T>(response: Response, message: string): Promise<T> {
  if (!response.ok) throw new Error(message);
  return (await response.json() as ApiResponse<T>).data;
}

function toItem(item: ApiCollectionCard): CollectionItem {
  return { id: item.id, cardPrintingId: item.cardPrintingId, quantity: item.regularQuantity,
    foilQuantity: item.foilQuantity, card: { ...toCard(item.card), printingId: item.cardPrintingId } };
}

export interface CollectionItem {
  id: number; // collectionCardId
  cardPrintingId: number;
  quantity: number;
  foilQuantity: number;
  card: Card;
}

interface CollectionState {
  collectionId: number | null;
  items: CollectionItem[];
  isLoading: boolean;
  error: string | null;
  fetchCollection: () => Promise<void>;
  addCard: (card: Card) => Promise<void>;
  removeCard: (collectionCardId: number) => Promise<void>;
  updateQuantity: (collectionCardId: number, quantity: number) => Promise<void>;
  getTotalCards: () => number;
}

export const useCollectionStore = create<CollectionState>()((set, get) => ({
  collectionId: null,
  items: [],
  isLoading: false,
  error: null,

  fetchCollection: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/v1/collections');
      if (!res.ok) throw new Error('Failed to fetch collections');
      const collections = await responseData<ApiCollection[]>(res, 'Failed to fetch collections');
      
      if (collections && collections.length > 0) {
        const defaultCol = collections.find((collection) => collection.defaultCollection) ?? collections[0];
        set({ collectionId: defaultCol.id });
        
        const cardsRes = await fetch(`/api/v1/collections/${defaultCol.id}/cards`);
        if (!cardsRes.ok) throw new Error('Failed to fetch collection cards');
        const cards = await responseData<ApiCollectionCard[]>(cardsRes, 'Failed to fetch collection cards');
        const items = cards.map(toItem);
        set({ items, isLoading: false });
      } else {
        set({ items: [], isLoading: false });
      }
    } catch (error: unknown) {
      set({ error: errorMessage(error), isLoading: false });
    }
  },

  addCard: async (card: Card) => {
    if (!card.printingId) {
      set({ error: 'This card has no printable version to add.' });
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      let colId = get().collectionId;
      
      if (!colId) {
        const createRes = await fetch('/api/v1/collections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'My Collection', defaultCollection: true })
        });
        if (!createRes.ok) throw new Error('Failed to create collection');
        const collection = await responseData<ApiCollection>(createRes, 'Failed to create collection');
        colId = collection.id;
        set({ collectionId: colId });
      }

      const existingItem = get().items.find(item => item.cardPrintingId === card.printingId);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + 1;
        const updateRes = await fetch(`/api/v1/collections/${colId}/cards/${existingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ regularQuantity: newQuantity, foilQuantity: existingItem.foilQuantity })
        });
        await responseData<ApiCollectionCard>(updateRes, 'Failed to update card quantity');
        
        set(state => ({
          items: state.items.map(item => 
            item.id === existingItem.id ? { ...item, quantity: newQuantity } : item
          ),
          isLoading: false
        }));
      } else {
        const addRes = await fetch(`/api/v1/collections/${colId}/cards`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cardPrintingId: card.printingId, regularQuantity: 1, foilQuantity: 0 })
        });
        if (!addRes.ok) throw new Error('Failed to add card to collection');
        const newItem = await responseData<ApiCollectionCard>(addRes, 'Failed to add card');
        
        set(state => ({
          items: [...state.items, toItem(newItem)],
          isLoading: false
        }));
      }
    } catch (error: unknown) {
      set({ error: errorMessage(error), isLoading: false });
    }
  },

  removeCard: async (collectionCardId: number) => {
    const colId = get().collectionId;
    if (!colId) return;
    
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/v1/collections/${colId}/cards/${collectionCardId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to remove card');
      
      set(state => ({
        items: state.items.filter(item => item.id !== collectionCardId),
        isLoading: false
      }));
    } catch (error: unknown) {
      set({ error: errorMessage(error), isLoading: false });
    }
  },

  updateQuantity: async (collectionCardId: number, quantity: number) => {
    const colId = get().collectionId;
    if (!colId) return;
    
    if (quantity <= 0) {
      await get().removeCard(collectionCardId);
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      const existingItem = get().items.find(item => item.id === collectionCardId);
      if (!existingItem) throw new Error('Item not found');
      
      const res = await fetch(`/api/v1/collections/${colId}/cards/${collectionCardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regularQuantity: quantity, foilQuantity: existingItem.foilQuantity })
      });
      if (!res.ok) throw new Error('Failed to update quantity');
      
      set(state => ({
        items: state.items.map(item => 
          item.id === collectionCardId ? { ...item, quantity } : item
        ),
        isLoading: false
      }));
    } catch (error: unknown) {
      set({ error: errorMessage(error), isLoading: false });
    }
  },

  getTotalCards: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  }
}));
