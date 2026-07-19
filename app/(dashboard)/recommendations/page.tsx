import { Metadata } from 'next';
import { RecommendationsClient } from '@/components/deck/RecommendationsClient';

export const metadata: Metadata = {
  title: 'Recommendations | Deck Assemble',
  description: 'Get synergistic card recommendations for your active deck.',
};

export default function RecommendationsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <RecommendationsClient />
    </div>
  );
}
