import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  getDeckCategories,
  createDeckCategory,
  updateDeckCategory,
  deleteDeckCategory,
  bulkReplaceCategoryCards,
} from '@/lib/api/decks';

describe('Deck Categories API Client', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should fetch deck categories via GET /api/v1/decks/:deckId/categories', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { id: 1, deckId: 10, name: 'Ramp', description: 'Mana acceleration', cardCount: 8 },
        { id: 2, deckId: 10, name: 'Card Draw', description: 'Draw engines', cardCount: 10 },
      ],
    });
    global.fetch = mockFetch;

    const categories = await getDeckCategories(10);

    expect(mockFetch).toHaveBeenCalled();
    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('/api/v1/decks/10/categories');
    expect(categories).toHaveLength(2);
    expect(categories[0].name).toBe('Ramp');
  });

  it('should create a deck category via POST /api/v1/decks/:deckId/categories', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 3, deckId: 10, name: 'Interaction', color: '#ef4444' }),
    });
    global.fetch = mockFetch;

    const category = await createDeckCategory(10, { name: 'Interaction', color: '#ef4444' });

    expect(mockFetch).toHaveBeenCalled();
    const [calledUrl, options] = mockFetch.mock.calls[0];
    expect(calledUrl).toContain('/api/v1/decks/10/categories');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ name: 'Interaction', color: '#ef4444' });
    expect(category.id).toBe(3);
  });

  it('should update a category via PATCH /api/v1/decks/:deckId/categories/:categoryId', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 3, deckId: 10, name: 'Removal & Wipes' }),
    });
    global.fetch = mockFetch;

    const updated = await updateDeckCategory(10, 3, { name: 'Removal & Wipes' });

    expect(mockFetch).toHaveBeenCalled();
    const [calledUrl, options] = mockFetch.mock.calls[0];
    expect(calledUrl).toContain('/api/v1/decks/10/categories/3');
    expect(options.method).toBe('PATCH');
    expect(updated.name).toBe('Removal & Wipes');
  });

  it('should delete a category via DELETE /api/v1/decks/:deckId/categories/:categoryId', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;

    await deleteDeckCategory(10, 3);

    expect(mockFetch).toHaveBeenCalled();
    const [calledUrl, options] = mockFetch.mock.calls[0];
    expect(calledUrl).toContain('/api/v1/decks/10/categories/3');
    expect(options.method).toBe('DELETE');
  });

  it('should bulk replace cards in a category via PUT /api/v1/decks/:deckId/categories/:categoryId/cards', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    global.fetch = mockFetch;

    await bulkReplaceCategoryCards(10, 3, [101, 102, 103]);

    expect(mockFetch).toHaveBeenCalled();
    const [calledUrl, options] = mockFetch.mock.calls[0];
    expect(calledUrl).toContain('/api/v1/decks/10/categories/3/cards');
    expect(options.method).toBe('PUT');
    expect(JSON.parse(options.body)).toEqual({ cardPrintingIds: [101, 102, 103] });
  });
});
