'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Layers,
  Hammer,
  BookOpen,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Compass,
} from 'lucide-react';
import { useOnboardingStore } from '@/lib/store/useOnboardingStore';
import { TOUR_STEPS } from './tourSteps';

const STEP_ICONS = [
  <Layers key="decks" className="w-8 h-8 text-emerald-400" />,
  <Hammer key="builder" className="w-8 h-8 text-purple-400" />,
  <BookOpen key="learn" className="w-8 h-8 text-blue-400" />,
  <Sparkles key="finish" className="w-8 h-8 text-amber-400" />,
];

interface TourHeaderProps {
  tag: string;
  onClose: () => void;
}

function TourHeader({ tag, onClose }: TourHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-5">
      <div className="flex items-center gap-2">
        <Compass className="w-4 h-4 text-purple-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-purple-400">{tag}</span>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close tour"
        className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface TourContentProps {
  stepIndex: number;
  title: string;
  description: string;
  highlightText: string;
}

function TourContent({ stepIndex, title, description, highlightText }: TourContentProps) {
  return (
    <div className="text-center space-y-4 py-2">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-inner">
        {STEP_ICONS[stepIndex] ?? <Sparkles className="w-8 h-8 text-purple-400" />}
      </div>
      <h2 id="tour-step-title" className="text-2xl font-black tracking-tight text-white">
        {title}
      </h2>
      <p className="text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">{description}</p>
      <div className="inline-block px-3 py-1 bg-zinc-950/80 border border-zinc-800 rounded-full text-xs font-semibold text-zinc-400">
        {highlightText}
      </div>
    </div>
  );
}

interface TourStepDotsProps {
  currentStep: number;
  totalSteps: number;
  onSelectStep: (step: number) => void;
}

function TourStepDots({ currentStep, totalSteps, onSelectStep }: TourStepDotsProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {Array.from({ length: totalSteps }, (_, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onSelectStep(idx)}
          aria-label={`Go to step ${idx + 1}`}
          className={`h-2 rounded-full transition-all ${
            idx === currentStep ? 'w-6 bg-purple-500' : 'w-2 bg-zinc-700 hover:bg-zinc-500'
          }`}
        />
      ))}
    </div>
  );
}

export function OnboardingTourModal() {
  const router = useRouter();
  const {
    isOpen,
    currentStep,
    isSaving,
    closeTour,
    nextStep,
    prevStep,
    goToStep,
    skipTour,
    completeTour,
  } = useOnboardingStore();

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep] || TOUR_STEPS[0];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  const handleFinish = async () => {
    await completeTour();
    router.push(step.route || '/deck-builder');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-step-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-zinc-100 flex flex-col justify-between">
        <TourHeader tag={step.tag} onClose={closeTour} />

        <TourContent
          stepIndex={currentStep}
          title={step.title}
          description={step.description}
          highlightText={step.highlightText}
        />

        <TourStepDots
          currentStep={currentStep}
          totalSteps={TOUR_STEPS.length}
          onSelectStep={goToStep}
        />

        <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-3 mt-4">
          <button
            type="button"
            onClick={skipTour}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                type="button"
                onClick={prevStep}
                disabled={isSaving}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            {isLastStep ? (
              <button
                type="button"
                onClick={handleFinish}
                disabled={isSaving}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-1.5 active:scale-95"
              >
                <span>{step.actionLabel || 'Get Started'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                disabled={isSaving}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-1.5 active:scale-95"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
