import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCollectionStore } from '@/lib/store/useCollectionStore';
import { Card } from '@/types/card';

const mockCard: Card = {
  id: 'card-1',
  printingId: 100,
  oracleId: 'oracle-1',
  name: 'Test Card',
  manaCost: '{1}',
  manaValue: 1,
  colors: [],
  colorIdentity: [],
  typeLine: 'Artifact',
  setCode: 'TST',
  setName: 'Test Set',
  rarity: 'common',
  legalities: {}
};

const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('Collection Store', () => {
  beforeEach(() => {
    useCollectionStore.setState({ items: [], collectionId: null, isLoading: false, error: null });
    vi.resetAllMocks();
  });

  it('should fetch collection and populate items', async () => {
    fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [{ id: 1, name: 'My Collection', defaultCollection: true }] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: 10,
              cardPrintingId: 100,
              regularQuantity: 2,
              foilQuantity: 0,
              card: { id: 'card-1', name: 'Test Card' }
            }
          ]
        })
      });

    const { fetchCollection } = useCollectionStore.getState();
    await fetchCollection();

    const state = useCollectionStore.getState();
    expect(state.collectionId).toBe(1);
    expect(state.items.length).toBe(1);
    expect(state.items[0].quantity).toBe(2);
    expect(state.items[0].cardPrintingId).toBe(100);
  });

  it('should add a new card to collection', async () => {
    useCollectionStore.setState({ collectionId: 1 });
    
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          id: 11,
          cardPrintingId: 100,
          regularQuantity: 1,
          foilQuantity: 0,
          card: { id: 'card-1', name: 'Test Card' }
        }
      })
    });

    const { addCard } = useCollectionStore.getState();
    await addCard(mockCard);

    const state = useCollectionStore.getState();
    expect(state.items.length).toBe(1);
    expect(state.items[0].quantity).toBe(1);
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/collections/1/cards', expect.any(Object));
  });
});
