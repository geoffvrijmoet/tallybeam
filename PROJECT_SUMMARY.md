# TallyBeam Project Summary

## Project Overview

**TallyBeam** is a full-stack invoicing and accounting application built with modern web technologies. The project follows a monorepo structure with separate frontend and backend applications, designed for scalability and maintainability.

## Architecture Overview

### Tech Stack

**Frontend:**
- **Framework:** Next.js 15.4.4 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** AWS Cognito
- **State Management:** React hooks with local state
- **Deployment:** Vercel (implied by Next.js structure)

**Backend:**
- **Runtime:** Node.js 20
- **Framework:** AWS Lambda + API Gateway (Serverless)
- **Language:** TypeScript
- **Database:** MongoDB Atlas
- **Authentication:** AWS Cognito
- **Deployment:** AWS (Serverless Framework)
- **Domain:** Custom domain (api.tallybeam.com) with CloudFront

### Project Structure

```
tallybeam/
├── apps/
│   ├── backend/                 # AWS Lambda backend
│   │   ├── src/
│   │   │   ├── handlers/        # Lambda function handlers
│   │   │   ├── services/        # Business logic services
│   │   │   ├── models/          # Database models
│   │   │   └── lib/             # Utilities and database connection
│   │   ├── serverless.yml       # Serverless configuration
│   │   └── package.json
│   └── frontend/                # Next.js frontend
│       ├── app/                 # Next.js App Router
│       │   ├── api/             # API routes (for local development)
│       │   ├── dashboard/       # Dashboard pages
│       │   ├── invoices/        # Invoice management pages
│       │   └── sign-in/         # Authentication pages
│       ├── components/          # Reusable React components
│       ├── lib/                 # Utilities and services
│       └── package.json
├── package.json                 # Root package.json (monorepo)
└── README.md
```

## Backend Architecture (AWS Lambda + API Gateway)

### Serverless Configuration (`serverless.yml`)

The backend uses Serverless Framework with the following key configurations:

- **Custom Domain:** `api.tallybeam.com` with CloudFront distribution
- **CORS:** Configured for cross-origin requests
- **Functions:** Individual Lambda functions for each API endpoint
- **Environment:** Development stage with proper resource naming

### API Endpoints

1. **Authentication:**
   - `POST /user/sync` - Sync user with Cognito tokens
   - `GET /user` - Get user information

2. **Accounting:**
   - `GET /accounting/accounts` - Retrieve user accounts
   - `GET /accounting/transactions` - Retrieve user transactions

3. **Invoices:**
   - `GET /invoices` - List all invoices
   - `POST /invoices` - Create new invoice
   - `GET /invoices/{id}` - Get specific invoice
   - `GET /invoices/{id}/pdf` - Generate PDF invoice

4. **CORS:** OPTIONS handlers for all endpoints

### Database Models

**Transaction Model** (MongoDB):
```typescript
{
  _id: ObjectId,
  userId: string,              // Cognito user ID or 'anonymous'
  transactionNumber: string,   // Auto-generated invoice number
  date: Date,                  // Transaction date
  description: string,         // Invoice description
  type: 'invoice' | 'payment' | 'expense',
  status: 'posted' | 'pending',
  totalDebit: number,          // Invoice amount
  totalCredit: number,
  isBalanced: boolean,
  
  // Invoice-specific fields
  clientName: string,
  clientEmail?: string,
  currency: string,            // Default: 'USD'
  dueDate: Date,
  issueDate: Date,
  notes?: string,
  invoiceStatus: 'draft' | 'sent' | 'paid',
  paymentMethod: string,       // Default: 'venmo'
  venmoUsername?: string
}
```

### Services Architecture

**InvoiceService:**
- `createInvoice()` - Creates new invoice transactions
- `getInvoices()` - Retrieves invoices for a user
- Handles invoice number generation (format: `TB-{timestamp}-{random}`)
- Manages Eastern timezone for dates

**UserService:**
- Handles Cognito token verification
- Manages user synchronization

### Authentication Flow

1. **Frontend:** User signs in via AWS Cognito
2. **Token Storage:** JWT tokens stored in browser storage
3. **API Calls:** Tokens sent in Authorization header
4. **Backend:** Verifies tokens using AWS Cognito SDK
5. **User Context:** User ID extracted from verified tokens

## Frontend Architecture (Next.js)

### Page Structure

1. **Landing Page** (`/`) - Invoice creation form
2. **Dashboard** (`/dashboard`) - Overview of invoices, accounts, transactions
3. **Invoice Details** (`/invoices/[id]`) - Individual invoice view
4. **Authentication** (`/sign-in`, `/sign-up`) - Cognito authentication

### State Management

- **Local State:** React hooks for component state
- **API State:** Custom hooks for data fetching
- **Authentication:** Cognito tokens stored in browser storage
- **Error Handling:** Try-catch blocks with user-friendly error messages

### API Integration

**Direct API Gateway Calls:**
- Frontend makes direct calls to AWS API Gateway
- Bypasses custom domain for development debugging
- Uses stored Cognito tokens for authentication

**Data Fetching Pattern:**
```typescript
const fetchDataWithTokens = async (tokens) => {
  const response = await fetch(API_URL, {
    headers: {
      'Authorization': `Bearer ${tokens.accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};
```

### Component Architecture

**Key Components:**
- `InvoiceDisplay` - Renders invoice data
- `InvoicePreview` - PDF preview functionality
- `InvoiceDocument` - PDF generation component

**Styling:**
- Tailwind CSS for responsive design
- Gradient backgrounds and modern UI
- Consistent color scheme and typography

## Development Workflow & Issues Resolved

### Major Issues Fixed

1. **Handler Export Issues:**
   - **Problem:** Lambda functions couldn't find exported handlers
   - **Solution:** Fixed export structure in `accounting.ts` and `invoices.ts`
   - **Change:** Changed from object methods to direct function exports

2. **Missing Service Methods:**
   - **Problem:** `InvoiceService.getInvoices()` method didn't exist
   - **Solution:** Added the missing method to retrieve invoices from MongoDB
   - **Implementation:** Query by `type: 'invoice'` with date sorting

3. **Frontend Error Handling:**
   - **Problem:** `TypeError: Cannot read properties of undefined (reading 'toFixed')`
   - **Solution:** Added null checks and default values for all transaction properties
   - **Fixed Properties:** `totalDebit`, `type`, `description`, `transactionNumber`, `date`, `status`, `_id`

4. **CORS Configuration:**
   - **Problem:** Cross-origin requests failing
   - **Solution:** Proper CORS headers in all Lambda responses
   - **Implementation:** Consistent headers across all endpoints

### Deployment Process

**Backend Deployment:**
```bash
cd apps/backend
npx serverless deploy
```

**Frontend Deployment:**
- Implied Vercel deployment (Next.js standard)
- Environment variables configured for API endpoints

### Environment Configuration

**Backend Environment:**
- MongoDB connection string
- AWS Cognito configuration
- Custom domain settings

**Frontend Environment:**
- API Gateway URLs
- Cognito user pool configuration
- Development vs production API endpoints

## Security Considerations

1. **Authentication:** AWS Cognito JWT tokens
2. **Authorization:** Token verification on all protected endpoints
3. **CORS:** Properly configured for production domains
4. **Database:** MongoDB Atlas with network security
5. **API Gateway:** Custom domain with SSL/TLS

## Scalability Features

1. **Serverless:** Auto-scaling Lambda functions
2. **Database:** MongoDB Atlas cloud database
3. **CDN:** CloudFront for API responses
4. **Monorepo:** Organized codebase for team development
5. **TypeScript:** Type safety across the stack

## Current Status

✅ **Working Features:**
- User authentication with Cognito
- Invoice creation and storage
- Invoice listing and retrieval
- Account and transaction data (mock data)
- PDF invoice generation
- Dashboard with transaction overview
- Error handling and fallback values

🔄 **In Progress/Planned:**
- Real accounting integration
- Payment processing
- Advanced invoice management
- User-specific data filtering
- Production deployment optimization

## Development Notes

- **Timezone Handling:** Eastern timezone for invoice dates
- **Error Logging:** Comprehensive logging in Lambda functions
- **Mock Data:** Accounts and transactions currently return mock data
- **Database:** MongoDB Atlas with proper indexing
- **API Versioning:** Ready for versioned API endpoints

## Key Learnings

1. **Serverless Handler Exports:** Must export functions directly, not as object methods
2. **CORS Configuration:** Essential for frontend-backend communication
3. **Error Handling:** Both frontend and backend need comprehensive error handling
4. **Authentication Flow:** Cognito integration requires proper token management
5. **Database Design:** Flexible schema for different transaction types
6. **TypeScript Benefits:** Catches many issues at compile time

This architecture provides a solid foundation for a scalable invoicing application with modern web technologies and cloud infrastructure. 