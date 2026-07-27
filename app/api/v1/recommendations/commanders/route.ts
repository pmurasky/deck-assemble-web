import { NextRequest, NextResponse } from 'next/server';
import { getBackendCommanderSuggestions } from '@/lib/api/recommendations';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Commander recommendations request failed';
}

export async function GET(req: NextRequest) {
  try {
    const queryString = req.nextUrl.searchParams.toString();
    const data = await getBackendCommanderSuggestions(queryString);
    return NextResponse.json({ data });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: errorMessage(error) } },
      { status: 502 }
    );
  }
}
