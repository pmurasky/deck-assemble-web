import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  getDeckFolders,
  createDeckFolder,
  getDeckTags,
  createDeckTag,
  getCategoryTemplates,
  setDeckFolder,
  setDeckTags,
  applyCategoryTemplate,
} from '@/lib/api/decks';

describe('Deck Folders, Tags, and Templates API Client', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should fetch and create deck folders', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1, name: 'Commander Decks', deckCount: 5 }] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 2, name: 'Competitive' }) });
    global.fetch = mockFetch;

    const folders = await getDeckFolders();
    expect(folders).toHaveLength(1);

    const created = await createDeckFolder({ name: 'Competitive' });
    expect(created.name).toBe('Competitive');
  });

  it('should fetch and create deck tags', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1, name: 'cEDH', color: '#ef4444' }] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 2, name: 'Casual', color: '#10b981' }) });
    global.fetch = mockFetch;

    const tags = await getDeckTags();
    expect(tags).toHaveLength(1);

    const created = await createDeckTag({ name: 'Casual', color: '#10b981' });
    expect(created.name).toBe('Casual');
  });

  it('should fetch category templates', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: 1, name: 'Standard EDH 8x8', categories: [{ name: 'Ramp' }] }],
    });
    global.fetch = mockFetch;

    const templates = await getCategoryTemplates();
    expect(templates).toHaveLength(1);
    expect(templates[0].name).toBe('Standard EDH 8x8');
  });

  it('should set deck folder, deck tags, and apply category template', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    global.fetch = mockFetch;

    await setDeckFolder(10, 2);
    expect(mockFetch).toHaveBeenLastCalledWith('/api/v1/decks/10/folder', expect.objectContaining({ method: 'PUT' }));

    await setDeckTags(10, [1, 2]);
    expect(mockFetch).toHaveBeenLastCalledWith('/api/v1/decks/10/tags', expect.objectContaining({ method: 'PUT' }));

    await applyCategoryTemplate(10, 1);
    expect(mockFetch).toHaveBeenLastCalledWith('/api/v1/decks/10/categories/from-template', expect.objectContaining({ method: 'POST' }));
  });
});
