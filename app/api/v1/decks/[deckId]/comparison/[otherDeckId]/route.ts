import { NextRequest, NextResponse } from 'next/server';
import { getDeckComparisonBackend } from '@/lib/api/decks';
import { handleRouteError } from '@/lib/api/route-utils';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ deckId: string; otherDeckId: string }> }
) {
  try {
    const { deckId, otherDeckId } = await context.params;
    const data = await getDeckComparisonBackend(Number(deckId), Number(otherDeckId));
    return NextResponse.json({ data });
  } catch (error: unknown) {
    return handleRouteError(error, 'Deck comparison request failed');
  }
}
