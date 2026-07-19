import React from 'react';
import { Metadata } from 'next';
import { DeckBuilderClient } from '@/components/deck/DeckBuilderClient';

export const metadata: Metadata = {
  title: 'Deck Builder | Deck Assemble',
  description: 'Construct, analyze, and validate your Magic: The Gathering decks.',
};

export default function DeckBuilderPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <DeckBuilderClient />
    </div>
  );
}
