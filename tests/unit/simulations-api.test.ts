import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateSampleHands, runDeckSimulation } from '@/lib/api/simulations';
import type { MulliganConfig } from '@/types/m3';

vi.mock('@/lib/auth0', () => ({
  auth0: {
    getAccessToken: vi.fn().mockResolvedValue({ token: 'test-token' }),
  },
}));

describe('simulations-api', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should generate sample hands with mulligan config', async () => {
    const mockHands = {
      seed: 'seed123',
      hands: [{ id: 'h1', handNumber: 1, cards: [], mulliganCount: 0 }],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockHands,
    } as Response);

    const config: MulliganConfig = {
      mulliganStrategy: 'LONDON_LAND_RANGE',
      minimumLands: 2,
      maximumLands: 5,
    };

    const res = await generateSampleHands(10, 7, config);
    expect(res).toEqual(mockHands);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        href: expect.stringContaining('/api/v1/decks/10/sample-hands'),
      }),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ count: 7, mulliganConfig: config }),
      })
    );
  });

  it('should run deck simulation and return Monte Carlo stats', async () => {
    const mockSim = {
      seed: 'sim-seed',
      landDropProbabilityByTurn: { 1: 0.95, 2: 0.88 },
      colorAvailabilityByTurn: { W: { 1: 0.6, 2: 0.8 } },
      cardsSeenByTurn: { 1: 8, 2: 9 },
      castabilityByTurn: { 1: 0.7, 2: 0.85 },
      playableSpellCountByTurn: { 1: 2, 2: 4 },
      confidence: { marginOfErrorPercent95: 1.5 },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockSim,
    } as Response);

    const res = await runDeckSimulation(10, 1000, 5);
    expect(res).toEqual(mockSim);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        href: expect.stringContaining('/api/v1/decks/10/simulations'),
      }),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ iterations: 1000, turns: 5 }),
      })
    );
  });
});
