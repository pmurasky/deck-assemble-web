import { NextResponse, type NextRequest } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { handleRouteError } from '@/lib/api/route-utils';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080';

export async function GET(req: NextRequest) {
  try {
    const token = await auth0.getAccessToken();
    const importToken = req.nextUrl.searchParams.get('token') ?? '';

    const url = new URL('/api/v1/collections/import/errors', API_BASE_URL);
    if (importToken) url.searchParams.set('token', importToken);

    const backendRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token.token}`,
      },
    });

    if (!backendRes.ok) {
      const errJson = await backendRes.json().catch(() => null);
      const msg = errJson?.error?.message || errJson?.message || 'Download collection import errors failed';
      return NextResponse.json({ error: { code: 'ERRORS_DOWNLOAD_FAILED', message: msg } }, { status: backendRes.status });
    }

    const headers = new Headers();
    headers.set('content-type', backendRes.headers.get('content-type') || 'text/csv');
    headers.set('content-disposition', backendRes.headers.get('content-disposition') || 'attachment; filename="collection_import_errors.csv"');

    return new NextResponse(backendRes.body, { status: 200, headers });
  } catch (error: unknown) {
    return handleRouteError(error, 'Collection import errors download failed');
  }
}
