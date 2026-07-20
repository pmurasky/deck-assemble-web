import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeckWorkspace } from '@/components/deck/DeckWorkspace';
import { useDeckStore } from '@/lib/store/deck-store';

// Mock the Zustand store
vi.mock('@/lib/store/deck-store', () => ({
  useDeckStore: vi.fn(),
}));

describe('DeckWorkspace Component', () => {
  it('renders empty state when no cards', () => {
    vi.mocked(useDeckStore).mockReturnValue({
      metadata: { name: 'Test Deck', format: 'Commander' },
      cards: [],
      removeCard: vi.fn(),
      addCard: vi.fn(),
    });
    
    render(<DeckWorkspace />);
    expect(screen.getByText(/Your deck is empty/i)).toBeDefined();
  });

  it('renders grouped cards', () => {
    vi.mocked(useDeckStore).mockReturnValue({
      metadata: { name: 'Test Deck', format: 'Commander' },
      cards: [
        {
          deckCardId: 1,
          cardPrintingId: 1,
          card: { id: '1', name: 'Goblin Guide', typeLine: 'Creature — Goblin' },
          quantity: 2,
          deckSection: 'MAIN_DECK',
        },
      ],
      removeCard: vi.fn(),
      addCard: vi.fn(),
    });
    
    render(<DeckWorkspace />);
    expect(screen.getByText(/Creature/i)).toBeDefined();
    expect(screen.getByText('Goblin Guide')).toBeDefined();
    expect(screen.getByText(/x2/i)).toBeDefined();
  });
});
