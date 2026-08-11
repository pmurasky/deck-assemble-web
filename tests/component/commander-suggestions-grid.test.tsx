import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CommanderSuggestionsGrid } from '@/components/deck/CommanderSuggestionsGrid';
import { CommanderSuggestion } from '@/types/builder';

describe('CommanderSuggestionsGrid & Explanation Chips', () => {
  const mockCommanders: CommanderSuggestion[] = [
    {
      id: '100',
      name: 'Korvold, Fae-Cursed King',
      imageUrl: 'https://example.com/korvold.jpg',
      colors: ['B', 'R', 'G'],
      colorIdentity: ['B', 'R', 'G'],
      ownershipCoverage: 82,
      missingStaplesCount: 4,
      unpricedMissingCardCount: 1,
      estimatedCostToComplete: 35.5,
      popularityRank: 5,
      typeLine: 'Legendary Creature — Dragon Noble',
      explanations: [
        { category: 'coverage', score: 85, explanation: '82% of core cards owned' },
        { category: 'color support', score: 90, explanation: 'Strong land base match' },
      ],
    },
    {
      id: '200',
      name: 'Unranked Mystery Commander',
      imageUrl: 'https://example.com/unranked.jpg',
      colors: ['W'],
      colorIdentity: ['W'],
      ownershipCoverage: 50,
      missingStaplesCount: 10,
      unpricedMissingCardCount: 0,
      estimatedCostToComplete: 120.0,
      popularityRank: null,
      typeLine: 'Legendary Creature — Human',
      explanations: [
        { category: 'rank', score: 40, explanation: 'Niche pick' },
      ],
    },
  ];

  it('renders commander cards with unpriced card indicators, ranks, and explanation chips', () => {
    const handleSelect = vi.fn();
    render(<CommanderSuggestionsGrid commanders={mockCommanders} onSelectCommander={handleSelect} />);

    expect(screen.getByText('Korvold, Fae-Cursed King')).toBeInTheDocument();
    expect(screen.getByText('#5 Rank')).toBeInTheDocument();
    expect(screen.getByText('Unranked')).toBeInTheDocument();
    expect(screen.getByText(/1 unpriced/i)).toBeInTheDocument();

    // Explanation chips
    expect(screen.getByText('coverage: 85')).toBeInTheDocument();
    expect(screen.getByText('color support: 90')).toBeInTheDocument();
    expect(screen.getByText('rank: 40')).toBeInTheDocument();
  });

  it('triggers build flow CTA when clicking Build Deck', () => {
    const handleSelect = vi.fn();
    render(<CommanderSuggestionsGrid commanders={mockCommanders} onSelectCommander={handleSelect} />);

    const buildButtons = screen.getAllByRole('button', { name: /Build Deck/i });
    fireEvent.click(buildButtons[0]);

    expect(handleSelect).toHaveBeenCalledWith(mockCommanders[0]);
  });
});
