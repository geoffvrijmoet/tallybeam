"use client";

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SimpleAnimatedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [key, setKey] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Reset animation state when pathname changes
    setIsVisible(false);
    setKey(prev => prev + 1);
    
    // Trigger animation after a small delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div
      key={key}
      className={`transition-all duration-500 ease-out ${
        isVisible 
          ? 'opacity-100 transform translate-y-0' 
          : 'opacity-0 transform translate-y-4'
      }`}
    >
      {children}
    </div>
  );
} 