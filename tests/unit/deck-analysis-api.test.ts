import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDeckAnalysis } from '@/lib/api/decks';

describe('Deck Analysis API Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch deck analysis data from GET /api/v1/decks/:deckId/analysis', async () => {
    const mockAnalysisData = {
      manaCurve: {
        '0': 2,
        '1': 12,
        '2': 25,
        '3': 20,
        '4': 15,
        '5': 10,
        '6+': 16,
      },
      typeDistribution: {
        Creature: 30,
        Instant: 20,
        Sorcery: 15,
        Artifact: 10,
        Enchantment: 5,
        Land: 35,
      },
      colorDemand: {
        W: 25,
        U: 40,
        B: 15,
        R: 0,
        G: 10,
        C: 10,
      },
      colorProduction: {
        W: 10,
        U: 20,
        B: 10,
        R: 0,
        G: 5,
        C: 5,
      },
      landCount: 35,
      averageManaValue: 2.85,
      ownershipBreakdown: {
        OWNED: 85,
        WISHLIST: 10,
        PROXY: 5,
      },
      valueByCurrency: {
        USD: 45.5,
        EUR: 39.9,
      },
      missingCostByCurrency: {
        USD: 12.0,
        EUR: 10.5,
      },
      unpricedCardCount: 0,
      functionalCategories: {
        Ramp: 10,
        'Card Draw': 12,
        Removal: 8,
      },
      tokenProducers: [],
      gameChangers: [],
      legality: {
        legal: true,
        violations: [],
      },
      combos: {
        available: true,
        count: 1,
        combos: [
          {
            id: 'combo-1',
            cards: ["Thassa's Oracle", 'Demonic Consultation'],
            produces: ['Win the game'],
            description: 'Wins the game on ETB.',
            prerequisites: 'Both cards in hand and sufficient mana.',
          },
        ],
      },
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockAnalysisData }),
    } as Response);

    const result = await getDeckAnalysis(10);
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/v1/decks/10/analysis');
    expect(result).toEqual(mockAnalysisData);
  });

  it('should return zeroed response structure when deck is empty', async () => {
    const mockZeroedResponse = {
      manaCurve: {},
      typeDistribution: {},
      colorDemand: {},
      colorProduction: {},
      landCount: 0,
      averageManaValue: 0,
      ownershipBreakdown: {
        OWNED: 0,
        WISHLIST: 0,
        PROXY: 0,
      },
      valueByCurrency: {},
      missingCostByCurrency: {},
      unpricedCardCount: 0,
      functionalCategories: {},
      tokenProducers: [],
      gameChangers: [],
      legality: {
        legal: true,
        violations: [],
      },
      combos: {
        available: false,
        count: 0,
        combos: [],
      },
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockZeroedResponse }),
    } as Response);

    const result = await getDeckAnalysis(99);
    expect(result.ownershipBreakdown).toEqual({ OWNED: 0, WISHLIST: 0, PROXY: 0 });
    expect(result.manaCurve).toEqual({});
  });
});
