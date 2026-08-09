import { NextResponse, type NextRequest } from 'next/server';
import { getSharedDeck } from '@/lib/api/publishing';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Shared deck not found';
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Shared deck not found' } }, { status: 404 });
    }

    const data = await getSharedDeck(slug);
    return NextResponse.json({ data });
  } catch (error: unknown) {
    // Per spec: 404 for private deck or unknown slug - deliberately indistinguishable
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: errorMessage(error) } },
      { status: 404 }
    );
  }
}
