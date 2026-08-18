import React from 'react';
import Link from 'next/link';
import { Sunrise, Sun, Swords, Sunset, Moon, Layers } from 'lucide-react';

interface PhaseStep {
  name: string;
  detail: string;
  glossaryHref?: string;
}

interface PhaseData {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  steps: PhaseStep[];
}

const PHASES: PhaseData[] = [
  {
    name: 'Beginning Phase',
    icon: Sunrise,
    steps: [
      { name: 'Untap', detail: 'Ready your tapped permanents.', glossaryHref: '#glossary-untap-step' },
      { name: 'Upkeep', detail: 'Resolve upkeep triggers; players receive priority.', glossaryHref: '#glossary-upkeep-step' },
      { name: 'Draw', detail: 'Draw one card from your library; players receive priority.', glossaryHref: '#glossary-draw-step' },
    ],
  },
  {
    name: 'Main Phase 1',
    icon: Sun,
    steps: [
      { name: 'Play a Land', detail: 'Once per turn total during your main phase when the stack is empty.' },
      { name: 'Cast Spells', detail: 'Cast Creatures, Artifacts, Enchantments, Sorceries, or Planeswalkers using the stack.' },
    ],
  },
  {
    name: 'Combat Phase',
    icon: Swords,
    steps: [
      { name: 'Beginning of Combat', detail: 'Triggers resolve; players gain priority before attackers are declared.', glossaryHref: '#glossary-beginning-of-combat-step' },
      { name: 'Declare Attackers', detail: 'Choose which untapped creatures attack; priority passes.', glossaryHref: '#glossary-declare-attackers-step' },
      { name: 'Declare Blockers', detail: 'Defender assigns blocking creatures; priority passes.', glossaryHref: '#glossary-declare-blockers-step' },
      { name: 'Combat Damage', detail: 'Creatures deal damage simultaneously; priority passes.', glossaryHref: '#glossary-combat-damage-step' },
      { name: 'End of Combat', detail: 'End-of-combat triggers resolve before moving to Main Phase 2.', glossaryHref: '#glossary-end-of-combat-step' },
    ],
  },
  {
    name: 'Main Phase 2',
    icon: Sunset,
    steps: [
      { name: 'Second Land Drop Opportunity', detail: 'Play a land if you have not played one yet this turn.' },
      { name: 'Post-Combat Spells', detail: 'Cast spells with full knowledge of combat outcomes.' },
    ],
  },
  {
    name: 'Ending Phase',
    icon: Moon,
    steps: [
      { name: 'End Step', detail: 'Resolve "at the beginning of the end step" triggers; priority passes.', glossaryHref: '#glossary-end-step' },
      { name: 'Cleanup', detail: 'Discard to maximum hand size; damage wears off permanents.', glossaryHref: '#glossary-cleanup-step' },
    ],
  },
];

function TimingCallout() {
  return (
    <div className="bg-zinc-900/70 border border-green-500/20 rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-2.5 text-green-400 font-semibold text-base">
        <Layers className="w-5 h-5 text-green-400 flex-shrink-0" />
        <span>Timing, The Stack & Priority</span>
      </div>
      <p className="text-sm text-zinc-300 leading-relaxed">
        Spells and activated abilities are cast onto{' '}
        <Link href="#glossary-the-stack" className="text-green-400 underline underline-offset-2 hover:text-green-300 font-medium">
          The Stack
        </Link>{' '}
        and resolve in reverse order. After each step, action, or trigger, all players must pass{' '}
        <Link href="#glossary-priority" className="text-green-400 underline underline-offset-2 hover:text-green-300 font-medium">
          Priority
        </Link>{' '}
        in succession before spells resolve or the game advances.
      </p>
    </div>
  );
}

function PhaseStepItem({ step }: { step: PhaseStep }) {
  return (
    <li className="text-sm text-zinc-400 flex items-start gap-2">
      <span className="text-green-500/50 mt-1">•</span>
      <span>
        {step.glossaryHref ? (
          <Link href={step.glossaryHref} className="font-semibold text-zinc-200 hover:text-green-400 underline-offset-2 hover:underline">
            {step.name}:
          </Link>
        ) : (
          <strong className="text-zinc-200">{step.name}:</strong>
        )}{' '}
        {step.detail}
      </span>
    </li>
  );
}

function PhaseCard({ phase, index }: { phase: PhaseData; index: number }) {
  const Icon = phase.icon;
  return (
    <div className="relative pl-8 md:pl-10">
      <div className="absolute left-[-17px] top-1 h-8 w-8 rounded-full bg-zinc-950 border border-green-500/50 flex items-center justify-center text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
        <Icon className="w-4 h-4" />
      </div>
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-green-500/30 transition-colors">
        <h3 className="font-bold text-lg text-zinc-100 flex items-center gap-2">
          <span className="text-sm font-mono text-zinc-500">{index + 1}.</span> {phase.name}
        </h3>
        <ul className="mt-3 space-y-2">
          {phase.steps.map((step, i) => (
            <PhaseStepItem key={i} step={step} />
          ))}
        </ul>
      </div>
    </div>
  );
}

export function TurnStructureSection() {
  return (
    <section id="turns" className="scroll-mt-32 space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h2 className="text-3xl font-extrabold text-white">Turn Structure</h2>
        <p className="text-zinc-400 mt-2 text-lg">Every turn in Magic follows a strict, sequential structure.</p>
      </div>

      <TimingCallout />

      <div className="relative border-l border-zinc-800 ml-3 md:ml-6 space-y-8 py-4">
        {PHASES.map((phase, index) => (
          <PhaseCard key={phase.name} phase={phase} index={index} />
        ))}
      </div>
    </section>
  );
}
