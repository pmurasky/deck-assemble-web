import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getDeckTags,
  createDeckTag,
  updateDeckTag,
  deleteDeckTag,
  assignDeckTags,
  getDeckFolders,
  createDeckFolder,
  updateDeckFolder,
  deleteDeckFolder,
  assignDeckFolder,
  getDeckCategories,
  createDeckCategory,
  updateDeckCategory,
  deleteDeckCategory,
  moveCardsToCategory,
  instantiateCategoriesFromTemplate,
  getCategoryTemplates,
  createCategoryTemplate,
  updateCategoryTemplate,
  deleteCategoryTemplate,
} from '@/lib/api/organization';

vi.mock('@/lib/auth0', () => ({
  auth0: {
    getAccessToken: vi.fn().mockResolvedValue({ token: 'mock-token' }),
  },
}));

describe('deck organization API', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('manages deck tags', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1, name: 'CEDH' }] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 2, name: 'Casual' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 2, name: 'Casual High' }) })
      .mockResolvedValueOnce({ ok: true, status: 204 })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ deckId: 10, tagIds: [1] }) })
    );

    const list = await getDeckTags();
    expect(list).toEqual([{ id: 1, name: 'CEDH' }]);

    const created = await createDeckTag({ name: 'Casual' });
    expect(created.name).toBe('Casual');

    const updated = await updateDeckTag(2, { name: 'Casual High' });
    expect(updated.name).toBe('Casual High');

    await expect(deleteDeckTag(2)).resolves.toBeUndefined();

    const assigned = await assignDeckTags(10, [1]);
    expect(assigned).toEqual({ deckId: 10, tagIds: [1] });
  });

  it('manages deck folders', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1, name: 'Commander Decks' }] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 2, name: 'Standard' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 2, name: 'Pioneer' }) })
      .mockResolvedValueOnce({ ok: true, status: 204 })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ deckId: 10, folderId: 1 }) })
    );

    const list = await getDeckFolders();
    expect(list.length).toBe(1);

    const created = await createDeckFolder({ name: 'Standard' });
    expect(created.name).toBe('Standard');

    const updated = await updateDeckFolder(2, { name: 'Pioneer' });
    expect(updated.name).toBe('Pioneer');

    await expect(deleteDeckFolder(2)).resolves.toBeUndefined();

    const assigned = await assignDeckFolder(10, 1);
    expect(assigned).toEqual({ deckId: 10, folderId: 1 });
  });

  it('manages in-deck categories', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 5, deckId: 10, name: 'Ramp' }] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 6, deckId: 10, name: 'Removal' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 6, deckId: 10, name: 'Interaction' }) })
      .mockResolvedValueOnce({ ok: true, status: 204 })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 7, name: 'Draw' }] })
    );

    const cats = await getDeckCategories(10);
    expect(cats[0].name).toBe('Ramp');

    const created = await createDeckCategory(10, { name: 'Removal' });
    expect(created.name).toBe('Removal');

    const updated = await updateDeckCategory(10, 6, { name: 'Interaction' });
    expect(updated.name).toBe('Interaction');

    await expect(deleteDeckCategory(10, 6)).resolves.toBeUndefined();

    const moved = await moveCardsToCategory(10, 5, [101, 102]);
    expect(moved).toEqual({ success: true });

    const fromTpl = await instantiateCategoriesFromTemplate(10, 1);
    expect(fromTpl.length).toBe(1);
  });

  it('manages category templates', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1, name: 'Standard EDH', defaultCategories: ['Ramp', 'Draw'] }] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 2, name: 'cEDH Template', defaultCategories: ['Fast Mana', 'Tutors'] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 2, name: 'High Power EDH', defaultCategories: ['Tutors'] }) })
      .mockResolvedValueOnce({ ok: true, status: 204 })
    );

    const list = await getCategoryTemplates();
    expect(list.length).toBe(1);

    const created = await createCategoryTemplate({ name: 'cEDH Template', defaultCategories: ['Fast Mana', 'Tutors'] });
    expect(created.name).toBe('cEDH Template');

    const updated = await updateCategoryTemplate(2, { name: 'High Power EDH' });
    expect(updated.name).toBe('High Power EDH');

    await expect(deleteCategoryTemplate(2)).resolves.toBeUndefined();
  });
});
