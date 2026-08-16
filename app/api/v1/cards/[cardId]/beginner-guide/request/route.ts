import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const { cardId } = await params;
  const face = req.nextUrl.searchParams.get('face');
  const url = new URL(`/api/v1/cards/${encodeURIComponent(cardId)}/beginner-guide/request`, API_BASE_URL);
  if (face !== null) {
    url.searchParams.set('face', face);
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.status === 429) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Daily generation limit reached' } },
        { status: 429 }
      );
    }
    if (!res.ok) {
      return NextResponse.json(
        { error: { code: 'UPSTREAM_ERROR', message: `Request failed with status ${res.status}` } },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json({ data }, { status: 202 });
  } catch {
    return NextResponse.json(
      { error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Beginner guide service unavailable' } },
      { status: 503 }
    );
  }
}
