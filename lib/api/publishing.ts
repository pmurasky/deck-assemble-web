import { auth0 } from '@/lib/auth0';
import type {
  DeckVisibility,
  PublishDeckResponse,
  DeckPrimer,
  SharedDeckResponse,
  ForkDeckResponse,
} from '@/types/m3';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080';

async function fetchPublishing(path: string, init?: RequestInit, requireAuth = true) {
  const headers = new Headers(init?.headers);
  if (requireAuth) {
    const token = await auth0.getAccessToken();
    headers.set('Authorization', `Bearer ${token.token}`);
  }
  headers.set('Content-Type', 'application/json');
  return fetch(new URL(`/api/v1${path}`, API_BASE_URL), { ...init, cache: 'no-store', headers });
}

async function json<T>(res: Promise<Response>, fallbackMessage: string): Promise<T> {
  const response = await res;
  if (!response.ok) {
    const errData = await response.json().catch(() => null);
    const msg = errData?.error?.message || errData?.message || fallbackMessage;
    const err = new Error(msg) as Error & { status?: number };
    err.status = response.status;
    throw err;
  }
  return response.json() as Promise<T>;
}

export async function updateDeckVisibility(
  deckId: number,
  visibility: DeckVisibility
): Promise<{ visibility: DeckVisibility }> {
  return json(
    fetchPublishing(`/decks/${deckId}/publishing`, {
      method: 'PATCH',
      body: JSON.stringify({ visibility }),
    }),
    'Failed to update deck visibility'
  );
}

export async function publishDeck(deckId: number): Promise<PublishDeckResponse> {
  return json(
    fetchPublishing(`/decks/${deckId}/publish`, {
      method: 'POST',
    }),
    'Failed to publish deck'
  );
}

export async function setDeckPrimer(
  deckId: number,
  content: string,
  title?: string
): Promise<DeckPrimer> {
  return json(
    fetchPublishing(`/decks/${deckId}/primer`, {
      method: 'PUT',
      body: JSON.stringify({ title, content }),
    }),
    'Failed to update deck primer'
  );
}

export async function getSharedDeck(slug: string): Promise<SharedDeckResponse> {
  return json(
    fetchPublishing(`/shared/decks/${encodeURIComponent(slug)}`, {}, false),
    'Shared deck not found'
  );
}

export async function forkSharedDeck(slug: string): Promise<ForkDeckResponse> {
  return json(
    fetchPublishing(`/shared/decks/${encodeURIComponent(slug)}/fork`, {
      method: 'POST',
    }),
    'Failed to fork shared deck'
  );
}
