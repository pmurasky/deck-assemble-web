import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getBeginnerGuide,
  requestBeginnerGuide,
  reportBeginnerGuide,
} from '@/lib/api/beginnerGuides';

describe('Beginner Guides API Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getBeginnerGuide', () => {
    it('returns guide data when response is 200', async () => {
      // Given
      const mockGuide = {
        cardId: 'sol-ring-123',
        status: 'PUBLISHED' as const,
        summary: 'Produces 2 colorless mana immediately for 1 mana.',
        examples: 'Tap for {C}{C} to cast a 3-cost spell on turn 1.',
        whenToUse: 'Play on turn 1 or as early as possible to ramp ahead.',
        publishedAt: '2026-08-01T12:00:00Z',
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: mockGuide }),
      } as Response);

      // When
      const result = await getBeginnerGuide('sol-ring-123');

      // Then
      expect(result).toEqual(mockGuide);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/cards/sol-ring-123/beginner-guide')
      );
    });

    it('returns null when response is 404 (no guide yet)', async () => {
      // Given
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: { code: 'NOT_FOUND', message: 'No guide exists' } }),
      } as Response);

      // When
      const result = await getBeginnerGuide('obscure-card-456');

      // Then
      expect(result).toBeNull();
    });

    it('throws error when response is 500 or upstream failure', async () => {
      // Given
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: { code: 'SERVER_ERROR', message: 'Internal server error' } }),
      } as Response);

      // When & Then
      await expect(getBeginnerGuide('card-error')).rejects.toThrow('Internal server error');
    });

    it('includes face query parameter when faceIndex is provided', async () => {
      // Given
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { cardId: 'dfc-card', status: 'PUBLISHED' } }),
      } as Response);

      // When
      await getBeginnerGuide('dfc-card', 1);

      // Then
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/cards/dfc-card/beginner-guide?face=1')
      );
    });
  });

  describe('requestBeginnerGuide', () => {
    it('returns request result with status when 202 accepted', async () => {
      // Given
      const mockResult = { cardId: 'card-abc', status: 'DRAFT' as const };
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 202,
        json: async () => ({ data: mockResult }),
      } as Response);

      // When
      const result = await requestBeginnerGuide('card-abc');

      // Then
      expect(result).toEqual(mockResult);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/cards/card-abc/beginner-guide/request'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('throws custom 429 rate limit error when daily generation cap is exceeded', async () => {
      // Given
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({
          error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Daily generation limit exceeded' },
        }),
      } as Response);

      // When & Then
      const promise = requestBeginnerGuide('card-capped');
      await expect(promise).rejects.toMatchObject({
        status: 429,
        message: 'Daily generation limit exceeded',
      });
    });
  });

  describe('reportBeginnerGuide', () => {
    it('returns success when report is accepted with 202', async () => {
      // Given
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 202,
        json: async () => ({ data: { success: true } }),
      } as Response);

      // When
      const result = await reportBeginnerGuide('card-xyz');

      // Then
      expect(result).toEqual({ success: true });
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/cards/card-xyz/beginner-guide/report'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
});
