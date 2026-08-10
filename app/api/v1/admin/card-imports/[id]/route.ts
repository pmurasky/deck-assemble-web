import { NextRequest, NextResponse } from 'next/server';
import { fetchImportRunStatus } from '@/lib/api/imports';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const run = await fetchImportRunStatus(id);
    return NextResponse.json({ data: run });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch import run status';
    const statusMatch = message.match(/\b(401|403|400|404|500)\b/);
    const status = statusMatch ? parseInt(statusMatch[0], 10) : 502;
    return NextResponse.json({ error: { message } }, { status });
  }
}
