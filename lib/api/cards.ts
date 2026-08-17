import type { ApiResponse } from '@/types/api';
import type { Card, AdvancedCardSearchParams } from '@/types/card';

export interface CardPrinting {
  id: number;
  setCode: string;
  collectorNumber: string;
  rarity: string;
  imageUri?: string;
  faces?: Card['faces'];
}

export interface GetCardsParams extends AdvancedCardSearchParams {
  page?: number;
  limit?: number;
  q?: string;
  type?: string;
  setCode?: string;
  colorIdentity?: string;
  commanderEligible?: boolean;
  partnerForCardId?: string | number;
  minOwnedQuantity?: number;
  maxOwnedQuantity?: number;
}

export async function getCards(params: GetCardsParams = {}): Promise<{ cards: Card[]; total: number }> {
  const {
    page = 1,
    limit = 50,
    q = '',
    type = '',
    setCode = '',
    colorIdentity = '',
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
  } = params;

  const url = new URL('/api/v1/cards', typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  url.searchParams.append('page', page.toString());
  url.searchParams.append('limit', limit.toString());
  if (q) url.searchParams.append('q', q);
  if (type) url.searchParams.append('type', type);
  if (setCode) url.searchParams.append('setCode', setCode);
  if (colorIdentity) url.searchParams.append('colorIdentity', colorIdentity);
  if (commanderEligible) url.searchParams.append('commanderEligible', 'true');
  if (partnerForCardId !== undefined && partnerForCardId !== null && partnerForCardId !== '') {
    url.searchParams.append('partnerForCardId', String(partnerForCardId));
  }
  if (name) url.searchParams.append('name', name);
  if (oracleText) url.searchParams.append('oracleText', oracleText);
  if (minCmc !== undefined) url.searchParams.append('minCmc', String(minCmc));
  if (maxCmc !== undefined) url.searchParams.append('maxCmc', String(maxCmc));
  if (power) url.searchParams.append('power', power);
  if (toughness) url.searchParams.append('toughness', toughness);
  if (loyalty) url.searchParams.append('loyalty', loyalty);
  if (rarity) url.searchParams.append('rarity', rarity);
  if (format) url.searchParams.append('format', format);
  if (keywords) url.searchParams.append('keywords', keywords);
  if (artist) url.searchParams.append('artist', artist);
  if (isReserved !== undefined) url.searchParams.append('isReserved', String(isReserved));
  if (isFullArt !== undefined) url.searchParams.append('isFullArt', String(isFullArt));
  if (isPromo !== undefined) url.searchParams.append('isPromo', String(isPromo));
  if (minOwnedQuantity !== undefined) url.searchParams.append('minOwnedQuantity', String(minOwnedQuantity));
  if (maxOwnedQuantity !== undefined) url.searchParams.append('maxOwnedQuantity', String(maxOwnedQuantity));

  const res = await fetch(url.pathname + url.search);
  if (!res.ok) {
    throw new Error('Failed to fetch cards');
  }

  const json: ApiResponse<{ cards: Card[]; total: number }> = await res.json();
  if (json.error || !json.data) {
    throw new Error(json.error?.message || 'Unknown error fetching cards');
  }

  return json.data;
}

export async function getPrintings({
  page = 1,
  limit = 50,
  q = '',
  type = '',
  setCode = '',
  colorIdentity = '',
  commanderEligible = false,
  partnerForCardId,
}: GetCardsParams = {}): Promise<{ cards: Card[]; total: number }> {
  const url = new URL('/api/v1/printings', typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  url.searchParams.append('page', page.toString());
  url.searchParams.append('limit', limit.toString());
  if (q) url.searchParams.append('q', q);
  if (type) url.searchParams.append('type', type);
  if (setCode) url.searchParams.append('setCode', setCode);
  if (colorIdentity) url.searchParams.append('colorIdentity', colorIdentity);
  if (commanderEligible) url.searchParams.append('commanderEligible', 'true');
  if (partnerForCardId !== undefined && partnerForCardId !== null && partnerForCardId !== '') {
    url.searchParams.append('partnerForCardId', String(partnerForCardId));
  }

  const res = await fetch(url.pathname + url.search);
  if (!res.ok) {
    throw new Error('Failed to fetch printings');
  }

  const json: ApiResponse<{ cards: Card[]; total: number }> = await res.json();
  if (json.error || !json.data) {
    throw new Error(json.error?.message || 'Unknown error fetching printings');
  }

  return json.data;
}

export async function getCardById(cardId: string): Promise<Card> {
  const res = await fetch(`/api/v1/cards/${cardId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch card ${cardId}`);
  }

  const json: ApiResponse<Card> = await res.json();
  if (json.error || !json.data) {
    throw new Error(json.error?.message || 'Unknown error fetching card');
  }

  return json.data;
}

export async function getCardPrintings(cardId: string): Promise<CardPrinting[]> {
  const res = await fetch(`/api/v1/cards/${cardId}/printings`);
  if (!res.ok) {
    throw new Error(`Failed to fetch printings for card ${cardId}`);
  }

  const json: ApiResponse<CardPrinting[]> = await res.json();
  if (json.error || !json.data) {
    throw new Error(json.error?.message || `Unknown error fetching printings for card ${cardId}`);
  }

  return json.data;
}

export interface LatestImport {
  query: string;
  recordsRead: number;
  completedAt: string;
}

export async function getLatestImport(): Promise<LatestImport | null> {
  const res = await fetch('/api/v1/card-imports/latest');
  if (!res.ok) {
    throw new Error('Failed to fetch import status');
  }
  const json: ApiResponse<LatestImport | null> = await res.json();
  if (json.error) {
    throw new Error(json.error.message);
  }
  return json.data ?? null;
}

export async function getSetPrintings(
  setCode: string,
  { page = 1, limit = 500, q = '', type = '', colorIdentity = '' }: GetCardsParams = {}
): Promise<{ cards: Card[]; total: number }> {
  const url = new URL(`/api/v1/sets/${setCode}/printings`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  url.searchParams.append('page', page.toString());
  url.searchParams.append('limit', limit.toString());
  if (q) url.searchParams.append('q', q);
  if (type) url.searchParams.append('type', type);
  if (colorIdentity) url.searchParams.append('colorIdentity', colorIdentity);

  const res = await fetch(url.pathname + url.search);
  if (!res.ok) {
    throw new Error('Failed to fetch set printings');
  }

  const json: ApiResponse<{ cards: Card[]; total: number }> = await res.json();
  if (json.error || !json.data) {
    throw new Error(json.error?.message || 'Unknown error fetching set printings');
  }

  return json.data;
}
