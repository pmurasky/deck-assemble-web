import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  updateDeckVisibility,
  publishDeck,
  setDeckPrimer,
  getSharedDeck,
  forkSharedDeck,
} from '@/lib/api/publishing';

vi.mock('@/lib/auth0', () => ({
  auth0: {
    getAccessToken: vi.fn().mockResolvedValue({ token: 'test-token' }),
  },
}));

describe('publishing-api', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should patch deck visibility', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ visibility: 'PUBLIC' }),
    } as Response);

    const res = await updateDeckVisibility(10, 'PUBLIC');
    expect(res).toEqual({ visibility: 'PUBLIC' });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        href: expect.stringContaining('/api/v1/decks/10/publishing'),
      }),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ visibility: 'PUBLIC' }),
      })
    );
  });

  it('should publish deck pinned revision', async () => {
    const mockPublish = {
      deckId: 10,
      publishedRevisionNumber: 3,
      publishedAt: '2026-08-09T03:00:00Z',
      slug: 'test-deck-10',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockPublish,
    } as Response);

    const res = await publishDeck(10);
    expect(res).toEqual(mockPublish);
  });

  it('should update deck primer Markdown source', async () => {
    const mockPrimer = { title: 'Strategy Guide', content: '# How to play' };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockPrimer,
    } as Response);

    const res = await setDeckPrimer(10, '# How to play', 'Strategy Guide');
    expect(res).toEqual(mockPrimer);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        href: expect.stringContaining('/api/v1/decks/10/primer'),
      }),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ title: 'Strategy Guide', content: '# How to play' }),
      })
    );
  });

  it('should fetch public shared deck by slug without auth', async () => {
    const mockShared = {
      id: 10,
      name: 'Shared Commander',
      formatCode: 'commander',
      cards: [],
      publishedAt: '2026-08-09T03:00:00Z',
      slug: 'shared-commander',
      visibility: 'PUBLIC',
      publishedRevisionNumber: 3,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockShared,
    } as Response);

    const res = await getSharedDeck('shared-commander');
    expect(res).toEqual(mockShared);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        href: expect.stringContaining('/api/v1/shared/decks/shared-commander'),
      }),
      expect.anything()
    );
  });

  it('should fork shared deck', async () => {
    const mockFork = {
      newDeckId: 101,
      newDeck: { id: 101, name: 'Shared Commander (Fork)', formatCode: 'commander' },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockFork,
    } as Response);

    const res = await forkSharedDeck('shared-commander');
    expect(res).toEqual(mockFork);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        href: expect.stringContaining('/api/v1/shared/decks/shared-commander/fork'),
      }),
      expect.objectContaining({ method: 'POST' })
    );
  });
});
