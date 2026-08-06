import { NextResponse, type NextRequest } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { handleRouteError } from '@/lib/api/route-utils';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080';

export async function POST(req: NextRequest) {
  try {
    const token = await auth0.getAccessToken();
    const body = await req.json();
    const idempotencyKey = req.headers.get('Idempotency-Key') || req.headers.get('idempotency-key');

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token.token}`,
      'Content-Type': 'application/json',
    };
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    const url = new URL('/api/v1/collections/import/commit', API_BASE_URL);
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      const msg = errJson?.error?.message || errJson?.message || 'Collection import commit failed';
      return NextResponse.json({ error: { code: 'COMMIT_FAILED', message: msg } }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    return handleRouteError(error, 'Collection import commit failed');
  }
}
