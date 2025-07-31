"use client";

import { useAppNavigation } from "../../lib/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, signOut } from "aws-amplify/auth";
import { fetchAuthSession } from "aws-amplify/auth";

export default function DashboardPage() {
  const navigation = useAppNavigation();
  const [user, setUser] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔧 Checking authentication...');
        
        // First, check if we have tokens stored in sessionStorage from manual OAuth
        const storedTokens = sessionStorage.getItem('cognito_tokens');
        
        if (storedTokens) {
          try {
            const tokens = JSON.parse(storedTokens);
            console.log('✅ Using stored tokens for authentication');
            
            // Set user from stored tokens
            setUser(tokens.user_info);
            setIsLoaded(true);
            
            // Use stored tokens for API calls
            syncUserWithTokens(tokens);
            fetchInvoicesWithTokens(tokens);
            fetchAccountsWithTokens(tokens);
            fetchTransactionsWithTokens(tokens);
            
            return; // Don't try Amplify auth
          } catch (tokenError) {
            console.error('❌ Error parsing stored tokens:', tokenError);
          }
        }
        
        // Fallback: try Amplify authentication
        console.log('🔧 Trying Amplify authentication...');
        const currentUser = await getCurrentUser();
        console.log('✅ Amplify authentication successful');
        setUser(currentUser);
        setIsLoaded(true);
        
        if (currentUser) {
          // Sync user with MongoDB and fetch data
          syncUser();
          fetchInvoices();
          fetchAccounts();
          fetchTransactions();
        }
      } catch (error) {
        console.error('❌ Authentication failed:', error);
        setIsLoaded(true);
        navigation.goToSignIn();
      }
    };

    checkAuth();
  }, []); // Empty dependency array since checkAuth doesn't depend on navigation

  const syncUser = async () => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString();
      if (token) {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.tallybeam.com/dev';
        await fetch(`${apiBaseUrl}/user/sync`, { 
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        // Also setup default chart of accounts
        await fetch(`${apiBaseUrl}/accounting/setup`, { 
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Error syncing user:', error);
    }
  };

  const fetchInvoices = async () => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString();
      if (token) {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.tallybeam.com/dev';
        const response = await fetch(`${apiBaseUrl}/invoices`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setInvoices(data.invoices || []);
        }
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString();
      if (token) {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.tallybeam.com/dev';
        const response = await fetch(`${apiBaseUrl}/accounting/accounts`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setAccounts(data.accounts || []);
        }
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString();
      if (token) {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.tallybeam.com/dev';
        const response = await fetch(`${apiBaseUrl}/accounting/transactions`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setTransactions(data.transactions || []);
        }
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  // Functions to use stored tokens for API calls
  const syncUserWithTokens = async (tokens: any) => {
    try {
      // Temporarily use direct API Gateway URL to test if custom domain is the issue
      const apiBaseUrl = 'https://yelptc4qye.execute-api.us-east-1.amazonaws.com/dev';
      const fullUrl = `${apiBaseUrl}/user/sync`;
      
      console.log('🔍 [syncUserWithTokens] Environment check:');
      console.log('  - NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
      console.log('  - apiBaseUrl:', apiBaseUrl);
      console.log('  - Full URL:', fullUrl);
      console.log('  - Token exists:', !!tokens.access_token);
      
      // Make a simple request to avoid CORS preflight
      console.log('🔍 [syncUserWithTokens] Making fetch request...');
      const response = await fetch(fullUrl, { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.id_token}`
        },
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (response.ok) {
        console.log('✅ User synced with stored tokens');
      } else {
        console.error('❌ User sync failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error syncing user with stored tokens:', error);
    }
  };

  const fetchInvoicesWithTokens = async (tokens: any) => {
    try {
      // Temporarily use direct API Gateway URL to test
      const apiBaseUrl = 'https://yelptc4qye.execute-api.us-east-1.amazonaws.com/dev';
      const fullUrl = `${apiBaseUrl}/invoices`;
      
      console.log('🔍 [fetchInvoicesWithTokens] Environment check:');
      console.log('  - NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
      console.log('  - apiBaseUrl:', apiBaseUrl);
      console.log('  - Full URL:', fullUrl);
      console.log('  - Token exists:', !!tokens.access_token);
      
      // Make a simple request to avoid CORS preflight
      console.log('🔍 [fetchInvoicesWithTokens] Making fetch request...');
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokens.id_token}`
        },
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
        console.log('✅ Invoices fetched successfully');
      } else {
        console.error('❌ Invoices fetch failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching invoices with stored tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountsWithTokens = async (tokens: any) => {
    try {
      // Temporarily use direct API Gateway URL to test
      const apiBaseUrl = 'https://yelptc4qye.execute-api.us-east-1.amazonaws.com/dev';
      const fullUrl = `${apiBaseUrl}/accounting/accounts`;
      
      console.log('🔍 [fetchAccountsWithTokens] Environment check:');
      console.log('  - NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
      console.log('  - apiBaseUrl:', apiBaseUrl);
      console.log('  - Full URL:', fullUrl);
      console.log('  - Token exists:', !!tokens.access_token);
      
      // Make a simple request to avoid CORS preflight
      console.log('🔍 [fetchAccountsWithTokens] Making fetch request...');
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokens.id_token}`
        },
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);
        console.log('✅ Accounts fetched successfully');
      } else {
        console.error('❌ Accounts fetch failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching accounts with stored tokens:', error);
    }
  };

  const fetchTransactionsWithTokens = async (tokens: any) => {
    try {
      // Temporarily use direct API Gateway URL to test
      const apiBaseUrl = 'https://yelptc4qye.execute-api.us-east-1.amazonaws.com/dev';
      
      // Make a simple request to avoid CORS preflight
      const response = await fetch(`${apiBaseUrl}/accounting/transactions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokens.id_token}`
        },
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
        console.log('✅ Transactions fetched successfully');
      } else {
        console.error('❌ Transactions fetch failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching transactions with stored tokens:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigation.goToSignIn();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50/50 to-pink-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to sign-in
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50/50 to-pink-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.firstName || user.email || user.username}!
              </h1>
              <p className="text-gray-600 mt-2">Manage your invoices and payments</p>
            </div>
            <button
              onClick={handleSignOut}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
              <button
                onClick={() => navigation.goToHome()}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
              >
                Create New Invoice
              </button>
            </div>
            <div className="divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nothing yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Invoices and expenses appear here.</p>
                </div>
              ) : (
                transactions.slice(0, 5).map((transaction: any, index: number) => (
                  <div key={transaction._id || `transaction-${index}`} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            transaction.type === 'invoice' ? 'bg-blue-100' :
                            transaction.type === 'payment' ? 'bg-green-100' :
                            transaction.type === 'expense' ? 'bg-red-100' :
                            'bg-gray-100'
                          }`}>
                            <span className={`text-sm font-medium ${
                              transaction.type === 'invoice' ? 'text-blue-600' :
                              transaction.type === 'payment' ? 'text-green-600' :
                              transaction.type === 'expense' ? 'text-red-600' :
                              'text-gray-600'
                            }`}>
                              {(transaction.type || 'T').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{transaction.description || 'No description'}</p>
                          <p className="text-sm text-gray-500">#{transaction.transactionNumber || 'N/A'} • {transaction.date ? new Date(transaction.date).toLocaleDateString() : 'No date'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-900">${(transaction.totalDebit || 0).toFixed(2)}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.status === 'posted' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {transaction.status || 'unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 