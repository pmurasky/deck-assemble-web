import { NextResponse, type NextRequest } from 'next/server';
import { getDeckRevisions } from '@/lib/api/revisions';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Failed to fetch revisions';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params;
    const id = Number(deckId);
    if (!Number.isSafeInteger(id) || id < 1) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid deck ID' } }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') ?? '1');
    const size = Number(searchParams.get('size') ?? '20');

    const data = await getDeckRevisions(id, page, size);
    return NextResponse.json({ data });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: errorMessage(error) } },
      { status: 502 }
    );
  }
}
