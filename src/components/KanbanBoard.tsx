import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Order, OrderStage } from '../types/order';
import { KanbanColumn } from './KanbanColumn';
import { OrderCard } from './OrderCard';

interface KanbanBoardProps {
  orders: Order[];
  onOrderStageChange: (orderId: string, newStage: OrderStage) => void;
  onAddOrderToStage: (stage: OrderStage) => void;
  onViewDetails: (order: Order) => void;
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
  activeFilterStage: OrderStage | 'all';
}

const KANBAN_COLUMNS: OrderStage[] = [
  'New Chats',
  'Awaiting Payment',
  'To Pack',
  'Shipped',
  'Done & Happy',
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  orders,
  onOrderStageChange,
  onAddOrderToStage,
  onViewDetails,
  onEdit,
  onDelete,
  activeFilterStage,
}) => {
  const [activeDraggingOrder, setActiveDraggingOrder] = useState<Order | null>(null);

  // Configure sensors for smooth mouse and touch control
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requires 8px movement before initiating drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const foundOrder = orders.find((o) => o.id === active.id);
    if (foundOrder) {
      setActiveDraggingOrder(foundOrder);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDraggingOrder(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Determine target stage
    let targetStage: OrderStage | null = null;

    if (KANBAN_COLUMNS.includes(overId as OrderStage)) {
      targetStage = overId as OrderStage;
    } else {
      // Over another card
      const targetCard = orders.find((o) => o.id === overId);
      if (targetCard) {
        targetStage = targetCard.orderStage;
      }
    }

    if (targetStage) {
      const currentOrder = orders.find((o) => o.id === activeId);
      if (currentOrder && currentOrder.orderStage !== targetStage) {
        onOrderStageChange(activeId, targetStage);
      }
    }
  };

  // Filter columns if a single stage filter is selected, or show all five
  const displayedColumns =
    activeFilterStage === 'all'
      ? KANBAN_COLUMNS
      : KANBAN_COLUMNS.filter((col) => col === activeFilterStage);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="relative">
        {/* Mobile Swipe Hint */}
        <div className="flex sm:hidden items-center justify-between text-xs font-spacemono text-[#6B5A5D] mb-2.5 px-1">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
            <span className="w-1.5 h-1.5 bg-[#9A3442] rotate-45" />
            Swipe stages horizontally →
          </span>
          <span className="font-spacemono font-bold text-[#9A3442] text-[10px] uppercase">
            {displayedColumns.length} {displayedColumns.length === 1 ? 'Stage' : 'Stages'}
          </span>
        </div>

        {/* Horizontal Kanban Scroll Container */}
        <div className="flex gap-3.5 sm:gap-6 overflow-x-auto pb-6 pt-1 kanban-scroll scroll-smooth snap-x snap-mandatory">
          {displayedColumns.map((stage) => {
            const columnOrders = orders.filter((o) => o.orderStage === stage);
            return (
              <div key={stage} className="snap-start shrink-0">
                <KanbanColumn
                  stage={stage}
                  orders={columnOrders}
                  onAddOrderToStage={onAddOrderToStage}
                  onViewDetails={onViewDetails}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onMoveStage={onOrderStageChange}
                />
              </div>
            );
          })}
        </div>

        {/* Drag Overlay for smooth preview during drag */}
        <DragOverlay>
          {activeDraggingOrder ? (
            <div className="w-[300px]">
              <OrderCard
                order={activeDraggingOrder}
                onViewDetails={() => {}}
                onEdit={() => {}}
                onDelete={() => {}}
                onMoveStage={() => {}}
                isDragOverlay
              />
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};
