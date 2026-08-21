import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateSampleHands,
  runDeckSimulation,
  startPracticeSession,
  playPracticeCard,
  tapPracticeCard,
  stepPracticeSession,
  resetPracticeSession,
} from '@/lib/api/simulations';
import type { MulliganConfig, PracticeSessionResponse } from '@/types/m3';

vi.mock('@/lib/auth0', () => ({
  auth0: {
    getAccessToken: vi.fn().mockResolvedValue({ token: 'test-token' }),
  },
}));

describe('simulations-api', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should generate sample hands with mulligan config and revision', async () => {
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

    const res = await generateSampleHands(10, 7, config, 2);
    expect(res).toEqual(mockHands);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        href: expect.stringContaining('/api/v1/decks/10/sample-hands'),
      }),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          revision: 2,
          handCount: 7,
          mulliganStrategy: 'LONDON_LAND_RANGE',
          minimumLands: 2,
          maximumLands: 5,
        }),
      })
    );
  });

  it('should run deck simulation and return Monte Carlo stats with required fields', async () => {
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
        body: JSON.stringify({
          revision: 1,
          iterations: 1000,
          turns: 5,
          onThePlay: true,
          mulliganStrategy: 'NONE',
        }),
      })
    );
  });

  it('should start a practice session with default session config', async () => {
    const mockSession: PracticeSessionResponse = {
      sessionId: 'sess-123',
      seed: 42,
      turn: 1,
      mulliganCount: 0,
      hand: [{ printingId: 101, name: 'Forest' }],
      battlefield: [],
      drawnCard: null,
      landsInPlay: 0,
      landPlayedThisTurn: false,
      castableSpells: [],
      finished: false,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockSession,
    } as Response);

    const res = await startPracticeSession(10);
    expect(res).toEqual(mockSession);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        href: expect.stringContaining('/api/v1/decks/10/practice-sessions'),
      }),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          revision: 1,
          onThePlay: true,
          mulliganStrategy: 'NONE',
        }),
      })
    );
  });

  it('should start a practice session with custom config', async () => {
    const mockSession: PracticeSessionResponse = {
      sessionId: 'sess-custom',
      seed: 999,
      turn: 1,
      mulliganCount: 0,
      hand: [],
      battlefield: [],
      drawnCard: null,
      landsInPlay: 0,
      landPlayedThisTurn: false,
      castableSpells: [],
      finished: false,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockSession,
    } as Response);

    const res = await startPracticeSession(10, {
      revision: 3,
      onThePlay: false,
      mulliganStrategy: 'LONDON_LAND_RANGE',
      minimumLands: 2,
      maximumLands: 4,
      seed: 999,
    });
    expect(res).toEqual(mockSession);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        href: expect.stringContaining('/api/v1/decks/10/practice-sessions'),
      }),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          revision: 3,
          onThePlay: false,
          mulliganStrategy: 'LONDON_LAND_RANGE',
          minimumLands: 2,
          maximumLands: 4,
          seed: 999,
        }),
      })
    );
  });

  it('should play a card in a practice session', async () => {
    const mockSession: PracticeSessionResponse = {
      sessionId: 'sess-123',
      seed: 42,
      turn: 1,
      mulliganCount: 0,
      hand: [],
      battlefield: [{ card: { printingId: 101, name: 'Forest' }, tapped: false }],
      drawnCard: null,
      landsInPlay: 1,
      landPlayedThisTurn: true,
      castableSpells: [],
      finished: false,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockSession,
    } as Response);

    const res = await playPracticeCard(10, 'sess-123', 101);
    expect(res).toEqual(mockSession);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        href: expect.stringContaining('/api/v1/decks/10/practice-sessions/sess-123/play'),
      }),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ printingId: 101 }),
      })
    );
  });

  it('should tap a card in a practice session', async () => {
    const mockSession: PracticeSessionResponse = {
      sessionId: 'sess-123',
      seed: 42,
      turn: 1,
      mulliganCount: 0,
      hand: [],
      battlefield: [{ card: { printingId: 101, name: 'Forest' }, tapped: true }],
      drawnCard: null,
      landsInPlay: 1,
      landPlayedThisTurn: true,
      castableSpells: [],
      finished: false,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockSession,
    } as Response);

    const res = await tapPracticeCard(10, 'sess-123', 101);
    expect(res).toEqual(mockSession);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        href: expect.stringContaining('/api/v1/decks/10/practice-sessions/sess-123/tap'),
      }),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ printingId: 101 }),
      })
    );
  });

  it('should step a practice session to next turn', async () => {
    const mockSession: PracticeSessionResponse = {
      sessionId: 'sess-123',
      seed: 42,
      turn: 2,
      mulliganCount: 0,
      hand: [{ printingId: 102, name: 'Llanowar Elves' }],
      battlefield: [{ card: { printingId: 101, name: 'Forest' }, tapped: false }],
      drawnCard: { printingId: 102, name: 'Llanowar Elves' },
      landsInPlay: 1,
      landPlayedThisTurn: false,
      castableSpells: [{ printingId: 102, name: 'Llanowar Elves' }],
      finished: false,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockSession,
    } as Response);

    const res = await stepPracticeSession(10, 'sess-123');
    expect(res).toEqual(mockSession);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        href: expect.stringContaining('/api/v1/decks/10/practice-sessions/sess-123/steps'),
      }),
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('should reset a practice session', async () => {
    const mockSession: PracticeSessionResponse = {
      sessionId: 'sess-123',
      seed: 42,
      turn: 1,
      mulliganCount: 0,
      hand: [{ printingId: 101, name: 'Forest' }],
      battlefield: [],
      drawnCard: null,
      landsInPlay: 0,
      landPlayedThisTurn: false,
      castableSpells: [],
      finished: false,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockSession,
    } as Response);

    const res = await resetPracticeSession(10, 'sess-123');
    expect(res).toEqual(mockSession);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        href: expect.stringContaining('/api/v1/decks/10/practice-sessions/sess-123/reset'),
      }),
      expect.objectContaining({
        method: 'POST',
      })
    );
  });
});

