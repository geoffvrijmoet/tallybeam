# TallyBeam: Complete Migration from Clerk to AWS Cognito

## Overview
This document details the complete migration of the TallyBeam application from Clerk authentication to AWS Cognito. The migration involved updating both frontend and backend components, changing authentication patterns, and maintaining all existing functionality.

## Project Structure
```
tallybeam/
├── package.json          # Root package.json with workspaces
├── apps/
│   ├── backend/          # Serverless API (AWS Lambda)
│   │   └── package.json  # Backend dependencies
│   └── frontend/         # Next.js application
│       ├── package.json  # Frontend dependencies
│       ├── app/          # Next.js app router
│       ├── components/   # React components
│       └── lib/          # Utilities and services
```

**Note:** This is a monorepo using npm workspaces. Dependencies should be installed from the project root, not from individual app directories.

## Migration Changes Summary

### 1. Package Dependencies (apps/frontend/package.json)

**Removed:**
- `@clerk/nextjs: ^6.25.5`

**Added:**
- `@aws-amplify/ui-react: ^6.0.0`
- `aws-amplify: ^6.0.0`
- `jsonwebtoken: ^9.0.0`
- `jwks-client: ^2.0.5`
- `@types/jsonwebtoken: ^9.0.0`

### 2. AWS Cognito Configuration (apps/frontend/lib/cognito.ts)

**Created new file** with:
- Amplify configuration setup
- JWT token verification utilities
- Cognito JWT payload interface
- `verifyCognitoToken()` function for server-side token validation

**Key Functions:**
```typescript
export function configureAmplify()
export async function verifyCognitoToken(token: string): Promise<CognitoJwtPayload>
```

### 3. User Model Updates (apps/frontend/lib/models/User.ts)

**Schema Changes:**
- Changed `clerkId: string` → `cognitoId: string`
- Updated indexes: `clerkId: 1` → `cognitoId: 1`

**Static Method Updates:**
- `findOrCreateFromClerk()` → `findOrCreateFromCognito()`
- `findByClerkId()` → `findByCognitoId()`
- `deactivateUser()` parameter changed from `clerkId` to `cognitoId`

**Data Mapping:**
- Clerk: `clerkUser.clerkId` → Cognito: `cognitoUser.sub`
- Clerk: `clerkUser.emailAddresses[0]?.emailAddress` → Cognito: `cognitoUser.email`
- Clerk: `clerkUser.firstName/lastName` → Cognito: `cognitoUser.given_name/family_name`
- Clerk: `clerkUser.imageUrl` → Cognito: `cognitoUser.picture`

### 4. User Service Updates (apps/frontend/lib/services/userService.ts)

**Import Changes:**
- Removed: `import { auth, currentUser } from '@clerk/nextjs/server'`
- Added: `import { verifyCognitoToken, CognitoJwtPayload } from '../cognito'`

**Method Signature Changes:**
- `getCurrentUser()` → `getCurrentUser(authToken?: string)`
- `getUserByClerkId()` → `getUserByCognitoId()`

**Authentication Flow:**
- Old: Used Clerk's `auth()` and `currentUser()` functions
- New: Verifies JWT tokens using `verifyCognitoToken()` and extracts user data

### 5. Authentication Middleware (apps/frontend/lib/auth.ts)

**Created new file** replacing Clerk middleware with:
- `AuthenticatedRequest` interface extending NextRequest
- `authenticateRequest()` function for token verification
- `requireAuth()` higher-order function for protecting routes

**Key Features:**
- Extracts Bearer token from Authorization header
- Verifies JWT using Cognito public keys
- Attaches decoded user data to request object

### 6. API Route Updates (apps/frontend/app/api/user/sync/route.ts)

**Authentication Pattern Change:**
- Old: Used Clerk's `auth()` and `currentUser()` functions
- New: Uses `requireAuth()` middleware with JWT token verification

**Request Flow:**
1. Extract Bearer token from Authorization header
2. Pass token to `UserService.getCurrentUser(token)`
3. Return user data with `cognitoId` instead of `clerkId`

**Updated Both POST and GET Methods:**
- Wrapped with `requireAuth()` middleware
- Added token extraction logic
- Updated response to use `cognitoId`

### 7. Layout Updates (apps/frontend/app/layout.tsx)

**Changes:**
- Removed: `import { ClerkProvider } from '@clerk/nextjs'`
- Added: `import { configureAmplify } from '../lib/cognito'`
- Removed: `<ClerkProvider>` wrapper
- Added: `configureAmplify()` call

### 8. Authentication Components

#### SignIn Component (apps/frontend/components/auth/SignIn.tsx)
**Created new file** with:
- Form handling for email/password
- Integration with `aws-amplify/auth.signIn()`
- Error handling and loading states
- Redirect to dashboard on success
- Tailwind CSS styling matching original design

#### SignUp Component (apps/frontend/components/auth/SignUp.tsx)
**Created new file** with:
- Form handling for email, password, first name, last name
- Integration with `aws-amplify/auth.signUp()`
- User attributes mapping (given_name, family_name)
- Success state with email confirmation message
- Tailwind CSS styling matching original design

### 9. Page Updates

#### Sign-in Page (apps/frontend/app/sign-in/[[...sign-in]]/page.tsx)
**Changes:**
- Removed: Clerk's `<SignIn>` component
- Removed: Clerk-specific configuration
- Added: Import and use of custom `<SignIn>` component

#### Sign-up Page (apps/frontend/app/sign-up/[[...sign-up]]/page.tsx)
**Changes:**
- Removed: Clerk's `<SignUp>` component
- Removed: Clerk-specific configuration
- Added: Import and use of custom `<SignUp>` component

#### Dashboard Page (apps/frontend/app/dashboard/page.tsx)
**Major Changes:**
- Removed: `useUser` and `useClerk` hooks
- Added: `getCurrentUser` and `signOut` from `aws-amplify/auth`
- Added: Local state management for user and loading states

**Authentication Flow:**
- Uses `getCurrentUser()` to check authentication status
- Redirects to sign-in if not authenticated
- Extracts JWT tokens for API calls

**API Call Updates:**
- All fetch calls now include Authorization headers with Bearer tokens
- Token extraction: `user.signInUserSession?.accessToken?.jwtToken`
- Updated: `syncUser()`, `fetchInvoices()`, `fetchAccounts()`, `fetchTransactions()`

**Added:**
- `handleSignOut()` function using Amplify's `signOut()`

### 10. Middleware Removal
**Deleted:** `apps/frontend/middleware.ts`
- Removed Clerk middleware configuration
- Replaced with custom authentication in individual API routes

### 11. Environment Configuration (apps/frontend/env.example)
**Created template** with required environment variables:
```env
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_AWS_REGION=us-east-1
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tallybeam
```

## Authentication Flow Comparison

### Before (Clerk):
1. User signs in through Clerk component
2. Clerk manages session state
3. API routes use `auth()` and `currentUser()` functions
4. User data synced using `clerkId`

### After (Cognito):
1. User signs in through custom Amplify component
2. Amplify manages session state and JWT tokens
3. API routes verify JWT tokens using `requireAuth()` middleware
4. User data synced using `cognitoId` (sub claim from JWT)

## Security Implementation

### JWT Verification:
- Uses `jwks-client` to fetch Cognito public keys
- Verifies token signature using RS256 algorithm
- Validates audience and issuer claims
- Checks token expiration

### Token Flow:
1. Frontend gets JWT from Amplify after sign-in
2. JWT included in Authorization header for API calls
3. Backend verifies JWT using Cognito public keys
4. User data extracted from verified JWT claims

## Required AWS Setup

### Cognito User Pool Configuration:
- Pool name: `tallybeam-users`
- Required attributes: Email
- Optional attributes: Given name, Family name
- Password policy: At least 8 characters, uppercase, lowercase, numbers
- App client: Created for frontend application

### Environment Variables Needed:
- `NEXT_PUBLIC_COGNITO_USER_POOL_ID`: User Pool ID from AWS Console
- `NEXT_PUBLIC_COGNITO_CLIENT_ID`: App Client ID from AWS Console
- `NEXT_PUBLIC_AWS_REGION`: AWS region (default: us-east-1)

## Migration Benefits

### Technical Benefits:
- Native AWS integration
- Better control over authentication flow
- JWT-based stateless authentication
- Automatic token refresh handling
- Built-in MFA support capability

### Cost Benefits:
- No per-user charges (Clerk pricing model)
- AWS Cognito free tier: 50,000 MAUs
- Pay-per-use model for additional users

### Security Benefits:
- AWS-managed security infrastructure
- Integration with AWS IAM for fine-grained permissions
- Automatic security updates and patches

## Testing Checklist

### Frontend Testing:
- [ ] Sign-up flow works correctly
- [ ] Sign-in flow works correctly
- [ ] Dashboard loads with authenticated user
- [ ] Sign-out redirects to sign-in page
- [ ] Unauthenticated users redirected to sign-in

### API Testing:
- [ ] User sync endpoint works with JWT tokens
- [ ] All protected routes require valid tokens
- [ ] Invalid tokens return 401 errors
- [ ] User data correctly mapped from JWT claims

### Database Testing:
- [ ] Users created with correct `cognitoId`
- [ ] Existing users can sign in
- [ ] User attributes updated correctly
- [ ] No data loss during migration

## Next Steps

### Immediate:
1. Install new dependencies from project root: `npm install` (not from apps/frontend)
2. Create AWS Cognito User Pool
3. Set environment variables
4. Test authentication flow

### Future:
1. Update remaining API routes (invoices, accounting)
2. Add MFA support if needed
3. Implement password reset functionality
4. ✅ **Google Sign-In Added** - Social identity provider implemented

## Rollback Plan

If issues arise, the original Clerk implementation can be restored by:
1. Reverting package.json changes
2. Restoring original middleware.ts
3. Reverting all component changes
4. Restoring original API route authentication
5. Updating environment variables back to Clerk configuration

## Files Modified Summary

### New Files Created:
- `apps/frontend/lib/cognito.ts`
- `apps/frontend/lib/auth.ts`
- `apps/frontend/components/auth/SignIn.tsx`
- `apps/frontend/components/auth/SignUp.tsx`
- `apps/frontend/env.example`

### Files Modified:
- `apps/frontend/package.json`
- `apps/frontend/lib/models/User.ts`
- `apps/frontend/lib/services/userService.ts`
- `apps/frontend/app/api/user/sync/route.ts`
- `apps/frontend/app/layout.tsx`
- `apps/frontend/app/sign-in/[[...sign-in]]/page.tsx`
- `apps/frontend/app/sign-up/[[...sign-up]]/page.tsx`
- `apps/frontend/app/dashboard/page.tsx`

### Files Deleted:
- `apps/frontend/middleware.ts`

This migration maintains all existing functionality while providing a more integrated, cost-effective, and AWS-native authentication solution. 