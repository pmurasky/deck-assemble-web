import { LearnSidebar } from '@/components/learn/LearnSidebar';
import { ObjectiveSection } from '@/components/learn/ObjectiveSection';
import { ColorPieSection } from '@/components/learn/ColorPieSection';
import { CardTypesSection } from '@/components/learn/CardTypesSection';
import { TurnStructureSection } from '@/components/learn/TurnStructureSection';
import { CommanderBasicsSection } from '@/components/learn/CommanderBasicsSection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How Magic Works | Deck Assemble',
  description: 'Learn the foundational rules of Magic: The Gathering and the Commander format.',
};

export default function LearnPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-12 border-b border-zinc-800 pb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-green-500 to-purple-500 bg-clip-text text-transparent">
          HOW MAGIC WORKS
        </h1>
        <p className="text-xl text-zinc-400 mt-4 max-w-3xl">
          Whether you are a newcomer learning the ropes or a veteran brushing up on Commander specifics, this guide covers everything you need to start building and playing.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-12 relative">
        {/* Sticky Sidebar */}
        <div className="md:w-64 flex-shrink-0">
          <LearnSidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-24 pb-32">
          <ObjectiveSection />
          <ColorPieSection />
          <CardTypesSection />
          <TurnStructureSection />
          <CommanderBasicsSection />
        </div>
      </div>
    </div>
  );
}
