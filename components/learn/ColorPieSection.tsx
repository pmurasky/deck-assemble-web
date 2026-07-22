import React from 'react';

const colors = [
  {
    name: 'White',
    symbol: 'W',
    bg: 'bg-amber-100',
    text: 'text-amber-900',
    border: 'border-amber-200',
    philosophy: 'Peace through Order',
    focus: 'Protection, healing, taxing effects, and large-scale balance.',
    description: 'White values structure, morality, and the well-being of the group over the individual. It seeks to create a world of harmony and protection through established rules, laws, and cooperation.',
  },
  {
    name: 'Blue',
    symbol: 'U',
    bg: 'bg-blue-600',
    text: 'text-white',
    border: 'border-blue-400',
    philosophy: 'Perfection through Knowledge',
    focus: 'Card manipulation, counterspells, drawing cards, and disrupting the opponent.',
    description: 'Blue views the world as a series of puzzles to be solved. It values intelligence, progress, and self-improvement, believing that with enough knowledge, one can achieve perfection.',
  },
  {
    name: 'Black',
    symbol: 'B',
    bg: 'bg-zinc-800',
    text: 'text-white',
    border: 'border-zinc-600',
    philosophy: 'Power through Opportunity',
    focus: 'Resource exchange, graveyard interaction, and removal.',
    description: 'Black is pragmatic and individualistic. It believes that the world is a cold place and that true success comes from personal power. It is willing to do whatever is necessary to achieve its ambitions.',
  },
  {
    name: 'Red',
    symbol: 'R',
    bg: 'bg-red-600',
    text: 'text-white',
    border: 'border-red-400',
    philosophy: 'Freedom through Action',
    focus: 'Speed, aggression, direct damage, and chaotic effects.',
    description: 'Red values emotion, impulse, and freedom. It believes that life should be lived in the moment and that one should follow their heart and passions without the constraints of societal rules.',
  },
  {
    name: 'Green',
    symbol: 'G',
    bg: 'bg-green-600',
    text: 'text-white',
    border: 'border-green-400',
    philosophy: 'Growth through Acceptance',
    focus: 'Mana acceleration (ramp), large creatures, and interaction with natural resources.',
    description: 'Green believes that the world is already perfect as it is and that everyone has a predetermined place within nature. It values acceptance, instinct, and the natural cycle of growth and decay.',
  }
];

export function ColorPieSection() {
  return (
    <section id="colors" className="scroll-mt-32 space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h2 className="text-3xl font-extrabold text-white">The 5 Colors of Mana</h2>
        <p className="text-zinc-400 mt-2 text-lg">The foundational system that dictates the game&apos;s mechanics and lore.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {colors.map((color) => (
          <div key={color.name} className="flex flex-col sm:flex-row gap-6 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex-shrink-0 flex items-center justify-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg border-2 ${color.bg} ${color.text} ${color.border}`}>
                {color.symbol}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-zinc-100">{color.name} <span className="text-sm font-normal text-zinc-500 ml-2">— {color.philosophy}</span></h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {color.description}
              </p>
              <div className="pt-2">
                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Mechanical Focus:</span>
                <p className="text-sm text-zinc-400">{color.focus}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
