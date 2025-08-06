"use client";

import { useEffect, useState } from 'react';
import { configureAmplify } from '../lib/cognito';
import LoadingScreen from './ui/LoadingScreen';

export default function AmplifyProvider({ children }: { children: React.ReactNode }) {
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    try {
      configureAmplify();
      setIsConfigured(true);
    } catch (error) {
      console.error('Failed to configure Amplify:', error);
    }
  }, []);

  // Don't render children until Amplify is configured
  if (!isConfigured) {
    return (
      <LoadingScreen 
        title="" 
        subtitle=""
        spinnerType="custom"
        spinnerColor="violet"
        spinnerSize="medium"
        className="bg-gradient-to-br from-blue-50 to-indigo-100"
      />
    );
  }

  return <>{children}</>;
} 