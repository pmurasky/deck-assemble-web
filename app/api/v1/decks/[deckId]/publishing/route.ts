import { NextResponse, type NextRequest } from 'next/server';
import { updateDeckVisibility } from '@/lib/api/publishing';
import type { DeckVisibility } from '@/types/m3';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Failed to update visibility';
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params;
    const id = Number(deckId);
    if (!Number.isSafeInteger(id) || id < 1) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid deck ID' } }, { status: 400 });
    }

    const body = (await req.json()) as { visibility?: DeckVisibility };
    if (!body.visibility || !['PRIVATE', 'UNLISTED', 'PUBLIC'].includes(body.visibility)) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid visibility value' } }, { status: 400 });
    }

    const data = await updateDeckVisibility(id, body.visibility);
    return NextResponse.json({ data });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: errorMessage(error) } },
      { status: 502 }
    );
  }
}
