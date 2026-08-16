import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/v1/cards/[cardId]/beginner-guide/route';
import { POST as requestPOST } from '@/app/api/v1/cards/[cardId]/beginner-guide/request/route';
import { POST as reportPOST } from '@/app/api/v1/cards/[cardId]/beginner-guide/report/route';

describe('Beginner Guide API Routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/v1/cards/[cardId]/beginner-guide', () => {
    it('returns 200 with guide data when upstream returns 200', async () => {
      // Given
      const mockGuide = {
        cardId: 'card-1',
        status: 'PUBLISHED',
        summary: 'Card summary',
        examples: 'Card examples',
        whenToUse: 'When to use',
        publishedAt: '2026-08-01T00:00:00Z',
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockGuide,
      } as Response);

      const req = new NextRequest('http://localhost/api/v1/cards/card-1/beginner-guide');
      const params = Promise.resolve({ cardId: 'card-1' });

      // When
      const res = await GET(req, { params });

      // Then
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data).toEqual(mockGuide);
    });

    it('returns 404 when upstream returns 404', async () => {
      // Given
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not found' }),
      } as Response);

      const req = new NextRequest('http://localhost/api/v1/cards/card-unknown/beginner-guide');
      const params = Promise.resolve({ cardId: 'card-unknown' });

      // When
      const res = await GET(req, { params });

      // Then
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /api/v1/cards/[cardId]/beginner-guide/request', () => {
    it('returns 202 when upstream accepts generation request', async () => {
      // Given
      const mockResult = { cardId: 'card-1', status: 'DRAFT' };
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 202,
        json: async () => mockResult,
      } as Response);

      const req = new NextRequest('http://localhost/api/v1/cards/card-1/beginner-guide/request', {
        method: 'POST',
      });
      const params = Promise.resolve({ cardId: 'card-1' });

      // When
      const res = await requestPOST(req, { params });

      // Then
      expect(res.status).toBe(202);
      const json = await res.json();
      expect(json.data).toEqual(mockResult);
    });

    it('returns 429 when daily generation limit is reached', async () => {
      // Given
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ message: 'Daily generation cap reached' }),
      } as Response);

      const req = new NextRequest('http://localhost/api/v1/cards/card-1/beginner-guide/request', {
        method: 'POST',
      });
      const params = Promise.resolve({ cardId: 'card-1' });

      // When
      const res = await requestPOST(req, { params });

      // Then
      expect(res.status).toBe(429);
      const json = await res.json();
      expect(json.error.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('POST /api/v1/cards/[cardId]/beginner-guide/report', () => {
    it('returns 202 when issue report is accepted', async () => {
      // Given
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 202,
        json: async () => ({ success: true }),
      } as Response);

      const req = new NextRequest('http://localhost/api/v1/cards/card-1/beginner-guide/report', {
        method: 'POST',
      });
      const params = Promise.resolve({ cardId: 'card-1' });

      // When
      const res = await reportPOST(req, { params });

      // Then
      expect(res.status).toBe(202);
      const json = await res.json();
      expect(json.data.success).toBe(true);
    });
  });
});
