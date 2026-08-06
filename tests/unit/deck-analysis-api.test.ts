import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDeckAnalysis } from '@/lib/api/decks';

describe('Deck Analysis API Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch deck analysis data from GET /api/v1/decks/:deckId/analysis', async () => {
    const mockAnalysisData = {
      deckId: 10,
      totalCards: 100,
      manaCurve: [
        { cmc: '0', count: 2 },
        { cmc: '1', count: 12 },
        { cmc: '2', count: 25 },
        { cmc: '3', count: 20 },
        { cmc: '4', count: 15 },
        { cmc: '5', count: 10 },
        { cmc: '6+', count: 16 },
      ],
      colorDemand: [
        { color: 'W', count: 25 },
        { color: 'U', count: 40 },
        { color: 'B', count: 15 },
        { color: 'R', count: 0 },
        { color: 'G', count: 10 },
        { color: 'C', count: 10 },
      ],
      typeDistribution: [
        { type: 'Creature', count: 30 },
        { type: 'Instant', count: 20 },
        { type: 'Sorcery', count: 15 },
        { type: 'Artifact', count: 10 },
        { type: 'Enchantment', count: 5 },
        { type: 'Land', count: 35 },
      ],
      ownership: {
        ownedCount: 85,
        missingCount: 15,
        ownedPercentage: 85,
      },
      valueByCurrency: {
        USD: 45.5,
        EUR: 39.9,
      },
      categories: [
        { name: 'Ramp', count: 10 },
        { name: 'Card Draw', count: 12 },
        { name: 'Removal', count: 8 },
      ],
      combos: [
        { name: 'Thassa\'s Oracle + Demonic Consultation', cards: ['Thassa\'s Oracle', 'Demonic Consultation'], description: 'Wins the game on ETB.' },
      ],
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
      deckId: 99,
      totalCards: 0,
      manaCurve: [],
      colorDemand: [],
      typeDistribution: [],
      ownership: { ownedCount: 0, missingCount: 0, ownedPercentage: 0 },
      valueByCurrency: { USD: 0 },
      categories: [],
      combos: [],
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockZeroedResponse }),
    } as Response);

    const result = await getDeckAnalysis(99);
    expect(result.totalCards).toBe(0);
    expect(result.manaCurve).toEqual([]);
  });
});
