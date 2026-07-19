import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardDetailClient } from '@/components/cards/CardDetailClient';

// Mock the React Query hook
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: () => ({
      data: {
        id: 'spidey-hero',
        name: 'Spider-Man, Neighborhood Hero',
        typeLine: 'Legendary Creature — Hero Human',
        manaCost: '{1}{U}{R}',
        oracleText: 'Reach, Haste',
        power: '3',
        toughness: '3',
        legalities: { commander: 'legal' },
      },
      isLoading: false,
      error: null,
    }),
  };
});

describe('CardDetailClient', () => {
  it('renders the card details', () => {
    render(<CardDetailClient cardId="spidey-hero" />);
    
    expect(screen.getByText('Spider-Man, Neighborhood Hero')).toBeDefined();
    expect(screen.getByText('Reach, Haste')).toBeDefined();
    expect(screen.getByText('3/3')).toBeDefined();
  });
});
