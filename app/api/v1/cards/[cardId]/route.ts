import { NextRequest, NextResponse } from 'next/server';
import { MOCK_CARDS } from '@/lib/mock-data/cards';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const { cardId } = await params;
  
  const card = MOCK_CARDS.find(c => c.id === cardId);
  
  if (!card) {
    return NextResponse.json({
      error: { code: 'NOT_FOUND', message: 'Card not found' }
    }, { status: 404 });
  }
  
  return NextResponse.json({
    data: card
  }, { status: 200 });
}
