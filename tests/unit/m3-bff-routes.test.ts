import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

import * as revisionsApi from '@/lib/api/revisions';
import * as simulationsApi from '@/lib/api/simulations';
import * as publishingApi from '@/lib/api/publishing';

import { GET as getRevisionsRoute } from '@/app/api/v1/decks/[deckId]/revisions/route';
import { GET as getRevisionDetailRoute } from '@/app/api/v1/decks/[deckId]/revisions/[n]/route';
import { GET as getRevisionDiffRoute } from '@/app/api/v1/decks/[deckId]/revisions/[n]/diff/[m]/route';
import { POST as restoreRevisionRoute } from '@/app/api/v1/decks/[deckId]/revisions/[n]/restore/route';

import { POST as sampleHandsRoute } from '@/app/api/v1/decks/[deckId]/sample-hands/route';
import { POST as simulationsRoute } from '@/app/api/v1/decks/[deckId]/simulations/route';

import { PATCH as publishingRoute } from '@/app/api/v1/decks/[deckId]/publishing/route';
import { POST as publishRoute } from '@/app/api/v1/decks/[deckId]/publish/route';
import { PUT as primerRoute } from '@/app/api/v1/decks/[deckId]/primer/route';

import { GET as sharedDeckRoute } from '@/app/api/v1/shared/decks/[slug]/route';
import { POST as forkSharedDeckRoute } from '@/app/api/v1/shared/decks/[slug]/fork/route';

import { POST as startPracticeSessionRoute } from '@/app/api/v1/decks/[deckId]/practice-sessions/route';
import { POST as playPracticeCardRoute } from '@/app/api/v1/decks/[deckId]/practice-sessions/[sessionId]/play/route';
import { POST as tapPracticeCardRoute } from '@/app/api/v1/decks/[deckId]/practice-sessions/[sessionId]/tap/route';
import { POST as stepPracticeSessionRoute } from '@/app/api/v1/decks/[deckId]/practice-sessions/[sessionId]/steps/route';
import { POST as resetPracticeSessionRoute } from '@/app/api/v1/decks/[deckId]/practice-sessions/[sessionId]/reset/route';

vi.mock('@/lib/api/revisions');
vi.mock('@/lib/api/simulations');
vi.mock('@/lib/api/publishing');

describe('M3 BFF Proxy Routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('GET /api/v1/decks/:deckId/revisions returns revisions list', async () => {
    vi.spyOn(revisionsApi, 'getDeckRevisions').mockResolvedValue({
      items: [], total: 0, page: 1, size: 20,
    });

    const req = new NextRequest('http://localhost/api/v1/decks/10/revisions?page=1&size=20');
    const res = await getRevisionsRoute(req, { params: Promise.resolve({ deckId: '10' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.total).toBe(0);
  });

  it('GET /api/v1/decks/:deckId/revisions/:n returns single revision', async () => {
    vi.spyOn(revisionsApi, 'getDeckRevision').mockResolvedValue({
      revisionNumber: 2,
      createdAt: '2026-08-09T00:00:00Z',
      snapshot: { id: 10, name: 'Deck', formatCode: 'commander', commanderCardId: null, revisionNumber: 2, cards: [] },
    });

    const req = new NextRequest('http://localhost/api/v1/decks/10/revisions/2');
    const res = await getRevisionDetailRoute(req, { params: Promise.resolve({ deckId: '10', n: '2' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.revisionNumber).toBe(2);
  });

  it('GET /api/v1/decks/:deckId/revisions/:n/diff/:m returns diff', async () => {
    vi.spyOn(revisionsApi, 'getDeckRevisionDiff').mockResolvedValue({
      revisionA: 1, revisionB: 2,
    });

    const req = new NextRequest('http://localhost/api/v1/decks/10/revisions/1/diff/2');
    const res = await getRevisionDiffRoute(req, { params: Promise.resolve({ deckId: '10', n: '1', m: '2' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.revisionA).toBe(1);
  });

  it('POST /api/v1/decks/:deckId/revisions/:n/restore handles expectedCurrentRevision', async () => {
    vi.spyOn(revisionsApi, 'restoreDeckRevision').mockResolvedValue({
      revisionNumber: 4,
      createdAt: '2026-08-09T00:00:00Z',
      snapshot: { id: 10, name: 'Restored', formatCode: 'commander', commanderCardId: null, revisionNumber: 4, cards: [] },
    });

    const req = new NextRequest('http://localhost/api/v1/decks/10/revisions/2/restore', {
      method: 'POST',
      body: JSON.stringify({ expectedCurrentRevision: 3 }),
    });
    const res = await restoreRevisionRoute(req, { params: Promise.resolve({ deckId: '10', n: '2' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.revisionNumber).toBe(4);
  });

  it('POST /api/v1/decks/:deckId/sample-hands calls sample hands API', async () => {
    vi.spyOn(simulationsApi, 'generateSampleHands').mockResolvedValue({
      seed: '123', hands: [],
    });

    const req = new NextRequest('http://localhost/api/v1/decks/10/sample-hands', {
      method: 'POST',
      body: JSON.stringify({ count: 7 }),
    });
    const res = await sampleHandsRoute(req, { params: Promise.resolve({ deckId: '10' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.seed).toBe('123');
  });

  it('POST /api/v1/decks/:deckId/simulations runs Monte Carlo simulation', async () => {
    vi.spyOn(simulationsApi, 'runDeckSimulation').mockResolvedValue({
      seed: '456',
      landDropProbabilityByTurn: {},
      colorAvailabilityByTurn: {},
      cardsSeenByTurn: {},
      castabilityByTurn: {},
      playableSpellCountByTurn: {},
      confidence: { marginOfErrorPercent95: 1.2 },
    });

    const req = new NextRequest('http://localhost/api/v1/decks/10/simulations', {
      method: 'POST',
      body: JSON.stringify({ iterations: 1000, turns: 5 }),
    });
    const res = await simulationsRoute(req, { params: Promise.resolve({ deckId: '10' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.confidence.marginOfErrorPercent95).toBe(1.2);
  });

  it('POST /api/v1/decks/:deckId/practice-sessions starts a session', async () => {
    vi.spyOn(simulationsApi, 'startPracticeSession').mockResolvedValue({
      sessionId: 'sess-123',
      seed: 42,
      turn: 1,
      mulliganCount: 0,
      hand: [],
      battlefield: [],
      drawnCard: null,
      landsInPlay: 0,
      landPlayedThisTurn: false,
      castableSpells: [],
      finished: false,
    });

    const req = new NextRequest('http://localhost/api/v1/decks/10/practice-sessions', { method: 'POST' });
    const res = await startPracticeSessionRoute(req, { params: Promise.resolve({ deckId: '10' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.sessionId).toBe('sess-123');
  });

  it('POST /api/v1/decks/:deckId/practice-sessions/:sessionId/play plays a card', async () => {
    vi.spyOn(simulationsApi, 'playPracticeCard').mockResolvedValue({
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
    });

    const req = new NextRequest('http://localhost/api/v1/decks/10/practice-sessions/sess-123/play', {
      method: 'POST',
      body: JSON.stringify({ printingId: 101 }),
    });
    const res = await playPracticeCardRoute(req, {
      params: Promise.resolve({ deckId: '10', sessionId: 'sess-123' }),
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.landsInPlay).toBe(1);
  });

  it('POST /api/v1/decks/:deckId/practice-sessions/:sessionId/tap taps a permanent', async () => {
    vi.spyOn(simulationsApi, 'tapPracticeCard').mockResolvedValue({
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
    });

    const req = new NextRequest('http://localhost/api/v1/decks/10/practice-sessions/sess-123/tap', {
      method: 'POST',
      body: JSON.stringify({ printingId: 101 }),
    });
    const res = await tapPracticeCardRoute(req, {
      params: Promise.resolve({ deckId: '10', sessionId: 'sess-123' }),
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.battlefield[0].tapped).toBe(true);
  });

  it('POST /api/v1/decks/:deckId/practice-sessions/:sessionId/steps advances turn', async () => {
    vi.spyOn(simulationsApi, 'stepPracticeSession').mockResolvedValue({
      sessionId: 'sess-123',
      seed: 42,
      turn: 2,
      mulliganCount: 0,
      hand: [],
      battlefield: [],
      drawnCard: null,
      landsInPlay: 0,
      landPlayedThisTurn: false,
      castableSpells: [],
      finished: false,
    });

    const req = new NextRequest('http://localhost/api/v1/decks/10/practice-sessions/sess-123/steps', {
      method: 'POST',
    });
    const res = await stepPracticeSessionRoute(req, {
      params: Promise.resolve({ deckId: '10', sessionId: 'sess-123' }),
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.turn).toBe(2);
  });

  it('POST /api/v1/decks/:deckId/practice-sessions/:sessionId/reset resets session', async () => {
    vi.spyOn(simulationsApi, 'resetPracticeSession').mockResolvedValue({
      sessionId: 'sess-123',
      seed: 42,
      turn: 1,
      mulliganCount: 0,
      hand: [],
      battlefield: [],
      drawnCard: null,
      landsInPlay: 0,
      landPlayedThisTurn: false,
      castableSpells: [],
      finished: false,
    });

    const req = new NextRequest('http://localhost/api/v1/decks/10/practice-sessions/sess-123/reset', {
      method: 'POST',
    });
    const res = await resetPracticeSessionRoute(req, {
      params: Promise.resolve({ deckId: '10', sessionId: 'sess-123' }),
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.turn).toBe(1);
  });

  it('PATCH /api/v1/decks/:deckId/publishing updates visibility', async () => {
    vi.spyOn(publishingApi, 'updateDeckVisibility').mockResolvedValue({ visibility: 'PUBLIC' });

    const req = new NextRequest('http://localhost/api/v1/decks/10/publishing', {
      method: 'PATCH',
      body: JSON.stringify({ visibility: 'PUBLIC' }),
    });
    const res = await publishingRoute(req, { params: Promise.resolve({ deckId: '10' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.visibility).toBe('PUBLIC');
  });

  it('POST /api/v1/decks/:deckId/publish pins current revision', async () => {
    vi.spyOn(publishingApi, 'publishDeck').mockResolvedValue({
      deckId: 10, publishedRevisionNumber: 3, publishedAt: '2026-08-09T00:00:00Z', slug: 'deck-10',
    });

    const req = new NextRequest('http://localhost/api/v1/decks/10/publish', { method: 'POST' });
    const res = await publishRoute(req, { params: Promise.resolve({ deckId: '10' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.slug).toBe('deck-10');
  });

  it('PUT /api/v1/decks/:deckId/primer updates primer source', async () => {
    vi.spyOn(publishingApi, 'setDeckPrimer').mockResolvedValue({
      title: 'Primer', content: '# Source',
    });

    const req = new NextRequest('http://localhost/api/v1/decks/10/primer', {
      method: 'PUT',
      body: JSON.stringify({ title: 'Primer', content: '# Source' }),
    });
    const res = await primerRoute(req, { params: Promise.resolve({ deckId: '10' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.title).toBe('Primer');
  });

  it('GET /api/v1/shared/decks/:slug returns shared deck', async () => {
    vi.spyOn(publishingApi, 'getSharedDeck').mockResolvedValue({
      id: 10, name: 'Shared', formatCode: 'commander', cards: [], publishedAt: '2026-08-09T00:00:00Z', slug: 'shared', visibility: 'PUBLIC', publishedRevisionNumber: 3,
    });

    const req = new NextRequest('http://localhost/api/v1/shared/decks/shared');
    const res = await sharedDeckRoute(req, { params: Promise.resolve({ slug: 'shared' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.slug).toBe('shared');
  });

  it('POST /api/v1/shared/decks/:slug/fork forks shared deck', async () => {
    vi.spyOn(publishingApi, 'forkSharedDeck').mockResolvedValue({
      newDeckId: 100, newDeck: { id: 100, name: 'Shared (Fork)', formatCode: 'commander', commanderCardId: null },
    });

    const req = new NextRequest('http://localhost/api/v1/shared/decks/shared/fork', { method: 'POST' });
    const res = await forkSharedDeckRoute(req, { params: Promise.resolve({ slug: 'shared' }) });
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.data.newDeckId).toBe(100);
  });
});

