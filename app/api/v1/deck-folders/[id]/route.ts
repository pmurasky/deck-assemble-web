import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/api/route-utils';
import { deleteDeckFolderBackend, updateDeckFolderBackend } from '@/lib/api/decks';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid ID' } }, { status: 400 });
    const body = await req.json();
    const data = await updateDeckFolderBackend(numericId, body);
    return NextResponse.json({ data });
  } catch (error) {
    return handleRouteError(error, 'Failed to update deck folder');
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
    await deleteDeckFolderBackend(numericId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleRouteError(error, 'Failed to delete deck folder');
  }
}
