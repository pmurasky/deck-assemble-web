import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ApiCard } from '@/lib/api/catalog';
import { useDeckStore } from '@/lib/store/deck-store';
import type { Card } from '@/types/card';

const mockCard: Card = {
  id: 'spidey-1',
  printingId: 123,
  oracleId: 'oracle-1',
  name: 'Spider-Man',
  manaValue: 3,
  colors: ['U', 'R'],
  colorIdentity: ['U', 'R'],
  typeLine: 'Legendary Creature — Hero',
  setCode: 'M21',
  setName: 'Core Set 2021',
  rarity: 'mythic',
  legalities: { commander: 'legal' },
};

const apiCard: ApiCard = {
  id: 1,
  printingId: 123,
  oracleId: 'oracle-1',
  name: 'Spider-Man',
  manaValue: 3,
  colors: 'U,R',
  colorIdentity: 'U,R',
  typeLine: 'Legendary Creature — Hero',
  setCode: 'M21',
  setName: 'Core Set 2021',
  rarity: 'mythic',
};

const deckCardResponse = {
  data: {
    id: 42,
    cardPrintingId: 123,
    quantity: 1,
    deckSection: 'MAIN_DECK',
    card: apiCard,
  },
};

describe('Deck Store', () => {
  beforeEach(() => {
    useDeckStore.setState({ id: 'test-uuid', cards: [], commander: undefined, metadata: { name: 'New Deck', format: 'Commander' } });
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(deckCardResponse))));
  });

  it('should add a card to the deck', async () => {
    const { addCard } = useDeckStore.getState();
    await addCard(mockCard);

    const { cards } = useDeckStore.getState();
    expect(cards.length).toBe(1);
    expect(cards[0].card.id).toBe('1');
    expect(cards[0].quantity).toBe(1);
  });

  it('should increment quantity when adding the same card', async () => {
    const { addCard } = useDeckStore.getState();
    await addCard(mockCard);
    await addCard(mockCard);

    const { cards } = useDeckStore.getState();
    expect(cards.length).toBe(1);
    expect(cards[0].quantity).toBe(2);
  });

  it('should remove a card from the deck', async () => {
    const { addCard, removeCard } = useDeckStore.getState();
    await addCard(mockCard);
    await addCard(mockCard);

    const stateBeforeRemoval = useDeckStore.getState();
    await removeCard(stateBeforeRemoval.cards[0].deckCardId);
    const state1 = useDeckStore.getState();
    expect(state1.cards[0].quantity).toBe(1);

    await removeCard(state1.cards[0].deckCardId);
    const state2 = useDeckStore.getState();
    expect(state2.cards.length).toBe(0);
  });

  it('should clear the deck', async () => {
    const { addCard, clearDeck } = useDeckStore.getState();
    await addCard(mockCard);
    
    clearDeck();
    const { cards } = useDeckStore.getState();
    expect(cards.length).toBe(0);
  });
});
