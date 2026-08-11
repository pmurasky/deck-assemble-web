import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { getDeckComparison, getDeckComparisonBackend } from '@/lib/api/decks';
import { GET } from '@/app/api/v1/decks/[deckId]/comparison/[otherDeckId]/route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth0', () => ({
  auth0: {
    getAccessToken: vi.fn().mockResolvedValue({ token: 'mock-access-token' }),
  },
}));

describe('Deck Comparison API Helpers & Proxy Route', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockComparisonResponse = {
    baseDeckId: 10,
    otherDeckId: 20,
    ownershipDelta: 15.0,
    missingCostDeltaByCurrency: { USD: -25.5 },
    valueDeltaByCurrency: { USD: 40.0 },
    added: [
      {
        cardId: 101,
        cardName: 'Sol Ring',
        manaCost: '{1}',
        typeLine: 'Artifact',
        baseQuantity: 0,
        otherQuantity: 1,
        delta: 1,
      },
    ],
    removed: [
      {
        cardId: 102,
        cardName: 'Manalith',
        manaCost: '{3}',
        typeLine: 'Artifact',
        baseQuantity: 1,
        otherQuantity: 0,
        delta: -1,
      },
    ],
    quantityChanged: [],
    gameChangersAdded: ['Sol Ring'],
    gameChangersRemoved: [],
  };

  it('fetches deck comparison from BFF client helper', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
      if (String(url).includes('/api/v1/decks/10/comparison/20')) {
        return new Response(JSON.stringify({ data: mockComparisonResponse }), { status: 200 });
      }
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    });

    const result = await getDeckComparison(10, 20);
    expect(result).toEqual(mockComparisonResponse);
    expect(result.ownershipDelta).toBe(15.0);
    expect(result.added).toHaveLength(1);
    expect(result.removed).toHaveLength(1);
  });

  it('proxies backend deck comparison request with Auth0 token', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async (url, init) => {
      const auth = (init?.headers as Headers)?.get?.('Authorization');
      if (String(url).includes('/api/v1/decks/10/comparison/20') && auth === 'Bearer mock-access-token') {
        return new Response(JSON.stringify(mockComparisonResponse), { status: 200 });
      }
      return new Response(JSON.stringify({ error: 'Unauthorized or not found' }), { status: 401 });
    });

    const result = await getDeckComparisonBackend(10, 20);
    expect(result).toEqual(mockComparisonResponse);
  });

  it('handles route handler GET for deck comparison proxy', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
      if (String(url).includes('/api/v1/decks/10/comparison/20')) {
        return new Response(JSON.stringify(mockComparisonResponse), { status: 200 });
      }
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    });

    const req = new NextRequest('http://localhost:3000/api/v1/decks/10/comparison/20');
    const params = Promise.resolve({ deckId: '10', otherDeckId: '20' });
    const response = await GET(req, { params });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toEqual(mockComparisonResponse);
  });
});
