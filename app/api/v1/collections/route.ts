import { NextResponse, type NextRequest } from 'next/server';
import { getCollections, createCollection } from '@/lib/api/collections';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Collection request failed';
}

export async function GET() {
  try {
    const data = await getCollections();
    return NextResponse.json({ data });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: errorMessage(error) } },
      { status: 502 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    if (!isCreateRequest(body)) return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid collection request' } }, { status: 400 });
    const data = await createCollection(body.name, body.defaultCollection);
    return NextResponse.json({ data });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: errorMessage(error) } },
      { status: 502 }
    );
  }
}

function isCreateRequest(value: unknown): value is { name: string; defaultCollection: boolean } {
  return typeof value === 'object' && value !== null && 'name' in value && 'defaultCollection' in value
    && typeof value.name === 'string' && typeof value.defaultCollection === 'boolean';
}
