"use client";

import { useEffect, useState } from 'react';

interface PageAnimationProps {
  children: React.ReactNode;
  type?: 'fade' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'zoom' | 'blur';
  duration?: number;
  delay?: number;
  className?: string;
  trigger?: boolean;
}

export default function PageAnimation({ 
  children, 
  type = 'fade', 
  duration = 300, 
  delay = 0,
  className = "",
  trigger
}: PageAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (trigger !== undefined) {
      // If trigger prop is provided, use it
      setIsVisible(trigger);
    } else {
      // Otherwise, auto-trigger after mount
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  const getAnimationClass = () => {
    const animationMap = {
      fade: 'opacity-0',
      slideUp: 'transform translate-y-8 opacity-0',
      slideDown: 'transform -translate-y-8 opacity-0',
      slideLeft: 'transform translate-x-8 opacity-0',
      slideRight: 'transform -translate-x-8 opacity-0',
      scale: 'transform scale-95 opacity-0',
      zoom: 'transform scale-105 opacity-0',
      blur: 'blur-sm opacity-0'
    };
    return animationMap[type];
  };

  const getVisibleClass = () => {
    const visibleMap = {
      fade: 'opacity-100',
      slideUp: 'transform translate-y-0 opacity-100',
      slideDown: 'transform translate-y-0 opacity-100',
      slideLeft: 'transform translate-x-0 opacity-100',
      slideRight: 'transform translate-x-0 opacity-100',
      scale: 'transform scale-100 opacity-100',
      zoom: 'transform scale-100 opacity-100',
      blur: 'blur-0 opacity-100'
    };
    return visibleMap[type];
  };

  return (
    <div
      className={`${getAnimationClass()} ${isVisible ? getVisibleClass() : ''} ${className}`}
      style={{
        transition: `all ${duration}ms ease-out`,
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
} 