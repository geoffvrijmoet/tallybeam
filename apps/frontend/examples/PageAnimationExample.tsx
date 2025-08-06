"use client";

import { useState, useEffect } from 'react';
import PageAnimation from '../components/ui/PageAnimation';
import { usePageAnimation } from '../hooks/usePageAnimation';
import LoadingScreen from '../components/ui/LoadingScreen';

export default function PageAnimationExample() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // Page animation hook - waits for loading to finish
  const { shouldAnimate } = usePageAnimation({
    isLoading: loading,
    loadingDuration: 500, // Wait 500ms after loading finishes
    animationType: 'slideUp',
    animationDuration: 400,
    animationDelay: 0
  });

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setData({ message: 'Data loaded!' });
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <LoadingScreen 
        title="Loading page..." 
        subtitle="Please wait while we load your content."
        spinnerType="custom"
        spinnerColor="violet"
        spinnerSize="medium"
      />
    );
  }

  return (
    <PageAnimation trigger={shouldAnimate} type="slideUp" duration={400}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Page Animation Example
          </h1>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              How it works:
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Page starts with LoadingScreen component</li>
              <li>Data loads in the background</li>
              <li>LoadingScreen disappears</li>
              <li>PageAnimation triggers after 500ms delay</li>
              <li>Content slides up smoothly</li>
            </ol>
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <p className="text-green-800 font-medium">
                ✅ {data?.message}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageAnimation>
  );
} 