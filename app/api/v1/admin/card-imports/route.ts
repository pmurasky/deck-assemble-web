import { NextRequest, NextResponse } from 'next/server';
import { fetchImportRuns, triggerImport } from '@/lib/api/imports';

export async function GET() {
  try {
    const runs = await fetchImportRuns();
    return NextResponse.json({ data: runs });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch import history';
    return NextResponse.json({ error: { message } }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('query')?.trim() ?? '';
    if (!query) {
      return NextResponse.json(
        { error: { message: 'Query parameter is required' } },
        { status: 400 }
      );
    }
    const result = await triggerImport(query);
    return NextResponse.json({ data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to trigger import';
    return NextResponse.json({ error: { message } }, { status: 502 });
  }
}

