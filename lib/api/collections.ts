import { auth0 } from '@/lib/auth0';
import type { Card } from '@/types/card';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080';

export interface ApiCollection {
  id: number;
  name: string;
  defaultCollection: boolean;
}

export interface ApiCollectionCard {
  id: number;
  cardPrintingId: number;
  regularQuantity: number;
  foilQuantity: number;
  card: Card;
}

async function fetchCollections(path: string, init?: RequestInit) {
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

export async function getCollections(): Promise<ApiCollection[]> {
  return json(fetchCollections('/collections'), 'Failed to fetch collections');
}

export async function createCollection(name: string, defaultCollection: boolean): Promise<ApiCollection> {
  return json(fetchCollections('/collections', {
    method: 'POST',
    body: JSON.stringify({ name, defaultCollection }),
  }), 'Failed to create collection');
}

export async function getCollectionCards(collectionId: number): Promise<ApiCollectionCard[]> {
  return json(fetchCollections(`/collections/${collectionId}/cards`), 'Failed to fetch collection cards');
}

export async function addCardToCollection(
  collectionId: number,
  cardPrintingId: number,
  regularQuantity: number,
  foilQuantity: number,
): Promise<ApiCollectionCard> {
  return json(fetchCollections(`/collections/${collectionId}/cards`, {
    method: 'POST',
    body: JSON.stringify({ cardPrintingId, regularQuantity, foilQuantity }),
  }), 'Failed to add card to collection');
}

export async function updateCollectionCard(
  collectionId: number,
  collectionCardId: number,
  regularQuantity: number,
  foilQuantity: number,
): Promise<ApiCollectionCard> {
  return json(fetchCollections(`/collections/${collectionId}/cards/${collectionCardId}`, {
    method: 'PATCH',
    body: JSON.stringify({ regularQuantity, foilQuantity }),
  }), 'Failed to update collection card');
}

export async function removeCollectionCard(collectionId: number, collectionCardId: number) {
  const res = await fetchCollections(`/collections/${collectionId}/cards/${collectionCardId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to remove collection card');
}
