import { NextResponse } from 'next/server';
import { triggerOracleTagsImport } from '@/lib/api/imports';

export async function POST() {
  try {
    const result = await triggerOracleTagsImport();
    return NextResponse.json({ data: result }, { status: 202 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to trigger oracle tags import';
    const statusMatch = message.match(/\b(401|403|400|404|500)\b/);
    const status = statusMatch ? parseInt(statusMatch[0], 10) : 502;
    return NextResponse.json({ error: { message } }, { status });
  }
}
