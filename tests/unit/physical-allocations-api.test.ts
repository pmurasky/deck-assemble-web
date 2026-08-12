import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getPhysicalCardAllocations,
  allocatePhysicalCard,
  updatePhysicalAllocation,
  deletePhysicalAllocation,
  getUnavailablePhysicalCards,
} from '@/lib/api/physical-allocations';

vi.mock('@/lib/auth0', () => ({
  auth0: {
    getAccessToken: vi.fn().mockResolvedValue({ token: 'mock-token' }),
  },
}));

describe('physical allocations API', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('manages physical deck card allocations', async () => {
    const mockAllocation = {
      allocationId: 1,
      deckId: 10,
      cardName: 'Sol Ring',
      totalAllocatedQuantity: 1,
      slices: [{ collectionCardId: 101, printingId: 5, allocatedQuantity: 1, isExactPrinting: true }],
      createdAt: '2026-08-11T12:00:00Z',
    };

    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [mockAllocation] })
      .mockResolvedValueOnce({ ok: true, json: async () => mockAllocation })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ...mockAllocation, totalAllocatedQuantity: 2 }) })
      .mockResolvedValueOnce({ ok: true, status: 204 })
    );

    const list = await getPhysicalCardAllocations(10);
    expect(list.length).toBe(1);

    const created = await allocatePhysicalCard(10, { cardName: 'Sol Ring', targetQuantity: 1 });
    expect(created.allocationId).toBe(1);

    const updated = await updatePhysicalAllocation(10, 1, { targetQuantity: 2 });
    expect(updated.totalAllocatedQuantity).toBe(2);

    await expect(deletePhysicalAllocation(10, 1)).resolves.toBeUndefined();
  });

  it('fetches unavailable physical cards', async () => {
    const mockUnavailable = {
      deckId: 10,
      unavailableItems: [
        {
          cardName: 'Mana Crypt',
          neededQuantity: 1,
          allocatedQuantity: 0,
          unfulfilledQuantity: 1,
          reason: 'INSUFFICIENT_COPIES' as const,
        },
      ],
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockUnavailable,
    }));

    const result = await getUnavailablePhysicalCards(10);
    expect(result.unavailableItems.length).toBe(1);
    expect(result.unavailableItems[0].reason).toBe('INSUFFICIENT_COPIES');
  });
});
