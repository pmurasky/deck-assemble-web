import { NextResponse, type NextRequest } from 'next/server';
import { getDeckLegality } from '@/lib/api/decks';
import { handleRouteError } from '@/lib/api/route-utils';

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params;
    const data = await getDeckLegality(Number(deckId));
    return NextResponse.json({ data });
  } catch (error) {
    return handleRouteError(error, 'Failed to fetch deck legality');
  }
}
