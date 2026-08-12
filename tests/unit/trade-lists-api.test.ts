import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getTradeLists,
  createTradeList,
  getTradeListById,
  updateTradeList,
  deleteTradeList,
  matchTradeLists,
} from '@/lib/api/trade-lists';

vi.mock('@/lib/auth0', () => ({
  auth0: {
    getAccessToken: vi.fn().mockResolvedValue({ token: 'mock-token' }),
  },
}));

describe('trade lists & matching API', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('manages trade lists', async () => {
    const mockList = {
      id: 1,
      ownerProfileId: 'usr-1',
      name: 'Haves',
      visibility: 'PUBLIC' as const,
      items: [{ cardName: 'Rhystic Study', quantity: 1, price: 40.0, currency: 'USD' }],
      createdAt: '2026-08-11T12:00:00Z',
    };

    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [mockList] })
      .mockResolvedValueOnce({ ok: true, json: async () => mockList })
      .mockResolvedValueOnce({ ok: true, json: async () => mockList })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ...mockList, name: 'Haves & Wants' }) })
      .mockResolvedValueOnce({ ok: true, status: 204 })
    );

    const lists = await getTradeLists();
    expect(lists.length).toBe(1);

    const created = await createTradeList({
      name: 'Haves',
      visibility: 'PUBLIC',
      items: [{ cardName: 'Rhystic Study', quantity: 1, price: 40.0, currency: 'USD' }],
    });
    expect(created.id).toBe(1);

    const fetched = await getTradeListById(1);
    expect(fetched.name).toBe('Haves');

    const updated = await updateTradeList(1, {
      name: 'Haves & Wants',
      items: [{ cardName: 'Rhystic Study', quantity: 1, price: 40.0, currency: 'USD' }],
    });
    expect(updated.name).toBe('Haves & Wants');

    await expect(deleteTradeList(1)).resolves.toBeUndefined();
  });

  it('compares two trade lists (match)', async () => {
    const mockMatchResult = {
      leftListId: 1,
      rightListId: 2,
      leftToRightMatches: [
        { cardName: 'Cyclonic Rift', matchedQuantity: 1, unitPrice: 35.0, currency: 'USD', missingPrice: false },
      ],
      rightToLeftMatches: [],
      leftToRightValueDeltas: [{ currency: 'USD', amount: 35.0 }],
      rightToLeftValueDeltas: [],
      hasMissingPrices: false,
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockMatchResult,
    }));

    const result = await matchTradeLists(1, 2);
    expect(result.leftListId).toBe(1);
    expect(result.rightListId).toBe(2);
    expect(result.leftToRightValueDeltas[0].amount).toBe(35.0);
  });
});
