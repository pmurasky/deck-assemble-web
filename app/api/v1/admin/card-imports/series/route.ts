import { NextResponse } from 'next/server';
import { fetchAvailableSeries } from '@/lib/api/imports';

export async function GET() {
  try {
    const series = await fetchAvailableSeries();
    return NextResponse.json({ data: series });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch available series';
    const statusMatch = message.match(/\b(401|403|400|404|500)\b/);
    const status = statusMatch ? parseInt(statusMatch[0], 10) : 502;
    return NextResponse.json({ error: { message } }, { status });
  }
}
