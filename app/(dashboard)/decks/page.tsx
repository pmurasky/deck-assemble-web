import { Metadata } from 'next';
import { DecksListClient } from '@/components/deck/DecksListClient';

export const metadata: Metadata = {
  title: 'My Decks | Deck Assemble',
  description: 'Manage your saved Marvel Magic: The Gathering decks.',
};

export default function DecksPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <DecksListClient />
    </div>
  );
}
