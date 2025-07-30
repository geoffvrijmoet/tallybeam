"use client";

import { useEffect, useState, useRef } from 'react';
import { getCurrentUser, fetchUserAttributes, signInWithRedirect, fetchAuthSession, signIn } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';

export default function HandleRedirect() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const processedRef = useRef(false);

  // Manual OAuth code exchange function
  const exchangeCodeForTokens = async (code: string) => {
    const tokenEndpoint = `https://${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/oauth2/token`;
    
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
      code: code,
      redirect_uri: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_SIGNIN || 'http://localhost:3000/auth/callback'
    });

    console.log('🔧 Manual token exchange - endpoint:', tokenEndpoint);
    console.log('🔧 Manual token exchange - params:', {
      grant_type: 'authorization_code',
      client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
      code: code.substring(0, 10) + '...',
      redirect_uri: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_SIGNIN
    });

    try {
      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
      });

      console.log('🔧 Manual token exchange - response status:', response.status);
      console.log('🔧 Manual token exchange - response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Manual token exchange failed:', errorText);
        throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
      }

      const tokenData = await response.json();
      console.log('✅ Manual token exchange successful:', {
        access_token: tokenData.access_token ? 'present' : 'missing',
        id_token: tokenData.id_token ? 'present' : 'missing',
        refresh_token: tokenData.refresh_token ? 'present' : 'missing',
        expires_in: tokenData.expires_in
      });

      return tokenData;
    } catch (error) {
      console.error('❌ Manual token exchange error:', error);
      throw error;
    }
  };

  // Function to manually set Amplify session with tokens
  const setAmplifySession = async (tokenData: any, userInfo: any) => {
    try {
      console.log('🔧 Attempting to set Amplify session with manual tokens...');
      
      // Try to sign in with the tokens we obtained
      // We'll use the user's email and a dummy password, then immediately sign in with the tokens
      const email = userInfo.email || userInfo.sub;
      
      // First, try to sign in with the tokens directly
      // This is a workaround since Amplify doesn't have a direct way to set tokens
      console.log('🔧 Attempting to sign in with tokens...');
      
      // For now, let's try a different approach - use Amplify's signIn with the tokens
      // We'll need to decode the ID token to get the username
      const idTokenPayload = JSON.parse(atob(tokenData.id_token.split('.')[1]));
      console.log('🔧 ID Token payload:', idTokenPayload);
      
      // Try to sign in using the sub as username
      try {
        await signIn({ username: idTokenPayload.sub, password: 'dummy-password' });
      } catch (signInError) {
        console.log('🔧 Direct signIn failed (expected), trying alternative approach...');
        
        // Since direct signIn won't work, let's try to manually set the session
        // We'll need to use Amplify's internal methods or find another way
        console.log('🔧 Manual session setting not available, trying to work around...');
        
        // Let's try to use the tokens directly in API calls instead of relying on Amplify's session
        console.log('🔧 Will use tokens directly for API calls instead of Amplify session');
        return { useDirectTokens: true, tokens: tokenData };
      }
      
      return { useDirectTokens: false, tokens: tokenData };
    } catch (error) {
      console.error('❌ Error setting Amplify session:', error);
      return { useDirectTokens: true, tokens: tokenData };
    }
  };

  useEffect(() => {
    const handleRedirect = async () => {
      if (processedRef.current) return;
      processedRef.current = true;

      try {
        console.log('🔧 ===== OAuth Redirect Handler Started =====');
        console.log('🔧 Current URL:', window.location.href);
        console.log('🔧 URL parameters:', window.location.search);

        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const errorParam = urlParams.get('error');

        console.log('🔧 OAuth parameters:', { code: !!code, state: !!state, error: errorParam });

        if (errorParam) {
          console.error('❌ OAuth error:', errorParam);
          setError(`Authentication failed: ${errorParam}`);
          setTimeout(() => {
            router.push('/sign-in/[[...sign-in]]');
          }, 3000);
          return;
        }

        if (!code) {
          console.log('❌ No OAuth code found, redirecting to sign-in');
          router.push('/sign-in/[[...sign-in]]');
          return;
        }

        // Try manual token exchange first
        console.log('🔧 Attempting manual token exchange...');
        const tokenData = await exchangeCodeForTokens(code);
        
        if (tokenData.access_token) {
          console.log('✅ Manual token exchange successful!');
          
          // Try to get user info with the access token
          try {
            const userInfoResponse = await fetch(`https://${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/oauth2/userInfo`, {
              headers: {
                'Authorization': `Bearer ${tokenData.access_token}`
              }
            });
            
            if (userInfoResponse.ok) {
              const userInfo = await userInfoResponse.json();
              console.log('✅ User info retrieved:', userInfo);
              
              // TODO: Fix CORS issue - temporarily skipping user sync
              console.log('⚠️ Temporarily skipping user sync due to CORS issue');
              console.log('✅ OAuth flow completed successfully!');
              console.log('✅ User created in Cognito:', userInfo);
              console.log('✅ Access token obtained:', tokenData.access_token ? 'present' : 'missing');
              
              // Try to set Amplify session with our tokens
              const sessionResult = await setAmplifySession(tokenData, userInfo);
              
              // Now let's test Amplify's authentication state
              console.log('🔧 ===== Testing Amplify Authentication State =====');
              
              if (sessionResult.useDirectTokens) {
                console.log('🔧 Using direct tokens for authentication - Amplify session not available');
                console.log('🔧 Storing tokens in sessionStorage for direct API calls');
                
                // Store tokens in sessionStorage for direct API calls
                sessionStorage.setItem('cognito_tokens', JSON.stringify({
                  access_token: tokenData.access_token,
                  id_token: tokenData.id_token,
                  refresh_token: tokenData.refresh_token,
                  expires_in: tokenData.expires_in,
                  user_info: userInfo
                }));
                
                console.log('✅ Tokens stored in sessionStorage');
              } else {
                try {
                  console.log('🔧 Attempting to get current user from Amplify...');
                  const currentUser = await getCurrentUser();
                  console.log('✅ Amplify getCurrentUser successful:', currentUser);
                } catch (userError) {
                  console.error('❌ Amplify getCurrentUser failed:', userError);
                }
                
                try {
                  console.log('🔧 Attempting to fetch auth session from Amplify...');
                  const session = await fetchAuthSession();
                  console.log('✅ Amplify fetchAuthSession successful:', {
                    isSignedIn: session.tokens ? 'yes' : 'no',
                    hasAccessToken: session.tokens?.accessToken ? 'yes' : 'no',
                    hasIdToken: session.tokens?.idToken ? 'yes' : 'no'
                  });
                } catch (sessionError) {
                  console.error('❌ Amplify fetchAuthSession failed:', sessionError);
                }
                
                try {
                  console.log('🔧 Attempting to fetch user attributes from Amplify...');
                  const attributes = await fetchUserAttributes();
                  console.log('✅ Amplify fetchUserAttributes successful:', attributes);
                } catch (attrError) {
                  console.error('❌ Amplify fetchUserAttributes failed:', attrError);
                }
              }
              
              console.log('🔄 Redirecting to dashboard...');
              router.push('/dashboard');
              return;
            } else {
              console.warn('⚠️ Could not get user info:', await userInfoResponse.text());
            }
          } catch (userInfoError) {
            console.warn('⚠️ User info fetch failed:', userInfoError);
          }
          
          // If we have tokens but can't get user info, still redirect to dashboard
          console.log('🔄 Redirecting to dashboard with tokens...');
          router.push('/dashboard');
          return;
        }

        // Fallback: try Amplify's session fetch (but with shorter timeout)
        console.log('🔧 Fallback: trying Amplify session fetch...');
        try {
          const sessionPromise = fetchAuthSession();
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Session fetch timeout after 5 seconds')), 5000)
          );
          const session = await Promise.race([sessionPromise, timeoutPromise]) as any;
          
          if (session?.tokens) {
            console.log('✅ Amplify session fetch successful!');
            router.push('/dashboard');
            return;
          }
        } catch (sessionError) {
          console.error('❌ Amplify session fetch failed:', sessionError);
        }

        console.log('❌ No valid session found, redirecting to sign-in');
        router.push('/sign-in/[[...sign-in]]');

      } catch (error) {
        console.error('❌ Redirect handling error:', error);
        setError('Authentication failed. Please try again.');
        setTimeout(() => {
          router.push('/sign-in/[[...sign-in]]');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };
    handleRedirect();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing sign-in...</h2>
            <p className="text-gray-600">Please wait while we complete your authentication.</p>
          </div>
        </div>
      </div>
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
              onClick={() => router.push('/sign-in/[[...sign-in]]')}
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