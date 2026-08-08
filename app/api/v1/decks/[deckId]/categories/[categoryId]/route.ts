import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/api/route-utils';
import { deleteDeckCategoryBackend, updateDeckCategoryBackend } from '@/lib/api/decks';

export async function PATCH(
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
    const data = await updateDeckCategoryBackend(numericDeckId, numericCategoryId, body);
    return NextResponse.json({ data });
  } catch (error) {
    return handleRouteError(error, 'Failed to update deck category');
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ deckId: string; categoryId: string }> }
) {
  try {
    const { deckId, categoryId } = await params;
    const numericDeckId = parseInt(deckId, 10);
    const numericCategoryId = parseInt(categoryId, 10);
    if (isNaN(numericDeckId) || isNaN(numericCategoryId)) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid ID parameters' } }, { status: 400 });
    }
    await deleteDeckCategoryBackend(numericDeckId, numericCategoryId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleRouteError(error, 'Failed to delete deck category');
  }
}
