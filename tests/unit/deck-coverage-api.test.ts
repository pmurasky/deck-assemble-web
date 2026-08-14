import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getDeckLegality,
  getDeckCombos,
  duplicateDeck,
  archiveDeck,
  syncDeckOwnership,
  getDeckWishlist,
  acquireDeckCard,
  getDeckCardAlternatives,
  createDeckUpgradePlan,
} from '@/lib/api/decks';

vi.mock('@/lib/auth0', () => ({
  auth0: {
    getAccessToken: vi.fn().mockResolvedValue({ token: 'test-bearer-token' }),
  },
}));

describe('Deck API coverage endpoints', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches deck legality check', async () => {
    const mockLegality = {
      legal: false,
      violations: [
        { code: 'COMMANDER_COLOR_IDENTITY', message: 'Contains off-color cards' },
      ],
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockLegality,
    }));

    const result = await getDeckLegality(42);
    expect(result.legal).toBe(false);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].code).toBe('COMMANDER_COLOR_IDENTITY');
  });

  it('fetches deck combos', async () => {
    const mockCombos = {
      available: true,
      combos: [
        {
          id: 'combo-123',
          cards: ['Thassa\'s Oracle', 'Demonic Consultation'],
          produces: ['Win the game'],
          description: 'Cast Thassa\'s Oracle and Consultation for win',
          prerequisites: 'UB mana available',
        },
      ],
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockCombos,
    }));

    const result = await getDeckCombos(42);
    expect(result.available).toBe(true);
    expect(result.combos).toHaveLength(1);
    expect(result.combos[0].id).toBe('combo-123');
  });

  it('duplicates a deck', async () => {
    const mockDeck = {
      id: 99,
      name: 'Spider-Man Clone',
      formatCode: 'COMMANDER',
      commanderCardId: 10,
      cardCount: 100,
      commanderName: 'Spider-Man',
      status: 'ACTIVE',
      useOwnedCardsOnly: false,
      createdAt: '2026-08-13T12:00:00Z',
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => mockDeck,
    }));

    const result = await duplicateDeck(42);
    expect(result.id).toBe(99);
    expect(result.name).toBe('Spider-Man Clone');
  });

  it('archives a deck', async () => {
    const mockDeck = {
      id: 42,
      name: 'Old Deck',
      formatCode: 'COMMANDER',
      commanderCardId: 10,
      cardCount: 100,
      status: 'ARCHIVED',
      useOwnedCardsOnly: false,
      createdAt: '2026-08-13T12:00:00Z',
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockDeck,
    }));

    const result = await archiveDeck(42);
    expect(result.id).toBe(42);
  });

  it('syncs deck ownership', async () => {
    const mockSync = {
      changedCount: 2,
      changes: [
        {
          deckCardId: 101,
          cardPrintingId: 501,
          fromStatus: 'WISHLIST',
          toStatus: 'OWNED',
        },
      ],
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockSync,
    }));

    const result = await syncDeckOwnership(42);
    expect(result.changedCount).toBe(2);
    expect(result.changes[0].toStatus).toBe('OWNED');
  });

  it('fetches deck wishlist', async () => {
    const mockWishlist = {
      items: [
        {
          deckCardId: 101,
          cardPrintingId: 501,
          cardName: 'Sol Ring',
          quantity: 1,
          unitPriceUsd: 1.5,
          lineTotalUsd: 1.5,
        },
      ],
      totalUsd: 1.5,
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockWishlist,
    }));

    const result = await getDeckWishlist(42);
    expect(result.items).toHaveLength(1);
    expect(result.totalUsd).toBe(1.5);
  });

  it('marks a deck card as acquired', async () => {
    const mockCard = {
      id: 101,
      cardPrintingId: 501,
      quantity: 1,
      deckSection: 'MAIN_DECK' as const,
      ownershipStatus: 'OWNED',
      card: {
        id: 501,
        name: 'Sol Ring',
        manaCost: '{1}',
        manaValue: 1,
        typeLine: 'Artifact',
        colors: '',
        colorIdentity: '',
      },
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockCard,
    }));

    const result = await acquireDeckCard(42, 101);
    expect(result.ownershipStatus).toBe('OWNED');
  });

  it('fetches deck card alternatives', async () => {
    const mockAlternatives = [
      {
        cardPrintingId: 602,
        name: 'Arcane Signet',
        owned: true,
        priceUsd: 0.99,
        total: 85.5,
        reasons: [
          {
            code: 'SYNERGY',
            points: 40,
            evidence: { match: 'Commander color match' },
          },
        ],
      },
    ];

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockAlternatives,
    }));

    const result = await getDeckCardAlternatives(42, 101, 5, true);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Arcane Signet');
    expect(result[0].owned).toBe(true);
  });

  it('creates deck upgrade plan', async () => {
    const mockPlan = {
      objective: 'REPLACE_PROXIES_WITH_OWNED' as const,
      currency: 'USD',
      budget: 50.0,
      maxChanges: 5,
      substitutions: [
        {
          deckCardId: 101,
          removedPrintingId: 501,
          removedName: 'Proxy Sol Ring',
          removedOwnershipStatus: 'PROXY',
          quantity: 1,
          addedPrintingId: 502,
          addedName: 'Owned Sol Ring',
          addedOwned: true,
          cost: 0,
          reasons: [{ code: 'OWNERSHIP', points: 50, evidence: { type: 'in_collection' } }],
        },
      ],
      before: {
        ownershipBreakdown: { OWNED: 80, PROXY: 20 },
        valueByCurrency: { USD: 300 },
        missingCostByCurrency: { USD: 50 },
        functionalCategories: { Ramp: 10 },
        legal: true,
      },
      after: {
        ownershipBreakdown: { OWNED: 81, PROXY: 19 },
        valueByCurrency: { USD: 300 },
        missingCostByCurrency: { USD: 45 },
        functionalCategories: { Ramp: 10 },
        legal: true,
      },
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockPlan,
    }));

    const result = await createDeckUpgradePlan(42, {
      objective: 'REPLACE_PROXIES_WITH_OWNED',
      budget: 50.0,
      currency: 'usd',
      maxChanges: 5,
    });
    expect(result.objective).toBe('REPLACE_PROXIES_WITH_OWNED');
    expect(result.substitutions).toHaveLength(1);
    expect(result.after.ownershipBreakdown.OWNED).toBe(81);
  });
});
