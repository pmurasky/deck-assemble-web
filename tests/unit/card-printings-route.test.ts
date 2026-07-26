import { NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ fetchCardPrintings: vi.fn() }));

vi.mock('@/lib/api/catalog', () => ({
  fetchCardPrintings: mocks.fetchCardPrintings,
}));

import { GET } from '@/app/api/v1/cards/[cardId]/printings/route';

describe('card printings route', () => {
  it('returns the selected card printing variants', async () => {
    mocks.fetchCardPrintings.mockResolvedValue([{ id: 262, imageUri: 'https://img.example/plains.jpg' }]);

    const response = await GET(new NextRequest('http://localhost/api/v1/cards/262/printings'), {
      params: Promise.resolve({ cardId: '262' }),
    });

    expect(mocks.fetchCardPrintings).toHaveBeenCalledWith('262');
    await expect(response.json()).resolves.toEqual({ data: [{ id: 262, imageUri: 'https://img.example/plains.jpg' }] });
  });

  it('returns not found when the card does not exist', async () => {
    mocks.fetchCardPrintings.mockResolvedValue(null);

    const response = await GET(new NextRequest('http://localhost/api/v1/cards/999/printings'), {
      params: Promise.resolve({ cardId: '999' }),
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: { code: 'NOT_FOUND', message: 'Card not found' } });
  });
});
