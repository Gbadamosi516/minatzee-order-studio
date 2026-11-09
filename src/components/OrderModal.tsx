import React, { useState, useEffect } from 'react';
import { X, MessageCircle, AlertCircle, Trash2 } from 'lucide-react';
import { Order, OrderStage, PaymentStatus, ProductCategory } from '../types/order';
import { formatNaira, getTodayString, generateWhatsAppLink } from '../utils/helpers';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (orderData: Partial<Order>) => void;
  onDelete?: (order: Order) => void;
  initialOrder?: Order | null;
  defaultStage?: OrderStage;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialOrder,
  defaultStage = 'New Chats',
}) => {
  const isEditing = Boolean(initialOrder);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [whatsappContact, setWhatsappContact] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productCategory, setProductCategory] = useState<ProductCategory>("Women's Innerwear");
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [orderAmount, setOrderAmount] = useState<number | ''>('');
  const [amountPaid, setAmountPaid] = useState<number | ''>(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Awaiting Payment');
  const [orderStage, setOrderStage] = useState<OrderStage>(defaultStage);
  const [orderDate, setOrderDate] = useState(getTodayString());
  const [dispatchDate, setDispatchDate] = useState('');
  const [notes, setNotes] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<{ customerName?: string; productDescription?: string; orderAmount?: string }>({});

  useEffect(() => {
    if (initialOrder) {
      setCustomerName(initialOrder.customerName || '');
      setPhoneNumber(initialOrder.phoneNumber || '');
      setWhatsappContact(initialOrder.whatsappContact || initialOrder.phoneNumber || '');
      setProductDescription(initialOrder.productDescription || '');
      setProductCategory(initialOrder.productCategory || "Women's Innerwear");
      setSize(initialOrder.size || '');
      setQuantity(initialOrder.quantity || 1);
      setOrderAmount(initialOrder.orderAmount ?? '');
      setAmountPaid(initialOrder.amountPaid ?? 0);
      setPaymentStatus(initialOrder.paymentStatus || 'Awaiting Payment');
      setOrderStage(initialOrder.orderStage || defaultStage);
      setOrderDate(initialOrder.orderDate || getTodayString());
      setDispatchDate(initialOrder.dispatchDate || '');
      setNotes(initialOrder.notes || '');
    } else {
      setCustomerName('');
      setPhoneNumber('');
      setWhatsappContact('');
      setProductDescription('');
      setProductCategory("Women's Innerwear");
      setSize('');
      setQuantity(1);
      setOrderAmount('');
      setAmountPaid(0);
      setPaymentStatus('Awaiting Payment');
      setOrderStage(defaultStage);
      setOrderDate(getTodayString());
      setDispatchDate('');
      setNotes('');
    }
    setErrors({});
  }, [initialOrder, defaultStage, isOpen]);

  const numericOrderAmount = typeof orderAmount === 'number' ? orderAmount : 0;
  const numericAmountPaid = typeof amountPaid === 'number' ? amountPaid : 0;
  const balanceDue = Math.max(0, numericOrderAmount - numericAmountPaid);

  const handleAmountPaidChange = (val: string) => {
    const num = val === '' ? '' : Math.max(0, Number(val));
    setAmountPaid(num);

    const enteredPaid = typeof num === 'number' ? num : 0;
    if (numericOrderAmount > 0) {
      if (enteredPaid >= numericOrderAmount) {
        setPaymentStatus('Paid');
      } else if (enteredPaid > 0) {
        setPaymentStatus('Part Payment');
      } else {
        setPaymentStatus('Awaiting Payment');
      }
    }
  };

  const handleOrderAmountChange = (val: string) => {
    const num = val === '' ? '' : Math.max(0, Number(val));
    setOrderAmount(num);

    const enteredAmount = typeof num === 'number' ? num : 0;
    if (enteredAmount > 0 && numericAmountPaid >= enteredAmount) {
      setPaymentStatus('Paid');
    } else if (numericAmountPaid > 0) {
      setPaymentStatus('Part Payment');
    } else {
      setPaymentStatus('Awaiting Payment');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};
    if (!customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }
    if (!productDescription.trim()) {
      newErrors.productDescription = 'Product description is required';
    }
    if (orderAmount === '' || Number(orderAmount) < 0) {
      newErrors.orderAmount = 'Valid order amount is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload: Partial<Order> = {
      customerName: customerName.trim(),
      phoneNumber: phoneNumber.trim(),
      whatsappContact: whatsappContact.trim() || phoneNumber.trim(),
      productDescription: productDescription.trim(),
      productCategory,
      size: size.trim(),
      quantity: Math.max(1, Number(quantity) || 1),
      orderAmount: numericOrderAmount,
      amountPaid: numericAmountPaid,
      balanceDue,
      paymentStatus,
      orderStage,
      orderDate,
      dispatchDate: orderStage === 'Shipped' && !dispatchDate ? getTodayString() : dispatchDate,
      notes: notes.trim(),
    };

    onSave(payload);
    onClose();
  };

  if (!isOpen) return null;

  const quickWhatsAppUrl = (whatsappContact || phoneNumber)
    ? generateWhatsAppLink(whatsappContact || phoneNumber, customerName || 'Customer', productDescription)
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#1A1A1A]/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-[14px] w-full max-w-xl my-6 shadow-[8px_8px_0_#9A3442] border-2 border-[#9A3442] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b-2 border-[#9A3442] flex items-center justify-between bg-[#FDFAF5] shrink-0">
          <div>
            <h2 className="font-fraunces font-bold text-lg sm:text-xl text-[#9A3442] tracking-tight">
              {isEditing ? 'Edit Customer Order' : 'Add New Customer Order'}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-spacemono font-bold uppercase tracking-wider text-[#9A3442]">
              <span className="w-1.5 h-1.5 bg-[#9A3442] rotate-45 shrink-0" />
              <span>Minatzee Enterprise · Comfort you can trust.</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#FDF1EF] border-2 border-transparent hover:border-[#9A3442] text-[#9A3442] flex items-center justify-center transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-5 kanban-scroll font-instrumentsans">
          
          {/* SECTION 1: CUSTOMER DETAILS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-spacemono font-bold text-xs text-[#9A3442] tracking-[0.14em] uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-[#9A3442] rotate-45 shrink-0" />
                Customer Details
              </h3>
              {quickWhatsAppUrl && (
                <a
                  href={quickWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-spacemono font-bold uppercase tracking-wider text-[#9A3442] bg-[#FDF1EF] hover:bg-[#FBDDD8] px-2.5 py-1 rounded-full border border-[#9A3442] shadow-[1px_1px_0_#9A3442] transition-all"
                >
                  <MessageCircle className="w-3 h-3 text-[#9A3442]" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Customer Name */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-spacemono font-bold uppercase tracking-[0.14em] text-[#6B5A5D] mb-1">
                  Customer Name <span className="text-[#9A3442]">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (errors.customerName) setErrors({ ...errors, customerName: undefined });
                  }}
                  placeholder="e.g. Amina Bello"
                  className={`w-full px-3.5 py-2.5 rounded-[8px] border-2 text-xs sm:text-sm text-[#2A1B1E] placeholder:text-[#CFBFA9] outline-none transition-all ${
                    errors.customerName
                      ? 'border-[#9A3442] bg-[#FDF1EF]'
                      : 'border-[#D98A96] bg-white hover:border-[#B04756] focus:border-[#9A3442] focus:ring-3 focus:ring-[#FBDDD8]'
                  }`}
                />
                {errors.customerName && (
                  <p className="mt-1 text-xs text-[#9A3442] font-spacemono font-bold uppercase flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.customerName}</span>
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-[11px] font-spacemono font-bold uppercase tracking-[0.14em] text-[#6B5A5D] mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  inputMode="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    if (!whatsappContact) setWhatsappContact(e.target.value);
                  }}
                  placeholder="e.g. 0803 123 4567"
                  className="w-full px-3.5 py-2.5 rounded-[8px] border-2 border-[#D98A96] bg-white hover:border-[#B04756] focus:border-[#9A3442] focus:ring-3 focus:ring-[#FBDDD8] text-xs sm:text-sm text-[#2A1B1E] placeholder:text-[#CFBFA9] outline-none transition-all"
                />
              </div>

              {/* WhatsApp Contact */}
              <div>
                <label className="block text-[11px] font-spacemono font-bold uppercase tracking-[0.14em] text-[#6B5A5D] mb-1">
                  WhatsApp Contact
                </label>
                <input
                  type="tel"
                  inputMode="tel"
                  value={whatsappContact}
                  onChange={(e) => setWhatsappContact(e.target.value)}
                  placeholder="e.g. 0803 123 4567"
                  className="w-full px-3.5 py-2.5 rounded-[8px] border-2 border-[#D98A96] bg-white hover:border-[#B04756] focus:border-[#9A3442] focus:ring-3 focus:ring-[#FBDDD8] text-xs sm:text-sm text-[#2A1B1E] placeholder:text-[#CFBFA9] outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: ORDER & PRODUCT DETAILS */}
          <div className="space-y-3 pt-3 border-t-2 border-[#E9DDD9]">
            <h3 className="font-spacemono font-bold text-xs text-[#9A3442] tracking-[0.14em] uppercase flex items-center gap-2">
              <span className="w-2 h-2 bg-[#9A3442] rotate-45 shrink-0" />
              Order &amp; Product Details
            </h3>

            <div>
              <label className="block text-[11px] font-spacemono font-bold uppercase tracking-[0.14em] text-[#6B5A5D] mb-1">
                Product Description <span className="text-[#9A3442]">*</span>
              </label>
              <textarea
                rows={2}
                value={productDescription}
                onChange={(e) => {
                  setProductDescription(e.target.value);
                  if (errors.productDescription) setErrors({ ...errors, productDescription: undefined });
                }}
                placeholder="e.g. Seamless Contour Wireless Bra & Briefs Set (Nude Blush)"
                className={`w-full px-3.5 py-2.5 rounded-[8px] border-2 text-xs sm:text-sm text-[#2A1B1E] placeholder:text-[#CFBFA9] outline-none transition-all resize-none ${
                  errors.productDescription
                    ? 'border-[#9A3442] bg-[#FDF1EF]'
                    : 'border-[#D98A96] bg-white hover:border-[#B04756] focus:border-[#9A3442] focus:ring-3 focus:ring-[#FBDDD8]'
                }`}
              />
              {errors.productDescription && (
                <p className="mt-1 text-xs text-[#9A3442] font-spacemono font-bold uppercase flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.productDescription}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Product Category */}
              <div>
                <label className="block text-[11px] font-spacemono font-bold uppercase tracking-[0.14em] text-[#6B5A5D] mb-1">
                  Category
                </label>
                <select
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value as ProductCategory)}
                  className="w-full px-3 py-2.5 rounded-[8px] border-2 border-[#D98A96] bg-white hover:border-[#B04756] focus:border-[#9A3442] focus:ring-3 focus:ring-[#FBDDD8] text-xs font-instrumentsans text-[#2A1B1E] outline-none"
                >
                  <option value="Women's Innerwear">Women&apos;s Innerwear</option>
                  <option value="Children's Innerwear">Children&apos;s Innerwear</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Sleepwear">Sleepwear</option>
                </select>
              </div>

              {/* Size */}
              <div>
                <label className="block text-[11px] font-spacemono font-bold uppercase tracking-[0.14em] text-[#6B5A5D] mb-1">
                  Size
                </label>
                <input
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="e.g. 36B, M, 6-8 Yrs"
                  className="w-full px-3 py-2.5 rounded-[8px] border-2 border-[#D98A96] bg-white hover:border-[#B04756] focus:border-[#9A3442] focus:ring-3 focus:ring-[#FBDDD8] text-xs font-instrumentsans text-[#2A1B1E] placeholder:text-[#CFBFA9] outline-none"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-[11px] font-spacemono font-bold uppercase tracking-[0.14em] text-[#6B5A5D] mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-2.5 rounded-[8px] border-2 border-[#D98A96] bg-white hover:border-[#B04756] focus:border-[#9A3442] focus:ring-3 focus:ring-[#FBDDD8] text-xs font-spacemono font-bold text-[#2A1B1E] outline-none"
                />
              </div>
            </div>

            {/* Order Amount */}
            <div>
              <label className="block text-[11px] font-spacemono font-bold uppercase tracking-[0.14em] text-[#6B5A5D] mb-1">
                Order Amount (₦) <span className="text-[#9A3442]">*</span>
              </label>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="100"
                value={orderAmount}
                onChange={(e) => handleOrderAmountChange(e.target.value)}
                placeholder="e.g. 15000"
                className={`w-full px-3.5 py-2.5 rounded-[8px] border-2 text-xs sm:text-sm font-spacemono font-bold text-[#2A1B1E] placeholder:text-[#CFBFA9] outline-none transition-all ${
                  errors.orderAmount
                    ? 'border-[#9A3442] bg-[#FDF1EF]'
                    : 'border-[#D98A96] bg-white hover:border-[#B04756] focus:border-[#9A3442] focus:ring-3 focus:ring-[#FBDDD8]'
                }`}
              />
              {errors.orderAmount && (
                <p className="mt-1 text-xs text-[#9A3442] font-spacemono font-bold uppercase flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.orderAmount}</span>
                </p>
              )}
            </div>
          </div>

          {/* SECTION 3: PAYMENT DETAILS */}
          <div className="space-y-3 pt-3 border-t-2 border-[#E9DDD9]">
            <h3 className="font-spacemono font-bold text-xs text-[#9A3442] tracking-[0.14em] uppercase flex items-center gap-2">
              <span className="w-2 h-2 bg-[#9A3442] rotate-45 shrink-0" />
              Payment Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Payment Status */}
              <div>
                <label className="block text-[11px] font-spacemono font-bold uppercase tracking-[0.14em] text-[#6B5A5D] mb-1">
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full px-3 py-2.5 rounded-[8px] border-2 border-[#D98A96] bg-white hover:border-[#B04756] focus:border-[#9A3442] focus:ring-3 focus:ring-[#FBDDD8] text-xs font-instrumentsans text-[#2A1B1E] outline-none"
                >
                  <option value="Awaiting Payment">Awaiting Payment</option>
                  <option value="Part Payment">Part Payment</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              {/* Amount Paid */}
              <div>
                <label className="block text-[11px] font-spacemono font-bold uppercase tracking-[0.14em] text-[#6B5A5D] mb-1">
                  Amount Paid (₦)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="100"
                  value={amountPaid}
                  onChange={(e) => handleAmountPaidChange(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 rounded-[8px] border-2 border-[#D98A96] bg-white hover:border-[#B04756] focus:border-[#9A3442] focus:ring-3 focus:ring-[#FBDDD8] text-xs sm:text-sm font-spacemono font-bold text-[#2A1B1E] outline-none"
                />
              </div>
            </div>

            {/* Balance Due Display Box (Radix Status Scale: Amber for outstanding, Grass for paid) */}
            <div className={`p-3.5 rounded-[14px] border-2 shadow-[2px_2px_0] flex items-center justify-between ${
              balanceDue > 0
                ? 'bg-[#F8E8DE] border-[#9C4A22] shadow-[#9C4A22] text-[#6E3212]'
                : 'bg-[#EAF1EC] border-[#2F6B4F] shadow-[#2F6B4F] text-[#20503A]'
            }`}>
              <div>
                <span className="text-[11px] font-spacemono font-bold uppercase tracking-wider block">
                  {balanceDue > 0 ? 'Balance Due' : 'Balance Settled'}
                </span>
                <span className="text-[11px] font-instrumentsans opacity-85">
                  {balanceDue > 0 ? 'Outstanding customer balance' : 'Order fully paid ✓'}
                </span>
              </div>
              <div className="font-spacemono font-bold text-base sm:text-lg tabular-nums">
                {formatNaira(balanceDue)}
              </div>
            </div>
          </div>

          {/* SECTION 4: ORDER TRACKING */}
          <div className="space-y-3 pt-3 border-t-2 border-[#E9DDD9]">
            <h3 className="font-spacemono font-bold text-xs text-[#9A3442] tracking-[0.14em] uppercase flex items-center gap-2">
              <span className="w-2 h-2 bg-[#9A3442] rotate-45 shrink-0" />
              Order Tracking &amp; Notes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Order Stage */}
              <div>
                <label className="block text-[11px] font-spacemono font-bold uppercase tracking-[0.14em] text-[#6B5A5D] mb-1">
                  Order Stage
                </label>
                <select
                  value={orderStage}
                  onChange={(e) => setOrderStage(e.target.value as OrderStage)}
                  className="w-full px-3 py-2.5 rounded-[8px] border-2 border-[#D98A96] bg-white hover:border-[#B04756] focus:border-[#9A3442] focus:ring-3 focus:ring-[#FBDDD8] text-xs font-instrumentsans text-[#2A1B1E] outline-none"
                >
                  <option value="New Chats">New Chats</option>
                  <option value="Awaiting Payment">Awaiting Payment</option>
                  <option value="To Pack">To Pack</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Done & Happy">Done &amp; Happy</option>
                </select>
              </div>

              {/* Order Date */}
              <div>
                <label className="block text-[11px] font-spacemono font-bold uppercase tracking-[0.14em] text-[#6B5A5D] mb-1">
                  Order Date
                </label>
                <input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-[8px] border-2 border-[#D98A96] bg-white hover:border-[#B04756] focus:border-[#9A3442] focus:ring-3 focus:ring-[#FBDDD8] text-xs font-spacemono text-[#2A1B1E] outline-none"
                />
              </div>

              {/* Dispatch Date */}
              <div>
                <label className="block text-[11px] font-spacemono font-bold uppercase tracking-[0.14em] text-[#6B5A5D] mb-1">
                  Dispatch Date
                </label>
                <input
                  type="date"
                  value={dispatchDate}
                  onChange={(e) => setDispatchDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-[8px] border-2 border-[#D98A96] bg-white hover:border-[#B04756] focus:border-[#9A3442] focus:ring-3 focus:ring-[#FBDDD8] text-xs font-spacemono text-[#2A1B1E] outline-none"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[11px] font-spacemono font-bold uppercase tracking-[0.14em] text-[#6B5A5D] mb-1">
                Private Boutique Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Delivery instructions, customer preferences, packaging requests..."
                className="w-full px-3.5 py-2.5 rounded-[8px] border-2 border-[#D98A96] bg-white hover:border-[#B04756] focus:border-[#9A3442] focus:ring-3 focus:ring-[#FBDDD8] text-xs sm:text-sm text-[#2A1B1E] placeholder:text-[#CFBFA9] outline-none resize-none font-instrumentsans"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t-2 border-[#E9DDD9] flex items-center justify-between gap-3 shrink-0">
            <div>
              {isEditing && onDelete && initialOrder && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(initialOrder);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[#9A3442] hover:bg-[#FDF1EF] border-2 border-[#9A3442] text-xs font-spacemono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[2px_2px_0_#9A3442] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Delete Order</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Secondary button: Outline Pill */}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full bg-white hover:bg-[#FDF1EF] border-2 border-[#9A3442] text-[#9A3442] text-xs font-spacemono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[2px_2px_0_#9A3442] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0"
              >
                Cancel
              </button>
              {/* Primary button: Solid Wine Pill */}
              <button
                type="submit"
                className="px-5 py-2.5 rounded-full bg-[#9A3442] hover:bg-[#822936] text-white text-xs sm:text-sm font-instrumentsans font-semibold transition-all shadow-[3px_3px_0_#9A3442] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 cursor-pointer border-2 border-[#9A3442]"
              >
                {isEditing ? 'Save Changes' : 'Create Order'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
