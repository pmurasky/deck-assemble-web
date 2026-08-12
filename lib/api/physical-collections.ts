import { auth0 } from '@/lib/auth0';
import type {
  CollectionLocation,
  CreateLocationRequest,
  UpdateLocationRequest,
  CardPhysicalMetadata,
  UpdatePhysicalMetadataRequest,
} from '@/types/physical-collection';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080';

async function fetchPhysColl(path: string, init?: RequestInit) {
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

// Storage Locations
export async function getCollectionLocations(): Promise<CollectionLocation[]> {
  return json(fetchPhysColl('/collection-locations'), 'Failed to fetch collection locations');
}

export async function createCollectionLocation(req: CreateLocationRequest): Promise<CollectionLocation> {
  return json(
    fetchPhysColl('/collection-locations', {
      method: 'POST',
      body: JSON.stringify(req),
    }),
    'Failed to create location'
  );
}

export async function updateCollectionLocation(id: number, req: UpdateLocationRequest): Promise<CollectionLocation> {
  return json(
    fetchPhysColl(`/collection-locations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(req),
    }),
    'Failed to update location'
  );
}

export async function deleteCollectionLocation(id: number): Promise<void> {
  const res = await fetchPhysColl(`/collection-locations/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    const msg = errData?.error?.message || errData?.message || 'Failed to delete location';
    const err = new Error(msg) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
}

// Card Physical Metadata
export async function getCardPhysicalMetadata(collectionId: number, collectionCardId: number): Promise<CardPhysicalMetadata> {
  return json(
    fetchPhysColl(`/collections/${collectionId}/cards/${collectionCardId}/physical`),
    'Failed to fetch card physical metadata'
  );
}

export async function updateCardPhysicalMetadata(
  collectionId: number,
  collectionCardId: number,
  req: UpdatePhysicalMetadataRequest
): Promise<CardPhysicalMetadata> {
  return json(
    fetchPhysColl(`/collections/${collectionId}/cards/${collectionCardId}/physical`, {
      method: 'PATCH',
      body: JSON.stringify(req),
    }),
    'Failed to update card physical metadata'
  );
}

export async function getBulkPhysicalMetadata(collectionId: number): Promise<CardPhysicalMetadata[]> {
  return json(
    fetchPhysColl(`/collections/${collectionId}/cards/physical`),
    'Failed to fetch bulk physical metadata'
  );
}
