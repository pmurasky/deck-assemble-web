import { NextResponse } from 'next/server';
import { triggerCommanderRankRefresh } from '@/lib/api/commander-ranks';

export async function POST() {
  try {
    const result = await triggerCommanderRankRefresh();
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to trigger commander rank refresh';
    const statusMatch = message.match(/\b(401|403|400|404|500|502)\b/);
    const status = statusMatch ? parseInt(statusMatch[0], 10) : 502;
    return NextResponse.json({ error: { message } }, { status });
  }
}
