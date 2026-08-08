import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/api/route-utils';
import { bulkReplaceCategoryCardsBackend } from '@/lib/api/decks';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string; categoryId: string }> }
) {
  try {
    const { deckId, categoryId } = await params;
    const numericDeckId = parseInt(deckId, 10);
    const numericCategoryId = parseInt(categoryId, 10);
    if (isNaN(numericDeckId) || isNaN(numericCategoryId)) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid ID parameters' } }, { status: 400 });
    }
    const body = await req.json();
    if (!body || !Array.isArray(body.cardPrintingIds)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'cardPrintingIds array is required' } },
        { status: 400 }
      );
    }
    await bulkReplaceCategoryCardsBackend(numericDeckId, numericCategoryId, body.cardPrintingIds);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleRouteError(error, 'Failed to bulk replace category cards');
  }
}
