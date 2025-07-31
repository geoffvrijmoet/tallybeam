import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export const useAppNavigation = () => {
  const router = useRouter();

  const goToSignIn = useCallback(() => router.push('/sign-in'), [router]);
  const goToSignUp = useCallback(() => router.push('/sign-up'), [router]);
  const goToDashboard = useCallback(() => router.push('/dashboard'), [router]);
  const goToHome = useCallback(() => router.push('/'), [router]);

  return {
    goToSignIn,
    goToSignUp,
    goToDashboard,
    goToHome,
  };
}; 