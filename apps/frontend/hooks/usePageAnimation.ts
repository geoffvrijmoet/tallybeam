import { useState, useEffect } from 'react';

interface UsePageAnimationProps {
  isLoading?: boolean;
  loadingDuration?: number;
  animationType?: 'fade' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'zoom' | 'blur';
  animationDuration?: number;
  animationDelay?: number;
  skipLoading?: boolean; // New option to skip all loading coordination
}

export function usePageAnimation({
  isLoading = false,
  loadingDuration = 1000,
  animationType = 'slideUp',
  animationDuration = 400,
  animationDelay = 0,
  skipLoading = false
}: UsePageAnimationProps = {}) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (skipLoading) {
      // Skip all loading coordination - animate immediately
      const timer = setTimeout(() => {
        setShouldAnimate(true);
      }, 50); // Just a small delay for mount

      return () => clearTimeout(timer);
    } else if (!isLoading) {
      // Wait for loading to finish, then trigger animation
      const timer = setTimeout(() => {
        setShouldAnimate(true);
      }, loadingDuration + animationDelay);

      return () => clearTimeout(timer);
    } else {
      // Reset animation state when loading starts
      setShouldAnimate(false);
    }
  }, [isLoading, loadingDuration, animationDelay, skipLoading]);

  return {
    shouldAnimate,
    animationType,
    animationDuration,
    animationDelay
  };
} 