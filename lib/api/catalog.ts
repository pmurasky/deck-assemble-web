import type { Card } from '@/types/card';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080';

interface ApiCard {
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

export async function fetchCards({ query = '', page = 0, size = 24 }: { query?: string; page?: number; size?: number } = {}) {
  const url = new URL('/api/v1/cards', API_BASE_URL);
  url.searchParams.set('query', query);
  url.searchParams.set('page', String(page));
  url.searchParams.set('size', String(size));

  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) {
    throw new Error(`Card catalog returned ${res.status}`);
  }

  const apiPage: ApiPage = await res.json();
  return { cards: apiPage.content.map(toCard), total: apiPage.totalElements };
}

export async function fetchCardById(cardId: string): Promise<Card | null> {
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
}

export async function fetchSetPrintings(setCode: string, { query = '', page = 0, size = 24 }: { query?: string; page?: number; size?: number } = {}) {
  const url = new URL(`/api/v1/sets/${setCode}/printings`, API_BASE_URL);
  url.searchParams.set('query', query);
  url.searchParams.set('page', String(page));
  url.searchParams.set('size', String(size));

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Set printings returned ${res.status}`);
  }

  const apiPage: ApiPage = await res.json();
  return { cards: apiPage.content.map(toCard), total: apiPage.totalElements };
}
