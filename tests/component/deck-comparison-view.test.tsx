import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DeckComparisonView } from '@/components/deck/DeckComparisonView';
import { GeneratedDeck, DeckComparisonResponse } from '@/types/builder';
import { getDeckComparison } from '@/lib/api/decks';

const mockComparisonResponseA: DeckComparisonResponse = {
  baseDeckId: 10,
  otherDeckId: 20,
  ownershipDelta: 13.0,
  missingCostDeltaByCurrency: { USD: -55.0 },
  valueDeltaByCurrency: { USD: 30.0 },
  added: [
    {
      cardId: 201,
      cardName: 'Inexorable Tide',
      manaCost: '{3}{U}',
      typeLine: 'Enchantment',
      baseQuantity: 0,
      otherQuantity: 1,
      delta: 1,
    },
  ],
  removed: [
    {
      cardId: 105,
      cardName: 'Cultivate',
      manaCost: '{2}{G}',
      typeLine: 'Sorcery',
      baseQuantity: 1,
      otherQuantity: 0,
      delta: -1,
    },
  ],
  quantityChanged: [],
  gameChangersAdded: ['Inexorable Tide'],
  gameChangersRemoved: [],
};

describe('DeckComparisonView Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
      if (String(url).includes('/api/v1/decks/10/comparison/20')) {
        return new Response(JSON.stringify({ data: mockComparisonResponseA }), { status: 200 });
      }
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    });
  });

  const baseDeck: GeneratedDeck = {
    id: '10',
    name: 'Base Atraxa Midrange',
    commander: {
      id: '100',
      name: "Atraxa, Praetors' Voice",
      colors: ['W', 'U', 'B', 'G'],
      colorIdentity: ['W', 'U', 'B', 'G'],
      ownershipCoverage: 75,
      missingStaplesCount: 5,
      estimatedCostToComplete: 45.0,
      popularityRank: 1,
      typeLine: 'Legendary Creature — Phyrexian Angel',
    },
    cards: [],
    totalCards: 100,
    ownedPercentage: 75,
    ownedCardsCount: 75,
    wishlistCardsCount: 25,
    unfillableSlotsCount: 0,
    wishlistTotalCost: 150.0,
    averageManaValue: 3.2,
    legalityWarnings: [],
    powerLevel: 7,
    buildScore: 85,
  };

  const comparisonDeckA: GeneratedDeck = {
    id: '20',
    name: 'Atraxa Proliferate Heavy',
    commander: baseDeck.commander,
    cards: [],
    totalCards: 100,
    ownedPercentage: 88,
    ownedCardsCount: 88,
    wishlistCardsCount: 12,
    unfillableSlotsCount: 0,
    wishlistTotalCost: 95.0,
    averageManaValue: 3.0,
    legalityWarnings: [],
    powerLevel: 8,
    buildScore: 92,
  };

  it('fetches pairwise comparison and displays deltas, power levels, and card diffs', async () => {
    render(<DeckComparisonView baseDeck={baseDeck} otherDecks={[comparisonDeckA]} />);

    await waitFor(() => {
      expect(screen.getAllByText('Atraxa Proliferate Heavy').length).toBeGreaterThan(0);
    });

    expect(screen.getAllByText('Base Atraxa Midrange').length).toBeGreaterThan(0);
    expect(screen.getByText(/owned vs base/i)).toBeInTheDocument();

    // Power Level display from build context
    expect(screen.getAllByText(/Desired Power Level: 7 \/ 10/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Desired Power Level: 8 \/ 10/i).length).toBeGreaterThan(0);

    // Card Diffs
    expect(screen.getByText('Inexorable Tide')).toBeInTheDocument();

    const removedTabBtn = screen.getByRole('button', { name: /Removed Cards/i });
    fireEvent.click(removedTabBtn);

    expect(screen.getByText('Cultivate')).toBeInTheDocument();
  });
});
