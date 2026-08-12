import { NextResponse, type NextRequest } from 'next/server';
import { matchTradeLists } from '@/lib/api/trade-lists';
import { handleRouteError } from '@/lib/api/route-utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const leftListId = Number(searchParams.get('leftListId'));
    const rightListId = Number(searchParams.get('rightListId'));

    if (!leftListId || !rightListId) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'leftListId and rightListId query parameters are required' } },
        { status: 400 }
      );
    }

    const data = await matchTradeLists(leftListId, rightListId);
    return NextResponse.json({ data });
  } catch (error) {
    return handleRouteError(error, 'Failed to match trade lists');
  }
}
