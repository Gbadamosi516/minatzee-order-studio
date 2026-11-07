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
        
        {/* CARD 1: TOTAL ORDERS TODAY */}
        <div className="bg-[#FFB7B1] rounded-[14px] p-3.5 sm:p-5 border-2 border-[#9A3442] shadow-[4px_4px_0_#9A3442] sm:shadow-[6px_6px_0_#9A3442] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 duration-150 flex flex-col justify-between relative">
          <div>
            <div className="flex items-center justify-between mb-2.5 sm:mb-3">
              <span className="font-spacemono text-[11px] sm:text-xs font-bold text-[#9A3442] tracking-[0.14em] uppercase flex items-center gap-1.5 sm:gap-2">
                <span className="w-2 h-2 bg-[#9A3442] rotate-45 shrink-0" />
                Orders Today
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-[#9A3442] border-2 border-[#9A3442] shadow-[2px_2px_0_#9A3442] flex items-center justify-center shrink-0">
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <div className="font-spacemono font-bold text-2xl sm:text-3xl text-[#9A3442] tabular-nums tracking-tight">
                {totalOrdersTodayCount}
              </div>
              <span className="font-spacemono font-bold text-[10px] uppercase tracking-wider text-[#9A3442] bg-white px-2.5 py-0.5 sm:py-1 rounded-full border-2 border-[#9A3442] shadow-[1px_1px_0_#9A3442] sm:shadow-[2px_2px_0_#9A3442] tabular-nums">
                {orders.length} TOTAL LOGGED
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t-2 border-[#9A3442]/20 flex items-center justify-between text-xs font-instrumentsans text-[#2E2425]">
            <span className="font-medium text-[11px] sm:text-xs">
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

        {/* CARD 2: TOTAL PAID */}
        <div className="bg-[#FFB7B1] rounded-[14px] p-3.5 sm:p-5 border-2 border-[#9A3442] shadow-[4px_4px_0_#9A3442] sm:shadow-[6px_6px_0_#9A3442] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 duration-150 flex flex-col justify-between relative">
          <div>
            <div className="flex items-center justify-between mb-2.5 sm:mb-3">
              <span className="font-spacemono text-[11px] sm:text-xs font-bold text-[#9A3442] tracking-[0.14em] uppercase flex items-center gap-1.5 sm:gap-2">
                <span className="w-2 h-2 bg-[#9A3442] rotate-45 shrink-0" />
                Total Paid
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-[#9A3442] border-2 border-[#9A3442] shadow-[2px_2px_0_#9A3442] flex items-center justify-center shrink-0">
                <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <div className="font-spacemono font-bold text-2xl sm:text-3xl text-[#9A3442] tabular-nums tracking-tight">
                {formatNaira(totalPaidAmount)}
              </div>
              <span className="font-spacemono font-bold text-[10px] uppercase tracking-wider text-[#9A3442] bg-white px-2.5 py-0.5 sm:py-1 rounded-full border-2 border-[#9A3442] shadow-[1px_1px_0_#9A3442] sm:shadow-[2px_2px_0_#9A3442]">
                CONFIRMED
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t-2 border-[#9A3442]/20 flex items-center justify-between text-xs font-instrumentsans text-[#2E2425]">
            <span className="font-medium text-[11px] sm:text-xs">Collected boutique revenue</span>
            <span className="font-spacemono font-bold text-[#9A3442] tabular-nums">
              {paidOrdersCount} orders
            </span>
          </div>
        </div>

        {/* CARD 3: TOTAL AWAITING PAYMENT (spans 2 columns on mobile/tablet) */}
        <div className="bg-[#FFB7B1] rounded-[14px] p-3.5 sm:p-5 border-2 border-[#9A3442] shadow-[4px_4px_0_#9A3442] sm:shadow-[6px_6px_0_#9A3442] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 duration-150 flex flex-col justify-between relative min-[480px]:col-span-2 lg:col-span-1">
          <div>
            <div className="flex items-center justify-between mb-2.5 sm:mb-3">
              <span className="font-spacemono text-[11px] sm:text-xs font-bold text-[#9A3442] tracking-[0.14em] uppercase flex items-center gap-1.5 sm:gap-2">
                <span className="w-2 h-2 bg-[#9A3442] rotate-45 shrink-0" />
                Awaiting Payment
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-[#9A3442] border-2 border-[#9A3442] shadow-[2px_2px_0_#9A3442] flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <div className="font-spacemono font-bold text-2xl sm:text-3xl text-[#9A3442] tabular-nums tracking-tight">
                {formatNaira(awaitingPaymentAmount)}
              </div>
              <span className="font-spacemono font-bold text-[10px] uppercase tracking-wider text-[#9A3442] bg-white px-2.5 py-0.5 sm:py-1 rounded-full border-2 border-[#9A3442] shadow-[1px_1px_0_#9A3442] sm:shadow-[2px_2px_0_#9A3442]">
                OUTSTANDING
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t-2 border-[#9A3442]/20 flex items-center justify-between text-xs font-instrumentsans text-[#2E2425]">
            <span className="font-medium text-[11px] sm:text-xs">Pending balance due</span>
            <span className="font-spacemono font-bold text-[#9A3442] tabular-nums">
              {awaitingOrdersCount} pending
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
