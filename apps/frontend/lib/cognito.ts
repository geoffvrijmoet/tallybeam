import { Amplify } from 'aws-amplify';

// Amplify v6 configuration format with OAuth enabled
// Amplify automatically uses localStorage for token persistence
const cognitoConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
      region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
      loginWith: {
        oauth: {
          domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN!,
          scopes: ['email', 'openid', 'profile'],
          redirectSignIn: [process.env.NEXT_PUBLIC_OAUTH_REDIRECT_SIGNIN || 'http://localhost:3000/auth/callback'],
          redirectSignOut: [process.env.NEXT_PUBLIC_OAUTH_REDIRECT_SIGNOUT || 'http://localhost:3000/'],
          responseType: 'code' as const
        }
      }
    }
  }
};

// Legacy configuration format that's more commonly used and might work better with OAuth
const legacyConfig = {
  Auth: {
    region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
    userPoolWebClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
    oauth: {
      domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN!,
      scope: ['email', 'openid', 'profile'],
      redirectSignIn: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_SIGNIN || 'http://localhost:3000/auth/callback',
      redirectSignOut: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_SIGNOUT || 'http://localhost:3000/',
      responseType: 'code'
    }
  }
};

export function configureAmplify() {
  console.log('🔧 Environment variables check:', {
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ? '✅ Set' : '❌ Missing',
    userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ? '✅ Set' : '❌ Missing',
    region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
    domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN ? '✅ Set' : '❌ Missing',
    redirectSignIn: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_SIGNIN ? '✅ Set' : '❌ Missing',
    redirectSignOut: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_SIGNOUT ? '✅ Set' : '❌ Missing'
  });
  
  console.log('🔧 Configuring Amplify v6 with:', {
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
    userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
    region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
    domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN,
    redirectSignIn: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_SIGNIN,
    redirectSignOut: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_SIGNOUT
  });
  
  if (!process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || !process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || !process.env.NEXT_PUBLIC_COGNITO_DOMAIN) {
    console.error('❌ Missing required Cognito environment variables');
    throw new Error('Cognito configuration is incomplete. Please check your environment variables.');
  }
  
  // Use v6 configuration
  console.log('🔧 Using Amplify v6 configuration');
  Amplify.configure(cognitoConfig);
}

// JWT verification utilities
export interface CognitoJwtPayload {
  sub: string; // User ID
  email: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  exp: number;
  iat: number;
  iss: string;
  aud: string;
}

// JWT verification is now in lib/server/cognito-verify.ts 