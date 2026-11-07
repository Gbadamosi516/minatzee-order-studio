import React from 'react';
import { 
  X, 
  MessageCircle, 
  Phone, 
  Edit3, 
  Calendar, 
  Package, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  FileText 
} from 'lucide-react';
import { Order, OrderStage } from '../types/order';
import { formatNaira, formatDate, generateWhatsAppLink } from '../utils/helpers';

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
  onEdit: (order: Order) => void;
  onMoveStage: (orderId: string, nextStage: OrderStage) => void;
}

const NEXT_STAGES: Record<OrderStage, OrderStage | null> = {
  'New Chats': 'Awaiting Payment',
  'Awaiting Payment': 'To Pack',
  'To Pack': 'Shipped',
  'Shipped': 'Done & Happy',
  'Done & Happy': null,
};

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  onClose,
  onEdit,
  onMoveStage,
}) => {
  if (!order) return null;

  const nextStage = NEXT_STAGES[order.orderStage];
  const whatsappUrl = generateWhatsAppLink(
    order.whatsappContact || order.phoneNumber,
    order.customerName,
    order.productDescription
  );

  const renderPaymentBadge = () => {
    switch (order.paymentStatus) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-spacemono font-bold tracking-wider uppercase bg-[#EAF1EC] text-[#2F6B4F] border border-[#2F6B4F] px-2.5 py-0.5 rounded-full shadow-[1px_1px_0_#2F6B4F]">
            <span className="text-[11px] leading-none">✓</span>
            <span>PAID</span>
          </span>
        );
      case 'Part Payment':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-spacemono font-bold tracking-wider uppercase bg-[#F8E8DE] text-[#9C4A22] border border-[#9C4A22] px-2.5 py-0.5 rounded-full shadow-[1px_1px_0_#9C4A22]">
            <span className="text-[11px] leading-none">!</span>
            <span>PART PAID</span>
          </span>
        );
      case 'Awaiting Payment':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-spacemono font-bold tracking-wider uppercase bg-[#F7EEDD] text-[#8A5A1E] border border-[#8A5A1E] px-2.5 py-0.5 rounded-full shadow-[1px_1px_0_#8A5A1E]">
            <span className="text-[10px] leading-none">◷</span>
            <span>PENDING</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1A1A1A]/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative w-full max-w-lg bg-white rounded-[14px] border-2 border-[#9A3442] shadow-[8px_8px_0_#9A3442] overflow-hidden flex flex-col font-instrumentsans text-[#2A1B1E]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b-2 border-[#9A3442] flex items-center justify-between bg-[#FDFAF5] shrink-0">
          <div>
            <h2 className="font-fraunces font-bold text-base sm:text-lg text-[#9A3442] tracking-tight">
              Order Details
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-[#6B5A5D] mt-0.5 font-spacemono">
              <span className="w-1.5 h-1.5 bg-[#9A3442] rotate-45" />
              <span>REF ID:</span>
              <span className="text-[#9A3442] font-bold tracking-wider">{order.id}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#FFC9C2] border-2 border-transparent hover:border-[#9A3442] text-[#9A3442] flex items-center justify-center transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto kanban-scroll text-xs">
          
          {/* Stage & Payment Overview */}
          <div className="p-3.5 rounded-[12px] bg-[#FAF6F2] border-2 border-[#E9DDD9] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#6B5A5D] block uppercase tracking-[0.14em] font-spacemono">
                Current Stage
              </span>
              <span className="font-fraunces font-bold text-sm sm:text-base text-[#9A3442]">
                {order.orderStage}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-[#6B5A5D] block uppercase tracking-[0.14em] mb-1 font-spacemono">
                Payment Status
              </span>
              {renderPaymentBadge()}
            </div>
          </div>

          {/* Customer Profile */}
          <div className="p-3.5 rounded-[12px] border-2 border-[#E9DDD9] bg-white">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="font-fraunces font-bold text-sm sm:text-[15px] text-[#9A3442]">{order.customerName}</h3>
                <p className="font-instrumentsans text-xs text-[#2E2425]/80 mt-0.5">{order.phoneNumber || 'No phone recorded'}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {order.phoneNumber && (
                  <>
                    <a
                      href={`tel:${order.phoneNumber}`}
                      className="w-8 h-8 rounded-full bg-white hover:bg-[#F3C6CB] border-2 border-[#9A3442] text-[#9A3442] flex items-center justify-center transition-all shadow-[2px_2px_0_#9A3442]"
                      title="Call customer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-[#F3C6CB] border-2 border-[#9A3442] text-[#9A3442] text-xs font-spacemono font-bold uppercase tracking-wider transition-all shadow-[2px_2px_0_#9A3442] hover:-translate-x-0.5 hover:-translate-y-0.5"
                      title="Open WhatsApp chat"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#9A3442]" />
                      <span>WhatsApp</span>
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Product Items & Specifications */}
          <div className="p-3.5 rounded-[12px] border-2 border-[#E9DDD9] bg-white space-y-2">
            <div className="flex items-center gap-1.5 text-[#9A3442] font-spacemono font-bold text-xs uppercase tracking-wider">
              <Package className="w-4 h-4" />
              <span>Items &amp; Specifications</span>
            </div>
            <p className="font-instrumentsans text-xs text-[#2E2425] pl-5 leading-relaxed font-medium">
              {order.productDescription}
            </p>
            <div className="flex items-center gap-2 pl-5 text-[10px] font-spacemono uppercase font-bold text-[#6B5A5D]">
              <span className="text-[#9A3442] bg-[#FAF6F2] px-2 py-0.5 rounded-full border border-[#9A3442]/50">{order.productCategory}</span>
              {order.size && (
                <>
                  <span className="text-[#9A3442]/40">·</span>
                  <span className="bg-[#F3C6CB] text-[#6B1E2B] px-2 py-0.5 rounded-full border border-[#9A3442]/50">Size: {order.size}</span>
                </>
              )}
              <span className="text-[#9A3442]/40">·</span>
              <span>Qty: {order.quantity}</span>
            </div>
          </div>

          {/* Financial Breakdown (Soft Rose supporting palette) */}
          <div className="p-3.5 rounded-[12px] bg-[#FBE9EB] border-2 border-[#E9DDD9] space-y-2">
            <div className="flex justify-between items-center text-[#2E2425]/90 font-instrumentsans">
              <span className="font-medium">Total Order Amount:</span>
              <span className="font-spacemono font-bold text-sm text-[#822936] tabular-nums">
                {formatNaira(order.orderAmount)}
              </span>
            </div>
            <div className="flex justify-between items-center text-[#2E2425]/90 font-instrumentsans">
              <span className="font-medium">Amount Paid:</span>
              <span className="font-spacemono font-bold text-sm text-[#2E2425] tabular-nums">
                {formatNaira(order.amountPaid)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t-2 border-[#E9DDD9] text-[#2E2425] font-medium font-instrumentsans">
              <span className="font-bold text-[#9A3442]">Balance Due:</span>
              <span className="font-spacemono font-bold text-base text-[#9C4A22] tabular-nums">
                {formatNaira(order.balanceDue)}
              </span>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-[12px] border-2 border-[#E9DDD9] bg-white">
              <div className="flex items-center gap-1 text-[#9A3442] mb-1 font-spacemono">
                <Calendar className="w-3.5 h-3.5 text-[#9A3442]" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Order Date</span>
              </div>
              <p className="font-spacemono font-bold text-xs text-[#2E2425]">{formatDate(order.orderDate)}</p>
            </div>
            <div className="p-3 rounded-[12px] border-2 border-[#E9DDD9] bg-white">
              <div className="flex items-center gap-1 text-[#9A3442] mb-1 font-spacemono">
                <Clock className="w-3.5 h-3.5 text-[#9A3442]" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Dispatch Date</span>
              </div>
              <p className="font-spacemono font-bold text-xs text-[#2E2425]">
                {order.dispatchDate ? formatDate(order.dispatchDate) : 'Pending dispatch'}
              </p>
            </div>
          </div>

          {/* Customer Delivery Notes */}
          {order.notes && (
            <div className="p-3.5 rounded-[12px] border-2 border-[#E9DDD9] bg-[#FAF6F2]">
              <div className="flex items-center gap-1.5 text-[#9A3442] mb-1 font-bold text-xs font-spacemono uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5" />
                <span>Notes &amp; Instructions</span>
              </div>
              <p className="font-instrumentsans text-xs text-[#2E2425] leading-relaxed italic pl-5">
                &ldquo;{order.notes}&rdquo;
              </p>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t-2 border-[#9A3442] bg-[#FDFAF5] flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={() => {
              onClose();
              onEdit(order);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-[#F3C6CB] border-2 border-[#9A3442] text-[#9A3442] text-xs font-spacemono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[2px_2px_0_#9A3442] hover:-translate-x-0.5 hover:-translate-y-0.5"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#9A3442]" />
            <span>Edit Order</span>
          </button>

          {nextStage && (
            <button
              onClick={() => {
                onMoveStage(order.id, nextStage);
                onClose();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#9A3442] hover:bg-[#822936] text-white text-xs sm:text-sm font-instrumentsans font-semibold transition-all border-2 border-[#9A3442] shadow-[3px_3px_0_#9A3442] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 cursor-pointer"
            >
              <span>Move to {nextStage}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {order.orderStage === 'Done & Happy' && (
            <div className="inline-flex items-center gap-1.5 text-[#2F6B4F] text-xs bg-[#EAF1EC] px-3.5 py-1.5 rounded-full border-2 border-[#2F6B4F] font-spacemono font-bold uppercase tracking-wider shadow-[1px_1px_0_#2F6B4F]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2F6B4F]" />
              <span>DELIVERED &amp; HAPPY</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
