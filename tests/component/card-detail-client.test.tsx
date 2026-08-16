import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CardDetailClient } from '@/components/cards/CardDetailClient';
import type { Card } from '@/types/card';

vi.mock('@/components/cards/BeginnerGuideSection', () => ({
  BeginnerGuideSection: ({ cardId, faceIndex, faceName }: { cardId: string; faceIndex: number; faceName?: string }) => (
    <div data-testid="beginner-guide-mock" data-card-id={cardId} data-face-index={faceIndex} data-face-name={faceName || ''}>
      Beginner Guide Section Mock
    </div>
  ),
}));

let mockCardData: Partial<Card> = {
  id: 'spidey-hero',
  name: 'Spider-Man, Neighborhood Hero',
  typeLine: 'Legendary Creature — Hero Human',
  imageUrl: 'https://cards.scryfall.io/normal/front/a/b/card.jpg',
  manaCost: '{1}{U}{R}',
  oracleText: 'Reach, Haste',
  power: '3',
  toughness: '3',
  legalities: { commander: 'legal' },
  faces: [],
};

// Mock React Query
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: () => ({
      data: mockCardData,
      isLoading: false,
      error: null,
    }),
  };
});

describe('CardDetailClient', () => {
  beforeEach(() => {
    mockCardData = {
      id: 'spidey-hero',
      name: 'Spider-Man, Neighborhood Hero',
      typeLine: 'Legendary Creature — Hero Human',
      imageUrl: 'https://cards.scryfall.io/normal/front/a/b/card.jpg',
      manaCost: '{1}{U}{R}',
      oracleText: 'Reach, Haste',
      power: '3',
      toughness: '3',
      legalities: { commander: 'legal' },
      faces: [],
    };
  });

  it('renders the card details and beginner guide section', () => {
    // Given & When
    render(<CardDetailClient cardId="spidey-hero" />);
    
    // Then
    expect(screen.getByText('Spider-Man, Neighborhood Hero')).toBeDefined();
    expect(screen.getByText('Reach, Haste')).toBeDefined();
    expect(screen.getByText('3/3')).toBeDefined();
    expect(screen.getByRole('img', { name: 'Spider-Man, Neighborhood Hero' })).toHaveAttribute(
      'src',
      'https://cards.scryfall.io/normal/front/a/b/card.jpg',
    );

    const guideMock = screen.getByTestId('beginner-guide-mock');
    expect(guideMock).toBeDefined();
    expect(guideMock.getAttribute('data-card-id')).toBe('spidey-hero');
    expect(guideMock.getAttribute('data-face-index')).toBe('0');
  });

  it('updates faceIndex passed to beginner guide when flipping multi-face card', async () => {
    // Given
    const user = userEvent.setup();
    mockCardData = {
      id: 'transform-card-1',
      name: 'Delver of Secrets // Insectile Aberration',
      typeLine: 'Creature // Creature',
      imageUrl: 'https://cards.scryfall.io/normal/front/1/1/delver.jpg',
      legalities: { commander: 'legal' },
      faces: [
        {
          name: 'Delver of Secrets',
          typeLine: 'Creature — Human Wizard',
          oracleText: 'At the beginning of your upkeep...',
          power: '1',
          toughness: '1',
          imageUrl: 'https://cards.scryfall.io/normal/front/1/1/delver.jpg',
        },
        {
          name: 'Insectile Aberration',
          typeLine: 'Creature — Human Insect',
          oracleText: 'Flying',
          power: '3',
          toughness: '2',
          imageUrl: 'https://cards.scryfall.io/normal/back/1/1/delver.jpg',
        },
      ],
    };

    render(<CardDetailClient cardId="transform-card-1" />);

    const guideMockBefore = screen.getByTestId('beginner-guide-mock');
    expect(guideMockBefore.getAttribute('data-face-index')).toBe('0');
    expect(guideMockBefore.getAttribute('data-face-name')).toBe('Delver of Secrets');

    // When clicking flip button
    const flipButton = screen.getByRole('button', { name: /Show Insectile Aberration/i });
    await user.click(flipButton);

    // Then
    const guideMockAfter = screen.getByTestId('beginner-guide-mock');
    expect(guideMockAfter.getAttribute('data-face-index')).toBe('1');
    expect(guideMockAfter.getAttribute('data-face-name')).toBe('Insectile Aberration');
  });
});
