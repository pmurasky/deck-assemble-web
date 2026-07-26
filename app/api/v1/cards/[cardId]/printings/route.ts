import { NextResponse } from 'next/server';
import { fetchCardPrintings } from '@/lib/api/catalog';

export async function GET(_: Request, { params }: { params: Promise<{ cardId: string }> }) {
  const { cardId } = await params;

  try {
    const printings = await fetchCardPrintings(cardId);
    if (!printings) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Card not found' } },
        { status: 404 },
      );
    }
    return NextResponse.json({ data: printings });
  } catch {
    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: 'Card printings unavailable' } },
      { status: 502 },
    );
  }
}
