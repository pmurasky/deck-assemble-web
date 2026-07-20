import { NextResponse, type NextRequest } from 'next/server';
import { getDeck, updateDeck, deleteDeck } from '@/lib/api/decks';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Deck request failed';
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const data = await getDeck(await deckIdFrom(params));
    return NextResponse.json({ data });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: errorMessage(error) } },
      { status: 502 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const body: unknown = await req.json();
    if (!isUpdateRequest(body)) return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid deck update request' } }, { status: 400 });
    const data = await updateDeck(
      await deckIdFrom(params),
      body.name,
      body.formatCode,
      body.commanderCardId
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
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    await deleteDeck(await deckIdFrom(params));
    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: errorMessage(error) } },
      { status: 502 }
    );
  }
}

async function deckIdFrom(params: Promise<{ deckId: string }>): Promise<number> {
  const { deckId } = await params;
  const id = Number(deckId);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new Error('Invalid deck ID');
  }
  return id;
}

function isUpdateRequest(value: unknown): value is { name?: string; formatCode?: string; commanderCardId?: number | null } {
  if (!isRecord(value)) return false;
  if (value.name !== undefined && typeof value.name !== 'string') return false;
  if (value.formatCode !== undefined && typeof value.formatCode !== 'string') return false;
  if (value.commanderCardId !== undefined && value.commanderCardId !== null
      && (typeof value.commanderCardId !== 'number'
        || !Number.isSafeInteger(value.commanderCardId)
        || value.commanderCardId < 1)) return false;
  return true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
