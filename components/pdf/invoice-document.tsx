import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: '/fonts/Inter-Regular.ttf', fontWeight: 'normal' },
    { src: '/fonts/Inter-Bold.ttf', fontWeight: 'bold' },
    { src: '/fonts/Inter-Medium.ttf', fontWeight: 'medium' },
  ],
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Inter',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40,
    paddingBottom: 20,
    borderBottom: '1px solid #e5e7eb',
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  companySubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  invoiceInfo: {
    alignItems: 'flex-end',
  },
  invoiceLabel: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 4,
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: 'medium',
    color: '#374151',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
  },
  billToBox: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  clientEmail: {
    fontSize: 12,
    color: '#6b7280',
  },
  infoBox: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: 'medium',
    color: '#1f2937',
  },
  statusBadge: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottom: '1px solid #e5e7eb',
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    textTransform: 'uppercase',
  },
  tableHeaderCellRight: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    textTransform: 'uppercase',
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottom: '1px solid #f3f4f6',
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    color: '#1f2937',
  },
  tableCellRight: {
    flex: 1,
    fontSize: 12,
    color: '#1f2937',
    textAlign: 'right',
    fontWeight: 'medium',
  },
  totalSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalBox: {
    backgroundColor: '#f3e8ff',
    padding: 20,
    borderRadius: 8,
    width: 200,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  currency: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  notes: {
    marginTop: 30,
    padding: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 12,
    color: '#1e3a8a',
    lineHeight: 1.5,
  },
  paymentInstructions: {
    marginTop: 30,
    padding: 16,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
  },
  paymentTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 8,
  },
  paymentText: {
    fontSize: 12,
    color: '#15803d',
    lineHeight: 1.5,
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: '1px solid #e5e7eb',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

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

interface InvoiceDocumentProps {
  invoice: Invoice;
}

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({ invoice }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'overdue':
        return { backgroundColor: '#fee2e2', color: '#991b1b' };
      default:
        return { backgroundColor: '#fef3c7', color: '#92400e' };
    }
  };

  return (
    <Document title={`Invoice ${invoice.transactionNumber} - ${invoice.clientName}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>TallyBeam</Text>
            <Text style={styles.companySubtitle}>Professional Invoice Service</Text>
          </View>
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceLabel}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{invoice.transactionNumber}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Invoice Details */}
          <View style={styles.section}>
            <View style={styles.grid}>
              {/* Bill To */}
              <View style={styles.column}>
                <Text style={styles.sectionTitle}>Bill To:</Text>
                <View style={styles.billToBox}>
                  <Text style={styles.clientName}>{invoice.clientName}</Text>
                  {invoice.clientEmail && (
                    <Text style={styles.clientEmail}>{invoice.clientEmail}</Text>
                  )}
                </View>
              </View>

              {/* Invoice Info */}
              <View style={styles.column}>
                <Text style={styles.sectionTitle}>Invoice Details:</Text>
                <View style={styles.infoBox}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Invoice Number:</Text>
                    <Text style={styles.infoValue}>#{invoice.transactionNumber}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Issue Date:</Text>
                    <Text style={styles.infoValue}>{formatDate(invoice.issueDate)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Due Date:</Text>
                    <Text style={styles.infoValue}>{formatDate(invoice.dueDate)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Status:</Text>
                    <Text style={[styles.statusBadge, getStatusColor(invoice.invoiceStatus)]}>
                      {invoice.invoiceStatus?.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Invoice Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items:</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>Description</Text>
                <Text style={styles.tableHeaderCellRight}>Amount</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>{invoice.description}</Text>
                <Text style={styles.tableCellRight}>${invoice.totalDebit.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Total */}
          <View style={styles.totalSection}>
            <View style={styles.totalBox}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalAmount}>${invoice.totalDebit.toFixed(2)}</Text>
              </View>
              <Text style={styles.currency}>USD</Text>
            </View>
          </View>

          {/* Notes */}
          {invoice.notes && (
            <View style={styles.notes}>
              <Text style={styles.notesTitle}>Notes:</Text>
              <Text style={styles.notesText}>{invoice.notes}</Text>
            </View>
          )}

          {/* Payment Instructions */}
          {invoice.paymentMethod === 'venmo' && invoice.venmoUsername && (
            <View style={styles.paymentInstructions}>
              <Text style={styles.paymentTitle}>Payment Instructions:</Text>
              <Text style={styles.paymentText}>
                Please send payment via Venmo to @{invoice.venmoUsername}
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for your business! • Generated by TallyBeam
          </Text>
        </View>
      </Page>
    </Document>
  );
}; 