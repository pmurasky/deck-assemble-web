import { create } from 'zustand';
import type { Card } from '@/types/card';
import type { DeckCard, DeckMetadata } from './deck-store';

export interface SavedDeck {
  id: string;
  cards: DeckCard[];
  commander?: Card;
  metadata: DeckMetadata;
  createdAt: string;
  updatedAt: string;
  cardCount?: number;
  commanderName?: string;
}

interface DeckResponse {
  id: number;
  name: string;
  formatCode: string;
  commanderCardId: number | null;
  cardCount: number;
  commanderName: string | null;
  createdAt: string;
}

type DeckInput = Omit<SavedDeck, 'createdAt' | 'updatedAt'>;

const formatByCode: Record<string, DeckMetadata['format']> = {
  COMMANDER: 'Commander',
  STANDARD: 'Standard',
  MODERN: 'Modern',
  LEGACY: 'Legacy',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function formatFromCode(formatCode: string): DeckMetadata['format'] {
  return formatByCode[formatCode] ?? 'Commander';
}

function readDeckResponse(value: unknown): DeckResponse {
  if (!isRecord(value)) throw new Error('Deck response was not an object');

  const commanderName = value.commanderName;
  const commanderCardId = value.commanderCardId;

  if (
    typeof value.id !== 'number' ||
    typeof value.name !== 'string' ||
    typeof value.formatCode !== 'string' ||
    (commanderCardId !== null && typeof commanderCardId !== 'number') ||
    typeof value.cardCount !== 'number' ||
    (commanderName !== null && typeof commanderName !== 'string') ||
    typeof value.createdAt !== 'string'
  ) {
    throw new Error('Deck response did not match the API contract');
  }

  return {
    id: value.id,
    name: value.name,
    formatCode: value.formatCode,
    commanderCardId,
    cardCount: value.cardCount,
    commanderName,
    createdAt: value.createdAt,
  };
}

function readProxyData(value: unknown): unknown {
  if (!isRecord(value) || !('data' in value)) {
    throw new Error('API response did not include data');
  }
  return value.data;
}

async function readJsonData(res: Response, action: string): Promise<unknown> {
  ensureOk(res, action);
  return readProxyData(await res.json());
}

function ensureOk(res: Response, action: string): void {
  if (!res.ok) throw new Error(`${action} failed with status ${res.status}`);
}

function toSavedDeck(deck: DeckResponse, input?: DeckInput): SavedDeck {
  return {
    id: String(deck.id),
    cards: input?.cards ?? [],
    commander: input?.commander,
    metadata: {
      name: deck.name,
      format: formatFromCode(deck.formatCode),
    },
    createdAt: deck.createdAt,
    updatedAt: deck.createdAt,
    cardCount: deck.cardCount,
    commanderName: deck.commanderName ?? undefined,
  };
}

function commanderId(deck: DeckInput): number | null {
  if (!deck.commander) return null;
  const id = Number(deck.commander.id);
  if (!Number.isInteger(id)) throw new Error('Commander card ID must be numeric');
  return id;
}

function upsertDeck(decks: SavedDeck[], savedDeck: SavedDeck): SavedDeck[] {
  const existingIndex = decks.findIndex(d => d.id === savedDeck.id);
  if (existingIndex < 0) return [...decks, savedDeck];

  const nextDecks = [...decks];
  nextDecks[existingIndex] = savedDeck;
  return nextDecks;
}

interface DecksListState {
  decks: SavedDeck[];
  isLoading: boolean;
  error: string | null;
  fetchDecks: () => Promise<void>;
  saveDeck: (deck: DeckInput) => Promise<SavedDeck>;
  deleteDeck: (id: string) => Promise<void>;
  getDeckById: (id: string) => SavedDeck | undefined;
}

export const useDecksListStore = create<DecksListState>((set, get) => ({
  decks: [],
  isLoading: false,
  error: null,
  
  fetchDecks: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await readJsonData(await fetch('/api/v1/decks'), 'Fetch decks');
       
      if (!Array.isArray(data)) throw new Error('Deck list response was not an array');
       
      const decks = data.map((deck) => toSavedDeck(readDeckResponse(deck)));
      
      set({ decks, isLoading: false });
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
    }
  },
  
  saveDeck: async (deckData) => {
    const isNew = !deckData.id || deckData.id.includes('-');
    let deckId = deckData.id;
    
    const formatCode = deckData.metadata.format.toUpperCase();
    const requestedCommanderId = commanderId(deckData);
    
    if (isNew) {
      const data = await readJsonData(await fetch('/api/v1/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: deckData.metadata.name,
          formatCode,
        }),
      }), 'Create deck');
      let apiDeck = readDeckResponse(data);
      deckId = String(apiDeck.id);
       
      if (requestedCommanderId !== null) {
        const dataWithCommander = await readJsonData(await fetch(`/api/v1/decks/${deckId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            commanderCardId: requestedCommanderId,
          }),
        }), 'Set commander');
        apiDeck = readDeckResponse(dataWithCommander);
      }

      const savedDeck = toSavedDeck(apiDeck, deckData);
      set((state) => ({ decks: upsertDeck(state.decks, savedDeck) }));
      return savedDeck;
    } else {
      const data = await readJsonData(await fetch(`/api/v1/decks/${deckId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: deckData.metadata.name,
          formatCode,
          commanderCardId: requestedCommanderId,
        }),
      }), 'Update deck');

      const savedDeck = toSavedDeck(readDeckResponse(data), deckData);
      set((state) => ({ decks: upsertDeck(state.decks, savedDeck) }));
      return savedDeck;
    }
  },

  deleteDeck: async (id) => {
    if (id.includes('-')) {
      set((state) => ({ decks: state.decks.filter(d => d.id !== id) }));
      return;
    }
    
    ensureOk(await fetch(`/api/v1/decks/${id}`, { method: 'DELETE' }), 'Delete deck');
    
    set((state) => ({
      decks: state.decks.filter(d => d.id !== id)
    }));
  },
  
  getDeckById: (id) => {
    return get().decks.find(d => d.id === id);
  }
}));
