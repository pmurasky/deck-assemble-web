import { NextResponse, type NextRequest } from 'next/server';
import { getDeckRevision } from '@/lib/api/revisions';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Failed to fetch revision detail';
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ deckId: string; n: string }> }
) {
  try {
    const { deckId, n } = await params;
    const id = Number(deckId);
    const revN = Number(n);
    if (!Number.isSafeInteger(id) || id < 1 || !Number.isSafeInteger(revN) || revN < 1) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid deck ID or revision number' } }, { status: 400 });
    }

    const data = await getDeckRevision(id, revN);
    return NextResponse.json({ data });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: errorMessage(error) } },
      { status: 502 }
    );
  }
}
