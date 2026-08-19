import React from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import type { PracticePhase } from '@/types/m3';

export const PRACTICE_PHASES: { key: PracticePhase; label: string }[] = [
  { key: 'UNTAP', label: 'Untap' },
  { key: 'UPKEEP', label: 'Upkeep' },
  { key: 'DRAW', label: 'Draw' },
  { key: 'MAIN_1', label: 'Main 1' },
  { key: 'COMBAT', label: 'Combat' },
  { key: 'MAIN_2', label: 'Main 2' },
  { key: 'END', label: 'End' },
];

interface PhaseStepperProps {
  currentPhase: PracticePhase;
}

export function PhaseStepper({ currentPhase }: PhaseStepperProps) {
  return (
    <div
      data-testid="phase-stepper"
      className="flex flex-wrap items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold"
    >
      <div className="flex items-center gap-1">
        {PRACTICE_PHASES.map((p, idx) => {
          const isActive = p.key === currentPhase;
          return (
            <React.Fragment key={p.key}>
              {idx > 0 && <span className="text-slate-600 text-[10px]">→</span>}
              <span
                data-testid={`phase-step-${p.key}`}
                data-active={isActive ? 'true' : 'false'}
                className={`px-1.5 py-0.5 rounded text-[11px] transition-colors ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 font-medium'
                }`}
              >
                {p.label}
              </span>
            </React.Fragment>
          );
        })}
      </div>
      <Link
        href="/learn/turn-structure"
        aria-label="Learn MTG Turn Phases"
        className="text-amber-400 hover:text-amber-300 ml-1.5"
        title="Learn MTG Turn Phases"
      >
        <BookOpen className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
