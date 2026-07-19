import { NextRequest, NextResponse } from 'next/server';
import { MOCK_CARDS } from '@/lib/mock-data/cards';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const q = searchParams.get('q')?.toLowerCase();
  
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  
  let cards = [...MOCK_CARDS];
  
  if (q) {
    cards = cards.filter(card => 
      card.name.toLowerCase().includes(q) || 
      (card.oracleText && card.oracleText.toLowerCase().includes(q))
    );
  }
  
  const total = cards.length;
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedCards = cards.slice(startIndex, endIndex);
  
  return NextResponse.json({
    data: {
      cards: paginatedCards,
      total
    }
  }, { status: 200 });
}
