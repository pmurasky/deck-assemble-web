import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import * as decksApi from '@/lib/api/decks';

import { GET as legalityRoute } from '@/app/api/v1/decks/[deckId]/legality/route';
import { GET as combosRoute } from '@/app/api/v1/decks/[deckId]/combos/route';
import { POST as duplicateRoute } from '@/app/api/v1/decks/[deckId]/duplicate/route';
import { POST as archiveRoute } from '@/app/api/v1/decks/[deckId]/archive/route';
import { POST as syncOwnershipRoute } from '@/app/api/v1/decks/[deckId]/sync-ownership/route';
import { GET as wishlistRoute } from '@/app/api/v1/decks/[deckId]/wishlist/route';
import { POST as acquireCardRoute } from '@/app/api/v1/decks/[deckId]/cards/[deckCardId]/acquire/route';
import { GET as alternativesRoute } from '@/app/api/v1/decks/[deckId]/cards/[deckCardId]/alternatives/route';
import { POST as upgradePlansRoute } from '@/app/api/v1/decks/[deckId]/upgrade-plans/route';

vi.mock('@/lib/api/decks');

describe('Deck Coverage BFF Proxy Routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('GET /api/v1/decks/:deckId/legality returns legality check', async () => {
    vi.spyOn(decksApi, 'getDeckLegality').mockResolvedValue({
      legal: true,
      violations: [],
    });

    const req = new NextRequest('http://localhost/api/v1/decks/10/legality');
    const res = await legalityRoute(req, { params: Promise.resolve({ deckId: '10' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.legal).toBe(true);
  });

  it('GET /api/v1/decks/:deckId/combos returns combos list', async () => {
    vi.spyOn(decksApi, 'getDeckCombos').mockResolvedValue({
      available: true,
      combos: [
        {
          id: 'combo-1',
          cards: ['A', 'B'],
          produces: ['Win'],
          description: 'Win combo',
          prerequisites: 'None',
        },
      ],
    });

    const req = new NextRequest('http://localhost/api/v1/decks/10/combos');
    const res = await combosRoute(req, { params: Promise.resolve({ deckId: '10' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.combos).toHaveLength(1);
  });

  it('POST /api/v1/decks/:deckId/duplicate duplicates deck', async () => {
    vi.spyOn(decksApi, 'duplicateDeck').mockResolvedValue({
      id: 99,
      name: 'Copy of Deck',
      formatCode: 'COMMANDER',
      commanderCardId: 1,
    });

    const req = new NextRequest('http://localhost/api/v1/decks/10/duplicate', { method: 'POST' });
    const res = await duplicateRoute(req, { params: Promise.resolve({ deckId: '10' }) });
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.data.id).toBe(99);
  });

  it('POST /api/v1/decks/:deckId/archive archives deck', async () => {
    vi.spyOn(decksApi, 'archiveDeck').mockResolvedValue({
      id: 10,
      name: 'Archived Deck',
      formatCode: 'COMMANDER',
      commanderCardId: 1,
    });

    const req = new NextRequest('http://localhost/api/v1/decks/10/archive', { method: 'POST' });
    const res = await archiveRoute(req, { params: Promise.resolve({ deckId: '10' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.id).toBe(10);
  });

  it('POST /api/v1/decks/:deckId/sync-ownership syncs ownership', async () => {
    vi.spyOn(decksApi, 'syncDeckOwnership').mockResolvedValue({
      changedCount: 1,
      changes: [{ deckCardId: 1, cardPrintingId: 2, fromStatus: 'WISHLIST', toStatus: 'OWNED' }],
    });

    const req = new NextRequest('http://localhost/api/v1/decks/10/sync-ownership', { method: 'POST' });
    const res = await syncOwnershipRoute(req, { params: Promise.resolve({ deckId: '10' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.changedCount).toBe(1);
  });

  it('GET /api/v1/decks/:deckId/wishlist returns wishlist', async () => {
    vi.spyOn(decksApi, 'getDeckWishlist').mockResolvedValue({
      items: [{ deckCardId: 1, cardPrintingId: 2, cardName: 'Sol Ring', quantity: 1, unitPriceUsd: 1.5, lineTotalUsd: 1.5 }],
      totalUsd: 1.5,
    });

    const req = new NextRequest('http://localhost/api/v1/decks/10/wishlist');
    const res = await wishlistRoute(req, { params: Promise.resolve({ deckId: '10' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.items).toHaveLength(1);
  });

  it('POST /api/v1/decks/:deckId/cards/:deckCardId/acquire marks card acquired', async () => {
    vi.spyOn(decksApi, 'acquireDeckCard').mockResolvedValue({
      id: 5,
      cardPrintingId: 100,
      quantity: 1,
      deckSection: 'MAIN_DECK',
      ownershipStatus: 'OWNED',
      card: {
        id: 100,
        name: 'Sol Ring',
        oracleId: 'ora-1',
        manaCost: '{1}',
        manaValue: 1,
        colors: '',
        colorIdentity: '',
        typeLine: 'Artifact',
        power: '',
        toughness: '',
      },
    });

    const req = new NextRequest('http://localhost/api/v1/decks/10/cards/5/acquire', { method: 'POST' });
    const res = await acquireCardRoute(req, { params: Promise.resolve({ deckId: '10', deckCardId: '5' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.ownershipStatus).toBe('OWNED');
  });

  it('GET /api/v1/decks/:deckId/cards/:deckCardId/alternatives returns alternatives', async () => {
    vi.spyOn(decksApi, 'getDeckCardAlternatives').mockResolvedValue([
      {
        cardPrintingId: 200,
        name: 'Mana Crypt',
        owned: false,
        total: 90,
        reasons: [],
      },
    ]);

    const req = new NextRequest('http://localhost/api/v1/decks/10/cards/5/alternatives?limit=5&ownedFirst=true');
    const res = await alternativesRoute(req, { params: Promise.resolve({ deckId: '10', deckCardId: '5' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toHaveLength(1);
    expect(json.data[0].name).toBe('Mana Crypt');
  });

  it('POST /api/v1/decks/:deckId/upgrade-plans creates upgrade plan', async () => {
    vi.spyOn(decksApi, 'createDeckUpgradePlan').mockResolvedValue({
      objective: 'REPLACE_PROXIES_WITH_OWNED',
      currency: 'usd',
      maxChanges: 5,
      substitutions: [],
      before: {
        ownershipBreakdown: {},
        valueByCurrency: {},
        missingCostByCurrency: {},
        functionalCategories: {},
        legal: true,
      },
      after: {
        ownershipBreakdown: {},
        valueByCurrency: {},
        missingCostByCurrency: {},
        functionalCategories: {},
        legal: true,
      },
    });

    const req = new NextRequest('http://localhost/api/v1/decks/10/upgrade-plans', {
      method: 'POST',
      body: JSON.stringify({
        objective: 'REPLACE_PROXIES_WITH_OWNED',
        budget: 20,
        currency: 'usd',
      }),
    });
    const res = await upgradePlansRoute(req, { params: Promise.resolve({ deckId: '10' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.objective).toBe('REPLACE_PROXIES_WITH_OWNED');
  });
});
