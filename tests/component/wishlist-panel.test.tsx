import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WishlistPanel } from '@/components/deck/WishlistPanel';
import { WishlistItem } from '@/types/builder';

const mockWishlistItems: WishlistItem[] = [
  {
    card: {
      id: 'c-2',
      oracleId: 'o-2',
      name: 'Doubling Season',
      manaCost: '{4}{G}',
      manaValue: 5,
      colors: ['G'],
      colorIdentity: ['G'],
      typeLine: 'Enchantment',
      setCode: 'cmm',
      setName: 'Commander Masters',
      rarity: 'mythic',
      legalities: { commander: 'legal' },
    },
    priority: 'High Synergy',
    estimatedPrice: 36.90,
    acquired: false,
    quantity: 1,
  },
  {
    card: {
      id: 'c-3',
      oracleId: 'o-3',
      name: 'Arcane Signet',
      manaCost: '{2}',
      manaValue: 2,
      colors: [],
      colorIdentity: [],
      typeLine: 'Artifact',
      setCode: 'cmd',
      setName: 'Commander',
      rarity: 'common',
      legalities: { commander: 'legal' },
    },
    priority: 'Key Staple',
    estimatedPrice: 1.50,
    acquired: false,
    quantity: 1,
  },
];

describe('WishlistPanel Component', () => {
  it('renders wishlist cards grouped by priority with price total', () => {
    render(
      <WishlistPanel
        items={mockWishlistItems}
        onMarkAcquired={() => {}}
        onBackToDeck={() => {}}
      />
    );

    expect(screen.getByText('Doubling Season')).toBeInTheDocument();
    expect(screen.getByText('Arcane Signet')).toBeInTheDocument();
    expect(screen.getByText('$38.40')).toBeInTheDocument();
    expect(screen.getByText('High Synergy')).toBeInTheDocument();
  });

  it('triggers mark as acquired flow', () => {
    const handleMark = vi.fn();
    render(
      <WishlistPanel
        items={mockWishlistItems}
        onMarkAcquired={handleMark}
        onBackToDeck={() => {}}
      />
    );

    const markBtns = screen.getAllByRole('button', { name: /Mark as acquired/i });
    fireEvent.click(markBtns[0]);

    expect(handleMark).toHaveBeenCalledWith('c-2');
  });

  it('provides export buttons for Text and CSV', () => {
    render(
      <WishlistPanel
        items={mockWishlistItems}
        onMarkAcquired={() => {}}
        onBackToDeck={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: /Export Text/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export CSV/i })).toBeInTheDocument();
  });
});
