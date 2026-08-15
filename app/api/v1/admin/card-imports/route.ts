import { NextRequest, NextResponse } from 'next/server';
import { fetchImportRuns, triggerImport } from '@/lib/api/imports';

export async function GET() {
  try {
    const runs = await fetchImportRuns();
    return NextResponse.json({ data: runs });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch import history';
    const statusMatch = message.match(/\b(401|403|400|404|500)\b/);
    const status = statusMatch ? parseInt(statusMatch[0], 10) : 502;
    return NextResponse.json({ error: { message } }, { status });
  }
}

async function extractSeriesOrQuery(request: NextRequest): Promise<string | string[] | null> {
  const seriesParam = request.nextUrl.searchParams.get('seriesKeys');
  if (seriesParam) {
    const keys = seriesParam.split(',').map((s) => s.trim()).filter(Boolean);
    if (keys.length > 0) return keys;
  }
  const queryParam = request.nextUrl.searchParams.get('query')?.trim();
  if (queryParam) return queryParam;

  const body = await request.json().catch(() => null);
  if (body?.seriesKeys) {
    const keys = Array.isArray(body.seriesKeys) ? body.seriesKeys : [body.seriesKeys];
    const filtered = keys.map((s: unknown) => String(s).trim()).filter(Boolean);
    if (filtered.length > 0) return filtered;
  }
  if (typeof body?.query === 'string' && body.query.trim()) {
    return body.query.trim();
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const input = await extractSeriesOrQuery(request);
    if (!input || (Array.isArray(input) && input.length === 0)) {
      return NextResponse.json(
        { error: { message: 'Series keys or query parameter is required' } },
        { status: 400 }
      );
    }
    const result = await triggerImport(input);
    return NextResponse.json({ data: result }, { status: 202 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to trigger import';
    const statusMatch = message.match(/\b(401|403|400|404|500)\b/);
    const status = statusMatch ? parseInt(statusMatch[0], 10) : 502;
    return NextResponse.json({ error: { message } }, { status });
  }
}
