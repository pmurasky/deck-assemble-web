import { CollectionClient } from '@/components/collection/CollectionClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Collection | Deck Assemble',
  description: 'Manage your physical collection of Marvel Magic: The Gathering cards.',
};

export default function CollectionPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <CollectionClient />
    </div>
  );
}
