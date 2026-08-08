import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/api/route-utils';
import { deleteCategoryTemplateBackend, updateCategoryTemplateBackend } from '@/lib/api/decks';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid ID' } }, { status: 400 });
    const body = await req.json();
    const data = await updateCategoryTemplateBackend(numericId, body);
    return NextResponse.json({ data });
  } catch (error) {
    return handleRouteError(error, 'Failed to update category template');
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid ID' } }, { status: 400 });
    await deleteCategoryTemplateBackend(numericId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleRouteError(error, 'Failed to delete category template');
  }
}
