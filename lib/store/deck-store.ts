import { create } from 'zustand';
import { toCard, type ApiCard } from '@/lib/api/catalog';
import type { Card } from '@/types/card';

type DeckSection = 'COMMANDER' | 'MAIN_DECK' | 'SIDEBOARD' | 'COMPANION' | 'MAYBE_BOARD';

const DEFAULT_DECK_SECTION: DeckSection = 'MAIN_DECK';

type UnknownObject = { readonly [key: string]: unknown };

export interface DeckCard {
  deckCardId: number;
  cardPrintingId: number;
  card: Card;
  quantity: number;
  deckSection: DeckSection;
}

export interface DeckMetadata {
  name: string;
  format: 'Commander' | 'Standard' | 'Modern' | 'Legacy';
}

interface DeckState {
  id: string;
  cards: DeckCard[];
  commander?: Card;
  metadata: DeckMetadata;
  isLoading: boolean;
  
  // Actions
  addCard: (card: Card, deckSection?: string) => Promise<void>;
  removeCard: (deckCardId: number) => Promise<void>;
  setCommander: (card: Card) => Promise<void>;
  updateMetadata: (metadata: Partial<DeckMetadata>) => Promise<void>;
  clearDeck: () => void;
  loadDeck: (id: string, cards: DeckCard[], commander: Card | undefined, metadata: DeckMetadata) => void;
  fetchDeckCards: (deckId: string) => Promise<void>;
}

function isObject(value: unknown): value is UnknownObject {
  return typeof value === 'object' && value !== null;
}

function isDeckSection(value: unknown): value is DeckSection {
  return value === 'COMMANDER' || value === 'MAIN_DECK' || value === 'SIDEBOARD' || value === 'COMPANION' || value === 'MAYBE_BOARD';
}

function parseDeckSection(value: string): DeckSection {
  if (!isDeckSection(value)) throw new Error('Invalid deck section');
  return value;
}

function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === 'string';
}

function isOptionalNumber(value: unknown): value is number | undefined {
  return value === undefined || typeof value === 'number';
}

function isApiCard(value: unknown): value is ApiCard {
  return isObject(value)
    && typeof value.id === 'number'
    && typeof value.oracleId === 'string'
    && typeof value.name === 'string'
    && isOptionalNumber(value.printingId)
    && isOptionalString(value.manaCost)
    && isOptionalNumber(value.manaValue)
    && isOptionalString(value.colors)
    && isOptionalString(value.colorIdentity)
    && isOptionalString(value.typeLine)
    && isOptionalString(value.oracleText)
    && isOptionalString(value.power)
    && isOptionalString(value.toughness)
    && isOptionalString(value.loyalty)
    && isOptionalString(value.imageUrl)
    && isOptionalString(value.setCode)
    && isOptionalString(value.setName)
    && isOptionalString(value.rarity)
    && isOptionalString(value.flavorText);
}

function getProxyData(body: unknown): unknown {
  if (!isObject(body)) throw new Error('Invalid proxy response');
  return body.data;
}

async function readProxyData(res: Response): Promise<unknown> {
  const body: unknown = await res.json();
  return getProxyData(body);
}

function parseDeckId(data: unknown): string {
  if (!isObject(data) || typeof data.id !== 'number') throw new Error('Invalid deck response');
  return String(data.id);
}

function parseDeckCard(data: unknown): DeckCard {
  if (!isObject(data)) throw new Error('Invalid deck card data');
  if (typeof data.id !== 'number') throw new Error('Invalid deck card id');
  if (typeof data.cardPrintingId !== 'number') throw new Error('Invalid card printing id');
  if (typeof data.quantity !== 'number') throw new Error('Invalid quantity');
  if (!isDeckSection(data.deckSection)) throw new Error('Invalid deck section');
  if (!isApiCard(data.card)) throw new Error('Invalid card data');

  return {
    deckCardId: data.id,
    cardPrintingId: data.cardPrintingId,
    card: toCard(data.card),
    quantity: data.quantity,
    deckSection: data.deckSection,
  };
}

async function ensureDeckExists(state: DeckState): Promise<string> {
  if (!state.id.includes('-')) return state.id;
  
  const res = await fetch('/api/v1/decks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: state.metadata.name,
      formatCode: state.metadata.format.toUpperCase(),
    }),
  });
  if (!res.ok) throw new Error('Failed to create deck');
  return parseDeckId(await readProxyData(res));
}

export const useDeckStore = create<DeckState>((set, get) => ({
  id: crypto.randomUUID(),
  cards: [],
  metadata: {
    name: 'New Deck',
    format: 'Commander',
  },
  isLoading: false,
  
  addCard: async (card, deckSection = DEFAULT_DECK_SECTION) => {
    const state = get();
    let deckId = state.id;
    const section = parseDeckSection(deckSection);
    
    if (card.printingId === undefined) {
      throw new Error('Card printingId is required to add to deck');
    }
    
    try {
      deckId = await ensureDeckExists(state);
      if (deckId !== state.id) {
        set({ id: deckId });
      }
      
      const existingCardIndex = state.cards.findIndex((c) => c.cardPrintingId === card.printingId && c.deckSection === section);
      
      if (existingCardIndex >= 0) {
        const existing = state.cards[existingCardIndex];
        const newQuantity = existing.quantity + 1;
        
        const res = await fetch(`/api/v1/decks/${deckId}/cards/${existing.deckCardId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: newQuantity, deckSection: existing.deckSection }),
        });
        if (!res.ok) throw new Error('Failed to update deck card');
        
        const newCards = [...state.cards];
        newCards[existingCardIndex] = {
          ...existing,
          quantity: newQuantity,
        };
        set({ cards: newCards });
      } else {
        const res = await fetch(`/api/v1/decks/${deckId}/cards`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cardPrintingId: card.printingId, quantity: 1, deckSection: section }),
        });
        
        if (!res.ok) throw new Error('Failed to add deck card');
        const deckCard = parseDeckCard(await readProxyData(res));
        
        set({ cards: [...get().cards, deckCard] });
      }
    } catch (error) {
      console.error('Failed to add card', error);
      throw error;
    }
  },
  
  removeCard: async (deckCardId) => {
    const state = get();
    const deckId = state.id;
    if (deckId.includes('-')) return; // Not saved yet
    
    const existingCardIndex = state.cards.findIndex((c) => c.deckCardId === deckCardId);
    if (existingCardIndex >= 0) {
      const existing = state.cards[existingCardIndex];
      
      try {
        if (existing.quantity > 1) {
          const newQuantity = existing.quantity - 1;
          const res = await fetch(`/api/v1/decks/${deckId}/cards/${existing.deckCardId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: newQuantity, deckSection: existing.deckSection }),
          });
          if (!res.ok) throw new Error('Failed to update deck card');
          
          const newCards = [...state.cards];
          newCards[existingCardIndex] = {
            ...existing,
            quantity: newQuantity,
          };
          set({ cards: newCards });
        } else {
          const res = await fetch(`/api/v1/decks/${deckId}/cards/${existing.deckCardId}`, {
            method: 'DELETE',
          });
          if (!res.ok) throw new Error('Failed to delete deck card');
          
          const newCards = [...state.cards];
          newCards.splice(existingCardIndex, 1);
          set({ cards: newCards });
        }
      } catch (error) {
        console.error('Failed to remove card', error);
        throw error;
      }
    }
  },
  
  setCommander: async (card) => {
    const state = get();
    let deckId = state.id;
    
    try {
      deckId = await ensureDeckExists(state);
      if (deckId !== state.id) {
        set({ id: deckId });
      }
      const commanderCardId = Number(card.id);
      if (!isPositiveInteger(commanderCardId)) throw new Error('Commander card id must be a positive integer');
      
      const res = await fetch(`/api/v1/decks/${deckId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commanderCardId,
        }),
      });
      if (!res.ok) throw new Error('Failed to set commander');
      
      set({ commander: card });
    } catch (error) {
      console.error('Failed to set commander', error);
      throw error;
    }
  },
  
  updateMetadata: async (metadata) => {
    const state = get();
    const newMetadata = { ...state.metadata, ...metadata };
    
    if (!state.id.includes('-')) {
      try {
        const res = await fetch(`/api/v1/decks/${state.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newMetadata.name,
            formatCode: newMetadata.format.toUpperCase(),
          }),
        });
        if (!res.ok) throw new Error('Failed to update metadata');
        set({ metadata: newMetadata });
      } catch (error) {
        console.error('Failed to update metadata', error);
        throw error;
      }
    } else {
      set({ metadata: newMetadata });
    }
  },
  
  clearDeck: () => set({ id: crypto.randomUUID(), cards: [], commander: undefined, metadata: { name: 'New Deck', format: 'Commander' } }),
  
  loadDeck: (id, cards, commander, metadata) => set({ id, cards, commander, metadata }),
  
  fetchDeckCards: async (deckId: string) => {
    if (deckId.includes('-')) return;
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/v1/decks/${deckId}/cards`);
      if (res.ok) {
        const data = await readProxyData(res);
        if (!Array.isArray(data)) throw new Error('Invalid data format');
        
        const cards = data.map(parseDeckCard);
        
        set({ cards, isLoading: false });
      } else {
        throw new Error('Failed to fetch deck cards');
      }
    } catch (error) {
      console.error('Failed to fetch deck cards', error);
      set({ isLoading: false });
    }
  }
}));
