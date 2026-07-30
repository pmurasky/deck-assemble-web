import { NextRequest, NextResponse } from 'next/server';
import { getBackendCommanderSuggestions } from '@/lib/api/recommendations';
import { handleRouteError } from '@/lib/api/route-utils';

export async function GET(req: NextRequest) {
  try {
    const queryString = req.nextUrl.searchParams.toString();
    const data = await getBackendCommanderSuggestions(queryString);
    return NextResponse.json({ data });
  } catch (error: unknown) {
    return handleRouteError(error, 'Commander recommendations request failed');
  }
}
