import { NextResponse, type NextRequest } from 'next/server';
import { duplicateDeck } from '@/lib/api/decks';
import { handleRouteError } from '@/lib/api/route-utils';

export async function POST(
  _: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params;
    const data = await duplicateDeck(Number(deckId));
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, 'Failed to duplicate deck');
  }
}
