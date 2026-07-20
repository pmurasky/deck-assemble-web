import { auth0 } from '@/lib/auth0';
import type { ApiCard } from '@/lib/api/catalog';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080';

export interface ApiDeck {
  id: number;
  name: string;
  formatCode: string;
  commanderCardId: number | null;
  cardCount?: number;
  commanderName?: string;
}

export type DeckSection = 'COMMANDER' | 'MAIN_DECK' | 'SIDEBOARD' | 'COMPANION' | 'MAYBE_BOARD';

export interface ApiDeckCard {
  id: number;
  cardPrintingId: number;
  quantity: number;
  deckSection: DeckSection;
  card: ApiCard;
}

async function fetchDecks(path: string, init?: RequestInit) {
  const token = await auth0.getAccessToken();
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${token.token}`);
  headers.set('Content-Type', 'application/json');
  return fetch(new URL(`/api/v1${path}`, API_BASE_URL), { ...init, cache: 'no-store', headers });
}

async function json<T>(res: Promise<Response>, message: string): Promise<T> {
  const response = await res;
  if (!response.ok) throw new Error(message);
  return response.json() as Promise<T>;
}

export async function getDecks(): Promise<ApiDeck[]> {
  return json(fetchDecks('/decks'), 'Failed to fetch decks');
}

export async function createDeck(name: string, formatCode: string): Promise<ApiDeck> {
  return json(fetchDecks('/decks', {
    method: 'POST',
    body: JSON.stringify({ name, formatCode }),
  }), 'Failed to create deck');
}

export async function getDeck(id: number): Promise<ApiDeck> {
  return json(fetchDecks(`/decks/${id}`), 'Failed to fetch deck');
}

export async function updateDeck(id: number, name?: string, formatCode?: string, commanderCardId?: number | null): Promise<ApiDeck> {
  const body: Record<string, unknown> = {};
  if (name !== undefined) body.name = name;
  if (formatCode !== undefined) body.formatCode = formatCode;
  if (commanderCardId !== undefined) body.commanderCardId = commanderCardId;
  
  return json(fetchDecks(`/decks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  }), 'Failed to update deck');
}

export async function deleteDeck(id: number): Promise<void> {
  const res = await fetchDecks(`/decks/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete deck');
}

export async function getDeckCards(deckId: number): Promise<ApiDeckCard[]> {
  return json(fetchDecks(`/decks/${deckId}/cards`), 'Failed to fetch deck cards');
}

export async function addCardToDeck(
  deckId: number,
  cardPrintingId: number,
  quantity: number,
  deckSection: DeckSection
): Promise<ApiDeckCard> {
  return json(fetchDecks(`/decks/${deckId}/cards`, {
    method: 'POST',
    body: JSON.stringify({ cardPrintingId, quantity, deckSection }),
  }), 'Failed to add card to deck');
}

export async function updateDeckCard(
  deckId: number,
  deckCardId: number,
  quantity: number,
  deckSection: DeckSection
): Promise<ApiDeckCard> {
  return json(fetchDecks(`/decks/${deckId}/cards/${deckCardId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity, deckSection }),
  }), 'Failed to update deck card');
}

export async function removeDeckCard(deckId: number, deckCardId: number): Promise<void> {
  const res = await fetchDecks(`/decks/${deckId}/cards/${deckCardId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to remove deck card');
}
