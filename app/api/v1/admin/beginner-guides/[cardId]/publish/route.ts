import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const { cardId } = await params;
    const token = await auth0.getAccessToken();

    const url = new URL(`/api/v1/admin/beginner-guides/${encodeURIComponent(cardId)}/publish`, API_BASE_URL);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.token}`,
      },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      return NextResponse.json(
        { error: { message: errData?.message || `Upstream returned ${res.status}` } },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to publish beginner guide';
    return NextResponse.json({ error: { message } }, { status: 502 });
  }
}
