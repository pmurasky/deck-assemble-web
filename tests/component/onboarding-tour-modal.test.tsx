import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OnboardingTourModal } from '@/components/onboarding/OnboardingTourModal';
import { useOnboardingStore } from '@/lib/store/useOnboardingStore';
import * as profileApi from '@/lib/api/profile';

vi.mock('@/lib/api/profile');

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('OnboardingTourModal Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockPush.mockReset();
    useOnboardingStore.setState({
      isOpen: true,
      isReplay: false,
      currentStep: 0,
      isSaving: false,
    });
  });

  it('renders nothing when isOpen is false', () => {
    // Given
    useOnboardingStore.setState({ isOpen: false });

    // When
    render(<OnboardingTourModal />);

    // Then
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders Step 1 with Decks hub details and Next/Skip buttons', () => {
    // Given & When
    render(<OnboardingTourModal />);

    // Then
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Your MTG Decks Hub/i)).toBeInTheDocument();
    expect(screen.getByText(/Step 1 of 4/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Skip/i })).toBeInTheDocument();
  });

  it('progresses to next step when Next button is clicked', () => {
    // Given
    render(<OnboardingTourModal />);

    // When
    const nextBtn = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextBtn);

    // Then
    expect(screen.getByText(/Intelligent Deck Builder/i)).toBeInTheDocument();
    expect(screen.getByText(/Step 2 of 4/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument();
  });

  it('steps back to previous step when Back button is clicked', () => {
    // Given
    useOnboardingStore.setState({ currentStep: 2 });
    render(<OnboardingTourModal />);
    expect(screen.getByText(/Learn MTG & Commander/i)).toBeInTheDocument();

    // When
    const backBtn = screen.getByRole('button', { name: /Back/i });
    fireEvent.click(backBtn);

    // Then
    expect(screen.getByText(/Intelligent Deck Builder/i)).toBeInTheDocument();
  });

  it('reaches final step and renders completion CTA button', () => {
    // Given
    useOnboardingStore.setState({ currentStep: 3 });
    render(<OnboardingTourModal />);

    // Then
    expect(screen.getByText(/Ready to Build/i)).toBeInTheDocument();
    expect(screen.getByText(/Step 4 of 4/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Get Started/i })).toBeInTheDocument();
  });

  it('clicking Skip Tour saves onboarding status and closes modal', async () => {
    // Given
    vi.mocked(profileApi.saveProfile).mockResolvedValue({
      id: 1,
      displayName: 'Peter',
      email: 'peter@example.com',
      onboardingCompletedAt: '2026-08-18T12:00:00.000Z',
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-18T12:00:00Z',
    });

    render(<OnboardingTourModal />);

    // When
    const skipBtn = screen.getByRole('button', { name: /Skip/i });
    fireEvent.click(skipBtn);

    // Then
    await waitFor(() => {
      expect(profileApi.saveProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          onboardingCompletedAt: expect.any(String),
        })
      );
      expect(useOnboardingStore.getState().isOpen).toBe(false);
    });
  });

  it('clicking Get Started on final step saves onboarding status and navigates to deck builder', async () => {
    // Given
    vi.mocked(profileApi.saveProfile).mockResolvedValue({
      id: 1,
      displayName: 'Peter',
      email: 'peter@example.com',
      onboardingCompletedAt: '2026-08-18T12:00:00.000Z',
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-18T12:00:00Z',
    });

    useOnboardingStore.setState({ currentStep: 3 });
    render(<OnboardingTourModal />);

    // When
    const finishBtn = screen.getByRole('button', { name: /Get Started/i });
    fireEvent.click(finishBtn);

    // Then
    await waitFor(() => {
      expect(profileApi.saveProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          onboardingCompletedAt: expect.any(String),
        })
      );
      expect(useOnboardingStore.getState().isOpen).toBe(false);
      expect(mockPush).toHaveBeenCalledWith('/deck-builder');
    });
  });
});
