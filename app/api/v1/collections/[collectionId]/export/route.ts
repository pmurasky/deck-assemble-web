import { NextResponse, type NextRequest } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { handleRouteError } from '@/lib/api/route-utils';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080';

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ collectionId: string }> }
) {
  try {
    const { collectionId } = await params;
    const token = await auth0.getAccessToken();

    const url = new URL(`/api/v1/collections/${collectionId}/export`, API_BASE_URL);

    const backendRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token.token}`,
      },
    });

    if (!backendRes.ok) {
      const errJson = await backendRes.json().catch(() => null);
      const msg = errJson?.error?.message || errJson?.message || 'Collection export failed';
      return NextResponse.json({ error: { code: 'EXPORT_FAILED', message: msg } }, { status: backendRes.status });
    }

    const headers = new Headers();
    const contentType = backendRes.headers.get('content-type') || 'text/csv';
    const contentDisposition = backendRes.headers.get('content-disposition') || `attachment; filename="collection_${collectionId}.csv"`;
    headers.set('content-type', contentType);
    headers.set('content-disposition', contentDisposition);

    return new NextResponse(backendRes.body, {
      status: 200,
      headers,
    });
  } catch (error: unknown) {
    return handleRouteError(error, 'Export collection failed');
  }
}
