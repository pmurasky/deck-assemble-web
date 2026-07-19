import React from 'react';
import { Sunrise, Sun, Swords, Sunset, Moon } from 'lucide-react';

const phases = [
  {
    name: 'Beginning Phase',
    icon: Sunrise,
    steps: ['Untap: Ready your tapped cards.', 'Upkeep: Resolve abilities that trigger at the beginning of your turn.', 'Draw: Draw one card from your library.'],
  },
  {
    name: 'Main Phase 1',
    icon: Sun,
    steps: ['Play a Land (once per turn total).', 'Cast any spell (Creatures, Artifacts, Enchantments, Sorceries, Planeswalkers).'],
  },
  {
    name: 'Combat Phase',
    icon: Swords,
    steps: ['Declare Attackers: Choose which of your untapped creatures will attack.', 'Declare Blockers: Opponent chooses which of their untapped creatures will defend.', 'Combat Damage: Creatures deal their damage simultaneously.'],
  },
  {
    name: 'Main Phase 2',
    icon: Sunset,
    steps: ['A second chance to play a Land (if you haven\'t yet).', 'Cast any spell (often better to cast creatures here so you keep your opponent guessing during combat!).'],
  },
  {
    name: 'Ending Phase',
    icon: Moon,
    steps: ['End Step: Resolve "at the beginning of the end step" triggers.', 'Cleanup: Damage on creatures wears off, and effects that last "until end of turn" end.'],
  }
];

export function TurnStructureSection() {
  return (
    <section id="turns" className="scroll-mt-32 space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h2 className="text-3xl font-extrabold text-white">Turn Structure</h2>
        <p className="text-zinc-400 mt-2 text-lg">Every turn in Magic follows a strict, sequential structure.</p>
      </div>

      <div className="relative border-l border-zinc-800 ml-3 md:ml-6 space-y-8 py-4">
        {phases.map((phase, index) => {
          const Icon = phase.icon;
          return (
            <div key={phase.name} className="relative pl-8 md:pl-10">
              <div className="absolute left-[-17px] top-1 h-8 w-8 rounded-full bg-zinc-950 border border-green-500/50 flex items-center justify-center text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-green-500/30 transition-colors">
                <h3 className="font-bold text-lg text-zinc-100 flex items-center gap-2">
                  <span className="text-sm font-mono text-zinc-500">{index + 1}.</span> {phase.name}
                </h3>
                <ul className="mt-3 space-y-2">
                  {phase.steps.map((step, i) => (
                    <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                      <span className="text-green-500/50 mt-1">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
