import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { fetchCards } from '@/lib/api/catalog';
import { getCards } from '@/lib/api/cards';

describe('Advanced Card Search API', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should forward all 14 advanced search parameters to the backend URL in fetchCards', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [
          {
            id: 101,
            oracleId: 'orc-101',
            name: 'Sol Ring',
            typeLine: 'Artifact',
            setCode: 'lea',
            rarity: 'uncommon',
          },
        ],
        totalElements: 1,
      }),
    });
    global.fetch = mockFetch;

    const result = await fetchCards({
      query: 'Sol Ring',
      name: 'Sol Ring',
      oracleText: 'add mana',
      minCmc: 1,
      maxCmc: 3,
      power: '2',
      toughness: '2',
      loyalty: '4',
      rarity: 'uncommon',
      format: 'commander',
      keywords: 'Flying',
      artist: 'Mark Tedin',
      isReserved: true,
      isFullArt: false,
      isPromo: false,
    });

    expect(mockFetch).toHaveBeenCalled();
    const calledUrl = new URL(mockFetch.mock.calls[0][0]);
    expect(calledUrl.searchParams.get('name')).toBe('Sol Ring');
    expect(calledUrl.searchParams.get('oracleText')).toBe('add mana');
    expect(calledUrl.searchParams.get('minCmc')).toBe('1');
    expect(calledUrl.searchParams.get('maxCmc')).toBe('3');
    expect(calledUrl.searchParams.get('power')).toBe('2');
    expect(calledUrl.searchParams.get('toughness')).toBe('2');
    expect(calledUrl.searchParams.get('loyalty')).toBe('4');
    expect(calledUrl.searchParams.get('rarity')).toBe('uncommon');
    expect(calledUrl.searchParams.get('format')).toBe('commander');
    expect(calledUrl.searchParams.get('keywords')).toBe('Flying');
    expect(calledUrl.searchParams.get('artist')).toBe('Mark Tedin');
    expect(calledUrl.searchParams.get('isReserved')).toBe('true');
    expect(calledUrl.searchParams.get('isFullArt')).toBe('false');
    expect(calledUrl.searchParams.get('isPromo')).toBe('false');

    expect(result.total).toBe(1);
    expect(result.cards[0].name).toBe('Sol Ring');
  });

  it('should forward advanced search parameters in getCards client method', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          cards: [
            {
              id: '101',
              oracleId: 'orc-101',
              name: 'Sol Ring',
              typeLine: 'Artifact',
              manaValue: 1,
              colors: [],
              colorIdentity: [],
              setCode: 'lea',
              setName: 'Alpha',
              rarity: 'uncommon',
              legalities: {},
            },
          ],
          total: 1,
        },
      }),
    });
    global.fetch = mockFetch;

    const result = await getCards({
      q: 'Sol',
      oracleText: 'tap',
      minCmc: 0,
      maxCmc: 2,
    });

    expect(mockFetch).toHaveBeenCalled();
    const calledUrlString = mockFetch.mock.calls[0][0] as string;
    expect(calledUrlString).toContain('oracleText=tap');
    expect(calledUrlString).toContain('minCmc=0');
    expect(calledUrlString).toContain('maxCmc=2');
    expect(result.cards).toHaveLength(1);
  });
});
