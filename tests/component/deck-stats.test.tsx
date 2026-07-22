import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DeckStats } from '@/components/deck/DeckStats';
import { useDeckStore } from '@/lib/store/deck-store';

// Mock the Zustand store
vi.mock('@/lib/store/deck-store', () => ({
  useDeckStore: vi.fn(),
}));

describe('DeckStats Component', () => {
  it('renders correctly with no cards', () => {
    vi.mocked(useDeckStore).mockReturnValue({
      cards: [],
    } as ReturnType<typeof useDeckStore>);
    
    render(<DeckStats />);
    expect(screen.getByText(/Mana Curve/i)).toBeDefined();
    expect(screen.getByRole('heading', { name: /Color Distribution/i })).toBeDefined();
  });

  it('calculates stats based on cards', () => {
    vi.mocked(useDeckStore).mockReturnValue({
      cards: [
        {
          card: { id: '1', name: 'Goblin Guide', manaValue: 1, colorIdentity: ['R'], typeLine: 'Creature' },
          quantity: 2
        },
        {
          card: { id: '2', name: 'Lightning Bolt', manaValue: 1, colorIdentity: ['R'], typeLine: 'Instant' },
          quantity: 4
        },
        {
          card: { id: '3', name: 'Tarmogoyf', manaValue: 2, colorIdentity: ['G'], typeLine: 'Creature' },
          quantity: 4
        }
      ],
    });
    
    render(<DeckStats />);
    
    // Test that average CMC is rendered correctly. (2*1 + 4*1 + 4*2) / 10 = 14 / 10 = 1.4
    expect(screen.getByText('1.4')).toBeDefined();
  });
});
