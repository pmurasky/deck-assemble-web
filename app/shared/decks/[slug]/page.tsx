import { notFound } from 'next/navigation';
import { getSharedDeck } from '@/lib/api/publishing';
import { SharedDeckClient } from '@/components/deck/SharedDeckClient';
import type { SharedDeckResponse } from '@/types/m3';

interface SharedDeckPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SharedDeckPage({ params }: SharedDeckPageProps) {
  const { slug } = await params;
  let deck: SharedDeckResponse | null = null;

  try {
    deck = await getSharedDeck(slug);
  } catch {
    notFound();
  }

  if (!deck) {
    notFound();
  }

  return <SharedDeckClient deck={deck} />;
}
