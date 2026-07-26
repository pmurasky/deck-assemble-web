import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { fetchCards } from '@/lib/api/catalog';
import { getCards } from '@/lib/api/cards';
import { generateBuildDeck } from '@/lib/api/recommendations';

describe('Commander Eligibility & Build API', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('passes commanderEligible parameter to fetchCards API', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [
          {
            id: 101,
            oracleId: 'o-101',
            name: 'Kragma Warcaller',
            typeLine: 'Legendary Minotaur',
            colorIdentity: 'R,B',
          },
        ],
        totalElements: 1,
      }),
    });
    global.fetch = mockFetch;

    const res = await fetchCards({ commanderEligible: true, query: 'kragma' });

    expect(mockFetch).toHaveBeenCalled();
    const callUrl = new URL(mockFetch.mock.calls[0][0]);
    expect(callUrl.searchParams.get('commanderEligible')).toBe('true');
    expect(callUrl.searchParams.get('query')).toBe('kragma');
    expect(res.cards[0].name).toBe('Kragma Warcaller');
  });

  it('passes commanderEligible parameter in getCards helper', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          cards: [
            {
              id: '101',
              oracleId: 'o-101',
              name: 'Kragma Warcaller',
              typeLine: 'Legendary Minotaur',
              colorIdentity: ['R', 'B'],
            },
          ],
          total: 1,
        },
      }),
    });
    global.fetch = mockFetch;

    const res = await getCards({ commanderEligible: true, q: 'kragma' });

    expect(mockFetch).toHaveBeenCalled();
    const callUrl = new URL(mockFetch.mock.calls[0][0], 'http://localhost');
    expect(callUrl.searchParams.get('commanderEligible')).toBe('true');
    expect(res.cards[0].name).toBe('Kragma Warcaller');
  });

  it('throws descriptive error message when generateBuildDeck encounters 400 Bad Request', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        error: {
          message: 'Card is not eligible as commander: Sol Ring',
        },
      }),
    });
    global.fetch = mockFetch;

    await expect(
      generateBuildDeck({
        commanderCardId: '101',
        secondaryCommanderCardId: '999',
      })
    ).rejects.toThrow('Card is not eligible as commander: Sol Ring');
  });
});
