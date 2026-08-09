import { notFound } from 'next/navigation';
import { getSharedDeck } from '@/lib/api/publishing';
import { SharedDeckClient } from '@/components/deck/SharedDeckClient';

interface SharedDeckPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SharedDeckPage({ params }: SharedDeckPageProps) {
  const { slug } = await params;

  try {
    const deck = await getSharedDeck(slug);
    if (!deck) {
      notFound();
    }
    return <SharedDeckClient deck={deck} />;
  } catch (_error: unknown) {
    // Spec: 404 (never 403) for private deck or unknown slug - deliberately indistinguishable
    notFound();
  }
}
