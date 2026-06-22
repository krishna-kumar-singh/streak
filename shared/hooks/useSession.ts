import { useState, useEffect } from 'react';
import { useAuthStore } from '@/shared/store';

export function useOnboarding() {
  const { profile, fetchProfile, checkOnboarding } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    await fetchProfile();
    const hasCompletedOnboarding = checkOnboarding();
    setNeedsOnboarding(!hasCompletedOnboarding);
    setIsLoading(false);
  };

  return { isLoading, needsOnboarding, profile };
}
