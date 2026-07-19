import { NextResponse, type NextRequest } from 'next/server';
import { updateCollectionCard, removeCollectionCard } from '@/lib/api/collections';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Collection request failed';
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ collectionId: string; collectionCardId: string }> }
) {
  try {
    const { collectionId, collectionCardId } = await params;
    const body: unknown = await req.json();
    if (!isUpdateRequest(body)) return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid quantity request' } }, { status: 400 });
    const data = await updateCollectionCard(
      parseInt(collectionId, 10),
      parseInt(collectionCardId, 10),
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ collectionId: string; collectionCardId: string }> }
) {
  try {
    const { collectionId, collectionCardId } = await params;
    await removeCollectionCard(
      parseInt(collectionId, 10),
      parseInt(collectionCardId, 10)
    );
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: errorMessage(error) } },
      { status: 502 }
    );
  }
}

function isUpdateRequest(value: unknown): value is { regularQuantity: number; foilQuantity: number } {
  return typeof value === 'object' && value !== null && 'regularQuantity' in value && 'foilQuantity' in value
    && typeof value.regularQuantity === 'number' && typeof value.foilQuantity === 'number';
}
