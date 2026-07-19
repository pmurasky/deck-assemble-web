import { NextRequest, NextResponse } from 'next/server';
import { Card } from '@/types/card';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080';

interface ApiCardSummary {
  id: number;
  oracleId: string;
  name: string;
  manaCost?: string;
  manaValue?: number;
  colors?: string;
  colorIdentity?: string;
  typeLine?: string;
  power?: string;
  toughness?: string;
  imageUrl?: string;
  setCode?: string;
  setName?: string;
  rarity?: string;
}

interface ApiPage {
  content: ApiCardSummary[];
  totalElements: number;
}

function toCard(summary: ApiCardSummary): Card {
  return {
    id: String(summary.id),
    oracleId: summary.oracleId,
    name: summary.name,
    imageUrl: summary.imageUrl,
    manaCost: summary.manaCost,
    manaValue: summary.manaValue ?? 0,
    colors: summary.colors?.split(',').filter(Boolean) ?? [],
    colorIdentity: summary.colorIdentity?.split(',').filter(Boolean) ?? [],
    typeLine: summary.typeLine ?? '',
    power: summary.power,
    toughness: summary.toughness,
    setCode: summary.setCode ?? '',
    setName: summary.setName ?? '',
    rarity: summary.rarity ?? '',
    legalities: {},
  };
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10) - 1, 0);
  const size = parseInt(searchParams.get('limit') || '50', 10);
  const query = searchParams.get('q') ?? '';

  const url = new URL('/api/v1/cards', API_BASE_URL);
  url.searchParams.set('query', query);
  url.searchParams.set('page', String(page));
  url.searchParams.set('size', String(size));

  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) {
    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: 'Card catalog unavailable' } },
      { status: 502 }
    );
  }

  const apiPage: ApiPage = await res.json();
  return NextResponse.json({
    data: {
      cards: apiPage.content.map(toCard),
      total: apiPage.totalElements,
    },
  });
}
