import { NextResponse, type NextRequest } from 'next/server';
import { getDeckCardAlternatives } from '@/lib/api/decks';
import { handleRouteError } from '@/lib/api/route-utils';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string; deckCardId: string }> }
) {
  try {
    const { deckId, deckCardId } = await params;
    const url = new URL(req.url);
    const limit = url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : undefined;
    const ownedFirst = url.searchParams.get('ownedFirst') !== null
      ? url.searchParams.get('ownedFirst') === 'true'
      : undefined;

    const data = await getDeckCardAlternatives(Number(deckId), Number(deckCardId), limit, ownedFirst);
    return NextResponse.json({ data });
  } catch (error) {
    return handleRouteError(error, 'Failed to fetch deck card alternatives');
  }
}
