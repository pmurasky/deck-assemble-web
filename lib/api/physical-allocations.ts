import { auth0 } from '@/lib/auth0';
import type {
  PhysicalCardAllocation,
  CreateAllocationRequest,
  UpdateAllocationRequest,
  UnavailableCardsResponse,
} from '@/types/physical-allocation';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080';

async function fetchAlloc(path: string, init?: RequestInit) {
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

export async function getPhysicalCardAllocations(deckId: number): Promise<PhysicalCardAllocation[]> {
  return json(fetchAlloc(`/decks/${deckId}/physical-cards`), 'Failed to fetch physical card allocations');
}

export async function allocatePhysicalCard(deckId: number, req: CreateAllocationRequest): Promise<PhysicalCardAllocation> {
  return json(
    fetchAlloc(`/decks/${deckId}/physical-cards`, {
      method: 'POST',
      body: JSON.stringify(req),
    }),
    'Failed to allocate physical card'
  );
}

export async function updatePhysicalAllocation(
  deckId: number,
  allocationId: number,
  req: UpdateAllocationRequest
): Promise<PhysicalCardAllocation> {
  return json(
    fetchAlloc(`/decks/${deckId}/physical-cards/${allocationId}`, {
      method: 'PATCH',
      body: JSON.stringify(req),
    }),
    'Failed to update physical card allocation'
  );
}

export async function deletePhysicalAllocation(deckId: number, allocationId: number): Promise<void> {
  const res = await fetchAlloc(`/decks/${deckId}/physical-cards/${allocationId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete physical card allocation');
}

export async function getUnavailablePhysicalCards(deckId: number): Promise<UnavailableCardsResponse> {
  return json(
    fetchAlloc(`/decks/${deckId}/physical-cards/unavailable`),
    'Failed to fetch unavailable physical cards'
  );
}
