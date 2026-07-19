import { NextRequest, NextResponse } from 'next/server';
import { fetchCardById } from '@/lib/api/catalog';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const { cardId } = await params;

  try {
    const card = await fetchCardById(cardId);
    if (!card) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Card not found' } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: card });
  } catch {
    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: 'Card catalog unavailable' } },
      { status: 502 }
    );
  }
}
