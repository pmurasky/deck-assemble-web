import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GeneratedDeckView } from '@/components/deck/GeneratedDeckView';
import { GeneratedDeck } from '@/types/builder';

const mockDeck: GeneratedDeck = {
  id: 'deck-101',
  name: "Atraxa's Proliferate Engine",
  commander: {
    id: 'cmd-1',
    name: "Atraxa, Praetors' Voice",
    colors: ['W', 'U', 'B', 'G'],
    colorIdentity: ['W', 'U', 'B', 'G'],
    ownershipCoverage: 75,
    missingStaplesCount: 2,
    estimatedCostToComplete: 45.0,
    popularityRank: 1,
    typeLine: 'Legendary Creature — Phyrexian Angel',
  },
  totalCards: 100,
  ownedPercentage: 74,
  wishlistTotalCost: 38.40,
  averageManaValue: 3.12,
  powerLevel: 7,
  legalityWarnings: [
    {
      severity: 'warning',
      rule: 'Format Ban Check',
      message: 'Deck passes all Commander legality rules!',
    },
  ],
  cards: [
    {
      card: {
        id: 'c-1',
        oracleId: 'o-1',
        name: 'Sol Ring',
        manaCost: '{1}',
        manaValue: 1,
        colors: [],
        colorIdentity: [],
        typeLine: 'Artifact',
        setCode: 'cmd',
        setName: 'Commander',
        rarity: 'uncommon',
        legalities: { commander: 'legal' },
      },
      quantity: 1,
      section: 'Ramp',
      ownership: 'owned',
      estimatedPrice: 1.50,
      synergyScore: 98,
      synergyReason: 'Universal ramp staple in Commander format.',
    },
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
      quantity: 1,
      section: 'Synergy',
      ownership: 'wishlist',
      estimatedPrice: 36.90,
      synergyScore: 99,
      synergyReason: 'Doubles all counters placed by Atraxa proliferate triggers.',
    },
  ],
};

describe('GeneratedDeckView Component', () => {
  it('renders header stats, sections, and ownership badges', () => {
    render(<GeneratedDeckView deck={mockDeck} onUpdateDeck={() => {}} onOpenWishlist={() => {}} />);

    expect(screen.getByText("Atraxa's Proliferate Engine")).toBeInTheDocument();
    expect(screen.getByText('74% Owned')).toBeInTheDocument();
    expect(screen.getByText('$38.40')).toBeInTheDocument();
    expect(screen.getByText('Sol Ring')).toBeInTheDocument();
    expect(screen.getByText('Doubling Season')).toBeInTheDocument();
    expect(screen.getByTestId('ownership-badge-owned')).toBeInTheDocument();
    expect(screen.getByTestId('ownership-badge-wishlist')).toBeInTheDocument();
  });

  it('allows removing a card row', () => {
    const handleUpdate = vi.fn();
    render(<GeneratedDeckView deck={mockDeck} onUpdateDeck={handleUpdate} onOpenWishlist={() => {}} />);

    const removeBtns = screen.getAllByRole('button', { name: /Remove card/i });
    fireEvent.click(removeBtns[0]);

    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        cards: expect.arrayContaining([
          expect.objectContaining({ card: expect.objectContaining({ name: 'Doubling Season' }) }),
        ]),
      })
    );
  });
});
