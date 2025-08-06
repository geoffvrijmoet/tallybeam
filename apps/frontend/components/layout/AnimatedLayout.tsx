"use client";

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import PageAnimation from '../ui/PageAnimation';

interface AnimatedLayoutProps {
  children: React.ReactNode;
  animationType?: 'fade' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'zoom' | 'blur';
  duration?: number;
  delay?: number;
}

export default function AnimatedLayout({ 
  children, 
  animationType = 'slideUp',
  duration = 400,
  delay = 0
}: AnimatedLayoutProps) {
  const pathname = usePathname();
  const [key, setKey] = useState(0);

  useEffect(() => {
    // Force re-render when pathname changes to trigger animation
    setKey(prev => prev + 1);
  }, [pathname]);

  return (
    <PageAnimation
      key={key}
      type={animationType}
      duration={duration}
      delay={delay}
      className="min-h-screen"
    >
      {children}
    </PageAnimation>
  );
} 