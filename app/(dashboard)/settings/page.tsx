import { Metadata } from 'next';
import { SettingsClient } from '@/components/profile/SettingsClient';

export const metadata: Metadata = {
  title: 'Settings | Deck Assemble',
  description: 'Manage your profile and builder preferences.',
};

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <SettingsClient />
    </div>
  );
}
