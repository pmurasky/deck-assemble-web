import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/api/route-utils';
import { createDeckFolderBackend, getDeckFoldersBackend } from '@/lib/api/decks';

export async function GET() {
  try {
    const data = await getDeckFoldersBackend();
    return NextResponse.json({ data });
  } catch (error) {
    return handleRouteError(error, 'Failed to fetch deck folders');
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Folder name is required' } }, { status: 400 });
    }
    const data = await createDeckFolderBackend(body);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, 'Failed to create deck folder');
  }
}
