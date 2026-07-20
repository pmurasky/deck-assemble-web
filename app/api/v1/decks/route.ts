import { NextResponse, type NextRequest } from 'next/server';
import { getDecks, createDeck } from '@/lib/api/decks';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Deck request failed';
}

export async function GET() {
  try {
    const data = await getDecks();
    return NextResponse.json({ data });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: errorMessage(error) } },
      { status: 502 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    if (!isCreateRequest(body)) return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid deck request' } }, { status: 400 });
    const data = await createDeck(body.name, body.formatCode);
    return NextResponse.json({ data });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: errorMessage(error) } },
      { status: 502 }
    );
  }
}

function isCreateRequest(value: unknown): value is { name: string; formatCode: string } {
  return typeof value === 'object' && value !== null && 'name' in value && 'formatCode' in value
    && typeof value.name === 'string' && typeof value.formatCode === 'string';
}
