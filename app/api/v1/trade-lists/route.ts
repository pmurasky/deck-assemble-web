import { NextResponse, type NextRequest } from 'next/server';
import { getTradeLists, createTradeList } from '@/lib/api/trade-lists';
import { handleRouteError } from '@/lib/api/route-utils';

export async function GET() {
  try {
    const data = await getTradeLists();
    return NextResponse.json({ data });
  } catch (error) {
    return handleRouteError(error, 'Failed to fetch trade lists');
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !Array.isArray(body.items)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'items array is required' } },
        { status: 400 }
      );
    }
    const data = await createTradeList(body);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, 'Failed to create trade list');
  }
}
