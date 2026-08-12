import { NextResponse, type NextRequest } from 'next/server';
import { getNotifications } from '@/lib/api/notifications';
import { handleRouteError } from '@/lib/api/route-utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') ?? '0');
    const size = Number(searchParams.get('size') ?? '20');
    const data = await getNotifications(page, size);
    return NextResponse.json({ data });
  } catch (error) {
    return handleRouteError(error, 'Failed to fetch notifications');
  }
}
