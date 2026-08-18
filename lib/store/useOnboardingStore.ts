import { create } from 'zustand';
import { saveProfile } from '@/lib/api/profile';
import { TOUR_STEPS } from '@/components/onboarding/tourSteps';

interface OnboardingStoreState {
  isOpen: boolean;
  isReplay: boolean;
  currentStep: number;
  isSaving: boolean;
  openTour: (options?: { isReplay?: boolean; initialStep?: number }) => void;
  closeTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  skipTour: () => Promise<void>;
  completeTour: () => Promise<void>;
}

async function persistOnboardingCompletion(): Promise<void> {
  try {
    await saveProfile({
      onboardingCompletedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to persist onboarding completion status:', err);
  }
}

export const useOnboardingStore = create<OnboardingStoreState>((set, get) => ({
  isOpen: false,
  isReplay: false,
  currentStep: 0,
  isSaving: false,

  openTour: (options) => {
    set({
      isOpen: true,
      isReplay: options?.isReplay ?? false,
      currentStep: options?.initialStep ?? 0,
    });
  },

  closeTour: () => {
    set({ isOpen: false });
  },

  nextStep: () => {
    const { currentStep } = get();
    if (currentStep < TOUR_STEPS.length - 1) {
      set({ currentStep: currentStep + 1 });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },

  goToStep: (step: number) => {
    if (step >= 0 && step < TOUR_STEPS.length) {
      set({ currentStep: step });
    }
  },

  skipTour: async () => {
    set({ isSaving: true });
    await persistOnboardingCompletion();
    set({ isOpen: false, isSaving: false });
  },

  completeTour: async () => {
    set({ isSaving: true });
    await persistOnboardingCompletion();
    set({ isOpen: false, isSaving: false });
  },
}));
