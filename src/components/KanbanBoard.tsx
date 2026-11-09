import React, { useState, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  pointerWithin,
  CollisionDetection,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { ChevronLeft, ChevronRight, Move, Sparkles } from 'lucide-react';
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Configure robust sensors for both desktop mouse and mobile touch
  const sensors = useSensors(
    // Mouse sensor: requires 6px of intentional movement so clicks still work smoothly
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    // Touch sensor: press-and-hold for 180ms with 6px tolerance for phone dragging without fighting scroll
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 180,
        tolerance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Hybrid collision detection: checks pointer position first for accurate column targeting
  const customCollisionDetection: CollisionDetection = (args) => {
    // 1. First priority: what is directly under the pointer?
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }
    // 2. Fallback: closest corners for when dragging near borders
    return closestCorners(args);
  };

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

  // Horizontal scroll helpers
  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  const scrollToStage = (stage: OrderStage) => {
    if (!scrollContainerRef.current) return;
    const stageIdx = KANBAN_COLUMNS.indexOf(stage);
    if (stageIdx >= 0) {
      scrollContainerRef.current.scrollTo({
        left: stageIdx * 340,
        behavior: 'smooth',
      });
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
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="relative">
        {/* Board Header: Controls, Stage Quick-Jump & Mobile Swipe Guidance */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5 bg-white p-2.5 sm:px-4 sm:py-2.5 rounded-[12px] border-2 border-[#9A3442] shadow-[3px_3px_0_#9A3442]">
          
          {/* Left: Interactive Stage Jump Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 kanban-scroll text-xs">
            <span className="font-spacemono font-bold text-[#9A3442] uppercase tracking-wider text-[11px] shrink-0 flex items-center gap-1 mr-1">
              <Move className="w-3.5 h-3.5 text-[#9A3442]" />
              <span className="hidden md:inline">Jump to:</span>
            </span>
            {KANBAN_COLUMNS.map((stage) => {
              const count = orders.filter((o) => o.orderStage === stage).length;
              return (
                <button
                  key={stage}
                  onClick={() => scrollToStage(stage)}
                  type="button"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-spacemono font-bold uppercase tracking-wider bg-[#FDFAF5] hover:bg-[#FDF1EF] text-[#9A3442] border border-[#9A3442]/50 hover:border-[#9A3442] transition-all cursor-pointer whitespace-nowrap active:scale-95"
                  title={`Scroll directly to ${stage}`}
                >
                  <span>{stage}</span>
                  <span className="px-1.5 py-0.2 bg-[#FDF1EF] text-[#9A3442] border border-[#9A3442] rounded-full text-[10px]">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Board Navigation Arrows & Interaction Hint */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            {/* Desktop / Tablet Scroll Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleScrollLeft}
                type="button"
                className="w-8 h-8 rounded-full bg-white hover:bg-[#FDF1EF] border-2 border-[#9A3442] text-[#9A3442] flex items-center justify-center transition-all cursor-pointer shadow-[2px_2px_0_#9A3442] active:translate-x-0 active:translate-y-0"
                title="Scroll stages left"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
              <button
                onClick={handleScrollRight}
                type="button"
                className="w-8 h-8 rounded-full bg-white hover:bg-[#FDF1EF] border-2 border-[#9A3442] text-[#9A3442] flex items-center justify-center transition-all cursor-pointer shadow-[2px_2px_0_#9A3442] active:translate-x-0 active:translate-y-0"
                title="Scroll stages right"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Quick Helper Badge */}
            <div className="inline-flex items-center gap-1 text-[11px] font-spacemono text-[#6B5A5D] bg-[#FDFAF5] px-2.5 py-1 rounded-full border border-[#CFBFA9]">
              <Sparkles className="w-3 h-3 text-[#9A3442]" />
              <span className="font-semibold text-[#9A3442]">Drag or Tap “Move”</span>
            </div>
          </div>
        </div>

        {/* Notice when single stage filter is active */}
        {activeFilterStage !== 'all' && (
          <div className="mb-3 p-2.5 bg-[#FFF8F7] border-2 border-[#9A3442] rounded-[10px] text-xs text-[#521722] flex items-center justify-between shadow-[2px_2px_0_#9A3442]">
            <span className="font-instrumentsans">
              Viewing only <strong>{activeFilterStage}</strong>. To drag orders between columns, switch the filter to "All Orders", or use the <strong>Move Stage</strong> button directly on any card.
            </span>
          </div>
        )}

        {/* Horizontal Kanban Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3.5 sm:gap-6 overflow-x-auto pb-6 pt-1 kanban-scroll scroll-smooth snap-x snap-mandatory"
        >
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
        <DragOverlay dropAnimation={null}>
          {activeDraggingOrder ? (
            <div className="w-[300px] pointer-events-none">
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

