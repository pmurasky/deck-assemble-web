import { NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ fetchSetPrintings: vi.fn() }));

vi.mock('@/lib/api/catalog', () => ({
  fetchSetPrintings: mocks.fetchSetPrintings,
}));

import { GET } from '@/app/api/v1/sets/msh/printings/route';

describe('MSH printing route', () => {
  it('forwards pagination and search to the catalog API', async () => {
    mocks.fetchSetPrintings.mockResolvedValue({ cards: [], total: 453 });

    const response = await GET(
      new NextRequest('http://localhost/api/v1/sets/msh/printings?page=2&limit=25&q=spider')
    );

    expect(mocks.fetchSetPrintings).toHaveBeenCalledWith('msh', {
      query: 'spider',
      page: 1,
      size: 25,
    });
    await expect(response.json()).resolves.toEqual({ data: { cards: [], total: 453 } });
  });
});
