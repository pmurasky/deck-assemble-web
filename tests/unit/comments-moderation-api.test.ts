import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  setCommentsEnabled,
  getDeckComments,
  createDeckComment,
  updateDeckComment,
  deleteDeckComment,
  submitCommunityReport,
  resolveCommunityReport,
  dismissCommunityReport,
} from '@/lib/api/comments-moderation';

vi.mock('@/lib/auth0', () => ({
  auth0: {
    getAccessToken: vi.fn().mockResolvedValue({ token: 'mock-token' }),
  },
}));

describe('comments & moderation API', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('toggles comments enabled on a deck', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ deckId: 10, commentsEnabled: true }),
    }));

    const result = await setCommentsEnabled(10, true);
    expect(result).toEqual({ deckId: 10, commentsEnabled: true });
  });

  it('fetches, creates, updates, and deletes deck comments', async () => {
    const commentData = {
      id: 1,
      deckSlug: 'test-deck-1',
      authorProfileId: 'usr-1',
      authorDisplayName: 'User One',
      content: 'Great deck build!',
      createdAt: '2026-08-11T12:00:00Z',
    };

    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ items: [commentData], total: 1, page: 0, size: 20 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => commentData })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ...commentData, content: 'Updated comment text' }) })
      .mockResolvedValueOnce({ ok: true, status: 204 })
    );

    const list = await getDeckComments('test-deck-1');
    expect(list.items.length).toBe(1);

    const created = await createDeckComment('test-deck-1', 'Great deck build!');
    expect(created.id).toBe(1);

    const updated = await updateDeckComment('test-deck-1', 1, 'Updated comment text');
    expect(updated.content).toBe('Updated comment text');

    await expect(deleteDeckComment('test-deck-1', 1)).resolves.toBeUndefined();
  });

  it('submits and resolves moderation reports', async () => {
    const report = {
      id: 100,
      reporterProfileId: 'usr-1',
      targetType: 'DECK',
      targetId: 'slug-1',
      reason: 'Inappropriate title',
      status: 'PENDING',
      createdAt: '2026-08-11T12:00:00Z',
    };

    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => report })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ...report, status: 'RESOLVED' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ...report, status: 'DISMISSED' }) })
    );

    const submitted = await submitCommunityReport({ targetType: 'DECK', targetId: 'slug-1', reason: 'Inappropriate title' });
    expect(submitted.id).toBe(100);

    const resolved = await resolveCommunityReport(100);
    expect(resolved.status).toBe('RESOLVED');

    const dismissed = await dismissCommunityReport(100);
    expect(dismissed.status).toBe('DISMISSED');
  });
});
