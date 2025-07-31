import connectToDatabase from '../lib/db';
import { Transaction } from '../models/Transaction';
import { CreateInvoiceRequest } from '../models/Transaction';

export class InvoiceService {
  static async createInvoice(invoiceData: CreateInvoiceRequest, userId?: string) {
    await connectToDatabase();
    
    // Generate invoice number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const invoiceNumber = `TB-${timestamp}-${random}`;
    
    // Create the transaction document with invoice type
    const transaction = new Transaction({
      userId: userId || 'anonymous',
      transactionNumber: invoiceNumber,
      date: invoiceData.issueDate ? new Date(invoiceData.issueDate) : new Date(),
      description: invoiceData.description,
      type: 'invoice',
      status: 'posted',
      lines: [], // Will be populated by createInvoiceTransaction if user is authenticated
      totalDebit: invoiceData.amount,
      totalCredit: invoiceData.amount,
      isBalanced: true,
      
      // Invoice-specific fields
      clientName: invoiceData.clientName,
      clientEmail: invoiceData.clientEmail,
      currency: invoiceData.currency || 'USD',
      dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      issueDate: invoiceData.issueDate ? new Date(invoiceData.issueDate) : new Date(),
      notes: invoiceData.notes,
      invoiceStatus: 'draft',
      paymentMethod: invoiceData.paymentMethod || 'venmo',
      venmoUsername: invoiceData.venmoUsername
    });
    
    const savedTransaction = await transaction.save();
    
    // Note: For now, we'll skip the accounting transaction creation
    // since we're focusing on non-authenticated users first
    // If user is authenticated, create corresponding accounting transaction
    // if (userId && userId !== 'anonymous') {
    //   await this.createInvoiceTransaction(savedTransaction, userId);
    // }
    
    return savedTransaction;
  }

  static async getInvoices(userId?: string) {
    await connectToDatabase();
    
    // For now, return all invoices (we can filter by userId later when authentication is implemented)
    const invoices = await Transaction.find({ type: 'invoice' })
      .sort({ date: -1 }) // Most recent first
      .lean();
    
    return invoices;
  }
} 