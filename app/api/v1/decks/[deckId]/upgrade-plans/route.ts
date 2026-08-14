import { NextResponse, type NextRequest } from 'next/server';
import { createDeckUpgradePlan } from '@/lib/api/decks';
import { handleRouteError } from '@/lib/api/route-utils';
import type { DeckUpgradeRequest } from '@/types/builder';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params;
    const body = (await req.json()) as DeckUpgradeRequest;
    if (!body || !body.objective) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'objective is required' } },
        { status: 400 }
      );
    }
    const data = await createDeckUpgradePlan(Number(deckId), body);
    return NextResponse.json({ data });
  } catch (error) {
    return handleRouteError(error, 'Failed to create deck upgrade plan');
  }
}
