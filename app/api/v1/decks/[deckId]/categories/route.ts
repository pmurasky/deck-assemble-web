import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/api/route-utils';
import { createDeckCategoryBackend, getDeckCategoriesBackend } from '@/lib/api/decks';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params;
    const numericDeckId = parseInt(deckId, 10);
    if (isNaN(numericDeckId)) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid deck ID' } }, { status: 400 });
    }
    const data = await getDeckCategoriesBackend(numericDeckId);
    return NextResponse.json({ data });
  } catch (error) {
    return handleRouteError(error, 'Failed to fetch deck categories');
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params;
    const numericDeckId = parseInt(deckId, 10);
    if (isNaN(numericDeckId)) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid deck ID' } }, { status: 400 });
    }
    const body = await req.json();
    if (!body || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Category name is required' } }, { status: 400 });
    }
    const data = await createDeckCategoryBackend(numericDeckId, body);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, 'Failed to create deck category');
  }
}
