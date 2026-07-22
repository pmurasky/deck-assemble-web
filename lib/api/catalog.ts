import type { Card } from '@/types/card';
import { MOCK_CARDS } from '@/lib/mock-data/cards';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080';

export interface ApiCard {
  id: number;
  printingId?: number;
  oracleId: string;
  name: string;
  manaCost?: string;
  manaValue?: number;
  colors?: string;
  colorIdentity?: string;
  typeLine?: string;
  oracleText?: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  imageUrl?: string;
  setCode?: string;
  setName?: string;
  rarity?: string;
  flavorText?: string;
}

interface ApiPage {
  content: ApiCard[];
  totalElements: number;
}

export interface FetchCardsOptions {
  query?: string;
  page?: number;
  size?: number;
  type?: string;
  setCode?: string;
  colorIdentity?: string;
  sort?: string;
}

export function toCard(api: ApiCard): Card {
  return {
    id: String(api.id),
    printingId: api.printingId,
    oracleId: api.oracleId,
    name: api.name,
    imageUrl: api.imageUrl,
    manaCost: api.manaCost,
    manaValue: api.manaValue ?? 0,
    colors: api.colors?.split(',').filter(Boolean) ?? [],
    colorIdentity: api.colorIdentity?.split(',').filter(Boolean) ?? [],
    typeLine: api.typeLine ?? '',
    oracleText: api.oracleText,
    flavorText: api.flavorText,
    power: api.power,
    toughness: api.toughness,
    loyalty: api.loyalty,
    setCode: api.setCode ?? '',
    setName: api.setName ?? '',
    rarity: api.rarity ?? '',
    legalities: {},
  };
}

export async function fetchCards({
  query = '',
  page = 0,
  size = 24,
  type = '',
  setCode = '',
  colorIdentity = '',
  sort = '',
}: FetchCardsOptions = {}) {
  const url = new URL('/api/v1/cards', API_BASE_URL);
  if (query) url.searchParams.set('query', query);
  url.searchParams.set('page', String(page));
  url.searchParams.set('size', String(size));
  if (type) url.searchParams.set('type', type);
  if (setCode) url.searchParams.set('setCode', setCode);
  if (colorIdentity) url.searchParams.set('colorIdentity', colorIdentity);
  if (sort) url.searchParams.set('sort', sort);

  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) {
      throw new Error(`Card catalog returned ${res.status}`);
    }

    const apiPage: ApiPage = await res.json();
    return { cards: apiPage.content.map(toCard), total: apiPage.totalElements };
  } catch {
    let filtered = MOCK_CARDS;
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.typeLine.toLowerCase().includes(q) ||
          c.oracleText?.toLowerCase().includes(q)
      );
    }
    if (type) {
      const t = type.toLowerCase();
      filtered = filtered.filter((c) => c.typeLine.toLowerCase().includes(t));
    }
    if (setCode) {
      filtered = filtered.filter((c) => c.setCode.toLowerCase() === setCode.toLowerCase());
    }
    if (colorIdentity) {
      const colors = colorIdentity.split(',').map((c) => c.trim()).filter(Boolean);
      if (colors.length > 0) {
        filtered = filtered.filter((c) => c.colorIdentity?.some((ci) => colors.includes(ci)));
      }
    }
    const start = page * size;
    const paginated = filtered.slice(start, start + size);
    return { cards: paginated, total: filtered.length };
  }
}

export async function fetchCardById(cardId: string): Promise<Card | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/cards/${cardId}`, {
      next: { revalidate: 300 },
    });
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      throw new Error(`Card catalog returned ${res.status}`);
    }
    return toCard(await res.json());
  } catch {
    const card = MOCK_CARDS.find((c) => c.id === cardId);
    return card ?? null;
  }
}

export async function fetchSetPrintings(
  setCode: string,
  { query = '', page = 0, size = 24, type = '' }: FetchCardsOptions = {}
) {
  const url = new URL(`/api/v1/sets/${setCode}/printings`, API_BASE_URL);
  if (query) url.searchParams.set('query', query);
  url.searchParams.set('page', String(page));
  url.searchParams.set('size', String(size));
  if (type) url.searchParams.set('type', type);

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Set printings returned ${res.status}`);
    }

    const apiPage: ApiPage = await res.json();
    return { cards: apiPage.content.map(toCard), total: apiPage.totalElements };
  } catch {
    let filtered = MOCK_CARDS.filter((c) => c.setCode.toLowerCase() === setCode.toLowerCase());
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.typeLine.toLowerCase().includes(q) ||
          c.oracleText?.toLowerCase().includes(q)
      );
    }
    if (type) {
      const t = type.toLowerCase();
      filtered = filtered.filter((c) => c.typeLine.toLowerCase().includes(t));
    }
    const start = page * size;
    const paginated = filtered.slice(start, start + size);
    return { cards: paginated, total: filtered.length };
  }
}

