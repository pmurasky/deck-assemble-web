import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  followProfile,
  unfollowProfile,
  favoriteDeck,
  unfavoriteDeck,
  getViewerFavorites,
  getDiscoveryDecks,
  getCommunityFeed,
} from '@/lib/api/community';

vi.mock('@/lib/auth0', () => ({
  auth0: {
    getAccessToken: vi.fn().mockResolvedValue({ token: 'mock-token' }),
  },
}));

describe('community API', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('handles follow and unfollow profile', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ profileId: 'p-1', isFollowing: true }) })
      .mockResolvedValueOnce({ ok: true, status: 204 })
    );

    const followRes = await followProfile('p-1');
    expect(followRes.isFollowing).toBe(true);

    await expect(unfollowProfile('p-1')).resolves.toBeUndefined();
  });

  it('handles self-follow error (400)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: 'Cannot follow yourself' } }),
    }));

    await expect(followProfile('my-id')).rejects.toThrow('Cannot follow yourself');
  });

  it('handles favorite and unfavorite deck', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ slug: 'deck-1', isFavorited: true }) })
      .mockResolvedValueOnce({ ok: true, status: 204 })
    );

    const favRes = await favoriteDeck('deck-1');
    expect(favRes.isFavorited).toBe(true);

    await expect(unfavoriteDeck('deck-1')).resolves.toBeUndefined();
  });

  it('fetches viewer favorites', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [{ id: 1, slug: 'deck-1' }], total: 1, page: 0, size: 20 }),
    }));

    const result = await getViewerFavorites();
    expect(result.items.length).toBe(1);
  });

  it('fetches discovery decks with filters', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [{ id: 1, name: 'Atraxa Superfriends' }], total: 1, page: 0, size: 20 }),
    }));

    const result = await getDiscoveryDecks({ commander: 'Atraxa', colors: ['W', 'U', 'B', 'G'] });
    expect(result.items[0].name).toBe('Atraxa Superfriends');
  });

  it('fetches community feed', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [{ id: 2, name: 'Urza Stax' }], total: 1, page: 0, size: 20 }),
    }));

    const result = await getCommunityFeed();
    expect(result.items[0].name).toBe('Urza Stax');
  });
});
