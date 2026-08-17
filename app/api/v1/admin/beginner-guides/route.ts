import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080';

export async function GET(req: NextRequest) {
  try {
    const token = await auth0.getAccessToken();
    const { searchParams } = req.nextUrl;
    const url = new URL('/api/v1/admin/beginner-guides', API_BASE_URL);
    searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });

    const res = await fetch(url, {
      cache: 'no-store',
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
    const message = error instanceof Error ? error.message : 'Failed to fetch beginner guides';
    return NextResponse.json({ error: { message } }, { status: 502 });
  }
}
