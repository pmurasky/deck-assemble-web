import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MissingStaplesModal } from '@/components/deck/MissingStaplesModal';
import type { CommanderSuggestion, WishlistItem } from '@/types/builder';

const sampleCommander: CommanderSuggestion = {
  id: '101',
  name: "Atraxa, Praetors' Voice",
  imageUrl: 'https://cards.scryfall.io/normal/front/a/b/card.jpg',
  colors: ['W', 'U', 'B', 'G'],
  colorIdentity: ['W', 'U', 'B', 'G'],
  ownershipCoverage: 82,
  missingStaplesCount: 18,
  estimatedCostToComplete: 45.2,
  popularityRank: 1,
  typeLine: 'Legendary Creature — Angel Horror',
};

const sampleWishlist: WishlistItem[] = [
  {
    card: {
      id: '201',
      oracleId: 'orc-201',
      name: 'Doubling Season',
      typeLine: 'Enchantment',
      manaCost: '{4}{G}',
      manaValue: 5,
      colors: ['G'],
      colorIdentity: ['G'],
      setCode: 'RAV',
      setName: 'Ravnica',
      rarity: 'rare',
      legalities: {},
    },
    priority: 'High Synergy',
    estimatedPrice: 25.0,
    acquired: false,
    quantity: 1,
  },
];

describe('MissingStaplesModal', () => {
  it('renders nothing when not open', () => {
    const { container } = render(
      <MissingStaplesModal
        isOpen={false}
        onClose={vi.fn()}
        commander={sampleCommander}
        isLoading={false}
        error={null}
        wishlistItems={[]}
        onBuildFullDeck={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders loading spinner when isLoading is true', () => {
    render(
      <MissingStaplesModal
        isOpen={true}
        onClose={vi.fn()}
        commander={sampleCommander}
        isLoading={true}
        error={null}
        wishlistItems={[]}
        onBuildFullDeck={vi.fn()}
      />
    );
    expect(screen.getByText(/Analyzing deck construction/i)).toBeInTheDocument();
  });

  it('renders missing wishlist items when available', () => {
    render(
      <MissingStaplesModal
        isOpen={true}
        onClose={vi.fn()}
        commander={sampleCommander}
        isLoading={false}
        error={null}
        wishlistItems={sampleWishlist}
        onBuildFullDeck={vi.fn()}
      />
    );
    expect(screen.getByText('Doubling Season')).toBeInTheDocument();
    expect(screen.getByText('High Synergy')).toBeInTheDocument();
    expect(screen.getAllByText('$25.00').length).toBeGreaterThan(0);
  });

  it('triggers onBuildFullDeck when Build Full 100-Card Deck button is clicked', () => {
    const handleBuild = vi.fn();
    const handleClose = vi.fn();
    render(
      <MissingStaplesModal
        isOpen={true}
        onClose={handleClose}
        commander={sampleCommander}
        isLoading={false}
        error={null}
        wishlistItems={sampleWishlist}
        onBuildFullDeck={handleBuild}
      />
    );

    fireEvent.click(screen.getByText('Build Full 100-Card Deck'));
    expect(handleClose).toHaveBeenCalled();
    expect(handleBuild).toHaveBeenCalled();
  });
});
