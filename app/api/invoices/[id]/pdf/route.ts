import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoiceDocument } from '../../../../../components/pdf/invoice-document';
import connectToDatabase from '../../../../../lib/db';
import { Transaction } from '../../../../../lib/models/Transaction';
import { registerFonts } from '../../../../../lib/fonts';
import React from 'react';
import { ITransaction } from '../../../../../lib/models/Transaction';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ message: 'Invalid or missing Invoice ID' }, { status: 400 });
    }

    // Connect to database and fetch transaction (invoice type)
    await connectToDatabase();
    const rawTransactionData = await Transaction.findOne({ _id: id, type: 'invoice' }).lean();

    if (!rawTransactionData) {
      return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });
    }

    // Convert MongoDB object to expected format
    const transactionData = rawTransactionData as unknown as ITransaction;

    console.log('🧾 Generating PDF for invoice:', transactionData.transactionNumber);

    // Register fonts for PDF generation
    console.log('📝 Registering fonts for PDF...');
    registerFonts();

    // Generate PDF
    console.log('📄 Rendering PDF document...');
    const pdfElement = React.createElement(InvoiceDocument, { invoice: transactionData as any });
    
    if (!React.isValidElement(pdfElement)) {
      throw new Error('Failed to create valid PDF React element.');
    }

    const pdfBuffer = await renderToBuffer(pdfElement as any);
    console.log('✅ PDF Buffer created, size:', pdfBuffer.length);

    // Format filename for download
    const formatFilenamePart = (str: string | undefined | null): string => {
      if (!str) return '';
      return str
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');
    };

    const filename = `invoice-${formatFilenamePart(transactionData.clientName)}-${transactionData.transactionNumber}.pdf`;

    // Return PDF with proper headers
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
} 