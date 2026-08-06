import { NextResponse, type NextRequest } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { handleRouteError } from '@/lib/api/route-utils';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080';

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params;
    const token = await auth0.getAccessToken();

    const url = new URL(`/api/v1/decks/${deckId}/analysis`, API_BASE_URL);
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token.token}`,
      },
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      const msg = errJson?.error?.message || errJson?.message || 'Deck analysis failed';
      return NextResponse.json({ error: { code: 'ANALYSIS_FAILED', message: msg } }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    return handleRouteError(error, 'Deck analysis failed');
  }
}
