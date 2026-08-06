import { NextResponse, type NextRequest } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { handleRouteError } from '@/lib/api/route-utils';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080';

export async function POST(req: NextRequest) {
  try {
    const token = await auth0.getAccessToken();
    const formData = await req.formData();

    const url = new URL('/api/v1/decks/import/preview', API_BASE_URL);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      const msg = errJson?.error?.message || errJson?.message || 'Import preview failed';
      return NextResponse.json({ error: { code: 'PREVIEW_FAILED', message: msg } }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    return handleRouteError(error, 'Import preview failed');
  }
}
