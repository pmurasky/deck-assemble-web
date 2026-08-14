import { NextResponse, type NextRequest } from 'next/server';
import { archiveDeck } from '@/lib/api/decks';
import { handleRouteError } from '@/lib/api/route-utils';

export async function POST(
  _: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params;
    const data = await archiveDeck(Number(deckId));
    return NextResponse.json({ data });
  } catch (error) {
    return handleRouteError(error, 'Failed to archive deck');
  }
}
