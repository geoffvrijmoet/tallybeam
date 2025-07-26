import { useState } from 'react';
import { createEasternDate, createTodayEasternDateString, createFutureDateString } from '../lib/utils';

interface InvoiceData {
  clientName: string;
  clientEmail?: string;
  amount: number;
  description: string;
  notes?: string;
  currency?: string;
  paymentMethod?: string;
  venmoUsername?: string;
}

interface InvoiceDisplayProps {
  data: InvoiceData;
  invoiceNumber?: string;
  dueDate?: string;
  issueDate?: string;
  isEditable?: boolean;
  onUpdate?: (updates: Partial<InvoiceData>) => void;
  onDateUpdate?: (field: 'dueDate' | 'issueDate', value: string) => void;
  onVenmoUpdate?: (username: string) => void;
}

export function InvoiceDisplay({ 
  data, 
  invoiceNumber, 
  dueDate: initialDueDate,
  issueDate: initialIssueDate,
  isEditable = false,
  onUpdate,
  onDateUpdate,
  onVenmoUpdate
}: InvoiceDisplayProps) {
  const [venmoUsername, setVenmoUsername] = useState(data.venmoUsername || 'yourvenmo');
  const [isEditingVenmo, setIsEditingVenmo] = useState(false);
  const [customDueDate, setCustomDueDate] = useState<string | null>(null);
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [customInvoiceDate, setCustomInvoiceDate] = useState<string | null>(null);
  const [isEditingInvoiceDate, setIsEditingInvoiceDate] = useState(false);

  // Use custom dates if set, otherwise use props or defaults
  const effectiveDueDate = customDueDate || initialDueDate || createFutureDateString(30);
  const effectiveInvoiceDate = customInvoiceDate || initialIssueDate || createTodayEasternDateString();
  
  const formattedDueDate = createEasternDate(effectiveDueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedInvoiceDate = createEasternDate(effectiveInvoiceDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleVenmoChange = (newUsername: string) => {
    setVenmoUsername(newUsername);
    if (onVenmoUpdate) {
      onVenmoUpdate(newUsername);
    }
    if (onUpdate) {
      onUpdate({ venmoUsername: newUsername });
    }
  };

  const handleDateChange = (field: 'dueDate' | 'issueDate', value: string) => {
    if (field === 'dueDate') {
      setCustomDueDate(value);
    } else {
      setCustomInvoiceDate(value);
    }
    if (onDateUpdate) {
      onDateUpdate(field, value);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Invoice Content */}
      <div className="p-8 bg-white">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoice</h1>
            <p className="text-sm text-gray-600">
              {invoiceNumber ? `#${invoiceNumber}` : '#TB-2024-0001'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 flex items-center justify-end space-x-2">
              <span>Invoice Date:</span>
              {isEditable && isEditingInvoiceDate ? (
                <input
                  type="date"
                  value={effectiveInvoiceDate}
                  onChange={(e) => handleDateChange('issueDate', e.target.value)}
                  onBlur={() => setIsEditingInvoiceDate(false)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setIsEditingInvoiceDate(false);
                    }
                  }}
                  className="px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-600"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => isEditable && setIsEditingInvoiceDate(true)}
                  className={`text-sm text-gray-600 ${
                    isEditable ? 'hover:text-gray-800 hover:bg-gray-100 px-2 py-1 rounded transition-colors duration-200 border border-transparent hover:border-gray-200' : ''
                  }`}
                  disabled={!isEditable}
                >
                  {formattedInvoiceDate}
                </button>
              )}
              {isEditable && <span className="text-xs text-gray-400">(click to edit)</span>}
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Bill To:</h3>
            <p className="text-lg font-medium text-gray-900">{data.clientName}</p>
            {data.clientEmail && (
              <p className="text-sm text-gray-600">{data.clientEmail}</p>
            )}
          </div>
          <div className="md:text-right">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Due Date:</span>
                <div className="flex items-center space-x-2">
                  {isEditable && isEditingDueDate ? (
                    <input
                      type="date"
                      value={effectiveDueDate}
                      onChange={(e) => handleDateChange('dueDate', e.target.value)}
                      onBlur={() => setIsEditingDueDate(false)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          setIsEditingDueDate(false);
                        }
                      }}
                      className="px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-900 font-medium"
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={() => isEditable && setIsEditingDueDate(true)}
                      className={`text-sm font-medium text-gray-900 ${
                        isEditable ? 'hover:text-gray-700 hover:bg-gray-100 px-2 py-1 rounded transition-colors duration-200 border border-transparent hover:border-gray-200' : ''
                      }`}
                      disabled={!isEditable}
                    >
                      {formattedDueDate}
                    </button>
                  )}
                  {isEditable && <span className="text-xs text-gray-500">(click to edit)</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="mb-8">
          <div className="bg-gray-50 rounded-lg p-1">
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider text-right">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white rounded-md">
                <tr>
                  <td className="px-4 py-4 text-sm text-gray-900 rounded-l-md">
                    {data.description}
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-gray-900 text-right rounded-r-md">
                    ${data.amount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2 border-t border-gray-200">
              <span className="text-sm text-gray-600">Subtotal:</span>
              <span className="text-sm font-medium text-gray-900">${data.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-t-2 border-gray-300">
              <span className="text-base font-semibold text-gray-900">Total:</span>
              <span className="text-base font-bold text-gray-900">${data.amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Instructions */}
        {data.paymentMethod === 'venmo' && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Payment Instructions</h4>
            <div className="text-sm text-blue-800">
              <p className="mb-2">Please send payment via:</p>
              <div className="flex items-center space-x-2">
                <span className="font-medium">Venmo</span>
                {isEditable && isEditingVenmo ? (
                  <input
                    type="text"
                    value={venmoUsername}
                    onChange={(e) => handleVenmoChange(e.target.value)}
                    onBlur={() => setIsEditingVenmo(false)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        setIsEditingVenmo(false);
                      }
                    }}
                    className="px-2 py-1 text-sm border border-blue-300 rounded bg-white text-blue-900 font-mono"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => isEditable && setIsEditingVenmo(true)}
                    className={`font-mono text-blue-900 ${
                      isEditable ? 'hover:text-blue-700 hover:bg-blue-100 px-2 py-1 rounded transition-colors duration-200 border border-transparent hover:border-blue-200' : ''
                    }`}
                    disabled={!isEditable}
                  >
                    @{venmoUsername}
                  </button>
                )}
                {isEditable && <span className="text-xs text-blue-600">(click to edit)</span>}
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {data.notes && (
          <div className="mt-8 border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes</h4>
            <p className="text-sm text-gray-600">{data.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
} 