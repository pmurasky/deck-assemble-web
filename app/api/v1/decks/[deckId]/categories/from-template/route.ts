import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/api/route-utils';
import { applyCategoryTemplateBackend } from '@/lib/api/decks';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params;
    const numericDeckId = parseInt(deckId, 10);
    if (isNaN(numericDeckId)) return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid deck ID' } }, { status: 400 });
    const body = await req.json();
    if (!body || typeof body.templateId !== 'number') {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'templateId is required' } }, { status: 400 });
    }
    await applyCategoryTemplateBackend(numericDeckId, body.templateId);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleRouteError(error, 'Failed to apply category template');
  }
}
