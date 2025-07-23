import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoiceDocument } from '../../../../../components/pdf/invoice-document';
import connectToDatabase from '../../../../../lib/db';
import InvoiceModel from '../../../../../lib/models/InvoiceModel';
import { registerFonts } from '../../../../../lib/fonts';
import React from 'react';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ message: 'Invalid or missing Invoice ID' }, { status: 400 });
    }

    // Connect to database and fetch invoice
    await connectToDatabase();
    const rawInvoiceData = await InvoiceModel.findById(id).lean();

    if (!rawInvoiceData) {
      return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });
    }

    // Convert MongoDB object to expected format
    const invoiceData = rawInvoiceData as any;

    console.log('🧾 Generating PDF for invoice:', invoiceData.invoiceNumber);

    // Register fonts for PDF generation
    console.log('📝 Registering fonts for PDF...');
    registerFonts();

    // Generate PDF
    console.log('📄 Rendering PDF document...');
    const pdfElement = React.createElement(InvoiceDocument, { invoice: invoiceData as any });
    
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

    const clientNameFormatted = formatFilenamePart(invoiceData.clientName);
    const invoiceNumberFormatted = formatFilenamePart(invoiceData.invoiceNumber);
    
    const filename = clientNameFormatted
      ? `${clientNameFormatted}-${invoiceNumberFormatted}.pdf`
      : `${invoiceNumberFormatted}-invoice.pdf`;

    // Return PDF response
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
      { message: 'Internal Server Error generating PDF' }, 
      { status: 500 }
    );
  }
} 