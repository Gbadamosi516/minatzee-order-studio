import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  MessageCircle, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Eye, 
  ArrowRightCircle, 
  CheckCircle2, 
  Calendar,
  GripVertical,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { Order, OrderStage } from '../types/order';
import { formatNaira, formatDate, generateWhatsAppLink } from '../utils/helpers';

interface OrderCardProps {
  order: Order;
  onViewDetails: (order: Order) => void;
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
  onMoveStage: (orderId: string, newStage: OrderStage) => void;
  isDragOverlay?: boolean;
}

const STAGES: OrderStage[] = [
  'New Chats',
  'Awaiting Payment',
  'To Pack',
  'Shipped',
  'Done & Happy',
];

const NEXT_STAGE_MAP: Record<OrderStage, OrderStage | null> = {
  'New Chats': 'Awaiting Payment',
  'Awaiting Payment': 'To Pack',
  'To Pack': 'Shipped',
  'Shipped': 'Done & Happy',
  'Done & Happy': null,
};

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onViewDetails,
  onEdit,
  onDelete,
  onMoveStage,
  isDragOverlay = false,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [stageDropdownOpen, setStageDropdownOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: order.id,
    data: { order },
    disabled: isDragOverlay,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  const whatsappUrl = generateWhatsAppLink(
    order.whatsappContact || order.phoneNumber,
    order.customerName,
    order.productDescription
  );

  const nextStage = NEXT_STAGE_MAP[order.orderStage];

  // Brand-aligned payment status indicators (Design System v1.2 #colour specs: icon + word, WCAG AA >= 4.5:1)
  const renderPaymentBadge = () => {
    switch (order.paymentStatus) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-spacemono font-bold tracking-wider uppercase bg-[#EAF1EC] text-[#2F6B4F] border border-[#2F6B4F] px-2 py-0.5 rounded-full shadow-[1px_1px_0_#2F6B4F]">
            <span className="text-[11px] leading-none">✓</span>
            <span>PAID</span>
          </span>
        );
      case 'Part Payment':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-spacemono font-bold tracking-wider uppercase bg-[#F8E8DE] text-[#9C4A22] border border-[#9C4A22] px-2 py-0.5 rounded-full shadow-[1px_1px_0_#9C4A22]">
            <span className="text-[11px] leading-none">!</span>
            <span>PART PAID</span>
          </span>
        );
      case 'Awaiting Payment':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-spacemono font-bold tracking-wider uppercase bg-[#F7EEDD] text-[#8A5A1E] border border-[#8A5A1E] px-2 py-0.5 rounded-full shadow-[1px_1px_0_#8A5A1E]">
            <span className="text-[10px] leading-none">◷</span>
            <span>PENDING</span>
          </span>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white rounded-[14px] border-2 border-[#9A3442] p-3 sm:p-3.5 shadow-[4px_4px_0_#9A3442] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 ${
        isDragOverlay ? 'drag-overlay-card' : ''
      }`}
    >
      {/* Top Drag & Move Strip: Large, touch-friendly drag handle */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E9DDD9]/70">
        {/* Drag Handle Bar (min 36px touch zone with clear visual grip) */}
        <div
          {...attributes}
          {...listeners}
          className="flex-1 flex items-center gap-1.5 py-1 px-2 -ml-1 rounded-md bg-[#FDFAF5] hover:bg-[#FDF1EF] text-[#9A3442] cursor-grab active:cursor-grabbing touch-none border border-[#9A3442]/30 hover:border-[#9A3442] transition-colors select-none"
          title="Click and drag to move order to another column"
        >
          <GripVertical className="w-4 h-4 stroke-[2.5] text-[#9A3442] shrink-0" />
          <span className="text-[10px] font-spacemono font-bold uppercase tracking-wider text-[#9A3442]">
            Hold &amp; Drag
          </span>
        </div>

        {/* Action Menu Trigger */}
        <div className="relative shrink-0 ml-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="w-7 h-7 rounded-md hover:bg-[#FDF1EF] text-[#9A3442] flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-[#9A3442]/40"
            aria-label="Order actions"
          >
            <MoreVertical className="w-4 h-4 stroke-[2.2]" />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                }} 
              />
              <div className="absolute right-0 top-8 z-50 w-48 bg-white rounded-xl border-2 border-[#9A3442] shadow-[0_8px_24px_rgba(154,52,66,0.18)] py-1 text-xs divide-y divide-[#E9DDD9] font-instrumentsans">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onViewDetails(order);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-[#FDF1EF] text-[#2E2425] hover:text-[#9A3442] font-semibold cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#9A3442]" />
                    <span>View Details</span>
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(order);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-[#FDF1EF] text-[#2E2425] hover:text-[#9A3442] font-semibold cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#9A3442]" />
                    <span>Edit Order</span>
                  </button>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(order);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 text-[#9A3442] hover:bg-[#FDF1EF] font-bold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#9A3442]" />
                    <span>Delete Order</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Customer Name Row */}
      <div className="flex items-start justify-between gap-1.5 mb-1.5">
        <button
          onClick={() => onViewDetails(order)}
          className="text-left font-fraunces font-bold text-sm sm:text-[15px] text-[#9A3442] hover:text-[#521722] truncate transition-colors cursor-pointer tracking-tight"
        >
          {order.customerName}
        </button>
      </div>

      {/* Product Description */}
      <p 
        onClick={() => onViewDetails(order)}
        className="font-instrumentsans text-xs text-[#2A1B1E] line-clamp-2 mb-2.5 cursor-pointer hover:text-[#9A3442] transition-colors leading-relaxed"
      >
        {order.productDescription}
      </p>

      {/* Size, Category, Quantity Metadata (.mz-tag style) */}
      <div className="flex items-center flex-wrap gap-1.5 text-[10px] font-spacemono font-bold uppercase tracking-wider mb-2.5">
        <span className="bg-[#FAF6F2] text-[#9A3442] px-2 py-0.5 rounded-full border border-[#9A3442]/60">
          {order.productCategory}
        </span>
        {order.size && (
          <span className="bg-[#FDF1EF] text-[#9A3442] px-2 py-0.5 rounded-full border border-[#9A3442]">
            SIZE {order.size}
          </span>
        )}
        <span className="text-[#9A3442] font-bold">·</span>
        <span className="text-[#6B5A5D]">QTY {order.quantity || 1}</span>
      </div>

      {/* Financials & Status Row */}
      <div className="flex items-center justify-between pt-2 border-t-2 border-[#E9DDD9]">
        <div>
          <div className="font-spacemono font-bold text-sm text-[#822936] tabular-nums">
            {formatNaira(order.orderAmount)}
          </div>
          {order.balanceDue > 0 && order.paymentStatus !== 'Paid' && (
            <div className="font-spacemono text-[10px] text-[#9C4A22] tracking-wider uppercase font-bold">
              BAL: {formatNaira(order.balanceDue)}
            </div>
          )}
        </div>

        <div>
          {renderPaymentBadge()}
        </div>
      </div>

      {/* Footer Info: Date & WhatsApp Quick Action */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E9DDD9]">
        <div className="flex items-center gap-1.5 text-[10px] font-spacemono text-[#6B5A5D] tracking-wider uppercase">
          <Calendar className="w-3 h-3 text-[#9A3442]" />
          <span>
            {order.orderStage === 'Shipped' && order.dispatchDate
              ? `SHIPPED ${formatDate(order.dispatchDate)}`
              : formatDate(order.orderDate)}
          </span>
        </div>

        {/* WhatsApp Pill Button */}
        {order.phoneNumber && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white hover:bg-[#FDF1EF] border-2 border-[#9A3442] text-[#9A3442] font-spacemono font-bold text-[10px] tracking-wider uppercase transition-all cursor-pointer shadow-[2px_2px_0_#9A3442] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0"
            title={`Chat with ${order.customerName} on WhatsApp`}
          >
            <MessageCircle className="w-3 h-3 text-[#9A3442]" />
            <span>WhatsApp</span>
          </a>
        )}
      </div>

      {/* 🚀 QUICK 1-TAP STAGE PROGRESSION (Guarantees card can be moved instantly on any phone or desktop without dragging) */}
      <div className="mt-2.5 pt-2 border-t-2 border-[#9A3442]/30 flex items-center gap-1.5">
        {nextStage ? (
          /* Direct Advance to Next Stage Button */
          <button
            onClick={() => onMoveStage(order.id, nextStage)}
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-full bg-[#9A3442] hover:bg-[#822936] text-white text-[11px] font-instrumentsans font-bold tracking-tight shadow-[2px_2px_0_#3D0F17] transition-all cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0"
            title={`Move order to ${nextStage}`}
          >
            <span>Move to {nextStage}</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        ) : (
          /* Completed Stage Status */
          <div className="flex-1 py-1 px-2.5 bg-[#EAF1EC] rounded-full border border-[#2F6B4F] text-[10px] font-spacemono font-bold uppercase tracking-wider text-[#2F6B4F] flex items-center justify-center gap-1 shadow-[1px_1px_0_#2F6B4F]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2F6B4F]" />
            <span>DELIVERED &amp; HAPPY</span>
          </div>
        )}

        {/* Jump-to-Any-Stage Dropdown Trigger */}
        <div className="relative shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setStageDropdownOpen(!stageDropdownOpen);
            }}
            type="button"
            className="w-7 h-7 rounded-full bg-[#FDFAF5] hover:bg-[#FDF1EF] border-2 border-[#9A3442] text-[#9A3442] flex items-center justify-center transition-all cursor-pointer shadow-[1px_1px_0_#9A3442]"
            title="Jump directly to any stage"
            aria-label="Change stage"
          >
            <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          {stageDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={(e) => {
                  e.stopPropagation();
                  setStageDropdownOpen(false);
                }} 
              />
              <div className="absolute right-0 bottom-8 z-50 w-44 bg-white rounded-xl border-2 border-[#9A3442] shadow-[0_6px_20px_rgba(154,52,66,0.2)] py-1 text-xs divide-y divide-[#E9DDD9] font-instrumentsans">
                <div className="px-2.5 py-1 text-[10px] font-spacemono font-bold text-[#9A3442] uppercase tracking-wider bg-[#FDFAF5]">
                  Select Stage:
                </div>
                <div className="py-1">
                  {STAGES.map((st) => (
                    <button
                      key={st}
                      disabled={st === order.orderStage}
                      onClick={() => {
                        onMoveStage(order.id, st);
                        setStageDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between cursor-pointer ${
                        st === order.orderStage
                          ? 'font-bold text-[#9A3442] bg-[#FDF1EF]'
                          : 'text-[#2E2425] hover:text-[#9A3442] hover:bg-[#FDFAF5]'
                      }`}
                    >
                      <span>{st}</span>
                      {st === order.orderStage && <CheckCircle2 className="w-3.5 h-3.5 text-[#9A3442]" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
