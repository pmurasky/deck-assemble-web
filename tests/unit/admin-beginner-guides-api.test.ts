import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getAdminBeginnerGuides,
  updateAdminBeginnerGuide,
  publishAdminBeginnerGuide,
  regenerateAdminBeginnerGuide,
  rejectAdminBeginnerGuide,
  type AdminBeginnerGuideItem,
  type AdminBeginnerGuidePage,
} from '@/lib/api/beginnerGuides';

describe('Admin Beginner Guides API Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAdminBeginnerGuides', () => {
    it('fetches review queue with default parameters when none provided', async () => {
      const mockPage: AdminBeginnerGuidePage = {
        content: [
          {
            cardId: 'sol-ring',
            cardName: 'Sol Ring',
            status: 'DRAFT',
            summary: 'Taps for two colorless mana.',
            examples: 'Turn 1 Sol Ring allows casting a 4-drop turn 2.',
            whenToUse: 'Cast immediately in the early game.',
            sourceRulingsSnapshot: ['Sol Ring enters untapped.'],
            generatedAt: '2026-08-16T12:00:00Z',
            reviewedBy: null,
          },
        ],
        totalElements: 1,
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: mockPage }),
      } as Response);

      const result = await getAdminBeginnerGuides();

      expect(result).toEqual(mockPage);
      expect(fetch).toHaveBeenCalledWith(
        '/api/v1/admin/beginner-guides?status=DRAFT%2CSTALE%2CREPORTED&page=0&size=20'
      );
    });

    it('passes custom status, page, and size in query params', async () => {
      const mockPage: AdminBeginnerGuidePage = {
        content: [],
        totalElements: 0,
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: mockPage }),
      } as Response);

      const result = await getAdminBeginnerGuides({ status: 'REPORTED', page: 2, size: 10 });

      expect(result).toEqual(mockPage);
      expect(fetch).toHaveBeenCalledWith(
        '/api/v1/admin/beginner-guides?status=REPORTED&page=2&size=10'
      );
    });

    it('throws error with message when response is not ok', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: { message: 'Admin access required' } }),
      } as Response);

      await expect(getAdminBeginnerGuides()).rejects.toThrow('Admin access required');
    });
  });

  describe('updateAdminBeginnerGuide', () => {
    it('sends PUT with payload and returns updated guide', async () => {
      const mockUpdated: AdminBeginnerGuideItem = {
        cardId: 'sol-ring',
        cardName: 'Sol Ring',
        status: 'DRAFT',
        summary: 'Updated summary',
        examples: 'Updated example',
        whenToUse: 'Updated when to use',
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: mockUpdated }),
      } as Response);

      const payload = {
        summary: 'Updated summary',
        examples: 'Updated example',
        whenToUse: 'Updated when to use',
      };

      const result = await updateAdminBeginnerGuide('sol-ring', payload);

      expect(result).toEqual(mockUpdated);
      expect(fetch).toHaveBeenCalledWith('/api/v1/admin/beginner-guides/sol-ring', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    });

    it('throws error with status on 404', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: { message: 'Guide not found' } }),
      } as Response);

      const promise = updateAdminBeginnerGuide('missing-card', {
        summary: 'a',
        examples: 'b',
        whenToUse: 'c',
      });
      await expect(promise).rejects.toMatchObject({
        status: 404,
        message: 'Guide not found',
      });
    });
  });

  describe('publishAdminBeginnerGuide', () => {
    it('sends POST to publish endpoint and returns published guide', async () => {
      const mockPublished: AdminBeginnerGuideItem = {
        cardId: 'sol-ring',
        cardName: 'Sol Ring',
        status: 'PUBLISHED',
        summary: 'Summary',
        examples: 'Example',
        whenToUse: 'When to use',
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: mockPublished }),
      } as Response);

      const result = await publishAdminBeginnerGuide('sol-ring');

      expect(result).toEqual(mockPublished);
      expect(fetch).toHaveBeenCalledWith('/api/v1/admin/beginner-guides/sol-ring/publish', {
        method: 'POST',
      });
    });
  });

  describe('regenerateAdminBeginnerGuide', () => {
    it('sends POST to regenerate endpoint and returns new draft guide', async () => {
      const mockDraft: AdminBeginnerGuideItem = {
        cardId: 'sol-ring',
        cardName: 'Sol Ring',
        status: 'DRAFT',
        summary: 'New generated summary',
        examples: 'New generated example',
        whenToUse: 'New generated when to use',
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 202,
        json: async () => ({ data: mockDraft }),
      } as Response);

      const result = await regenerateAdminBeginnerGuide('sol-ring');

      expect(result).toEqual(mockDraft);
      expect(fetch).toHaveBeenCalledWith('/api/v1/admin/beginner-guides/sol-ring/regenerate', {
        method: 'POST',
      });
    });
  });

  describe('rejectAdminBeginnerGuide', () => {
    it('sends POST to reject endpoint and returns void on 204', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: async () => null,
      } as unknown as Response);

      await expect(rejectAdminBeginnerGuide('sol-ring')).resolves.toBeUndefined();
      expect(fetch).toHaveBeenCalledWith('/api/v1/admin/beginner-guides/sol-ring/reject', {
        method: 'POST',
      });
    });

    it('throws error on failure', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: { message: 'Forbidden' } }),
      } as Response);

      await expect(rejectAdminBeginnerGuide('sol-ring')).rejects.toThrow('Forbidden');
    });
  });
});
