import { NextResponse, type NextRequest } from 'next/server';
import { acquireDeckCard } from '@/lib/api/decks';
import { handleRouteError } from '@/lib/api/route-utils';

export async function POST(
  _: NextRequest,
  { params }: { params: Promise<{ deckId: string; deckCardId: string }> }
) {
  try {
    const { deckId, deckCardId } = await params;
    const data = await acquireDeckCard(Number(deckId), Number(deckCardId));
    return NextResponse.json({ data });
  } catch (error) {
    return handleRouteError(error, 'Failed to acquire deck card');
  }
}
