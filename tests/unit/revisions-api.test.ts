import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getDeckRevisions,
  getDeckRevision,
  getDeckRevisionDiff,
  restoreDeckRevision,
} from '@/lib/api/revisions';

vi.mock('@/lib/auth0', () => ({
  auth0: {
    getAccessToken: vi.fn().mockResolvedValue({ token: 'test-token' }),
  },
}));

describe('revisions-api', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(global.fetch).mockReset?.();
  });

  it('should fetch paginated revisions list', async () => {
    const mockData = {
      items: [{ id: 1, revisionNumber: 1, changeType: 'CREATED', createdAt: '2026-08-09T00:00:00Z' }],
      total: 1,
      page: 1,
      size: 20,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    const res = await getDeckRevisions(10, 1, 20);
    expect(res).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        href: expect.stringContaining('/api/v1/decks/10/revisions?page=1&size=20'),
      }),
      expect.anything()
    );
  });

  it('should fetch single revision detail', async () => {
    const mockDetail = {
      revisionNumber: 2,
      createdAt: '2026-08-09T01:00:00Z',
      snapshot: { id: 10, name: 'Test Deck', formatCode: 'commander', revisionNumber: 2, cards: [] },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockDetail,
    } as Response);

    const res = await getDeckRevision(10, 2);
    expect(res).toEqual(mockDetail);
  });

  it('should fetch revision diff between revision n and m', async () => {
    const mockDiff = {
      revisionA: 1,
      revisionB: 2,
      cardChanges: [{ cardName: 'Sol Ring', oldQuantity: 0, newQuantity: 1, section: 'MAIN_DECK' }],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockDiff,
    } as Response);

    const res = await getDeckRevisionDiff(10, 1, 2);
    expect(res).toEqual(mockDiff);
  });

  it('should send restore request with expectedCurrentRevision', async () => {
    const mockDetail = {
      revisionNumber: 3,
      createdAt: '2026-08-09T02:00:00Z',
      snapshot: { id: 10, name: 'Restored Deck', formatCode: 'commander', revisionNumber: 3, cards: [] },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockDetail,
    } as Response);

    const res = await restoreDeckRevision(10, 1, 2);
    expect(res).toEqual(mockDetail);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        href: expect.stringContaining('/api/v1/decks/10/revisions/1/restore'),
      }),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ expectedCurrentRevision: 2 }),
      })
    );
  });
});
