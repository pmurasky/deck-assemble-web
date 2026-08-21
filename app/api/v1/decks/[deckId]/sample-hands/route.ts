import { NextResponse, type NextRequest } from 'next/server';
import { generateSampleHands } from '@/lib/api/simulations';
import type { MulliganConfig } from '@/types/m3';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Failed to generate sample hands';
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params;
    const id = Number(deckId);
    if (!Number.isSafeInteger(id) || id < 1) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid deck ID' } }, { status: 400 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      count?: number;
      handCount?: number;
      mulliganConfig?: MulliganConfig;
      revision?: number;
    };
    const count = Number(body.handCount ?? body.count ?? 7);

    const data = await generateSampleHands(id, count, body.mulliganConfig, body.revision);
    return NextResponse.json({ data });
  } catch (error: unknown) {
    const status = (error as { status?: number })?.status;
    const httpStatus = typeof status === 'number' && status >= 400 && status < 600 ? status : 502;
    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: errorMessage(error) } },
      { status: httpStatus }
    );
  }
}
