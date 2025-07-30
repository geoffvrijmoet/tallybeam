import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { InvoiceService } from '../services/invoiceService';
import { CreateInvoiceRequest } from '../models/Transaction';
import { createEasternDate, createTodayEasternDateString, createFutureDateString } from '../lib/utils';

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

export const create = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Parse the request body
    const body: CreateInvoiceRequest = JSON.parse(event.body || '{}');

    console.log('📋 Creating invoice with data:', body);

    // Validation
    if (!body.clientName || !body.amount || !body.description) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ 
          error: 'Client name, amount, and description are required' 
        })
      };
    }

    if (body.amount <= 0) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ 
          error: 'Amount must be greater than 0' 
        })
      };
    }

    // Generate invoice with Eastern time handling
    const issueDate = body.issueDate ? createEasternDate(body.issueDate) : createEasternDate(createTodayEasternDateString());
    const dueDate = body.dueDate ? createEasternDate(body.dueDate) : createEasternDate(createFutureDateString(30));

    const invoiceData = {
      clientName: body.clientName,
      clientEmail: body.clientEmail || undefined,
      amount: body.amount,
      currency: body.currency || 'USD',
      dueDate: dueDate.toISOString(),
      issueDate: issueDate.toISOString(),
      description: body.description,
      notes: body.notes || undefined,
      paymentMethod: body.paymentMethod || 'venmo',
      venmoUsername: body.venmoUsername || undefined
    } as CreateInvoiceRequest;

    // For now, we'll handle non-authenticated users (userId will be 'anonymous')
    // TODO: Add AWS Cognito authentication later
    const userId = undefined; // This will default to 'anonymous' in the service

    const savedTransaction = await InvoiceService.createInvoice(invoiceData, userId);

    console.log('✅ Invoice created:', savedTransaction.transactionNumber, 'ID:', savedTransaction._id);

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        invoiceNumber: savedTransaction.transactionNumber,
        _id: savedTransaction._id,
        id: savedTransaction._id, // Add this for frontend compatibility
        invoice: savedTransaction
      })
    };

  } catch (error) {
    console.error('❌ Error creating invoice:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ 
        error: 'Internal server error' 
      })
    };
  }
};
