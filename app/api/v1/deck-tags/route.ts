import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/api/route-utils';
import { createDeckTagBackend, getDeckTagsBackend } from '@/lib/api/decks';

export async function GET() {
  try {
    const data = await getDeckTagsBackend();
    return NextResponse.json({ data });
  } catch (error) {
    return handleRouteError(error, 'Failed to fetch deck tags');
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Tag name is required' } }, { status: 400 });
    }
    const data = await createDeckTagBackend(body);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, 'Failed to create deck tag');
  }
}
