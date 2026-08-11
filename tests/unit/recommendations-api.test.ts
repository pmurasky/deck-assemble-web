import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { getCommanderRecommendations, generateBuildDeck } from '@/lib/api/recommendations';
import { GenerateBuildRequest } from '@/types/builder';

describe('Recommendations API Client & Endpoints', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches commander recommendations with proxy mapping and card details batch enrichment', async () => {
    const mockSuggestions = [
      {
        commanderCardId: 123,
        commanderName: "Atraxa, Praetors' Voice",
        colorIdentity: 'W,U,B,G',
        coveragePercent: 75.0,
        missingCardCount: 2,
        estimatedCompletionCostUsd: 45.0,
        unpricedMissingCardCount: 1,
        commanderRank: null,
        explanations: [
          { category: 'coverage', score: 80, explanation: 'High collection overlap' },
          { category: 'missing', score: 90, explanation: 'Only 2 missing staples' },
        ],
      },
    ];

    const mockCard = {
      id: 123,
      oracleId: 'ora-123',
      name: "Atraxa, Praetors' Voice",
      typeLine: 'Legendary Creature — Phyrexian Angel',
      imageUrl: 'https://example.com/atraxa.jpg',
      colors: 'W,U,B,G',
      colorIdentity: 'W,U,B,G',
    };

    vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes('/api/v1/recommendations/commanders')) {
        return new Response(JSON.stringify({ data: mockSuggestions }), { status: 200 });
      }
      if (urlStr.includes('/api/v1/cards/123')) {
        return new Response(JSON.stringify(mockCard), { status: 200 });
      }
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    });

    const recommendations = await getCommanderRecommendations({
      colorIdentity: ['W', 'U'],
      maxBudget: 50,
    });

    expect(Array.isArray(recommendations)).toBe(true);
    expect(recommendations.length).toBe(1);
    expect(recommendations[0].id).toBe('123');
    expect(recommendations[0].name).toBe("Atraxa, Praetors' Voice");
    expect(recommendations[0].colorIdentity).toEqual(['W', 'U', 'B', 'G']);
    expect(recommendations[0].ownershipCoverage).toBe(75.0);
    expect(recommendations[0].missingStaplesCount).toBe(2);
    expect(recommendations[0].unpricedMissingCardCount).toBe(1);
    expect(recommendations[0].estimatedCostToComplete).toBe(45.0);
    expect(recommendations[0].popularityRank).toBeNull();
    expect(recommendations[0].explanations).toHaveLength(2);
    expect(recommendations[0].explanations?.[0].category).toBe('coverage');
    expect(recommendations[0].typeLine).toBe('Legendary Creature — Phyrexian Angel');
    expect(recommendations[0].imageUrl).toBe('https://example.com/atraxa.jpg');
  });

  it('posts a build request and assembles deck with cards, commander, and gaps', async () => {
    const mockBuildResult = {
      deck: {
        id: 9,
        name: "Atraxa's Proliferate Engine",
        commanderCardId: 123,
        secondaryCommanderCardId: null,
        commanderName: "Atraxa, Praetors' Voice",
        cardCount: 100,
        formatCode: 'COMMANDER',
        status: 'COMPLETE',
        createdAt: '2026-07-26',
      },
      cardCount: 100,
      ownedCount: 80,
      wishlistCount: 20,
      gaps: ['3 slots could not be filled from your collection'],
      score: 87.5,
      legality: {
        legal: true,
        violations: [],
      },
    };

    const mockDeckCards = [
      {
        id: 1,
        cardPrintingId: 789,
        quantity: 1,
        deckSection: 'COMMANDER',
        ownershipStatus: 'OWNED',
        card: {
          id: 123,
          oracleId: 'ora-123',
          name: "Atraxa, Praetors' Voice",
          typeLine: 'Legendary Creature — Phyrexian Angel',
          manaCost: '{G}{W}{U}{B}',
          manaValue: 4,
          colors: 'W,U,B,G',
          colorIdentity: 'W,U,B,G',
        },
      },
      {
        id: 2,
        cardPrintingId: 790,
        quantity: 1,
        deckSection: 'MAIN_DECK',
        ownershipStatus: 'WISHLIST',
        card: {
          id: 456,
          oracleId: 'ora-456',
          name: 'Sol Ring',
          typeLine: 'Artifact',
          manaCost: '{1}',
          manaValue: 1,
          colors: '',
          colorIdentity: '',
        },
      },
    ];

    vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes('/api/v1/recommendations/builds')) {
        return new Response(JSON.stringify({ data: mockBuildResult }), { status: 200 });
      }
      if (urlStr.includes('/api/v1/decks/9/cards')) {
        return new Response(JSON.stringify({ data: mockDeckCards }), { status: 200 });
      }
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    });

    const request: GenerateBuildRequest = {
      commanderCardId: 123,
      secondaryCommanderCardId: null,
      desiredPowerLevel: 8,
      playStyle: 'midrange',
      useOwnedCardsOnly: false,
      budgetLimit: 200,
    };

    const deck = await generateBuildDeck(request);

    expect(deck).toBeDefined();
    expect(deck.id).toBe('9');
    expect(deck.name).toBe("Atraxa's Proliferate Engine");
    expect(deck.commander.name).toBe("Atraxa, Praetors' Voice");
    expect(deck.totalCards).toBe(100);
    expect(deck.ownedCardsCount).toBe(80);
    expect(deck.wishlistCardsCount).toBe(20);
    expect(deck.buildScore).toBe(87.5);
    expect(deck.gaps).toEqual(['3 slots could not be filled from your collection']);
    expect(deck.cards.length).toBe(2);
    expect(deck.cards[0].section).toBe('Commander');
    expect(deck.cards[1].section).toBe('Main Deck');
  });

  it('throws error when recommendation proxy fails', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async () => {
      return new Response(JSON.stringify({ error: { message: 'Upstream connection error' } }), { status: 502 });
    });

    await expect(getCommanderRecommendations()).rejects.toThrow('Failed to fetch commander recommendations');
  });
});
