import { NextResponse, type NextRequest } from 'next/server';
import { playPracticeCard } from '@/lib/api/simulations';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Failed to play card';
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string; sessionId: string }> }
) {
  try {
    const { deckId, sessionId } = await params;
    const id = Number(deckId);
    if (!Number.isSafeInteger(id) || id < 1) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid deck ID' } },
        { status: 400 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as { printingId?: number };
    const printingId = Number(body.printingId ?? 0);

    const data = await playPracticeCard(id, sessionId, printingId);
    return NextResponse.json({ data });
  } catch (error: unknown) {
    const status = (error as { status?: number })?.status || 502;
    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: errorMessage(error) } },
      { status }
    );
  }
}
