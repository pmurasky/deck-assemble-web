import { NextResponse, type NextRequest } from 'next/server';
import { getCategoryTemplates, createCategoryTemplate } from '@/lib/api/organization';
import { handleRouteError } from '@/lib/api/route-utils';

export async function GET() {
  try {
    const data = await getCategoryTemplates();
    return NextResponse.json({ data });
  } catch (error) {
    return handleRouteError(error, 'Failed to fetch category templates');
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await createCategoryTemplate(body);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, 'Failed to create category template');
  }
}
