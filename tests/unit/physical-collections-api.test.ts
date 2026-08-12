import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getCollectionLocations,
  createCollectionLocation,
  updateCollectionLocation,
  deleteCollectionLocation,
  getCardPhysicalMetadata,
  updateCardPhysicalMetadata,
  getBulkPhysicalMetadata,
} from '@/lib/api/physical-collections';

vi.mock('@/lib/auth0', () => ({
  auth0: {
    getAccessToken: vi.fn().mockResolvedValue({ token: 'mock-token' }),
  },
}));

describe('physical collections & locations API', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('manages collection locations', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1, name: 'Binder 1' }] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 2, name: 'Box A', parentId: 1 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 2, name: 'Box B', parentId: 1 }) })
      .mockResolvedValueOnce({ ok: true, status: 204 })
    );

    const locations = await getCollectionLocations();
    expect(locations[0].name).toBe('Binder 1');

    const created = await createCollectionLocation({ name: 'Box A', parentId: 1 });
    expect(created.name).toBe('Box A');

    const updated = await updateCollectionLocation(2, { name: 'Box B' });
    expect(updated.name).toBe('Box B');

    await expect(deleteCollectionLocation(2)).resolves.toBeUndefined();
  });

  it('handles 409 conflict when deleting non-empty location subtree', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ error: { message: 'Location subtree contains cards. Move cards first.' } }),
    }));

    await expect(deleteCollectionLocation(1)).rejects.toThrow('Location subtree contains cards. Move cards first.');
  });

  it('manages card physical metadata', async () => {
    const metaData = {
      collectionCardId: 10,
      locationId: 1,
      condition: 'NM' as const,
      purchasePrice: 25.50,
      currency: 'USD',
      notes: 'Foil printing',
    };

    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => metaData })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ...metaData, condition: 'LP' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => [metaData] })
    );

    const meta = await getCardPhysicalMetadata(100, 10);
    expect(meta.condition).toBe('NM');

    const updated = await updateCardPhysicalMetadata(100, 10, { condition: 'LP' });
    expect(updated.condition).toBe('LP');

    const bulk = await getBulkPhysicalMetadata(100);
    expect(bulk.length).toBe(1);
  });
});
