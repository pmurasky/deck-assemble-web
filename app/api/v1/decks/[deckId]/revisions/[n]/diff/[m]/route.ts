import { NextResponse, type NextRequest } from 'next/server';
import { getDeckRevisionDiff } from '@/lib/api/revisions';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Failed to fetch revision diff';
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ deckId: string; n: string; m: string }> }
) {
  try {
    const { deckId, n, m } = await params;
    const id = Number(deckId);
    const revN = Number(n);
    const revM = Number(m);
    if (
      !Number.isSafeInteger(id) || id < 1 ||
      !Number.isSafeInteger(revN) || revN < 1 ||
      !Number.isSafeInteger(revM) || revM < 1
    ) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid arguments' } }, { status: 400 });
    }

    const data = await getDeckRevisionDiff(id, revN, revM);
    return NextResponse.json({ data });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: errorMessage(error) } },
      { status: 502 }
    );
  }
}
