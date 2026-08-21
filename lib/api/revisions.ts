import { auth0 } from '@/lib/auth0';
import type {
  DeckRevisionListResponse,
  DeckRevisionDetail,
  DeckRevisionDiff,
} from '@/types/m3';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080';

async function fetchRevisions(path: string, init?: RequestInit) {
  const token = await auth0.getAccessToken();
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${token.token}`);
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

export async function getDeckRevisions(
  deckId: number,
  page = 1,
  size = 20
): Promise<DeckRevisionListResponse> {
  return json(
    fetchRevisions(`/decks/${deckId}/revisions?page=${page}&size=${size}`),
    'Failed to fetch revisions'
  );
}

export async function getDeckRevision(
  deckId: number,
  revisionNumber: number
): Promise<DeckRevisionDetail> {
  return json(
    fetchRevisions(`/decks/${deckId}/revisions/${revisionNumber}`),
    'Failed to fetch revision detail'
  );
}

export async function getDeckRevisionDiff(
  deckId: number,
  revA: number,
  revB: number
): Promise<DeckRevisionDiff> {
  return json(
    fetchRevisions(`/decks/${deckId}/revisions/${revA}/diff/${revB}`),
    'Failed to fetch revision diff'
  );
}

export async function restoreDeckRevision(
  deckId: number,
  revisionNumber: number,
  expectedCurrentRevision: number
): Promise<DeckRevisionDetail> {
  return json(
    fetchRevisions(`/decks/${deckId}/revisions/${revisionNumber}/restore`, {
      method: 'POST',
      body: JSON.stringify({ expectedCurrentRevision }),
    }),
    'Failed to restore revision'
  );
}

export async function getLatestDeckRevisionNumber(deckId: number): Promise<number> {
  try {
    const res = await fetchRevisions(`/decks/${deckId}/revisions?size=1`);
    if (res.ok) {
      const data = await res.json();
      const item = data?.content?.[0] ?? data?.items?.[0];
      if (item && typeof item.revisionNumber === 'number') {
        return item.revisionNumber;
      }
    }
  } catch {
    // Fall back to 1 if revision cannot be resolved
  }
  return 1;
}
