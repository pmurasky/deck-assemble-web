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
  ownedCardsCount: 74,
  wishlistCardsCount: 26,
  unfillableSlotsCount: 0,
  wishlistTotalCost: 38.40,
  averageManaValue: 3.12,
  powerLevel: 7,
  buildScore: 91,
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
      section: 'Theme/Synergy',
      ownership: 'wishlist',
      estimatedPrice: 36.90,
      synergyScore: 99,
      synergyReason: 'Doubles all counters placed by Atraxa proliferate triggers.',
    },
  ],
};

describe('GeneratedDeckView Component', () => {
  it('renders header stats, build score, sections, and ownership badges', () => {
    render(<GeneratedDeckView deck={mockDeck} onUpdateDeck={() => {}} onOpenWishlist={() => {}} />);

    expect(screen.getByText("Atraxa's Proliferate Engine")).toBeInTheDocument();
    expect(screen.getByText(/91 \/ 100/i)).toBeInTheDocument();
    expect(screen.getByText(/74%/i)).toBeInTheDocument();
    expect(screen.getAllByText(/38\.40/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Sol Ring')).toBeInTheDocument();
    expect(screen.getByText('Doubling Season')).toBeInTheDocument();
    expect(screen.getByTestId('ownership-badge-owned')).toBeInTheDocument();
    expect(screen.getByTestId('ownership-badge-wishlist')).toBeInTheDocument();
  });

  it('renders secondary commander and gaps if present', () => {
    const deckWithPartnerAndGaps: GeneratedDeck = {
      ...mockDeck,
      secondaryCommander: {
        id: 'cmd-2',
        name: 'Thrasios, Triton Hero',
        colors: ['G', 'U'],
        colorIdentity: ['G', 'U'],
        ownershipCoverage: 100,
        missingStaplesCount: 0,
        estimatedCostToComplete: 0,
        popularityRank: 2,
        typeLine: 'Legendary Creature — Triton Wizard',
      },
      gaps: ['Missing 2 ramp spells from inventory'],
    };

    render(<GeneratedDeckView deck={deckWithPartnerAndGaps} onUpdateDeck={() => {}} onOpenWishlist={() => {}} />);

    expect(screen.getByText(/Thrasios, Triton Hero/i)).toBeInTheDocument();
    expect(screen.getByText(/Missing 2 ramp spells from inventory/i)).toBeInTheDocument();
  });

  it('allows syncing ownership for a card row', () => {
    const handleUpdate = vi.fn();
    render(<GeneratedDeckView deck={mockDeck} onUpdateDeck={handleUpdate} onOpenWishlist={() => {}} />);

    const syncBtns = screen.getAllByRole('button', { name: /Sync ownership/i });
    expect(syncBtns.length).toBeGreaterThan(0);
    fireEvent.click(syncBtns[0]);

    expect(handleUpdate).toHaveBeenCalled();
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

  it('filters deck view to show unowned / wishlist cards only', () => {
    render(<GeneratedDeckView deck={mockDeck} onUpdateDeck={() => {}} onOpenWishlist={() => {}} />);

    const filterUnownedBtn = screen.getByTestId('filter-unowned-cards');
    fireEvent.click(filterUnownedBtn);

    // Doubling Season (wishlist) should be visible, but Sol Ring (owned) should not be in filtered list
    expect(screen.getByText('Doubling Season')).toBeInTheDocument();
    expect(screen.queryByText('Sol Ring')).not.toBeInTheDocument();
  });

  it('opens CardPreviewModal when clicking inspect button for a card', () => {
    render(<GeneratedDeckView deck={mockDeck} onUpdateDeck={() => {}} onOpenWishlist={() => {}} />);

    const inspectBtns = screen.getAllByRole('button', { name: /Inspect card image/i });
    expect(inspectBtns.length).toBeGreaterThan(0);
    fireEvent.click(inspectBtns[0]);

    expect(screen.getByTestId('card-preview-modal')).toBeInTheDocument();
  });

  it('renders PROTECTION and FINISHER category sections for labeled cards', () => {
    const deckWithProtectionAndFinisher: GeneratedDeck = {
      ...mockDeck,
      cards: [
        {
          card: {
            id: 'prot-1',
            oracleId: 'ora-prot-1',
            name: "Heroic Intervention",
            manaCost: '{1}{G}',
            manaValue: 2,
            colors: ['G'],
            colorIdentity: ['G'],
            typeLine: 'Instant',
            setCode: 'aer',
            setName: 'Aether Revolt',
            rarity: 'rare',
            legalities: { commander: 'legal' },
          },
          quantity: 1,
          section: 'PROTECTION' as any,
          ownership: 'owned',
          estimatedPrice: 2.5,
          synergyScore: 95,
          synergyReason: 'Protects board from wipes and targeted removal.',
        },
        {
          card: {
            id: 'fin-1',
            oracleId: 'ora-fin-1',
            name: 'Craterhoof Behemoth',
            manaCost: '{5}{G}{G}{G}',
            manaValue: 8,
            colors: ['G'],
            colorIdentity: ['G'],
            typeLine: 'Creature — Beast',
            setCode: 'avr',
            setName: 'Avacyn Restored',
            rarity: 'mythic',
            legalities: { commander: 'legal' },
          },
          quantity: 1,
          section: 'FINISHER' as any,
          ownership: 'owned',
          estimatedPrice: 30.0,
          synergyScore: 99,
          synergyReason: 'Game-ending finisher with wide board state.',
        },
      ],
    };

    render(
      <GeneratedDeckView
        deck={deckWithProtectionAndFinisher}
        onUpdateDeck={() => {}}
        onOpenWishlist={() => {}}
      />
    );

    expect(screen.getByText('Protection')).toBeInTheDocument();
    expect(screen.getByText('Heroic Intervention')).toBeInTheDocument();
    expect(screen.getByText('Finisher')).toBeInTheDocument();
    expect(screen.getByText('Craterhoof Behemoth')).toBeInTheDocument();
  });
});

