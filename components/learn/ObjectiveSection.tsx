import React from 'react';
import { Target, LifeBuoy, Library, Skull } from 'lucide-react';

export function ObjectiveSection() {
  return (
    <section id="objective" className="scroll-mt-32 space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h2 className="text-3xl font-extrabold text-white">The Goal of the Game</h2>
        <p className="text-zinc-400 mt-2 text-lg">Defeat your opponent and survive.</p>
      </div>

      <div className="prose prose-invert max-w-none">
        <p className="text-zinc-300 leading-relaxed">
          In Magic: The Gathering, you play the role of a powerful wizard (called a Planeswalker) battling other Planeswalkers. 
          Your deck of cards represents your arsenal of spells, creatures, and artifacts. The core objective is simple: 
          reduce your opponent's life total from its starting value to 0.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-3 text-green-400 mb-2">
            <LifeBuoy className="w-6 h-6" />
            <h3 className="font-bold text-lg text-zinc-100">Life Totals</h3>
          </div>
          <p className="text-sm text-zinc-400">
            In standard formats, players start with <strong>20 life</strong>. In the popular Commander format, players start with <strong>40 life</strong> to accommodate longer, multiplayer games. If your life reaches 0, you lose.
          </p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-3 text-purple-400 mb-2">
            <Library className="w-6 h-6" />
            <h3 className="font-bold text-lg text-zinc-100">The Library</h3>
          </div>
          <p className="text-sm text-zinc-400">
            Your deck is called your Library. You draw cards from it to play the game. If you are forced to draw a card but your Library is empty, you lose the game immediately!
          </p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-3 text-zinc-400 mb-2">
            <Skull className="w-6 h-6" />
            <h3 className="font-bold text-lg text-zinc-100">The Graveyard</h3>
          </div>
          <p className="text-sm text-zinc-400">
            When creatures die, or when you cast spells that resolve, they go to your Graveyard (your discard pile). Many decks interact with the graveyard, so it's often a resource rather than a dead zone!
          </p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-3 text-blue-400 mb-2">
            <Target className="w-6 h-6" />
            <h3 className="font-bold text-lg text-zinc-100">The Stack</h3>
          </div>
          <p className="text-sm text-zinc-400">
            When you cast a spell, it doesn't happen instantly. It goes on "The Stack." Your opponents have a chance to respond with their own instant-speed spells before yours resolves. Last in, first out!
          </p>
        </div>
      </div>
    </section>
  );
}
