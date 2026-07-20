import { NextResponse, type NextRequest } from 'next/server';
import {
  addCardToDeck,
  type DeckSection,
  getDeckCards,
} from '@/lib/api/decks';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Deck card request failed';
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params;
    const numericDeckId = parseDeckId(deckId);
    if (numericDeckId === null) return invalidDeckId();
    const data = await getDeckCards(numericDeckId);
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
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params;
    const numericDeckId = parseDeckId(deckId);
    if (numericDeckId === null) return invalidDeckId();
    const body: unknown = await req.json();
    if (!isAddCardRequest(body)) return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid deck card request' } }, { status: 400 });
    const data = await addCardToDeck(
      numericDeckId,
      body.cardPrintingId,
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

function invalidDeckId() {
  return NextResponse.json(
    { error: { code: 'VALIDATION_ERROR', message: 'Invalid deck ID' } },
    { status: 400 }
  );
}

function parseDeckId(value: string) {
  const deckId = Number(value);
  return Number.isSafeInteger(deckId) && deckId > 0 ? deckId : null;
}

function isAddCardRequest(value: unknown): value is {
  cardPrintingId: number;
  quantity: number;
  deckSection: DeckSection;
} {
  if (typeof value !== 'object' || value === null) return false;
  if (!('cardPrintingId' in value) || !('quantity' in value) || !('deckSection' in value)) return false;
  return typeof value.cardPrintingId === 'number'
    && Number.isSafeInteger(value.cardPrintingId)
    && value.cardPrintingId > 0
    && typeof value.quantity === 'number'
    && Number.isSafeInteger(value.quantity)
    && value.quantity > 0
    && isDeckSection(value.deckSection);
}

function isDeckSection(value: unknown): value is DeckSection {
  return value === 'COMMANDER' || value === 'MAIN_DECK' || value === 'SIDEBOARD'
    || value === 'COMPANION' || value === 'MAYBE_BOARD';
}
