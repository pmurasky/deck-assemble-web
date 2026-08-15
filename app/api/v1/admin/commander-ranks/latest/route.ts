import { NextResponse } from 'next/server';
import { fetchLatestCommanderRankRun } from '@/lib/api/commander-ranks';

export async function GET() {
  try {
    const latest = await fetchLatestCommanderRankRun();
    return NextResponse.json({ data: latest });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch latest commander rank run';
    const statusMatch = message.match(/\b(401|403|400|404|500)\b/);
    const status = statusMatch ? parseInt(statusMatch[0], 10) : 502;
    return NextResponse.json({ error: { message } }, { status });
  }
}
