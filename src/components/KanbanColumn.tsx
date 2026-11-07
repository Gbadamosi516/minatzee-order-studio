import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MessageSquare, Clock, Package, Truck, Smile } from 'lucide-react';
import { Order, OrderStage } from '../types/order';
import { OrderCard } from './OrderCard';

interface KanbanColumnProps {
  stage: OrderStage;
  orders: Order[];
  onAddOrderToStage: (stage: OrderStage) => void;
  onViewDetails: (order: Order) => void;
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
  onMoveStage: (orderId: string, newStage: OrderStage) => void;
}

const STAGE_CONFIG: Record<
  OrderStage,
  {
    icon: React.ElementType;
    emptyText: string;
    emptySubtext: string;
  }
> = {
  'New Chats': {
    icon: MessageSquare,
    emptyText: 'No new customer chats',
    emptySubtext: 'Inquiries and interested shoppers will appear here.',
  },
  'Awaiting Payment': {
    icon: Clock,
    emptyText: 'No pending payments',
    emptySubtext: 'Orders awaiting transfer or balance confirmation.',
  },
  'To Pack': {
    icon: Package,
    emptyText: 'Nothing to pack',
    emptySubtext: 'Paid orders ready for careful boutique packaging.',
  },
  'Shipped': {
    icon: Truck,
    emptyText: 'No dispatched parcels',
    emptySubtext: 'Orders currently en route to customers via dispatch.',
  },
  'Done & Happy': {
    icon: Smile,
    emptyText: 'Delivered orders will appear here',
    emptySubtext: 'Completed deliveries and satisfied clients.',
  },
};

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  stage,
  orders,
  onAddOrderToStage,
  onViewDetails,
  onEdit,
  onDelete,
  onMoveStage,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
    data: { stage },
  });

  const config = STAGE_CONFIG[stage];
  const IconComponent = config.icon;
  const orderIds = orders.map((o) => o.id);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-[86vw] sm:w-[320px] max-w-[360px] shrink-0 bg-[#F8F2E8] rounded-[14px] border-2 transition-all duration-200 overflow-hidden shadow-[4px_4px_0_#9A3442] ${
        isOver
          ? 'border-[#9A3442] ring-3 ring-[#FFC9C2] bg-[#FDF1EF]'
          : 'border-[#9A3442]/80 hover:border-[#9A3442]'
      }`}
    >
      {/* Column Header with clearly defined boundaries and Burgundy titles */}
      <div className="px-3.5 py-3 bg-white border-b-2 border-[#9A3442] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Rotated Wine Diamond Indicator */}
          <span className="w-2 h-2 bg-[#9A3442] rotate-45 shrink-0" />
          
          <h3 className="font-fraunces font-bold text-xs sm:text-[13px] text-[#9A3442] tracking-wider uppercase">
            {stage}
          </h3>

          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-spacemono font-bold bg-[#FFC9C2] text-[#3D0F17] border-2 border-[#9A3442] tabular-nums shadow-[1px_1px_0_#9A3442]">
            {orders.length}
          </span>
        </div>

        {/* Quick Add Shortcut */}
        <button
          onClick={() => onAddOrderToStage(stage)}
          type="button"
          className="w-7 h-7 rounded-full text-[#9A3442] hover:bg-[#FFC9C2] border-2 border-transparent hover:border-[#9A3442] flex items-center justify-center transition-all cursor-pointer"
          title={`Add order directly to ${stage}`}
          aria-label={`Add order to ${stage}`}
        >
          <Plus className="w-4 h-4 stroke-[2.4]" />
        </button>
      </div>

      {/* Column Body / Cards Area */}
      <div className="flex-1 p-2.5 sm:p-3 overflow-y-auto min-h-[300px] sm:max-h-[calc(100vh-270px)] space-y-3 kanban-scroll bg-[#F8F2E8]">
        <SortableContext items={orderIds} strategy={verticalListSortingStrategy}>
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onViewDetails={onViewDetails}
              onEdit={onEdit}
              onDelete={onDelete}
              onMoveStage={onMoveStage}
            />
          ))}
        </SortableContext>

        {/* Empty State */}
        {orders.length === 0 && (
          <div className="h-44 flex flex-col items-center justify-center text-center p-4 rounded-[14px] border-2 border-dashed border-[#CFBFA9] bg-white my-1">
            <div className="w-8 h-8 rounded-full bg-[#FDF1EF] text-[#9A3442] border-2 border-[#9A3442] shadow-[2px_2px_0_#9A3442] flex items-center justify-center mb-2">
              <IconComponent className="w-4 h-4" />
            </div>
            <p className="font-fraunces font-bold text-xs text-[#9A3442] mb-0.5">
              {config.emptyText}
            </p>
            <p className="font-instrumentsans text-xs text-[#5C4649] max-w-[190px] mb-2.5 leading-tight">
              {config.emptySubtext}
            </p>
            <button
              onClick={() => onAddOrderToStage(stage)}
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white hover:bg-[#FFC9C2] border-2 border-[#9A3442] text-[#9A3442] text-xs font-spacemono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[2px_2px_0_#9A3442] hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              <Plus className="w-3 h-3" />
              <span>Add Order</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
