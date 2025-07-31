"use client";

import { signOut } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import { useAppNavigation } from '../../lib/navigation';

export default function SignOut() {
  const router = useRouter();
  const navigation = useAppNavigation();
  const handleSignOut = async () => {
    try {
      await signOut();
      console.log('✅ Successfully signed out');
      navigation.goToSignIn();
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if there's an error, redirect to sign-in
      navigation.goToSignIn();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-lg rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign Out</h2>
          <p className="text-gray-600 mb-6">Are you sure you want to sign out?</p>
          <button
            onClick={handleSignOut}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
} 