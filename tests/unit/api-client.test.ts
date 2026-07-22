import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCards, getCardById } from '@/lib/api/cards';

describe('API Client: cards', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getCards should call the correct URL and return data', async () => {
    const mockData = { data: { cards: [{ id: '1', name: 'Test' }], total: 1 } };
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    const result = await getCards({ page: 1, limit: 10, q: 'test' });
    
    expect(global.fetch).toHaveBeenCalledWith('/api/v1/cards?page=1&limit=10&q=test');
    expect(result).toEqual(mockData.data);
  });

  it('getCardById should call the correct URL and return a card', async () => {
    const mockData = { data: { id: 'spidey-hero', name: 'Spider-Man' } };
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    const result = await getCardById('spidey-hero');
    
    expect(global.fetch).toHaveBeenCalledWith('/api/v1/cards/spidey-hero');
    expect(result).toEqual(mockData.data);
  });
});
