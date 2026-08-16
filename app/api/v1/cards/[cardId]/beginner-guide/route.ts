import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const { cardId } = await params;
  const face = req.nextUrl.searchParams.get('face');
  const url = new URL(`/api/v1/cards/${encodeURIComponent(cardId)}/beginner-guide`, API_BASE_URL);
  if (face !== null) {
    url.searchParams.set('face', face);
  }

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (res.status === 404) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'No beginner guide found for card' } },
        { status: 404 }
      );
    }
    if (!res.ok) {
      return NextResponse.json(
        { error: { code: 'UPSTREAM_ERROR', message: `Upstream returned ${res.status}` } },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Beginner guide service unavailable' } },
      { status: 503 }
    );
  }
}
