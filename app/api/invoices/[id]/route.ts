import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/db';
import { Transaction } from '../../../../lib/models/Transaction';
import { createEasternDate } from '../../../../lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const { id } = await params;
    
    console.log('🔍 Fetching invoice with ID:', id);

    // Find transaction by MongoDB ObjectId, filtering for invoice type
    const transaction = await Transaction.findOne({ _id: id, type: 'invoice' }).lean();

    if (!transaction) {
      console.log('❌ Invoice not found:', id);
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    console.log('✅ Invoice found');

    return NextResponse.json({
      success: true,
      invoice: transaction
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

    // Find and update the transaction (invoice type)
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: id, type: 'invoice' },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedTransaction) {
      console.log('❌ Invoice not found for update:', id);
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    console.log('✅ Invoice updated successfully');

    return NextResponse.json({
      success: true,
      invoice: updatedTransaction
    });

  } catch (error) {
    console.error('❌ Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 