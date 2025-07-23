import mongoose, { Schema, Document } from 'mongoose';

// Interface for the Invoice document
export interface IInvoice extends Document {
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  amount: number;
  currency: string;
  dueDate: Date;
  issueDate: Date;
  description: string;
  notes?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: 'cash' | 'check' | 'bank_transfer' | 'venmo' | 'paypal' | 'other';
  venmoUsername?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema
const InvoiceSchema: Schema = new Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true
    },
    clientName: {
      type: String,
      required: true,
      index: true
    },
    clientEmail: {
      type: String,
      sparse: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'CAD']
    },
    dueDate: {
      type: Date,
      required: true
    },
    issueDate: {
      type: Date,
      default: Date.now
    },
    description: {
      type: String,
      required: true
    },
    notes: {
      type: String
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
      default: 'draft'
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'check', 'bank_transfer', 'venmo', 'paypal', 'other'],
      default: 'venmo'
    },
    venmoUsername: {
      type: String
    }
  },
  {
    timestamps: true // This adds createdAt and updatedAt automatically
  }
);

// Create indexes for common queries
InvoiceSchema.index({ clientName: 1, createdAt: -1 });
InvoiceSchema.index({ status: 1, dueDate: 1 });
InvoiceSchema.index({ invoiceNumber: 1 });

// Helper method to generate invoice number
InvoiceSchema.statics.generateInvoiceNumber = function(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TB-${timestamp}-${random}`;
};

// Export the model
export default mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema); 