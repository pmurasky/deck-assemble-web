import React from 'react';
import { ShieldAlert, BookOpen, Layers } from 'lucide-react';
import Link from 'next/link';

export function CommanderBasicsSection() {
  return (
    <section id="commander" className="scroll-mt-32 space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
          Commander Basics
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
            Format Focus
          </span>
        </h2>
        <p className="text-zinc-400 mt-2 text-lg">Deck Assemble is built specifically for the Commander format.</p>
      </div>

      <div className="prose prose-invert max-w-none mb-6">
        <p className="text-zinc-300 leading-relaxed">
          Commander (also known as EDH) is a casual, multiplayer format. Instead of standard 60-card decks with 4 copies of each card, Commander is a "singleton" format led by a legendary creature.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-green-950/50 flex items-center justify-center text-green-400 border border-green-800/50 mb-3">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-zinc-100">The Commander</h3>
          <p className="text-sm text-zinc-400">
            Your deck is led by a Legendary Creature. It starts the game in the "Command Zone" and can be cast from there. If it dies, it goes back to the Command Zone, costing 2 more mana each subsequent time you cast it.
          </p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-purple-950/50 flex items-center justify-center text-purple-400 border border-purple-800/50 mb-3">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-zinc-100">Color Identity</h3>
          <p className="text-sm text-zinc-400">
            Every card in your deck MUST match the color identity of your Commander. If your Commander is Red and Green, you cannot put a Blue card in your deck. Our Deck Builder validates this automatically!
          </p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-blue-950/50 flex items-center justify-center text-blue-400 border border-blue-800/50 mb-3">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-zinc-100">100-Card Singleton</h3>
          <p className="text-sm text-zinc-400">
            Your deck must be exactly 100 cards (99 cards + 1 Commander). You can only have ONE copy of any card in your deck, except for basic lands.
          </p>
        </div>
      </div>

      <div className="mt-8 p-6 bg-gradient-to-br from-green-950/30 to-purple-950/30 border border-zinc-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg text-white">Ready to build your first deck?</h3>
          <p className="text-zinc-400 text-sm mt-1">Head over to the Deck Builder to start assembling your heroes.</p>
        </div>
        <Link 
          href="/decks/create" 
          className="flex-shrink-0 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-950/50 transition-all whitespace-nowrap"
        >
          Build a Deck
        </Link>
      </div>
    </section>
  );
}
