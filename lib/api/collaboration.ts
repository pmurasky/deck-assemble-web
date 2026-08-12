import { auth0 } from '@/lib/auth0';
import type { DeckCollaborator } from '@/types/collaboration';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080';

async function fetchCollaboration(path: string, init?: RequestInit) {
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

export async function getCollaborators(deckId: number): Promise<DeckCollaborator[]> {
  return json(fetchCollaboration(`/decks/${deckId}/collaborators`), 'Failed to fetch collaborators');
}

export async function inviteCollaborator(deckId: number, profileId: string, role: 'EDITOR' | 'VIEWER' = 'EDITOR'): Promise<DeckCollaborator> {
  return json(
    fetchCollaboration(`/decks/${deckId}/collaborators`, {
      method: 'POST',
      body: JSON.stringify({ profileId, role }),
    }),
    'Failed to invite collaborator'
  );
}

export async function removeCollaborator(deckId: number, profileId: string): Promise<void> {
  const res = await fetchCollaboration(`/decks/${deckId}/collaborators/${encodeURIComponent(profileId)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    const msg = errData?.error?.message || errData?.message || 'Failed to remove collaborator';
    const err = new Error(msg) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
}
