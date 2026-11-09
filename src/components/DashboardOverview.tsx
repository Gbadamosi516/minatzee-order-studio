import React from 'react';
import { ShoppingBag, Wallet, Clock, ArrowUpRight } from 'lucide-react';
import { Order } from '../types/order';
import { formatNaira, getTodayString } from '../utils/helpers';

interface DashboardOverviewProps {
  orders: Order[];
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ orders }) => {
  const todayStr = getTodayString();

  // Card 1: Total Orders Today
  const todayOrders = orders.filter(
    (o) => o.orderDate === todayStr || (o.createdAt && o.createdAt.startsWith(todayStr))
  );
  const totalOrdersTodayCount = todayOrders.length;
  const todayTotalValue = todayOrders.reduce((sum, o) => sum + (Number(o.orderAmount) || 0), 0);

  // Card 2: Total Paid
  const totalPaidAmount = orders
    .filter((o) => o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + (Number(o.orderAmount) || 0), 0);
  const paidOrdersCount = orders.filter((o) => o.paymentStatus === 'Paid').length;

  // Card 3: Awaiting Payment
  const awaitingPaymentAmount = orders
    .filter((o) => o.paymentStatus === 'Awaiting Payment' || o.orderStage === 'Awaiting Payment')
    .reduce((sum, o) => sum + (Number(o.balanceDue ?? (o.orderAmount - o.amountPaid)) || 0), 0);
  const awaitingOrdersCount = orders.filter((o) => o.paymentStatus !== 'Paid').length;

  return (
    <section className="mb-5 sm:mb-7" aria-label="Dashboard Overview">
      {/* 
        Responsive Grid:
        - Very narrow phones: 1 column
        - Typical mobile/Android (min 480px): 2 balanced columns, card 3 neatly spanning below
        - Desktop (lg): 3 columns
      */}
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4.5">
        
        {/* CARD 1: TOTAL ORDERS TODAY (Radix Accent Scale: Burgundy #9A3442) */}
        <div className="bg-white rounded-[14px] p-4 sm:p-5 border-2 border-[#9A3442] shadow-[4px_4px_0_#9A3442] sm:shadow-[5px_5px_0_#9A3442] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 duration-150 flex flex-col justify-between relative">
          <div>
            <div className="flex items-center justify-between mb-2.5 sm:mb-3">
              <span className="font-spacemono text-[11px] sm:text-xs font-bold text-[#9A3442] tracking-[0.14em] uppercase flex items-center gap-1.5 sm:gap-2">
                <span className="w-2 h-2 bg-[#9A3442] rotate-45 shrink-0" />
                Orders Today
              </span>
              <div className="w-8 h-8 rounded-full bg-[#FDF1EF] text-[#9A3442] border-2 border-[#9A3442] shadow-[2px_2px_0_#9A3442] flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <div className="font-spacemono font-bold text-2xl sm:text-3xl text-[#9A3442] tabular-nums tracking-tight">
                {totalOrdersTodayCount}
              </div>
              <span className="font-spacemono font-bold text-[10px] uppercase tracking-wider text-[#9A3442] bg-[#FDF1EF] px-2.5 py-1 rounded-full border border-[#9A3442] shadow-[1px_1px_0_#9A3442] tabular-nums">
                {orders.length} TOTAL LOGGED
              </span>
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t-2 border-[#E9DDD9] flex items-center justify-between text-xs font-instrumentsans text-[#2E2425]">
            <span className="font-medium text-[11px] sm:text-xs text-[#5C4649]">
              {totalOrdersTodayCount > 0 
                ? `${totalOrdersTodayCount} order${totalOrdersTodayCount > 1 ? 's' : ''} logged today`
                : 'No orders logged today yet'}
            </span>
            {todayTotalValue > 0 && (
              <span className="font-spacemono font-bold text-[#9A3442] tabular-nums">
                {formatNaira(todayTotalValue)}
              </span>
            )}
          </div>
        </div>

        {/* CARD 2: TOTAL PAID (Radix Grass / Success Scale: #2F6B4F on #EAF1EC) */}
        <div className="bg-white rounded-[14px] p-4 sm:p-5 border-2 border-[#2F6B4F] shadow-[4px_4px_0_#2F6B4F] sm:shadow-[5px_5px_0_#2F6B4F] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 duration-150 flex flex-col justify-between relative">
          <div>
            <div className="flex items-center justify-between mb-2.5 sm:mb-3">
              <span className="font-spacemono text-[11px] sm:text-xs font-bold text-[#2F6B4F] tracking-[0.14em] uppercase flex items-center gap-1.5 sm:gap-2">
                <span className="w-2 h-2 bg-[#2F6B4F] rotate-45 shrink-0" />
                Total Paid
              </span>
              <div className="w-8 h-8 rounded-full bg-[#EAF1EC] text-[#2F6B4F] border-2 border-[#2F6B4F] shadow-[2px_2px_0_#2F6B4F] flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <div className="font-spacemono font-bold text-2xl sm:text-3xl text-[#2F6B4F] tabular-nums tracking-tight">
                {formatNaira(totalPaidAmount)}
              </div>
              <span className="font-spacemono font-bold text-[10px] uppercase tracking-wider text-[#2F6B4F] bg-[#EAF1EC] px-2.5 py-1 rounded-full border border-[#2F6B4F] shadow-[1px_1px_0_#2F6B4F]">
                CONFIRMED
              </span>
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t-2 border-[#E9DDD9] flex items-center justify-between text-xs font-instrumentsans text-[#2E2425]">
            <span className="font-medium text-[11px] sm:text-xs text-[#5C4649]">Collected boutique revenue</span>
            <span className="font-spacemono font-bold text-[#2F6B4F] tabular-nums">
              {paidOrdersCount} orders
            </span>
          </div>
        </div>

        {/* CARD 3: TOTAL AWAITING PAYMENT (Radix Amber / Warning Scale: #9C4A22 on #F8E8DE) */}
        <div className="bg-white rounded-[14px] p-4 sm:p-5 border-2 border-[#9C4A22] shadow-[4px_4px_0_#9C4A22] sm:shadow-[5px_5px_0_#9C4A22] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 duration-150 flex flex-col justify-between relative min-[480px]:col-span-2 lg:col-span-1">
          <div>
            <div className="flex items-center justify-between mb-2.5 sm:mb-3">
              <span className="font-spacemono text-[11px] sm:text-xs font-bold text-[#9C4A22] tracking-[0.14em] uppercase flex items-center gap-1.5 sm:gap-2">
                <span className="w-2 h-2 bg-[#9C4A22] rotate-45 shrink-0" />
                Awaiting Payment
              </span>
              <div className="w-8 h-8 rounded-full bg-[#F8E8DE] text-[#9C4A22] border-2 border-[#9C4A22] shadow-[2px_2px_0_#9C4A22] flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <div className="font-spacemono font-bold text-2xl sm:text-3xl text-[#9C4A22] tabular-nums tracking-tight">
                {formatNaira(awaitingPaymentAmount)}
              </div>
              <span className="font-spacemono font-bold text-[10px] uppercase tracking-wider text-[#9C4A22] bg-[#F8E8DE] px-2.5 py-1 rounded-full border border-[#9C4A22] shadow-[1px_1px_0_#9C4A22]">
                OUTSTANDING
              </span>
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t-2 border-[#E9DDD9] flex items-center justify-between text-xs font-instrumentsans text-[#2E2425]">
            <span className="font-medium text-[11px] sm:text-xs text-[#5C4649]">Pending balance due</span>
            <span className="font-spacemono font-bold text-[#9C4A22] tabular-nums">
              {awaitingOrdersCount} pending
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
