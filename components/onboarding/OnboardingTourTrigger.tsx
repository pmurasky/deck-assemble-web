'use client';

import React, { useEffect, useRef } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { fetchProfile } from '@/lib/api/profile';
import { useOnboardingStore } from '@/lib/store/useOnboardingStore';
import { OnboardingTourModal } from './OnboardingTourModal';

export function OnboardingTourTrigger() {
  const { user, isLoading } = useUser();
  const openTour = useOnboardingStore((state) => state.openTour);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (isLoading || !user || checkedRef.current) return;
    checkedRef.current = true;

    let isMounted = true;
    fetchProfile()
      .then((profile) => {
        if (isMounted && !profile.onboardingCompletedAt) {
          openTour({ isReplay: false });
        }
      })
      .catch((err) => {
        console.error('Failed to verify user onboarding status:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [user, isLoading, openTour]);

  return <OnboardingTourModal />;
}
