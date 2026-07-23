import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DeckComparisonModal } from '@/components/deck/DeckComparisonModal';
import { GeneratedDeck } from '@/types/builder';

const mockDecks: GeneratedDeck[] = [
  {
    id: 'deck-1',
    name: "Atraxa's Proliferate Engine",
    commander: {
      id: 'cmd-1',
      name: "Atraxa, Praetors' Voice",
      colors: ['W', 'U', 'B', 'G'],
      colorIdentity: ['W', 'U', 'B', 'G'],
      ownershipCoverage: 75,
      missingStaplesCount: 2,
      estimatedCostToComplete: 45.0,
      popularityRank: 1,
      typeLine: 'Legendary Creature',
    },
    totalCards: 100,
    ownedPercentage: 74,
    wishlistTotalCost: 38.40,
    averageManaValue: 3.12,
    powerLevel: 7,
    legalityWarnings: [],
    cards: [],
  },
  {
    id: 'deck-2',
    name: 'Krenko Goblin Swarm',
    commander: {
      id: 'cmd-2',
      name: 'Krenko, Mob Boss',
      colors: ['R'],
      colorIdentity: ['R'],
      ownershipCoverage: 90,
      missingStaplesCount: 0,
      estimatedCostToComplete: 12.50,
      popularityRank: 5,
      typeLine: 'Legendary Creature',
    },
    totalCards: 100,
    ownedPercentage: 92,
    wishlistTotalCost: 12.50,
    averageManaValue: 2.45,
    powerLevel: 6,
    legalityWarnings: [],
    cards: [],
  },
];

describe('DeckComparisonModal Component', () => {
  it('renders side-by-side comparison metrics for multiple decks', () => {
    render(<DeckComparisonModal decks={mockDecks} isOpen={true} onClose={() => {}} />);

    expect(screen.getByText("Atraxa's Proliferate Engine")).toBeInTheDocument();
    expect(screen.getByText('Krenko Goblin Swarm')).toBeInTheDocument();
    expect(screen.getByText('74% Owned')).toBeInTheDocument();
    expect(screen.getByText('92% Owned')).toBeInTheDocument();
    expect(screen.getByText('$38.40')).toBeInTheDocument();
    expect(screen.getByText('$12.50')).toBeInTheDocument();
  });
});
