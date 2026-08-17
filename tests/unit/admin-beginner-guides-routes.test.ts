import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/v1/admin/beginner-guides/route';
import { PUT } from '@/app/api/v1/admin/beginner-guides/[cardId]/route';
import { POST as publishPOST } from '@/app/api/v1/admin/beginner-guides/[cardId]/publish/route';
import { POST as regeneratePOST } from '@/app/api/v1/admin/beginner-guides/[cardId]/regenerate/route';
import { POST as rejectPOST } from '@/app/api/v1/admin/beginner-guides/[cardId]/reject/route';

vi.mock('@/lib/auth0', () => ({
  auth0: {
    getAccessToken: vi.fn().mockResolvedValue({ token: 'mock-jwt-token' }),
  },
}));

describe('Admin Beginner Guides BFF Route Handlers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/v1/admin/beginner-guides', () => {
    it('proxies request with query params and authorization header', async () => {
      const mockResult = {
        content: [{ cardId: 'sol-ring', cardName: 'Sol Ring', status: 'DRAFT' }],
        totalElements: 1,
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResult,
      } as Response);

      const req = new NextRequest('http://localhost/api/v1/admin/beginner-guides?status=DRAFT&page=0&size=10');
      const res = await GET(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data).toEqual(mockResult);
      expect(fetch).toHaveBeenCalled();
      const [calledUrl, calledInit] = vi.mocked(fetch).mock.calls[0];
      expect(calledUrl.toString()).toContain('/api/v1/admin/beginner-guides?status=DRAFT&page=0&size=10');
      expect((calledInit?.headers as Record<string, string>)?.Authorization).toBe('Bearer mock-jwt-token');
    });

    it('handles 403 forbidden error from upstream', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ message: 'Forbidden' }),
      } as Response);

      const req = new NextRequest('http://localhost/api/v1/admin/beginner-guides');
      const res = await GET(req);

      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error.message).toBe('Forbidden');
    });
  });

  describe('PUT /api/v1/admin/beginner-guides/[cardId]', () => {
    it('proxies update payload and returns 200', async () => {
      const mockUpdated = { cardId: 'sol-ring', status: 'DRAFT', summary: 'New summary' };
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockUpdated,
      } as Response);

      const req = new NextRequest('http://localhost/api/v1/admin/beginner-guides/sol-ring', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: 'New summary', examples: 'New example', whenToUse: 'When to use' }),
      });
      const params = Promise.resolve({ cardId: 'sol-ring' });
      const res = await PUT(req, { params });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data).toEqual(mockUpdated);
      const [calledUrl, calledInit] = vi.mocked(fetch).mock.calls[0];
      expect(calledUrl.toString()).toContain('/api/v1/admin/beginner-guides/sol-ring');
      expect((calledInit?.headers as Record<string, string>)?.Authorization).toBe('Bearer mock-jwt-token');
    });
  });

  describe('POST /api/v1/admin/beginner-guides/[cardId]/publish', () => {
    it('proxies publish request and returns 200', async () => {
      const mockPublished = { cardId: 'sol-ring', status: 'PUBLISHED' };
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockPublished,
      } as Response);

      const req = new NextRequest('http://localhost/api/v1/admin/beginner-guides/sol-ring/publish', {
        method: 'POST',
      });
      const params = Promise.resolve({ cardId: 'sol-ring' });
      const res = await publishPOST(req, { params });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data).toEqual(mockPublished);
      const [calledUrl, calledInit] = vi.mocked(fetch).mock.calls[0];
      expect(calledUrl.toString()).toContain('/api/v1/admin/beginner-guides/sol-ring/publish');
      expect((calledInit?.headers as Record<string, string>)?.Authorization).toBe('Bearer mock-jwt-token');
    });
  });

  describe('POST /api/v1/admin/beginner-guides/[cardId]/regenerate', () => {
    it('proxies regenerate request and returns 202', async () => {
      const mockDraft = { cardId: 'sol-ring', status: 'DRAFT' };
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 202,
        json: async () => mockDraft,
      } as Response);

      const req = new NextRequest('http://localhost/api/v1/admin/beginner-guides/sol-ring/regenerate', {
        method: 'POST',
      });
      const params = Promise.resolve({ cardId: 'sol-ring' });
      const res = await regeneratePOST(req, { params });

      expect(res.status).toBe(202);
      const json = await res.json();
      expect(json.data).toEqual(mockDraft);
      const [calledUrl, calledInit] = vi.mocked(fetch).mock.calls[0];
      expect(calledUrl.toString()).toContain('/api/v1/admin/beginner-guides/sol-ring/regenerate');
      expect((calledInit?.headers as Record<string, string>)?.Authorization).toBe('Bearer mock-jwt-token');
    });
  });

  describe('POST /api/v1/admin/beginner-guides/[cardId]/reject', () => {
    it('proxies reject request and returns 204', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 204,
      } as Response);

      const req = new NextRequest('http://localhost/api/v1/admin/beginner-guides/sol-ring/reject', {
        method: 'POST',
      });
      const params = Promise.resolve({ cardId: 'sol-ring' });
      const res = await rejectPOST(req, { params });

      expect(res.status).toBe(204);
      const [calledUrl, calledInit] = vi.mocked(fetch).mock.calls[0];
      expect(calledUrl.toString()).toContain('/api/v1/admin/beginner-guides/sol-ring/reject');
      expect((calledInit?.headers as Record<string, string>)?.Authorization).toBe('Bearer mock-jwt-token');
    });
  });
});
