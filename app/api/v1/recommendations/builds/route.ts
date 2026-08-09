import { NextRequest, NextResponse } from 'next/server';
import { createBackendDeckBuild } from '@/lib/api/recommendations';
import type { GenerateBuildRequest } from '@/types/builder';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Build request failed';
}

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const data = await createBackendDeckBuild(body as GenerateBuildRequest);
    return NextResponse.json({ data });
  } catch (error: unknown) {
    const status =
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      typeof error.status === 'number' &&
      error.status < 500
        ? error.status
        : 502;

    if (status === 400) {
      return NextResponse.json(
        { error: { message: errorMessage(error) } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: errorMessage(error) } },
      { status: 502 }
    );
  }
}
