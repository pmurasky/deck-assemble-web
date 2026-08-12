import { NextResponse, type NextRequest } from 'next/server';
import { getDeckFolders, createDeckFolder } from '@/lib/api/organization';
import { handleRouteError } from '@/lib/api/route-utils';

export async function GET() {
  try {
    const data = await getDeckFolders();
    return NextResponse.json({ data });
  } catch (error) {
    return handleRouteError(error, 'Failed to fetch deck folders');
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await createDeckFolder(body);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, 'Failed to create deck folder');
  }
}
