import { NextResponse, type NextRequest } from 'next/server';
import { setDeckPrimer } from '@/lib/api/publishing';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Failed to set primer';
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params;
    const id = Number(deckId);
    if (!Number.isSafeInteger(id) || id < 1) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid deck ID' } }, { status: 400 });
    }

    const body = (await req.json()) as { title?: string; content?: string };
    if (typeof body.content !== 'string') {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Content is required' } }, { status: 400 });
    }
    if (body.title && body.title.length > 200) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Title exceeds 200 characters' } }, { status: 400 });
    }
    if (body.content.length > 20000) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Content exceeds 20,000 characters' } }, { status: 400 });
    }

    const data = await setDeckPrimer(id, body.content, body.title);
    return NextResponse.json({ data });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: errorMessage(error) } },
      { status: 502 }
    );
  }
}
