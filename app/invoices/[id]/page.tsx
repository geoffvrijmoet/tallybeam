'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Invoice {
  _id: string;
  transactionNumber: string;
  clientName: string;
  clientEmail?: string;
  totalDebit: number;
  currency: string;
  dueDate: string;
  issueDate: string;
  description: string;
  notes?: string;
  invoiceStatus: string;
  paymentMethod?: string;
  venmoUsername?: string;
  createdAt: string;
  updatedAt: string;
}

export default function InvoicePage() {
  const params = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchInvoice(params.id as string);
    }
  }, [params.id]);

  const fetchInvoice = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/invoices/${id}`);
      
      if (!response.ok) {
        throw new Error('Invoice not found');
      }

      const data = await response.json();
      setInvoice(data.invoice);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The invoice you are looking for does not exist.'}</p>
          <a 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            ← Create New Invoice
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoice #{invoice.transactionNumber}</h1>
          <p className="text-gray-600">Professional Invoice from TallyBeam</p>
        </div>

        {/* Invoice Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Invoice Header */}
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-2">TallyBeam</h2>
                <p className="text-violet-100">Professional Invoice Service</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold mb-1">INVOICE</div>
                <div className="text-violet-100">#{invoice.transactionNumber}</div>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Bill To */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill To:</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-medium text-gray-900">{invoice.clientName}</div>
                  {invoice.clientEmail && (
                    <div className="text-gray-600 mt-1">{invoice.clientEmail}</div>
                  )}
                </div>
              </div>

              {/* Invoice Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details:</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Invoice Number:</span>
                    <span className="font-medium">#{invoice.transactionNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Issue Date:</span>
                    <span className="font-medium">{formatDate(invoice.issueDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-medium">{formatDate(invoice.dueDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium px-2 py-1 rounded text-xs ${
                      invoice.invoiceStatus === 'paid' ? 'bg-green-100 text-green-800' :
                      invoice.invoiceStatus === 'overdue' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {invoice.invoiceStatus?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Items:</h3>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                        ${invoice.totalDebit.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-end">
              <div className="bg-violet-50 p-6 rounded-lg w-64">
                <div className="flex justify-between items-center text-lg font-semibold text-gray-900">
                  <span>Total:</span>
                  <span>${invoice.totalDebit.toFixed(2)}</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">USD</div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Notes:</h4>
                <p className="text-gray-700">{invoice.notes}</p>
              </div>
            )}

            {/* Payment Instructions */}
            {invoice.paymentMethod === 'venmo' && invoice.venmoUsername && (
              <div className="mt-8 p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Payment Instructions:</h4>
                <p className="text-gray-700">
                  Please send payment via Venmo to <span className="font-medium">@{invoice.venmoUsername}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <a 
            href="/" 
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Create New Invoice
          </a>
          <button 
            onClick={() => window.print()}
            className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            🖨️ Print Invoice
          </button>
          <a 
            href={`/api/invoices/${invoice._id}/pdf`}
            download
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors inline-flex items-center space-x-2"
          >
            <span>📄</span>
            <span>Download PDF</span>
          </a>
        </div>
      </div>
    </div>
  );
} 