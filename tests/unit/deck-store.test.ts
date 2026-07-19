import { describe, it, expect, beforeEach } from 'vitest';
import { useDeckStore } from '@/lib/store/deck-store';
import { Card } from '@/types/card';

const mockCard: Card = {
  id: 'spidey-1',
  oracleId: 'spidey-o-1',
  name: 'Spider-Man',
  manaCost: '{2}{R}',
  manaValue: 3,
  colors: ['R'],
  colorIdentity: ['R'],
  typeLine: 'Legendary Creature — Hero',
  legalities: { commander: 'legal' }
};

describe('Deck Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useDeckStore.setState({ cards: [], commander: undefined, metadata: { name: 'New Deck', format: 'Commander' } });
  });

  it('should add a card to the deck', () => {
    const { addCard } = useDeckStore.getState();
    addCard(mockCard);
    
    const { cards } = useDeckStore.getState();
    expect(cards.length).toBe(1);
    expect(cards[0].card.id).toBe('spidey-1');
    expect(cards[0].quantity).toBe(1);
  });

  it('should increment quantity when adding the same card', () => {
    const { addCard } = useDeckStore.getState();
    addCard(mockCard);
    addCard(mockCard);
    
    const { cards } = useDeckStore.getState();
    expect(cards.length).toBe(1);
    expect(cards[0].quantity).toBe(2);
  });

  it('should remove a card from the deck', () => {
    const { addCard, removeCard } = useDeckStore.getState();
    addCard(mockCard);
    addCard(mockCard); // Qty: 2
    
    removeCard(mockCard.id);
    const state1 = useDeckStore.getState();
    expect(state1.cards[0].quantity).toBe(1);
    
    removeCard(mockCard.id);
    const state2 = useDeckStore.getState();
    expect(state2.cards.length).toBe(0);
  });

  it('should clear the deck', () => {
    const { addCard, clearDeck } = useDeckStore.getState();
    addCard(mockCard);
    clearDeck();
    
    const { cards } = useDeckStore.getState();
    expect(cards.length).toBe(0);
  });
});
