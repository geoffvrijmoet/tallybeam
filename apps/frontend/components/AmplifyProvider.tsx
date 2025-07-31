"use client";

import { useEffect, useState } from 'react';
import { configureAmplify } from '../lib/cognito';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 