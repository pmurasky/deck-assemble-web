import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useOnboardingStore } from '@/lib/store/useOnboardingStore';
import * as profileApi from '@/lib/api/profile';

vi.mock('@/lib/api/profile');

describe('useOnboardingStore', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useOnboardingStore.setState({
      isOpen: false,
      isReplay: false,
      currentStep: 0,
      isSaving: false,
    });
  });

  it('initializes with default closed state and step 0', () => {
    // Given & When
    const state = useOnboardingStore.getState();

    // Then
    expect(state.isOpen).toBe(false);
    expect(state.currentStep).toBe(0);
    expect(state.isReplay).toBe(false);
  });

  it('openTour opens the modal and sets isReplay flag', () => {
    // Given
    const { openTour } = useOnboardingStore.getState();

    // When
    openTour({ isReplay: true });

    // Then
    const state = useOnboardingStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.isReplay).toBe(true);
    expect(state.currentStep).toBe(0);
  });

  it('advances and steps back through tour steps', () => {
    // Given
    const { openTour, nextStep, prevStep } = useOnboardingStore.getState();
    openTour();

    // When
    nextStep();

    // Then
    expect(useOnboardingStore.getState().currentStep).toBe(1);

    // When
    nextStep();
    expect(useOnboardingStore.getState().currentStep).toBe(2);

    prevStep();
    expect(useOnboardingStore.getState().currentStep).toBe(1);

    prevStep();
    expect(useOnboardingStore.getState().currentStep).toBe(0);

    // Should not go below 0
    prevStep();
    expect(useOnboardingStore.getState().currentStep).toBe(0);
  });

  it('skipTour saves onboardingCompletedAt timestamp and closes modal', async () => {
    // Given
    vi.mocked(profileApi.saveProfile).mockResolvedValue({
      id: 1,
      displayName: 'Peter',
      email: 'peter@example.com',
      onboardingCompletedAt: '2026-08-18T12:00:00.000Z',
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-18T12:00:00Z',
    });

    const { openTour, skipTour } = useOnboardingStore.getState();
    openTour();
    expect(useOnboardingStore.getState().isOpen).toBe(true);

    // When
    await skipTour();

    // Then
    expect(profileApi.saveProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        onboardingCompletedAt: expect.any(String),
      })
    );
    expect(useOnboardingStore.getState().isOpen).toBe(false);
  });

  it('completeTour saves onboardingCompletedAt timestamp and closes modal', async () => {
    // Given
    vi.mocked(profileApi.saveProfile).mockResolvedValue({
      id: 1,
      displayName: 'Peter',
      email: 'peter@example.com',
      onboardingCompletedAt: '2026-08-18T12:00:00.000Z',
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-18T12:00:00Z',
    });

    const { openTour, completeTour } = useOnboardingStore.getState();
    openTour();

    // When
    await completeTour();

    // Then
    expect(profileApi.saveProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        onboardingCompletedAt: expect.any(String),
      })
    );
    expect(useOnboardingStore.getState().isOpen).toBe(false);
  });
});
