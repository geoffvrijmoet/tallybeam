"use client";

import { useEffect, useState, useRef } from 'react';
import { getCurrentUser, fetchUserAttributes, fetchAuthSession, signInWithRedirect } from 'aws-amplify/auth';
import { useAppNavigation } from '../../lib/navigation';
import LoadingScreen from '../ui/LoadingScreen';

export default function HandleRedirect() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigation = useAppNavigation();
  const processedRef = useRef(false);

  useEffect(() => {
    const handleOAuthRedirect = async () => {
      if (processedRef.current) return;
      processedRef.current = true;

      try {
        console.log('🔧 ===== Amplify OAuth Redirect Handler Started =====');
        console.log('🔧 Current URL:', window.location.href);

        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const errorParam = urlParams.get('error');

        console.log('🔧 OAuth parameters:', { code: !!code, state: !!state, error: errorParam });

        if (errorParam) {
          console.error('❌ OAuth error:', errorParam);
          setError(`Authentication failed: ${errorParam}`);
          setTimeout(() => {
            navigation.goToSignIn();
          }, 3000);
          return;
        }

        if (!code) {
          console.log('❌ No OAuth code found, redirecting to sign-in');
          navigation.goToSignIn();
          return;
        }

        // Wait a moment for Amplify to process the OAuth redirect
        console.log('🔧 Waiting for Amplify to process OAuth redirect...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if we have a valid session after redirect
        try {
          const session = await fetchAuthSession();
          if (session.tokens) {
            console.log('✅ Amplify OAuth redirect successful!');
            console.log('✅ Session tokens available:', {
              hasAccessToken: !!session.tokens.accessToken,
              hasIdToken: !!session.tokens.idToken
            });
            
            // Get user info
            try {
              const currentUser = await getCurrentUser();
              console.log('✅ Current user:', currentUser);
            } catch (userError) {
              console.error('❌ Error getting current user:', userError);
            }
            
            console.log('🔄 Redirecting to dashboard...');
            navigation.goToDashboard();
            return;
          }
        } catch (sessionError) {
          console.error('❌ Error checking session after OAuth redirect:', sessionError);
        }

        // If Amplify didn't handle it automatically, try manual token exchange
        console.log('🔧 Amplify did not handle OAuth automatically, trying manual token exchange...');
        
        try {
          // Manual token exchange
          const tokenEndpoint = `https://${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/oauth2/token`;
          
          const params = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
            code: code,
            redirect_uri: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_SIGNIN || 'http://localhost:3000/auth/callback'
          });

          console.log('🔧 Manual token exchange request details:', {
            endpoint: tokenEndpoint,
            clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
            redirectUri: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_SIGNIN || 'http://localhost:3000/auth/callback',
            codeLength: code.length
          });

          const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString()
          });

          console.log('🔧 Token exchange response status:', response.status);
          console.log('🔧 Token exchange response headers:', Object.fromEntries(response.headers.entries()));

          if (response.ok) {
            const tokenData = await response.json();
            console.log('✅ Manual token exchange successful');
            console.log('✅ Token data received:', {
              hasAccessToken: !!tokenData.access_token,
              hasIdToken: !!tokenData.id_token,
              hasRefreshToken: !!tokenData.refresh_token,
              expiresIn: tokenData.expires_in
            });
            
            // Store tokens in localStorage for persistence
            localStorage.setItem('amplify-authenticator-authToken', tokenData.access_token);
            localStorage.setItem('amplify-authenticator-idToken', tokenData.id_token);
            if (tokenData.refresh_token) {
              localStorage.setItem('amplify-authenticator-refreshToken', tokenData.refresh_token);
            }
            
            console.log('✅ Tokens stored in localStorage');
            console.log('🔄 Redirecting to dashboard...');
            navigation.goToDashboard();
            return;
          } else {
            const errorText = await response.text();
            console.error('❌ Manual token exchange failed:', response.status, response.statusText);
            console.error('❌ Error response body:', errorText);
          }
        } catch (error) {
          console.error('❌ Manual token exchange error:', error);
        }
        
        console.log('❌ OAuth handling failed, redirecting to sign-in');
        navigation.goToSignIn();

      } catch (error) {
        console.error('❌ OAuth redirect handling error:', error);
        setError('Authentication failed. Please try again.');
        setTimeout(() => {
          navigation.goToSignIn();
        }, 3000);
      } finally {
        setLoading(false);
      }
    };
    handleOAuthRedirect();
  }, [navigation]);

  if (loading) {
    return (
      <LoadingScreen 
        title="Completing sign-in..." 
        subtitle="Please wait while we complete your authentication."
        spinnerType="custom"
        spinnerColor="violet"
        spinnerSize="medium"
        className="bg-gradient-to-br from-blue-50 to-indigo-100"
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigation.goToSignIn()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 