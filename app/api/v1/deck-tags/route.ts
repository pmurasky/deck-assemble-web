import { NextResponse, type NextRequest } from 'next/server';
import { getDeckTags, createDeckTag } from '@/lib/api/organization';
import { handleRouteError } from '@/lib/api/route-utils';

export async function GET() {
  try {
    const data = await getDeckTags();
    return NextResponse.json({ data });
  } catch (error) {
    return handleRouteError(error, 'Failed to fetch deck tags');
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await createDeckTag(body);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, 'Failed to create deck tag');
  }
}
