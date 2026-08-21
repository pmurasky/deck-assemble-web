import { NextResponse, type NextRequest } from 'next/server';
import { resetPracticeSession } from '@/lib/api/simulations';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Failed to reset practice session';
}

export async function POST(
  _req: NextRequest,
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

    const data = await resetPracticeSession(id, sessionId);
    return NextResponse.json({ data });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: errorMessage(error) } },
      { status: 502 }
    );
  }
}
