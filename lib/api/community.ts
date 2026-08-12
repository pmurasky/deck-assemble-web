import { auth0 } from '@/lib/auth0';
import type {
  DiscoveryFilterParams,
  DiscoveryDeckListResponse,
  CommunityFeedResponse,
} from '@/types/community';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080';

async function fetchCommunity(path: string, init?: RequestInit, requireAuth = true) {
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

export async function followProfile(profileId: string): Promise<{ profileId: string; isFollowing: boolean }> {
  return json(
    fetchCommunity(`/community/profiles/${encodeURIComponent(profileId)}/follow`, {
      method: 'POST',
    }),
    'Failed to follow profile'
  );
}

export async function unfollowProfile(profileId: string): Promise<void> {
  const res = await fetchCommunity(`/community/profiles/${encodeURIComponent(profileId)}/follow`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to unfollow profile');
}

export async function favoriteDeck(slug: string): Promise<{ slug: string; isFavorited: boolean }> {
  return json(
    fetchCommunity(`/shared/decks/${encodeURIComponent(slug)}/favorite`, {
      method: 'POST',
    }),
    'Failed to favorite deck'
  );
}

export async function unfavoriteDeck(slug: string): Promise<void> {
  const res = await fetchCommunity(`/shared/decks/${encodeURIComponent(slug)}/favorite`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to unfavorite deck');
}

export async function getViewerFavorites(page = 0, size = 20): Promise<DiscoveryDeckListResponse> {
  const query = new URLSearchParams({ page: String(page), size: String(size) }).toString();
  return json(
    fetchCommunity(`/community/favorites?${query}`),
    'Failed to fetch viewer favorites'
  );
}

export async function getDiscoveryDecks(params: DiscoveryFilterParams = {}): Promise<DiscoveryDeckListResponse> {
  const queryParams = new URLSearchParams();
  if (params.commander) queryParams.set('commander', params.commander);
  if (params.colors && params.colors.length > 0) queryParams.set('colors', params.colors.join(','));
  if (params.tags && params.tags.length > 0) queryParams.set('tags', params.tags.join(','));
  if (params.category) queryParams.set('category', params.category);
  if (params.updated) queryParams.set('updated', params.updated);
  if (params.favorite !== undefined) queryParams.set('favorite', String(params.favorite));
  if (params.page !== undefined) queryParams.set('page', String(params.page));
  if (params.size !== undefined) queryParams.set('size', String(params.size));
  if (params.sort) queryParams.set('sort', params.sort);

  return json(
    fetchCommunity(`/community/decks?${queryParams.toString()}`, {}, false),
    'Failed to fetch discovery decks'
  );
}

export async function getCommunityFeed(page = 0, size = 20): Promise<CommunityFeedResponse> {
  const query = new URLSearchParams({ page: String(page), size: String(size) }).toString();
  return json(
    fetchCommunity(`/community/feed?${query}`),
    'Failed to fetch community feed'
  );
}
