import { NextResponse, type NextRequest } from 'next/server';
import { updateDeckCard, removeDeckCard, type DeckSection } from '@/lib/api/decks';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Deck card request failed';
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string; deckCardId: string }> }
) {
  try {
    const { deckId, deckCardId } = await params;
    const body: unknown = await req.json();
    if (!isUpdateCardRequest(body)) return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid deck card update request' } }, { status: 400 });
    const data = await updateDeckCard(
      parseInt(deckId, 10),
      parseInt(deckCardId, 10),
      body.quantity,
      body.deckSection
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
  { params }: { params: Promise<{ deckId: string; deckCardId: string }> }
) {
  try {
    const { deckId, deckCardId } = await params;
    await removeDeckCard(parseInt(deckId, 10), parseInt(deckCardId, 10));
    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: errorMessage(error) } },
      { status: 502 }
    );
  }
}

function isUpdateCardRequest(value: unknown): value is { quantity: number; deckSection: DeckSection } {
  if (!isRecord(value)) return false;
  return typeof value.quantity === 'number'
    && Number.isSafeInteger(value.quantity)
    && value.quantity > 0
    && isDeckSection(value.deckSection);
}

function isDeckSection(value: unknown): value is DeckSection {
  return value === 'COMMANDER' || value === 'MAIN_DECK' || value === 'SIDEBOARD'
    || value === 'COMPANION' || value === 'MAYBE_BOARD';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
