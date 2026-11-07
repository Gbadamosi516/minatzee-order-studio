import React from 'react';
import { Search, X, ArrowUpDown } from 'lucide-react';
import { FilterState, OrderStage, PaymentStatus, DateFilterOption, SortOption } from '../types/order';

interface SearchAndFiltersProps {
  filters: FilterState;
  onFilterChange: (updated: Partial<FilterState>) => void;
  onClearFilters: () => void;
  totalFilteredCount: number;
  totalOrdersCount: number;
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  totalFilteredCount,
  totalOrdersCount,
}) => {
  const isFiltered =
    filters.searchQuery.trim() !== '' ||
    filters.stage !== 'all' ||
    filters.paymentStatus !== 'all' ||
    filters.dateRange !== 'all_time' ||
    filters.sortBy !== 'newest';

  const stages: { label: string; value: OrderStage | 'all' }[] = [
    { label: 'All Orders', value: 'all' },
    { label: 'New Chats', value: 'New Chats' },
    { label: 'Awaiting Payment', value: 'Awaiting Payment' },
    { label: 'To Pack', value: 'To Pack' },
    { label: 'Shipped', value: 'Shipped' },
    { label: 'Done & Happy', value: 'Done & Happy' },
  ];

  return (
    <div className="bg-white rounded-[14px] p-3.5 sm:p-4.5 border-2 border-[#9A3442] shadow-[4px_4px_0_#9A3442] mb-5 sm:mb-7 space-y-3.5">
      {/* Top Row: Search Input + Filters */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-[#9A3442]" />
          </div>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Search customer, phone, order details..."
            className="w-full pl-10 pr-9 py-2.5 bg-white border-2 border-[#D98A96] focus:border-[#9A3442] focus:ring-3 focus:ring-[#FFC9C2] rounded-[8px] text-xs sm:text-sm text-[#2A1B1E] font-instrumentsans placeholder:text-[#CFBFA9] transition-all outline-none"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9A3442] hover:text-[#521722] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters and Sorting Zone */}
        <div className="grid grid-cols-2 sm:flex items-center gap-2 pb-0.5 sm:pb-0">
          {/* Sort By Dropdown */}
          <div className="relative flex items-center col-span-2 sm:col-span-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#9A3442] absolute left-3 pointer-events-none" />
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as SortOption })}
              className="pl-8 pr-7 py-2 sm:py-2.5 w-full bg-white border-2 border-[#D98A96] focus:border-[#9A3442] focus:ring-3 focus:ring-[#FFC9C2] rounded-[8px] text-xs font-instrumentsans text-[#2E2425] outline-none cursor-pointer appearance-none transition-all"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="highest_amount">Sort: Amount (High to Low)</option>
              <option value="lowest_amount">Sort: Amount (Low to High)</option>
            </select>
          </div>

          {/* Payment Status Dropdown */}
          <select
            value={filters.paymentStatus}
            onChange={(e) => onFilterChange({ paymentStatus: e.target.value as PaymentStatus | 'all' })}
            className="w-full sm:w-auto px-3 py-2 sm:py-2.5 bg-white border-2 border-[#D98A96] focus:border-[#9A3442] focus:ring-3 focus:ring-[#FFC9C2] rounded-[8px] text-xs font-instrumentsans text-[#2E2425] outline-none cursor-pointer transition-all"
          >
            <option value="all">Payment: All</option>
            <option value="Paid">Payment: Paid</option>
            <option value="Part Payment">Payment: Part Paid</option>
            <option value="Awaiting Payment">Payment: Awaiting</option>
          </select>

          {/* Date Filter Dropdown */}
          <select
            value={filters.dateRange}
            onChange={(e) => onFilterChange({ dateRange: e.target.value as DateFilterOption })}
            className="w-full sm:w-auto px-3 py-2 sm:py-2.5 bg-white border-2 border-[#D98A96] focus:border-[#9A3442] focus:ring-3 focus:ring-[#FFC9C2] rounded-[8px] text-xs font-instrumentsans text-[#2E2425] outline-none cursor-pointer transition-all"
          >
            <option value="all_time">Date: All</option>
            <option value="today">Date: Today</option>
            <option value="yesterday">Date: Yesterday</option>
            <option value="last_7_days">Date: Last 7 Days</option>
            <option value="last_30_days">Date: Last 30 Days</option>
          </select>

          {/* Clear Filters Button */}
          {isFiltered && (
            <button
              onClick={onClearFilters}
              type="button"
              className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FFC9C2] hover:bg-[#FFB7B1] border-2 border-[#9A3442] text-[#3D0F17] text-xs font-spacemono font-bold tracking-wider uppercase transition-all cursor-pointer whitespace-nowrap shadow-[2px_2px_0_#9A3442] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Stage Filter Tabs */}
      <div className="flex items-center justify-between border-t-2 border-[#E9DDD9] pt-3 gap-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 max-w-full kanban-scroll">
          {stages.map((st) => {
            const isActive = filters.stage === st.value;
            return (
              <button
                key={st.value}
                onClick={() => onFilterChange({ stage: st.value })}
                className={`px-3 py-1.5 rounded-full text-xs font-spacemono uppercase tracking-wider font-bold whitespace-nowrap transition-all cursor-pointer border-2 ${
                  isActive
                    ? 'bg-[#9A3442] text-white border-[#9A3442] shadow-[2px_2px_0_#9A3442]'
                    : 'bg-[#FAF6F2] hover:bg-[#F3C6CB] text-[#9A3442] border-[#9A3442]/40 hover:border-[#9A3442]'
                }`}
              >
                {st.label}
              </button>
            );
          })}
        </div>

        {/* Results Counter */}
        <div className="text-xs font-spacemono font-bold text-[#9A3442] uppercase tracking-wider shrink-0 ml-2 hidden sm:flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-[#9A3442] rotate-45" />
          <span>{totalFilteredCount} of {totalOrdersCount} orders</span>
        </div>
      </div>
    </div>
  );
};
