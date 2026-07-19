import React from 'react';
import { Mountain, Users, Zap, ScrollText, Sparkles, Gem, Crown } from 'lucide-react';

const types = [
  {
    name: 'Land',
    icon: Mountain,
    description: 'The foundation of the game. You can play one land per turn. You tap lands to produce mana, which is used to cast spells.',
  },
  {
    name: 'Creature',
    icon: Users,
    description: 'Permanents that can attack your opponent and defend you. They have Power (damage they deal) and Toughness (damage they can take).',
  },
  {
    name: 'Instant',
    icon: Zap,
    description: 'Spells that can be cast at almost any time, including during your opponent\'s turn. They have an immediate effect and go to the graveyard.',
  },
  {
    name: 'Sorcery',
    icon: ScrollText,
    description: 'Similar to Instants, but they can only be cast during your main phase when the stack is empty.',
  },
  {
    name: 'Artifact',
    icon: Gem,
    description: 'Colorless magical items, weapons, or vehicles that stay on the battlefield. Some provide mana, while others have unique activated abilities.',
  },
  {
    name: 'Enchantment',
    icon: Sparkles,
    description: 'Magical manifestations that stay on the battlefield and provide persistent effects. "Auras" are enchantments that attach directly to creatures.',
  },
  {
    name: 'Planeswalker',
    icon: Crown,
    description: 'Powerful allies you summon to help you. They have "Loyalty" instead of toughness. You can use one of their abilities per turn by adding or removing loyalty.',
  }
];

export function CardTypesSection() {
  return (
    <section id="types" className="scroll-mt-32 space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h2 className="text-3xl font-extrabold text-white">Card Types</h2>
        <p className="text-zinc-400 mt-2 text-lg">Understanding what each card does is key to deck building.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {types.map((type) => {
          const Icon = type.icon;
          return (
            <div key={type.name} className="flex gap-4 p-5 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:bg-zinc-800/50 transition-colors">
              <div className="flex-shrink-0 mt-1 text-green-400">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-zinc-100">{type.name}</h3>
                <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{type.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
