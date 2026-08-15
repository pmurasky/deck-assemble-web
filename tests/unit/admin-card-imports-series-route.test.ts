import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/v1/admin/card-imports/series/route';
import * as importsApi from '@/lib/api/imports';

vi.mock('@/lib/api/imports');

describe('API Route: /api/v1/admin/card-imports/series', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return available series data on success', async () => {
    const mockSeries: importsApi.CardSeries[] = [
      { key: 'MARVEL', label: 'Marvel' },
      { key: 'SPIDER_MAN', label: 'Spider-Man' },
      { key: 'HOBBIT', label: 'The Hobbit' },
      { key: 'TMNT', label: 'Teenage Mutant Ninja Turtles' },
      { key: 'ASSASSINS_CREED', label: "Assassin's Creed" },
    ];
    vi.spyOn(importsApi, 'fetchAvailableSeries').mockResolvedValue(mockSeries);

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toEqual({ data: mockSeries });
  });

  it('should return error response when fetchAvailableSeries fails', async () => {
    vi.spyOn(importsApi, 'fetchAvailableSeries').mockRejectedValue(new Error('Available series returned 403'));

    const res = await GET();
    expect(res.status).toBe(403);

    const json = await res.json();
    expect(json).toEqual({ error: { message: 'Available series returned 403' } });
  });
});
