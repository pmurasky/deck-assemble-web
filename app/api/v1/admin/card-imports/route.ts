import { NextResponse } from 'next/server';
import { fetchImportRuns } from '@/lib/api/imports';

export async function GET() {
  try {
    const runs = await fetchImportRuns();
    return NextResponse.json({ data: runs });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch import history';
    return NextResponse.json({ error: { message } }, { status: 502 });
  }
}
