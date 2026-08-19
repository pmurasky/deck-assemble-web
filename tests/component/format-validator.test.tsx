import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormatValidator } from '@/components/deck/FormatValidator';
import { useDeckStore } from '@/lib/store/deck-store';
import { Card } from '@/types/card';

// Mock the Zustand store
vi.mock('@/lib/store/deck-store', () => ({
  useDeckStore: vi.fn(),
}));

describe('FormatValidator Component', () => {
  it('shows valid state for exact commander size', () => {
    // 99 cards in main deck + 1 commander = 100 cards
    vi.mocked(useDeckStore).mockReturnValue({
      cards: [{ card: { id: 'm1', typeLine: 'Basic Land' } as Card, quantity: 99 }],
      metadata: { format: 'Commander' },
      commander: { id: 'c1' } as Card,
    } as ReturnType<typeof useDeckStore>);
    
    render(<FormatValidator />);
    expect(screen.getByText(/Deck is legal for Commander/i)).toBeDefined();
  });

  it('shows error for wrong size', () => {
    vi.mocked(useDeckStore).mockReturnValue({
      cards: [{ card: { id: 'm1', typeLine: 'Basic Land' } as Card, quantity: 98 }],
      metadata: { format: 'Commander' },
      commander: { id: 'c1' } as Card,
    } as ReturnType<typeof useDeckStore>);
    
    render(<FormatValidator />);
    expect(screen.getByText(/Deck must be exactly 100 cards/i)).toBeDefined();
  });

  it('shows error for singleton violation', () => {
    vi.mocked(useDeckStore).mockReturnValue({
      cards: [
        { card: { id: '1', typeLine: 'Creature', name: 'Goblin Guide' } as Card, quantity: 2 },
        { card: { id: '2', typeLine: 'Basic Land', name: 'Mountain' } as Card, quantity: 98 }
      ],
      metadata: { format: 'Commander' },
      commander: { id: 'c1' } as Card,
    } as ReturnType<typeof useDeckStore>);
    
    render(<FormatValidator />);
    expect(screen.getByText(/Only 1 copy of Goblin Guide is allowed in Commander/i)).toBeDefined();
  });

  it('accepts 99 main cards plus separate commander as legal 100 card deck', () => {
    vi.mocked(useDeckStore).mockReturnValue({
      cards: [{ card: { id: 'm1', typeLine: 'Basic Land' } as Card, quantity: 99, deckSection: 'MAIN_DECK' }],
      metadata: { format: 'Commander' },
      commander: { id: 'c1', name: 'Spider-Man' } as Card,
    } as ReturnType<typeof useDeckStore>);

    render(<FormatValidator />);
    expect(screen.getByText(/Deck is legal for Commander/i)).toBeDefined();
  });

  describe('Non-Commander Format Validation', () => {
    it('shows valid state for legal Standard deck of 60 cards and max 4 copies', () => {
      vi.mocked(useDeckStore).mockReturnValue({
        cards: [
          { card: { id: '1', name: 'Lightning Bolt', typeLine: 'Instant', legalities: { standard: 'legal' } } as unknown as Card, quantity: 4 },
          { card: { id: '2', name: 'Mountain', typeLine: 'Basic Land', legalities: { standard: 'legal' } } as unknown as Card, quantity: 56 },
        ],
        metadata: { format: 'Standard' },
        commander: undefined,
      } as ReturnType<typeof useDeckStore>);

      render(<FormatValidator />);
      expect(screen.getByText(/Deck is legal for Standard/i)).toBeDefined();
    });

    it('shows error for Standard deck with fewer than 60 cards', () => {
      vi.mocked(useDeckStore).mockReturnValue({
        cards: [
          { card: { id: '1', name: 'Mountain', typeLine: 'Basic Land' } as Card, quantity: 59 },
        ],
        metadata: { format: 'Standard' },
        commander: undefined,
      } as ReturnType<typeof useDeckStore>);

      render(<FormatValidator />);
      expect(screen.getByText(/Standard decks must have at least 60 cards \(currently 59\)/i)).toBeDefined();
    });

    it('shows error for Standard deck with more than 4 copies of a non-basic card', () => {
      vi.mocked(useDeckStore).mockReturnValue({
        cards: [
          { card: { id: '1', name: 'Lightning Bolt', typeLine: 'Instant' } as Card, quantity: 5 },
          { card: { id: '2', name: 'Mountain', typeLine: 'Basic Land' } as Card, quantity: 55 },
        ],
        metadata: { format: 'Standard' },
        commander: undefined,
      } as ReturnType<typeof useDeckStore>);

      render(<FormatValidator />);
      expect(screen.getByText(/Maximum 4 copies of Lightning Bolt allowed in Standard/i)).toBeDefined();
    });

    it('shows error for cards banned or not legal in the chosen format', () => {
      vi.mocked(useDeckStore).mockReturnValue({
        cards: [
          { card: { id: '1', name: 'Black Lotus', typeLine: 'Artifact', legalities: { standard: 'banned' } } as unknown as Card, quantity: 1 },
          { card: { id: '2', name: 'Mountain', typeLine: 'Basic Land' } as Card, quantity: 59 },
        ],
        metadata: { format: 'Standard' },
        commander: undefined,
      } as ReturnType<typeof useDeckStore>);

      render(<FormatValidator />);
      expect(screen.getByText(/Black Lotus is banned in Standard/i)).toBeDefined();
    });

    it('renders working glossary cross-links alongside violation messages', () => {
      vi.mocked(useDeckStore).mockReturnValue({
        cards: [
          { card: { id: '1', name: 'Sol Ring', typeLine: 'Artifact' } as Card, quantity: 2 },
        ],
        metadata: { format: 'Commander' },
        commander: undefined,
      } as ReturnType<typeof useDeckStore>);

      render(<FormatValidator />);

      const glossaryLinks = screen.getAllByRole('link', { name: /glossary|rules|commander/i });
      expect(glossaryLinks.length).toBeGreaterThan(0);
      expect(glossaryLinks[0]).toHaveAttribute('href', expect.stringMatching(/\/learn(#|\?|$)/));
    });
  });
});


