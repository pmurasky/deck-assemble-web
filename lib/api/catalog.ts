import { MOCK_CARDS } from '@/lib/mock-data/cards';
import type { Card, CardFace } from '@/types/card';

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
  faces?: CardFace[];
  legalities?: Record<string, string>;
  ownedQuantity?: number;
  regularOwnedQuantity?: number;
  foilOwnedQuantity?: number;
}

export interface ApiCardPrinting {
  id: number;
  setCode: string;
  collectorNumber: string;
  rarity: string;
  imageUri?: string;
  faces?: CardFace[];
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
  commanderEligible?: boolean;
  partnerForCardId?: string | number;
  name?: string;
  oracleText?: string;
  minCmc?: number;
  maxCmc?: number;
  power?: string;
  toughness?: string;
  loyalty?: string;
  rarity?: string;
  format?: string;
  keywords?: string;
  artist?: string;
  isReserved?: boolean;
  isFullArt?: boolean;
  isPromo?: boolean;
  minOwnedQuantity?: number;
  maxOwnedQuantity?: number;
}

export function toCard(api: ApiCard): Card {
  const imageUrl =
    api.imageUrl ||
    (api.name ? `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(api.name)}&format=image` : undefined);
  return {
    id: String(api.id),
    printingId: api.printingId,
    oracleId: api.oracleId,
    name: api.name,
    imageUrl,
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
    legalities: api.legalities ?? {},
    faces: api.faces ?? [],
    ownedQuantity: api.ownedQuantity,
    regularOwnedQuantity: api.regularOwnedQuantity,
    foilOwnedQuantity: api.foilOwnedQuantity,
  };
}

export async function fetchCards(options: FetchCardsOptions = {}) {
  const {
    query = '',
    page = 0,
    size = 24,
    type = '',
    setCode = '',
    colorIdentity = '',
    sort = '',
    commanderEligible = false,
    partnerForCardId,
    name,
    oracleText,
    minCmc,
    maxCmc,
    power,
    toughness,
    loyalty,
    rarity,
    format,
    keywords,
    artist,
    isReserved,
    isFullArt,
    isPromo,
    minOwnedQuantity,
    maxOwnedQuantity,
  } = options;

  const url = new URL('/api/v1/cards', API_BASE_URL);
  if (query) url.searchParams.set('query', query);
  url.searchParams.set('page', String(page));
  url.searchParams.set('size', String(size));
  if (type) url.searchParams.set('type', type);
  if (setCode) url.searchParams.set('setCode', setCode);
  if (colorIdentity) url.searchParams.set('colorIdentity', colorIdentity);
  if (sort) url.searchParams.set('sort', sort);
  if (commanderEligible) url.searchParams.set('commanderEligible', 'true');
  if (partnerForCardId !== undefined && partnerForCardId !== null && partnerForCardId !== '') {
    url.searchParams.set('partnerForCardId', String(partnerForCardId));
  }
  if (name) url.searchParams.set('name', name);
  if (oracleText) url.searchParams.set('oracleText', oracleText);
  if (minCmc !== undefined) url.searchParams.set('minCmc', String(minCmc));
  if (maxCmc !== undefined) url.searchParams.set('maxCmc', String(maxCmc));
  if (power) url.searchParams.set('power', power);
  if (toughness) url.searchParams.set('toughness', toughness);
  if (loyalty) url.searchParams.set('loyalty', loyalty);
  if (rarity) url.searchParams.set('rarity', rarity);
  if (format) url.searchParams.set('format', format);
  if (keywords) url.searchParams.set('keywords', keywords);
  if (artist) url.searchParams.set('artist', artist);
  if (isReserved !== undefined) url.searchParams.set('isReserved', String(isReserved));
  if (isFullArt !== undefined) url.searchParams.set('isFullArt', String(isFullArt));
  if (isPromo !== undefined) url.searchParams.set('isPromo', String(isPromo));
  if (minOwnedQuantity !== undefined) url.searchParams.set('minOwnedQuantity', String(minOwnedQuantity));
  if (maxOwnedQuantity !== undefined) url.searchParams.set('maxOwnedQuantity', String(maxOwnedQuantity));

  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) {
      throw new Error(`Card catalog returned ${res.status}`);
    }

    const apiPage: ApiPage = await res.json();
    return { cards: apiPage.content.map(toCard), total: apiPage.totalElements };
  } catch {
    let filtered = MOCK_CARDS;
    if (minOwnedQuantity !== undefined) {
      filtered = filtered.filter((c) => (c.ownedQuantity ?? 0) >= minOwnedQuantity);
    }
    if (maxOwnedQuantity !== undefined) {
      filtered = filtered.filter((c) => (c.ownedQuantity ?? 0) <= maxOwnedQuantity);
    }
    if (commanderEligible) {
      filtered = filtered.filter(
        (c) =>
          (c.typeLine.toLowerCase().includes('legendary') &&
            (c.typeLine.toLowerCase().includes('creature') || c.typeLine.toLowerCase().includes('planeswalker'))) ||
          c.oracleText?.toLowerCase().includes('can be your commander') ||
          c.legalities?.commander === 'legal'
      );
    }
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
      const typeWords = type.toLowerCase().split(/\s+/).filter(Boolean);
      filtered = filtered.filter((c) =>
        typeWords.every((t) => c.typeLine.toLowerCase().includes(t))
      );
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

export async function fetchPrintings({
  query = '',
  page = 0,
  size = 24,
  type = '',
  setCode = '',
  colorIdentity = '',
  sort = '',
  commanderEligible = false,
  partnerForCardId,
}: FetchCardsOptions = {}) {
  const url = new URL('/api/v1/printings', API_BASE_URL);
  if (query) url.searchParams.set('query', query);
  url.searchParams.set('page', String(page));
  url.searchParams.set('size', String(size));
  if (type) url.searchParams.set('type', type);
  if (setCode) url.searchParams.set('setCode', setCode);
  if (colorIdentity) url.searchParams.set('colorIdentity', colorIdentity);
  if (sort) url.searchParams.set('sort', sort);
  if (commanderEligible) url.searchParams.set('commanderEligible', 'true');
  if (partnerForCardId !== undefined && partnerForCardId !== null && partnerForCardId !== '') {
    url.searchParams.set('partnerForCardId', String(partnerForCardId));
  }

  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) {
      throw new Error(`Printings returned ${res.status}`);
    }

    const apiPage: ApiPage = await res.json();
    return { cards: apiPage.content.map(toCard), total: apiPage.totalElements };
  } catch {
    let filtered = MOCK_CARDS;
    if (commanderEligible) {
      filtered = filtered.filter(
        (c) =>
          (c.typeLine.toLowerCase().includes('legendary') &&
            (c.typeLine.toLowerCase().includes('creature') || c.typeLine.toLowerCase().includes('planeswalker'))) ||
          c.oracleText?.toLowerCase().includes('can be your commander') ||
          c.legalities?.commander === 'legal'
      );
    }
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
      const typeWords = type.toLowerCase().split(/\s+/).filter(Boolean);
      filtered = filtered.filter((c) =>
        typeWords.every((t) => c.typeLine.toLowerCase().includes(t))
      );
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
      const mockMatch = MOCK_CARDS.find((c) => c.id === cardId || c.name.toLowerCase() === cardId.toLowerCase());
      return mockMatch ?? null;
    }
    if (!res.ok) {
      throw new Error(`Card catalog returned ${res.status}`);
    }
    return toCard(await res.json());
  } catch {
    const card = MOCK_CARDS.find((c) => c.id === cardId || c.name.toLowerCase() === cardId.toLowerCase());
    return card ?? null;
  }
}

export async function fetchCardPrintings(cardId: string): Promise<ApiCardPrinting[] | null> {
  const res = await fetch(`${API_BASE_URL}/api/v1/cards/${cardId}/printings`, {
    next: { revalidate: 300 },
  });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Card printings returned ${res.status}`);
  }
  return res.json();
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
