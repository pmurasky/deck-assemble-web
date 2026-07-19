import React from 'react';
import { CardDetailClient } from '@/components/cards/CardDetailClient';
import { getCardById } from '@/lib/api/cards';

// In Next.js 15, dynamic route params must be awaited
export default async function CardDetailPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;

  return (
    <div className="min-h-screen bg-black text-white">
      <CardDetailClient cardId={cardId} />
    </div>
  );
}

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;
  
  try {
    const card = await getCardById(cardId);
    return {
      title: `${card.name} | Deck Assemble`,
      description: card.oracleText || `Details for ${card.name}`,
    };
  } catch (e) {
    return {
      title: 'Card Details | Deck Assemble',
    };
  }
}
