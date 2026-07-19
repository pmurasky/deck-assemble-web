import { NextResponse } from 'next/server';
import { fetchLatestImport } from '@/lib/api/imports';

export async function GET() {
  try {
    const latest = await fetchLatestImport();
    return NextResponse.json({ data: latest });
  } catch {
    return NextResponse.json({ error: { message: 'Failed to fetch import status' } }, { status: 502 });
  }
}
