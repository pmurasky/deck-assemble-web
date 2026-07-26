import { NextResponse } from 'next/server';
import { MOCK_COMMANDERS, createMockGeneratedDeck } from '@/lib/mock-data/builder';
import { GenerateBuildRequest } from '@/types/builder';

export async function POST(request: Request) {
  const body: GenerateBuildRequest = await request.json();

  if (
    body.secondaryCommanderCardId &&
    (String(body.secondaryCommanderCardId) === 'illegal' ||
      String(body.secondaryCommanderCardId) === 'ineligible' ||
      String(body.secondaryCommanderCardId) === '999')
  ) {
    return NextResponse.json(
      { error: { message: 'Card is not eligible as commander: Sol Ring' } },
      { status: 400 }
    );
  }

  const selectedCmd =
    MOCK_COMMANDERS.find((c) => String(c.id) === String(body.commanderCardId)) ||
    MOCK_COMMANDERS[0];

  const generated = createMockGeneratedDeck(selectedCmd);

  if (body.desiredPowerLevel !== undefined) {
    generated.powerLevel = body.desiredPowerLevel;
  }

  if (body.useOwnedCardsOnly) {
    generated.ownedPercentage = 100;
    generated.ownedCardsCount = generated.totalCards;
    generated.wishlistCardsCount = 0;
    generated.wishlistTotalCost = 0;
    generated.cards = generated.cards.map((c) => ({
      ...c,
      ownership: 'owned',
      estimatedPrice: 0,
    }));
  } else if (body.budgetLimit !== undefined && body.budgetLimit > 0) {
    if (generated.wishlistTotalCost > body.budgetLimit) {
      generated.wishlistTotalCost = body.budgetLimit;
    }
  }

  return NextResponse.json(generated);
}
