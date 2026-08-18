import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OnboardingTourTrigger } from '@/components/onboarding/OnboardingTourTrigger';
import { useOnboardingStore } from '@/lib/store/useOnboardingStore';
import * as profileApi from '@/lib/api/profile';
import * as authClient from '@auth0/nextjs-auth0/client';

vi.mock('@/lib/api/profile');
vi.mock('@auth0/nextjs-auth0/client');

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('OnboardingTourTrigger Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useOnboardingStore.setState({
      isOpen: false,
      isReplay: false,
      currentStep: 0,
      isSaving: false,
    });
  });

  it('triggers tour automatically when user is authenticated and onboardingCompletedAt is null', async () => {
    // Given
    vi.spyOn(authClient, 'useUser').mockReturnValue({
      user: { sub: 'auth0|123', name: 'Peter' },
      isLoading: false,
    } as ReturnType<typeof authClient.useUser>);

    vi.mocked(profileApi.fetchProfile).mockResolvedValue({
      id: 1,
      displayName: 'Peter',
      email: 'peter@example.com',
      onboardingCompletedAt: null,
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
    });

    // When
    render(<OnboardingTourTrigger />);

    // Then
    await waitFor(() => {
      expect(profileApi.fetchProfile).toHaveBeenCalled();
      expect(useOnboardingStore.getState().isOpen).toBe(true);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/Your MTG Decks Hub/i)).toBeInTheDocument();
    });
  });

  it('does not trigger tour when onboardingCompletedAt is already set', async () => {
    // Given
    vi.spyOn(authClient, 'useUser').mockReturnValue({
      user: { sub: 'auth0|123', name: 'Peter' },
      isLoading: false,
    } as ReturnType<typeof authClient.useUser>);

    vi.mocked(profileApi.fetchProfile).mockResolvedValue({
      id: 1,
      displayName: 'Peter',
      email: 'peter@example.com',
      onboardingCompletedAt: '2026-08-18T10:00:00.000Z',
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-18T10:00:00Z',
    });

    // When
    render(<OnboardingTourTrigger />);

    // Then
    await waitFor(() => {
      expect(profileApi.fetchProfile).toHaveBeenCalled();
    });
    expect(useOnboardingStore.getState().isOpen).toBe(false);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('does not trigger tour when user is not authenticated', async () => {
    // Given
    vi.spyOn(authClient, 'useUser').mockReturnValue({
      user: undefined,
      isLoading: false,
    } as ReturnType<typeof authClient.useUser>);

    // When
    render(<OnboardingTourTrigger />);

    // Then
    expect(profileApi.fetchProfile).not.toHaveBeenCalled();
    expect(useOnboardingStore.getState().isOpen).toBe(false);
  });

  it('handles fetchProfile errors gracefully', async () => {
    // Given
    vi.spyOn(authClient, 'useUser').mockReturnValue({
      user: { sub: 'auth0|123', name: 'Peter' },
      isLoading: false,
    } as ReturnType<typeof authClient.useUser>);

    vi.mocked(profileApi.fetchProfile).mockRejectedValue(new Error('Network error'));

    // When
    render(<OnboardingTourTrigger />);

    // Then
    await waitFor(() => {
      expect(profileApi.fetchProfile).toHaveBeenCalled();
    });
    expect(useOnboardingStore.getState().isOpen).toBe(false);
  });
});
