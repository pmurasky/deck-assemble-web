import { NextResponse, type NextRequest } from 'next/server';
import { getCollectionCards, addCardToCollection } from '@/lib/api/collections';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Collection request failed';
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ collectionId: string }> }
) {
  try {
    const { collectionId } = await params;
    const data = await getCollectionCards(parseInt(collectionId, 10));
    return NextResponse.json({ data });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: errorMessage(error) } },
      { status: 502 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ collectionId: string }> }
) {
  try {
    const { collectionId } = await params;
    const body: unknown = await req.json();
    if (!isAddCardRequest(body)) return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid collection card request' } }, { status: 400 });
    const data = await addCardToCollection(
      parseInt(collectionId, 10),
      body.cardPrintingId,
      body.regularQuantity,
      body.foilQuantity
    );
    return NextResponse.json({ data });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: errorMessage(error) } },
      { status: 502 }
    );
  }
}

function isAddCardRequest(value: unknown): value is { cardPrintingId: number; regularQuantity: number; foilQuantity: number } {
  return typeof value === 'object' && value !== null && 'cardPrintingId' in value
    && 'regularQuantity' in value && 'foilQuantity' in value && typeof value.cardPrintingId === 'number'
    && typeof value.regularQuantity === 'number' && typeof value.foilQuantity === 'number';
}
