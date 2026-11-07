import { Order } from '../types/order';

/**
 * Cleanly format and export orders to a standard CSV file that opens seamlessly
 * in Google Sheets, Microsoft Excel, and Apple Numbers.
 */
export function exportOrdersToCSV(orders: Order[], filenamePrefix: string = 'Minatzee_Orders'): void {
  const headers = [
    'Order ID',
    'Order Date',
    'Customer Name',
    'Phone Number',
    'WhatsApp Contact',
    'Product Category',
    'Product Description',
    'Size',
    'Quantity',
    'Order Amount (NGN)',
    'Amount Paid (NGN)',
    'Balance Due (NGN)',
    'Payment Status',
    'Order Stage',
    'Dispatch Date',
    'Notes',
    'Created At',
    'Updated At',
  ];

  const escapeCSV = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = orders.map((o) => [
    escapeCSV(o.id),
    escapeCSV(o.orderDate || ''),
    escapeCSV(o.customerName || ''),
    escapeCSV(o.phoneNumber || ''),
    escapeCSV(o.whatsappContact || o.phoneNumber || ''),
    escapeCSV(o.productCategory || ''),
    escapeCSV(o.productDescription || ''),
    escapeCSV(o.size || ''),
    escapeCSV(o.quantity ?? 1),
    escapeCSV(o.orderAmount ?? 0),
    escapeCSV(o.amountPaid ?? 0),
    escapeCSV(o.balanceDue ?? 0),
    escapeCSV(o.paymentStatus || ''),
    escapeCSV(o.orderStage || ''),
    escapeCSV(o.dispatchDate || ''),
    escapeCSV(o.notes || ''),
    escapeCSV(o.createdAt || ''),
    escapeCSV(o.updatedAt || ''),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  // UTF-8 BOM so Excel and Google Sheets render Nigerian characters and currencies accurately
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const today = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${today}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
