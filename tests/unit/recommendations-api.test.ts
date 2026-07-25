import { describe, expect, it } from 'vitest';
import { getCommanderRecommendations, generateBuildDeck } from '@/lib/api/recommendations';
import { GenerateBuildRequest } from '@/types/builder';

describe('Recommendations API Client & Endpoints', () => {
  it('fetches commander recommendations with filtering', async () => {
    const recommendations = await getCommanderRecommendations({
      colorIdentity: ['R'],
      maxBudget: 50,
    });

    expect(Array.isArray(recommendations)).toBe(true);
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations.some((c) => c.name === 'Krenko, Mob Boss')).toBe(true);
  });

  it('posts a build request and returns a valid 100-card generated deck', async () => {
    const request: GenerateBuildRequest = {
      commanderCardId: 'cmd-1',
      secondaryCommanderCardId: null,
      desiredPowerLevel: 8,
      playStyle: 'midrange',
      useOwnedCardsOnly: false,
      budgetLimit: 200,
    };

    const deck = await generateBuildDeck(request);

    expect(deck).toBeDefined();
    expect(deck.commander).toBeDefined();
    expect(deck.totalCards).toBe(100);
    expect(typeof deck.buildScore).toBe('number');
    expect(deck.buildScore).toBeGreaterThanOrEqual(1);
    expect(typeof deck.ownedCardsCount).toBe('number');
    expect(typeof deck.wishlistCardsCount).toBe('number');
    expect(typeof deck.unfillableSlotsCount).toBe('number');
    expect(Array.isArray(deck.cards)).toBe(true);
    expect(Array.isArray(deck.legalityWarnings)).toBe(true);
  });
});
