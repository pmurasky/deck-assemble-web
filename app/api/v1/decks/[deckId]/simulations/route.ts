import { NextResponse, type NextRequest } from 'next/server';
import { runDeckSimulation } from '@/lib/api/simulations';
import type { MulliganConfig } from '@/types/m3';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Failed to run simulation';
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

    const body = (await req.json().catch(() => ({}))) as { iterations?: number; turns?: number; mulliganConfig?: MulliganConfig };
    const iterations = Number(body.iterations ?? 1000);
    const turns = Number(body.turns ?? 5);

    const data = await runDeckSimulation(id, iterations, turns, body.mulliganConfig);
    return NextResponse.json({ data });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: errorMessage(error) } },
      { status: 502 }
    );
  }
}
