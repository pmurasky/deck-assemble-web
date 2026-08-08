import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/api/route-utils';
import { setDeckTagsBackend } from '@/lib/api/decks';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params;
    const numericDeckId = parseInt(deckId, 10);
    if (isNaN(numericDeckId)) return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid deck ID' } }, { status: 400 });
    const body = await req.json();
    if (!body || !Array.isArray(body.tagIds)) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'tagIds array is required' } }, { status: 400 });
    }
    await setDeckTagsBackend(numericDeckId, body.tagIds);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleRouteError(error, 'Failed to set deck tags');
  }
}
