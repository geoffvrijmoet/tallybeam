import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { verifyCognitoToken } from '../lib/cognito-verify';

// Mock data for now - replace with actual service calls
const mockAccounts = [
  { id: '1', name: 'Checking Account', balance: 5000, type: 'checking' },
  { id: '2', name: 'Savings Account', balance: 15000, type: 'savings' },
  { id: '3', name: 'Credit Card', balance: -2500, type: 'credit' }
];

const mockTransactions = [
  { id: '1', accountId: '1', amount: 100, description: 'Grocery Store', date: '2024-01-15', type: 'expense' },
  { id: '2', accountId: '1', amount: 2000, description: 'Salary Deposit', date: '2024-01-14', type: 'income' },
  { id: '3', accountId: '2', amount: 500, description: 'Transfer from Checking', date: '2024-01-13', type: 'transfer' }
];

// OPTIONS handler for CORS preflight
export const options = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('🔧 Handling OPTIONS request for CORS preflight');
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Max-Age': '86400',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: 'CORS preflight successful' })
  };
};

export const accounts = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log('🔧 Getting accounts...');
    
    // Verify authentication
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, OPTIONS'
        },
        body: JSON.stringify({ error: 'Authorization header required' })
      };
    }

    const token = authHeader.replace('Bearer ', '');
    const cognitoUser = await verifyCognitoToken(token);
    console.log('✅ Authenticated user:', cognitoUser.sub);

    // TODO: Replace with actual database query
    console.log('✅ Returning mock accounts data');
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        accounts: mockAccounts
      })
    };

  } catch (error) {
    console.error('❌ Error getting accounts:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

export const transactions = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log('🔧 Getting transactions...');
    
    // Verify authentication
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, OPTIONS'
        },
        body: JSON.stringify({ error: 'Authorization header required' })
      };
    }

    const token = authHeader.replace('Bearer ', '');
    const cognitoUser = await verifyCognitoToken(token);
    console.log('✅ Authenticated user:', cognitoUser.sub);

    // TODO: Replace with actual database query
    console.log('✅ Returning mock transactions data');
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        transactions: mockTransactions
      })
    };

  } catch (error) {
    console.error('❌ Error getting transactions:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}; 