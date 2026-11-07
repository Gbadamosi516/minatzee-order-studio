import { Order, DateFilterOption } from '../types/order';

/**
 * Format currency in Nigerian Naira (₦)
 */
export function formatNaira(amount: number | null | undefined): string {
  const val = typeof amount === 'number' && !isNaN(amount) ? Math.max(0, amount) : 0;
  return '₦' + val.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Normalize a Nigerian phone number and produce a WhatsApp wa.me link
 */
export function generateWhatsAppLink(phone: string, customerName: string, productDesc?: string): string {
  if (!phone) return '#';
  
  // Clean string
  let cleaned = phone.replace(/[^0-9]/g, '');
  
  // If starts with 0 and is 11 digits (typical Nigerian e.g. 080..., 090..., 070..., 081...)
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = '234' + cleaned.substring(1);
  } else if (!cleaned.startsWith('234') && cleaned.length === 10) {
    cleaned = '234' + cleaned;
  }
  
  const greeting = `Hello ${customerName ? customerName.trim() : 'there'}! Thank you for choosing Minatzee Enterprise.`;
  const productText = productDesc ? ` Regarding your order (${productDesc.trim()})` : ` Regarding your order with us`;
  const text = encodeURIComponent(`${greeting}${productText}, how may I assist you today?`);
  
  return `https://wa.me/${cleaned}?text=${text}`;
}

/**
 * Format date for display: e.g. "Oct 31, 2026"
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Get today's date formatted as YYYY-MM-DD
 */
export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Filter by date range helper
 */
export function matchesDateRange(orderDateStr: string, range: DateFilterOption): boolean {
  if (range === 'all_time' || !orderDateStr) return true;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const orderDate = new Date(orderDateStr + 'T00:00:00');
  if (isNaN(orderDate.getTime())) return true;
  
  const diffTime = today.getTime() - orderDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  switch (range) {
    case 'today':
      return diffDays === 0;
    case 'yesterday':
      return diffDays === 1;
    case 'last_7_days':
      return diffDays >= 0 && diffDays <= 7;
    case 'last_30_days':
      return diffDays >= 0 && diffDays <= 30;
    default:
      return true;
  }
}

/**
 * Initial curated realistic orders for Minatzee Enterprise
 */
export function getInitialSeedOrders(): Order[] {
  const today = getTodayString();
  const now = new Date();
  
  const formatDateOffset = (daysOffset: number): string => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysOffset);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  return [
    {
      id: 'ord_min_101',
      customerName: 'Amina Bello',
      phoneNumber: '08034567891',
      whatsappContact: '08034567891',
      productDescription: 'Seamless Contour Wireless Bra & Briefs Set (Nude Blush)',
      productCategory: "Women's Innerwear",
      size: '36C / L',
      quantity: 2,
      orderAmount: 24500,
      amountPaid: 0,
      balanceDue: 24500,
      paymentStatus: 'Awaiting Payment',
      orderStage: 'New Chats',
      orderDate: today,
      dispatchDate: '',
      notes: 'Customer inquired via Instagram DM. Wants discreet delivery to Lokogoma Phase 2.',
      createdAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
    },
    {
      id: 'ord_min_102',
      customerName: 'Chiamaka Okonkwo',
      phoneNumber: '08123984512',
      whatsappContact: '08123984512',
      productDescription: 'Pack of 5 Cotton Everyday Panties (Assorted Pastel Tones)',
      productCategory: "Women's Innerwear",
      size: 'M',
      quantity: 1,
      orderAmount: 16000,
      amountPaid: 8000,
      balanceDue: 8000,
      paymentStatus: 'Part Payment',
      orderStage: 'Awaiting Payment',
      orderDate: formatDateOffset(1),
      dispatchDate: '',
      notes: 'Paid 50% commitment. Balance to be transferred before dispatch to Wuse 2.',
      createdAt: new Date(now.getTime() - 26 * 3600000).toISOString(),
      updatedAt: new Date(now.getTime() - 4 * 3600000).toISOString(),
    },
    {
      id: 'ord_min_103',
      customerName: 'Zainab Danjuma',
      phoneNumber: '09071239988',
      whatsappContact: '09071239988',
      productDescription: "Boys Breathable Cotton Boxer Briefs (Pack of 6, Dino & Stripes)",
      productCategory: "Children's Innerwear",
      size: 'Age 6-8',
      quantity: 2,
      orderAmount: 22000,
      amountPaid: 22000,
      balanceDue: 0,
      paymentStatus: 'Paid',
      orderStage: 'To Pack',
      orderDate: today,
      dispatchDate: today,
      notes: 'Payment confirmed via Kuda Bank. Pack with complimentary thank you note.',
      createdAt: new Date(now.getTime() - 5 * 3600000).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * 3600000).toISOString(),
    },
    {
      id: 'ord_min_104',
      customerName: 'Funmilayo Adeyemi',
      phoneNumber: '08055667788',
      whatsappContact: '08055667788',
      productDescription: 'Burgundy Lace Trim Satin Bralette & High-Waist Knickers',
      productCategory: "Women's Innerwear",
      size: '34B / S',
      quantity: 1,
      orderAmount: 19500,
      amountPaid: 19500,
      balanceDue: 0,
      paymentStatus: 'Paid',
      orderStage: 'Shipped',
      orderDate: formatDateOffset(2),
      dispatchDate: formatDateOffset(1),
      notes: 'Dispatched via GIG Logistics dispatch rider. Waybill #ABJ-88219.',
      createdAt: new Date(now.getTime() - 52 * 3600000).toISOString(),
      updatedAt: new Date(now.getTime() - 12 * 3600000).toISOString(),
    },
    {
      id: 'ord_min_105',
      customerName: 'Ngozi Ekwueme',
      phoneNumber: '07038899112',
      whatsappContact: '07038899112',
      productDescription: "Girls 100% Organic Cotton Camisoles & Undies Set (Pack of 4)",
      productCategory: "Children's Innerwear",
      size: 'Age 4-5',
      quantity: 1,
      orderAmount: 18500,
      amountPaid: 18500,
      balanceDue: 0,
      paymentStatus: 'Paid',
      orderStage: 'Done & Happy',
      orderDate: formatDateOffset(4),
      dispatchDate: formatDateOffset(3),
      notes: 'Customer confirmed delivery in Gwarinpa. Left a 5-star WhatsApp voice note!',
      createdAt: new Date(now.getTime() - 96 * 3600000).toISOString(),
      updatedAt: new Date(now.getTime() - 48 * 3600000).toISOString(),
    },
    {
      id: 'ord_min_106',
      customerName: 'Halima Suleiman',
      phoneNumber: '08023344556',
      whatsappContact: '08023344556',
      productDescription: 'Full Support Postpartum Shaper & Comfort Nursing Bra',
      productCategory: "Women's Innerwear",
      size: 'XL',
      quantity: 1,
      orderAmount: 28000,
      amountPaid: 28000,
      balanceDue: 0,
      paymentStatus: 'Paid',
      orderStage: 'To Pack',
      orderDate: today,
      dispatchDate: today,
      notes: 'Repeat buyer. Requested gift wrap ribbon for a baby shower present.',
      createdAt: new Date(now.getTime() - 3 * 3600000).toISOString(),
      updatedAt: new Date(now.getTime() - 30 * 60000).toISOString(),
    }
  ];
}
