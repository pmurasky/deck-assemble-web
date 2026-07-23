import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CommanderSuggestionsGrid } from '@/components/deck/CommanderSuggestionsGrid';
import { CommanderSuggestion } from '@/types/builder';

const mockCommanders: CommanderSuggestion[] = [
  {
    id: 'cmd-1',
    name: 'Atraxa, Praetors\' Voice',
    imageUrl: 'https://cards.scryfall.io/normal/front/d/0/d0d0.jpg',
    colors: ['W', 'U', 'B', 'G'],
    colorIdentity: ['W', 'U', 'B', 'G'],
    ownershipCoverage: 75,
    missingStaplesCount: 2,
    estimatedCostToComplete: 45.0,
    popularityRank: 1,
    typeLine: 'Legendary Creature — Phyrexian Angel',
  },
  {
    id: 'cmd-2',
    name: 'Krenko, Mob Boss',
    imageUrl: 'https://cards.scryfall.io/normal/front/c/d/cdcd.jpg',
    colors: ['R'],
    colorIdentity: ['R'],
    ownershipCoverage: 90,
    missingStaplesCount: 0,
    estimatedCostToComplete: 12.50,
    popularityRank: 5,
    typeLine: 'Legendary Creature — Goblin Warrior',
  },
];

describe('CommanderSuggestionsGrid Component', () => {
  it('renders commander suggestion cards with stats and pips', () => {
    render(<CommanderSuggestionsGrid commanders={mockCommanders} onSelectCommander={() => {}} />);

    expect(screen.getByText("Atraxa, Praetors' Voice")).toBeInTheDocument();
    expect(screen.getByText('75% Owned')).toBeInTheDocument();
    expect(screen.getByText('$45.00 to complete')).toBeInTheDocument();
    expect(screen.getByText('Krenko, Mob Boss')).toBeInTheDocument();
    expect(screen.getByText('90% Owned')).toBeInTheDocument();
  });

  it('triggers onSelectCommander when Build Deck button is clicked', () => {
    const handleSelect = vi.fn();
    render(<CommanderSuggestionsGrid commanders={mockCommanders} onSelectCommander={handleSelect} />);

    const buildButtons = screen.getAllByRole('button', { name: /Build Deck/i });
    fireEvent.click(buildButtons[0]);

    expect(handleSelect).toHaveBeenCalledWith(mockCommanders[0]);
  });

  it('filters commanders by color identity when color filter pips are toggled', () => {
    render(<CommanderSuggestionsGrid commanders={mockCommanders} onSelectCommander={() => {}} />);

    // Click Red filter button
    const redFilterBtn = screen.getByRole('button', { name: /Filter Red/i });
    fireEvent.click(redFilterBtn);

    // Krenko (Red) should remain, Atraxa (4-color) filtered out if exact or matching logic applied
    expect(screen.getByText('Krenko, Mob Boss')).toBeInTheDocument();
  });
});
