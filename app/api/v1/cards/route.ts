import { NextRequest, NextResponse } from 'next/server';
import { fetchCards } from '@/lib/api/catalog';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const pageRaw = parseInt(searchParams.get('page') || '0', 10);
  const page = searchParams.has('limit') && pageRaw > 0 ? pageRaw - 1 : Math.max(pageRaw, 0);
  const size = parseInt(searchParams.get('limit') || searchParams.get('size') || '50', 10);
  const query = searchParams.get('query') ?? searchParams.get('q') ?? '';
  const type = searchParams.get('type') ?? '';
  const setCode = searchParams.get('setCode') ?? '';
  const colorIdentity = searchParams.get('colorIdentity') ?? '';
  const sort = searchParams.get('sort') ?? '';

  try {
    const data = await fetchCards({ query, page, size, type, setCode, colorIdentity, sort });
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: 'Card catalog unavailable' } },
      { status: 502 }
    );
  }
}

