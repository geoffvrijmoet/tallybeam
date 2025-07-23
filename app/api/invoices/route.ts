import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/db';
import InvoiceModel from '../../../lib/models/InvoiceModel';
import { CreateInvoiceRequest } from '../../../lib/models/Invoice';
import { createEasternDate, createTodayEasternDateString, createFutureDateString } from '../../../lib/utils';

function generateInvoiceNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TB-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
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
      invoiceNumber: generateInvoiceNumber(),
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      amount: body.amount,
      currency: body.currency || 'USD',
      dueDate,
      issueDate,
      description: body.description,
      notes: body.notes,
      status: 'draft' as const,
      paymentMethod: body.paymentMethod || 'venmo',
      venmoUsername: body.venmoUsername // This maps venmoUsername to venmoUsername
    };

    const invoice = new InvoiceModel(invoiceData);
    const savedInvoice = await invoice.save();

    console.log('✅ Invoice created:', savedInvoice.invoiceNumber, 'ID:', savedInvoice._id);

    return NextResponse.json(
      { 
        success: true, 
        invoiceNumber: savedInvoice.invoiceNumber,
        id: savedInvoice._id,
        invoice: savedInvoice
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
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = parseInt(searchParams.get('skip') || '0');

    const filter = status ? { status } : {};
    
    const invoices = await InvoiceModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await InvoiceModel.countDocuments(filter);

    return NextResponse.json({
      invoices,
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