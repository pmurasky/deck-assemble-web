import { NextResponse, type NextRequest } from 'next/server';
import { restoreDeckRevision } from '@/lib/api/revisions';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Failed to restore revision';
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string; n: string }> }
) {
  try {
    const { deckId, n } = await params;
    const id = Number(deckId);
    const revN = Number(n);
    if (!Number.isSafeInteger(id) || id < 1 || !Number.isSafeInteger(revN) || revN < 1) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid deck ID or revision number' } }, { status: 400 });
    }

    const body: unknown = await req.json();
    if (typeof body !== 'object' || body === null || !('expectedCurrentRevision' in body)) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Missing expectedCurrentRevision' } }, { status: 400 });
    }

    const expectedCurrentRevision = Number((body as { expectedCurrentRevision: unknown }).expectedCurrentRevision);
    const data = await restoreDeckRevision(id, revN, expectedCurrentRevision);
    return NextResponse.json({ data });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    if (err.status === 409) {
      return NextResponse.json({ error: { code: 'CONFLICT', message: err.message } }, { status: 409 });
    }
    if (err.status === 404) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: err.message } }, { status: 404 });
    }
    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: errorMessage(error) } },
      { status: 502 }
    );
  }
}
