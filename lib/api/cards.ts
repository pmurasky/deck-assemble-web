import { Card } from '@/types/card';
import { ApiResponse } from '@/types/api';

interface GetCardsParams {
  page?: number;
  limit?: number;
  q?: string;
}

export async function getCards({ page = 1, limit = 50, q = '' }: GetCardsParams = {}): Promise<{ cards: Card[], total: number }> {
  const url = new URL('/api/v1/cards', typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  url.searchParams.append('page', page.toString());
  url.searchParams.append('limit', limit.toString());
  if (q) {
    url.searchParams.append('q', q);
  }

  const res = await fetch(url.pathname + url.search);
  if (!res.ok) {
    throw new Error('Failed to fetch cards');
  }

  const json: ApiResponse<{ cards: Card[], total: number }> = await res.json();
  if (json.error || !json.data) {
    throw new Error(json.error?.message || 'Unknown error fetching cards');
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
