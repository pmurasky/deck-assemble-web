import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CardTile } from '@/components/cards/CardTile';
import { CardDetailClient } from '@/components/cards/CardDetailClient';
import { Card } from '@/types/card';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockDualFaceCard: Card = {
  id: 'delver-secrets',
  oracleId: 'delver-o-1',
  name: 'Delver of Secrets // Insectile Aberration',
  imageUrl: 'https://cards.scryfall.io/normal/front/1/1/1111.jpg',
  manaCost: '{U}',
  manaValue: 1,
  colors: ['U'],
  colorIdentity: ['U'],
  typeLine: 'Creature — Human Wizard // Creature — Human Insect',
  oracleText: 'At the beginning of your upkeep...',
  power: '1',
  toughness: '1',
  setCode: 'ISD',
  setName: 'Innistrad',
  rarity: 'common',
  legalities: { commander: 'legal' },
  faces: [
    {
      name: 'Delver of Secrets',
      manaCost: '{U}',
      typeLine: 'Creature — Human Wizard',
      oracleText: 'At the beginning of your upkeep...',
      power: '1',
      toughness: '1',
      imageUrl: 'https://cards.scryfall.io/normal/front/1/1/1111_front.jpg',
    },
    {
      name: 'Insectile Aberration',
      manaCost: '',
      typeLine: 'Creature — Human Insect',
      oracleText: 'Flying',
      power: '3',
      toughness: '2',
      imageUrl: 'https://cards.scryfall.io/normal/front/1/1/1111_back.jpg',
    },
  ],
};

vi.mock('@/lib/api/cards', () => ({
  getCardById: vi.fn(async () => mockDualFaceCard),
}));

vi.mock('@/lib/store/useCollectionStore', () => ({
  useCollectionStore: vi.fn(() => ({
    items: [],
    collectionId: 1,
    fetchCollection: vi.fn(),
    addCard: vi.fn(),
  })),
}));

vi.mock('@/lib/store/deck-store', () => ({
  useDeckStore: vi.fn(() => ({
    addCard: vi.fn(),
  })),
}));

describe('Dual-Faced Card Component Behavior', () => {
  it('renders CardTile with front image default and Two-Sided badge indicator', () => {
    render(<CardTile card={mockDualFaceCard} />);

    // Front image should be used by default
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://cards.scryfall.io/normal/front/1/1/1111_front.jpg');

    // Two-sided badge indicator should be visible
    expect(screen.getByText(/Two-Sided/i)).toBeInTheDocument();
  });

  it('allows flipping card image in CardTile grid view', () => {
    render(<CardTile card={mockDualFaceCard} />);

    const flipBtn = screen.getByRole('button', { name: /Flip card/i });
    expect(flipBtn).toBeInTheDocument();

    fireEvent.click(flipBtn);

    // Image should update to back face
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://cards.scryfall.io/normal/front/1/1/1111_back.jpg');
  });

  it('renders CardDetailClient with single image and labeled Flip card button', async () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <CardDetailClient cardId="delver-secrets" />
      </QueryClientProvider>
    );

    // Wait for card to load
    const title = await screen.findByText('Delver of Secrets');
    expect(title).toBeInTheDocument();

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://cards.scryfall.io/normal/front/1/1/1111_front.jpg');

    // Check labeled flip button
    const flipBtn = screen.getByRole('button', { name: /Show Insectile Aberration/i });
    expect(flipBtn).toBeInTheDocument();

    fireEvent.click(flipBtn);

    // Active face details should update
    expect(screen.getByText('Insectile Aberration')).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://cards.scryfall.io/normal/front/1/1/1111_back.jpg');
    expect(screen.getByRole('button', { name: /Show Delver of Secrets/i })).toBeInTheDocument();
  });
});
