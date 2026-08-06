import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth0', () => ({
  auth0: {
    getAccessToken: vi.fn().mockResolvedValue({ token: 'mock-jwt-token' }),
  },
}));

describe('API v1 Proxy Routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('/api/v1/decks/[deckId]/export', () => {
    it('should proxy export GET request to backend with JWT and format', async () => {
      const { GET } = await import('@/app/api/v1/decks/[deckId]/export/route');

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/plain', 'content-disposition': 'attachment; filename="deck.txt"' }),
        body: new ReadableStream(),
      } as unknown as Response);

      const req = new NextRequest('http://localhost/api/v1/decks/5/export?format=txt');
      const params = Promise.resolve({ deckId: '5' });
      const res = await GET(req, { params });

      expect(res.status).toBe(200);
    });
  });

  describe('/api/v1/collections/[collectionId]/export', () => {
    it('should proxy collection CSV export GET request', async () => {
      const { GET } = await import('@/app/api/v1/collections/[collectionId]/export/route');

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/csv', 'content-disposition': 'attachment; filename="collection.csv"' }),
        body: new ReadableStream(),
      } as unknown as Response);

      const req = new NextRequest('http://localhost/api/v1/collections/12/export');
      const params = Promise.resolve({ collectionId: '12' });
      const res = await GET(req, { params });

      expect(res.status).toBe(200);
    });
  });

  describe('/api/v1/decks/[deckId]/analysis', () => {
    it('should proxy deck analysis GET request', async () => {
      const { GET } = await import('@/app/api/v1/decks/[deckId]/analysis/route');

      const mockData = { totalCards: 0, manaCurve: [] };
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: mockData }),
      } as unknown as Response);

      const req = new NextRequest('http://localhost/api/v1/decks/5/analysis');
      const params = Promise.resolve({ deckId: '5' });
      const res = await GET(req, { params });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data).toEqual(mockData);
    });
  });
});
