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
    // 100 cards
    (useDeckStore as any).mockReturnValue({
      cards: [{ card: { typeLine: 'Basic Land' } as Card, quantity: 100 }],
      metadata: { format: 'Commander' },
      commander: { id: 'c1' } as Card,
    });
    
    render(<FormatValidator />);
    expect(screen.getByText(/Deck is legal for Commander/i)).toBeDefined();
  });

  it('shows error for wrong size', () => {
    (useDeckStore as any).mockReturnValue({
      cards: [{ card: { typeLine: 'Basic Land' } as Card, quantity: 99 }],
      metadata: { format: 'Commander' },
      commander: { id: 'c1' } as Card,
    });
    
    render(<FormatValidator />);
    expect(screen.getByText(/Deck must be exactly 100 cards/i)).toBeDefined();
  });

  it('shows error for singleton violation', () => {
    (useDeckStore as any).mockReturnValue({
      cards: [
        { card: { id: '1', typeLine: 'Creature', name: 'Goblin Guide' } as Card, quantity: 2 },
        { card: { id: '2', typeLine: 'Basic Land', name: 'Mountain' } as Card, quantity: 98 }
      ],
      metadata: { format: 'Commander' },
      commander: { id: 'c1' } as Card,
    });
    
    render(<FormatValidator />);
    expect(screen.getByText(/Only 1 copy of Goblin Guide is allowed in Commander/i)).toBeDefined();
  });
});
