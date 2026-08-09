import { NextResponse, type NextRequest } from 'next/server';
import { forkSharedDeck } from '@/lib/api/publishing';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Failed to fork deck';
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Shared deck not found' } }, { status: 404 });
    }

    const data = await forkSharedDeck(slug);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    if (err.status === 404) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Deck not found or not published' } }, { status: 404 });
    }
    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: errorMessage(error) } },
      { status: 502 }
    );
  }
}
