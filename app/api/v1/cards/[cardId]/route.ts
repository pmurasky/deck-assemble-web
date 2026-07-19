import { NextRequest, NextResponse } from 'next/server';
import { Card } from '@/types/card';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080';

interface ApiCardDetail {
  id: number;
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const { cardId } = await params;

  const res = await fetch(`${API_BASE_URL}/api/v1/cards/${cardId}`, {
    next: { revalidate: 300 },
  });

  if (res.status === 404) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Card not found' } },
      { status: 404 }
    );
  }
  if (!res.ok) {
    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: 'Card catalog unavailable' } },
      { status: 502 }
    );
  }

  const detail: ApiCardDetail = await res.json();
  const card: Card = {
    id: String(detail.id),
    oracleId: detail.oracleId,
    name: detail.name,
    imageUrl: detail.imageUrl,
    manaCost: detail.manaCost,
    manaValue: detail.manaValue ?? 0,
    colors: detail.colors?.split(',').filter(Boolean) ?? [],
    colorIdentity: detail.colorIdentity?.split(',').filter(Boolean) ?? [],
    typeLine: detail.typeLine ?? '',
    oracleText: detail.oracleText,
    flavorText: detail.flavorText,
    power: detail.power,
    toughness: detail.toughness,
    loyalty: detail.loyalty,
    setCode: detail.setCode ?? '',
    setName: detail.setName ?? '',
    rarity: detail.rarity ?? '',
    legalities: {},
  };

  return NextResponse.json({ data: card });
}
