import { NextRequest, NextResponse } from 'next/server';
import { fetchCards } from '@/lib/api/catalog';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10) - 1, 0);
  const size = parseInt(searchParams.get('limit') || '50', 10);
  const query = searchParams.get('q') ?? '';

  try {
    const data = await fetchCards({ query, page, size });
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: 'Card catalog unavailable' } },
      { status: 502 }
    );
  }
}
