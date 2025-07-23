import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/db';
import InvoiceModel from '../../../../lib/models/InvoiceModel';
import { createEasternDate } from '../../../../lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const { id } = await params;
    
    console.log('🔍 Fetching invoice with ID:', id);

    // Find invoice by MongoDB ObjectId
    const invoice = await InvoiceModel.findById(id).lean();

    if (!invoice) {
      console.log('❌ Invoice not found:', id);
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    console.log('✅ Invoice found');

    return NextResponse.json({
      success: true,
      invoice
    });

  } catch (error) {
    console.error('❌ Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const { id } = await params;
    const body = await request.json();
    
    console.log('📝 Updating invoice with ID:', id, 'Data:', body);

    // Convert date strings to proper Eastern time Date objects
    const updateData = { ...body };
    if (updateData.dueDate) {
      updateData.dueDate = createEasternDate(updateData.dueDate);
    }
    if (updateData.issueDate) {
      updateData.issueDate = createEasternDate(updateData.issueDate);
    }

    // Find and update the invoice
    const updatedInvoice = await InvoiceModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedInvoice) {
      console.log('❌ Invoice not found for update:', id);
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    console.log('✅ Invoice updated successfully');

    return NextResponse.json({
      success: true,
      invoice: updatedInvoice
    });

  } catch (error) {
    console.error('❌ Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 