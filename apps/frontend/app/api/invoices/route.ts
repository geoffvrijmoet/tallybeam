import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { InvoiceService } from '../../../lib/services/invoiceService';
import { CreateInvoiceRequest, Transaction } from '../../../lib/models/Transaction';
import { createEasternDate, createTodayEasternDateString, createFutureDateString } from '../../../lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    const body: CreateInvoiceRequest = await request.json();

    console.log('📋 Creating invoice with data:', body);

    // Validation
    if (!body.clientName || !body.amount || !body.description) {
      return NextResponse.json(
        { error: 'Client name, amount, and description are required' },
        { status: 400 }
      );
    }

    if (body.amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
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

    const savedTransaction = await InvoiceService.createInvoice(invoiceData, userId || undefined);

    console.log('✅ Invoice created:', savedTransaction.transactionNumber, 'ID:', savedTransaction._id);

    return NextResponse.json(
      { 
        success: true, 
        invoiceNumber: savedTransaction.transactionNumber,
        _id: savedTransaction._id,
        id: savedTransaction._id, // Add this for frontend compatibility
        invoice: savedTransaction
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('❌ Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = parseInt(searchParams.get('skip') || '0');

    const filter: any = { type: 'invoice' }; // Only get invoice transactions
    if (userId) {
      filter.userId = userId; // Only filter by userId if authenticated
    }
    if (status) {
      filter.invoiceStatus = status; // Use invoiceStatus instead of status
    }
    
    const transactions = await Transaction
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Transaction.countDocuments(filter);

    return NextResponse.json({
      invoices: transactions, // Keep the API response format the same
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + limit < total
      }
    });

  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 