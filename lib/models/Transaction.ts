import mongoose, { Schema, Document } from 'mongoose';

export interface ITransactionLine extends Document {
  accountId: mongoose.Types.ObjectId;
  accountName: string;
  accountNumber: string;
  debit: number;
  credit: number;
  description: string;
}

export interface ITransaction extends Document {
  userId: string;
  transactionNumber: string;
  date: Date;
  description: string;
  reference?: string;
  memo?: string;
  type: 'invoice' | 'payment' | 'expense' | 'transfer' | 'adjustment' | 'journal';
  status: 'pending' | 'posted' | 'void';
  lines: ITransactionLine[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  relatedInvoiceId?: mongoose.Types.ObjectId;
  attachments?: string[];
  
  // Invoice-specific fields (only used when type === 'invoice')
  clientName?: string;
  clientEmail?: string;
  currency?: string;
  dueDate?: Date;
  issueDate?: Date;
  notes?: string;
  invoiceStatus?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: 'cash' | 'check' | 'bank_transfer' | 'venmo' | 'paypal' | 'other';
  venmoUsername?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const TransactionLineSchema = new Schema<ITransactionLine>({
  accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  accountName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  debit: { type: Number, default: 0 },
  credit: { type: Number, default: 0 },
  description: { type: String, required: true }
});

const TransactionSchema = new Schema<ITransaction>({
  userId: { type: String, required: true, index: true },
  transactionNumber: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
  description: { type: String, required: true },
  reference: { type: String },
  memo: { type: String },
  type: { 
    type: String, 
    required: true, 
    enum: ['invoice', 'payment', 'expense', 'transfer', 'adjustment', 'journal'] 
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'posted', 'void'], 
    default: 'pending' 
  },
  lines: [TransactionLineSchema],
  totalDebit: { type: Number, default: 0 },
  totalCredit: { type: Number, default: 0 },
  isBalanced: { type: Boolean, default: false },
  relatedInvoiceId: { type: Schema.Types.ObjectId, ref: 'Transaction' },
  attachments: [{ type: String }],
  
  // Invoice-specific fields
  clientName: { type: String, index: true },
  clientEmail: { type: String, sparse: true },
  currency: { 
    type: String, 
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD'] 
  },
  dueDate: { type: Date },
  issueDate: { type: Date },
  notes: { type: String },
  invoiceStatus: { 
    type: String, 
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft' 
  },
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'check', 'bank_transfer', 'venmo', 'paypal', 'other'],
    default: 'venmo' 
  },
  venmoUsername: { type: String }
}, {
  timestamps: true
});

// Indexes for efficient queries
TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, type: 1 });
TransactionSchema.index({ userId: 1, transactionNumber: 1 }, { unique: true });
TransactionSchema.index({ userId: 1, status: 1 });
TransactionSchema.index({ userId: 1, clientName: 1, createdAt: -1 });
TransactionSchema.index({ userId: 1, invoiceStatus: 1, dueDate: 1 });

// Pre-save middleware to calculate totals and check balance
TransactionSchema.pre('save', function(next) {
  this.totalDebit = this.lines.reduce((sum, line) => sum + line.debit, 0);
  this.totalCredit = this.lines.reduce((sum, line) => sum + line.credit, 0);
  this.isBalanced = Math.abs(this.totalDebit - this.totalCredit) < 0.01;
  next();
});

// Helper method to generate invoice number
TransactionSchema.statics.generateInvoiceNumber = function(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TB-${timestamp}-${random}`;
};

export const Transaction = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

// Additional interfaces for API requests
export interface CreateInvoiceRequest {
  clientName: string;
  clientEmail?: string;
  amount: number;
  currency?: string;
  dueDate?: string;
  issueDate?: string;
  description: string;
  notes?: string;
  paymentMethod?: 'cash' | 'check' | 'bank_transfer' | 'venmo' | 'paypal' | 'other';
  venmoUsername?: string;
}

export interface InvoiceListItem {
  _id: string;
  transactionNumber: string;
  clientName: string;
  amount: number;
  currency: string;
  dueDate: Date;
  invoiceStatus: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  createdAt: Date;
}

export interface VenmoPayment {
  _id?: string;
  invoiceId: string;
  amount: number;
  venmoTransactionId?: string;
  email: string;
  receivedAt: Date;
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: Date;
}

export interface EmailInvoiceRequest {
  _id?: string;
  fromEmail: string;
  subject: string;
  body: string;
  parsedData: Partial<CreateInvoiceRequest>;
  missingFields: string[];
  status: 'pending_parse' | 'needs_input' | 'completed' | 'failed';
  conversationThread: EmailInvoiceMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailInvoiceMessage {
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: Date;
  type: 'original' | 'clarification_request' | 'clarification_response';
} 