"use client";

import { useEffect, useState } from 'react';

interface SimplePageAnimationProps {
  children: React.ReactNode;
  className?: string;
}

export default function SimplePageAnimation({ children, className = "" }: SimplePageAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Simple: just animate after mount
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`transition-all duration-500 ease-out ${
        isVisible 
          ? 'opacity-100 transform translate-y-0' 
          : 'opacity-0 transform translate-y-4'
      } ${className}`}
    >
      {children}
    </div>
  );
} 