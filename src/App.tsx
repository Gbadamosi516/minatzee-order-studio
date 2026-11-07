/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  DashboardOverview 
} from './components/DashboardOverview';
import { 
  SearchAndFilters 
} from './components/SearchAndFilters';
import { 
  KanbanBoard 
} from './components/KanbanBoard';
import { 
  OrderModal 
} from './components/OrderModal';
import { 
  OrderDetailsModal 
} from './components/OrderDetailsModal';
import { 
  SettingsModal 
} from './components/SettingsModal';
import { 
  ConfirmationModal 
} from './components/ConfirmationModal';
import { 
  Order, 
  OrderStage, 
  FilterState, 
  BusinessSettings 
} from './types/order';
import { 
  loadOrders, 
  saveOrders, 
  loadSettings, 
  saveSettings, 
  DEFAULT_SETTINGS 
} from './utils/storage';
import { 
  matchesDateRange, 
  getTodayString 
} from './utils/helpers';
import { 
  triggerCelebration 
} from './utils/confetti';
import { User } from 'firebase/auth';
import { 
  initAuth, 
  googleSignIn, 
  logoutGoogle, 
  getAccessToken 
} from './services/googleAuth';
import { 
  syncOrdersToSpreadsheet, 
  getCachedSheetInfo 
} from './services/googleSheets';
import { CheckCircle2, Heart } from 'lucide-react';

export default function App() {
  // Primary States
  const [orders, setOrders] = useState<Order[]>(() => loadOrders());
  const [settings, setSettings] = useState<BusinessSettings>(() => loadSettings());

  // Google Sheets Integration State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(
    () => getCachedSheetInfo().spreadsheetUrl
  );
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(
    () => getCachedSheetInfo().lastSync
  );

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => setGoogleUser(user),
      () => setGoogleUser(null)
    );
    return () => unsubscribe();
  }, []);

  // Filter & Search State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    stage: 'all',
    paymentStatus: 'all',
    dateRange: 'all_time',
    sortBy: 'newest',
  });

  // Modal States
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [defaultOrderStage, setDefaultOrderStage] = useState<OrderStage>('New Chats');

  const [inspectingOrder, setInspectingOrder] = useState<Order | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reusable Confirmation Dialog State
  const [confirmationConfig, setConfirmationConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Persist orders whenever they change
  useEffect(() => {
    saveOrders(orders);
  }, [orders]);

  // Persist settings whenever they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Toast timer
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 4000);
  };

  // Google Sign-in & Sheets sync handlers
  const handleGoogleSignIn = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        showToast(`Connected Google account: ${res.user.email}`);
      }
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
      showToast(err.message || 'Could not sign in with Google');
    }
  };

  const handleGoogleSignOut = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    showToast('Signed out from Google account.');
  };

  const handleExecuteSheetsSync = async () => {
    try {
      setIsSyncingSheets(true);
      let token = await getAccessToken();
      if (!token) {
        const authRes = await googleSignIn();
        if (!authRes) throw new Error('Please sign in to Google to sync sheets');
        token = authRes.accessToken;
        setGoogleUser(authRes.user);
      }

      const res = await syncOrdersToSpreadsheet(token, orders);
      setSpreadsheetUrl(res.spreadsheetUrl);
      setLastSyncedAt(res.syncedAt);
      showToast(`Synced ${res.count} orders to Google Sheets!`);
    } catch (err: any) {
      console.error('Sheets sync error:', err);
      showToast(err.message || 'Failed to sync with Google Sheets');
    } finally {
      setIsSyncingSheets(false);
    }
  };

  const handleTriggerSheetsSync = () => {
    if (!googleUser) {
      handleGoogleSignIn();
      return;
    }
    setConfirmationConfig({
      isOpen: true,
      title: 'Sync Orders to Google Sheets?',
      message: `This will update your private 'Minatzee Order Studio - Boutique Orders' spreadsheet with all current ${orders.length} order(s).`,
      confirmLabel: 'Sync to Sheets',
      isDestructive: false,
      onConfirm: () => {
        setConfirmationConfig((c) => ({ ...c, isOpen: false }));
        handleExecuteSheetsSync();
      },
    });
  };

  // Order Handlers
  const handleOpenNewOrder = (stage: OrderStage = 'New Chats') => {
    setEditingOrder(null);
    setDefaultOrderStage(stage);
    setIsOrderModalOpen(true);
  };

  const handleOpenEditOrder = (order: Order) => {
    setEditingOrder(order);
    setDefaultOrderStage(order.orderStage);
    setIsOrderModalOpen(true);
  };

  const handleSaveOrder = (orderData: Partial<Order>) => {
    const nowIso = new Date().toISOString();

    if (editingOrder) {
      // Update existing
      setOrders((prev) =>
        prev.map((item) =>
          item.id === editingOrder.id
            ? ({
                ...item,
                ...orderData,
                updatedAt: nowIso,
              } as Order)
            : item
        )
      );
      showToast(`Order for ${orderData.customerName} updated successfully.`);
    } else {
      // Create new
      const newOrder: Order = {
        id: `ord_${Date.now().toString().slice(-6)}`,
        customerName: orderData.customerName || 'New Customer',
        phoneNumber: orderData.phoneNumber || '',
        whatsappContact: orderData.whatsappContact || orderData.phoneNumber || '',
        productDescription: orderData.productDescription || '',
        productCategory: orderData.productCategory || "Women's Innerwear",
        size: orderData.size || '',
        quantity: orderData.quantity || 1,
        orderAmount: orderData.orderAmount || 0,
        amountPaid: orderData.amountPaid || 0,
        balanceDue: orderData.balanceDue || 0,
        paymentStatus: orderData.paymentStatus || 'Awaiting Payment',
        orderStage: orderData.orderStage || defaultOrderStage,
        orderDate: orderData.orderDate || getTodayString(),
        dispatchDate: orderData.dispatchDate || '',
        notes: orderData.notes || '',
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      setOrders((prev) => [newOrder, ...prev]);
      showToast(`Order for ${newOrder.customerName} created.`);
    }

    setIsOrderModalOpen(false);
    setEditingOrder(null);
  };

  const handleDeleteOrder = (orderToDelete: Order) => {
    setConfirmationConfig({
      isOpen: true,
      title: 'Delete Customer Order?',
      message: `Are you sure you want to permanently delete the order for "${orderToDelete.customerName}" (${orderToDelete.productDescription})?`,
      confirmLabel: 'Delete Order',
      isDestructive: true,
      onConfirm: () => {
        setOrders((prev) => prev.filter((o) => o.id !== orderToDelete.id));
        setConfirmationConfig((c) => ({ ...c, isOpen: false }));
        setIsOrderModalOpen(false);
        setInspectingOrder(null);
        showToast('Order was deleted.');
      },
    });
  };

  const handleStageChange = (orderId: string, newStage: OrderStage) => {
    const existing = orders.find((o) => o.id === orderId);
    if (!existing || existing.orderStage === newStage) return;

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updated: Order = {
            ...o,
            orderStage: newStage,
            updatedAt: new Date().toISOString(),
          };
          // If moved to Shipped and dispatchDate not set, auto-suggest today
          if (newStage === 'Shipped' && !updated.dispatchDate) {
            updated.dispatchDate = getTodayString();
          }
          return updated;
        }
        return o;
      })
    );

    // If moved to Done & Happy, trigger confetti celebration and special message!
    if (newStage === 'Done & Happy') {
      triggerCelebration();
      showToast('Order completed! Another happy Minatzee customer.');
    } else {
      showToast(`Moved order to ${newStage}`);
    }
  };

  const handleClearAllData = () => {
    setOrders([]);
    showToast('All order records have been cleared.');
  };

  const handleRestoreOrders = (restored: Order[]) => {
    setOrders(restored);
    showToast(`Successfully restored ${restored.length} orders.`);
  };

  // Filtered & Sorted Orders
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Search query filter
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.customerName.toLowerCase().includes(q) ||
          o.phoneNumber.includes(q) ||
          o.productDescription.toLowerCase().includes(q) ||
          (o.notes && o.notes.toLowerCase().includes(q))
      );
    }

    // Payment Status filter
    if (filters.paymentStatus !== 'all') {
      result = result.filter((o) => o.paymentStatus === filters.paymentStatus);
    }

    // Date range filter
    if (filters.dateRange !== 'all_time') {
      result = result.filter((o) => matchesDateRange(o.orderDate, filters.dateRange));
    }

    // Sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.createdAt || b.orderDate).getTime() - new Date(a.createdAt || a.orderDate).getTime();
        case 'oldest':
          return new Date(a.createdAt || a.orderDate).getTime() - new Date(b.createdAt || b.orderDate).getTime();
        case 'highest_amount':
          return (b.orderAmount || 0) - (a.orderAmount || 0);
        case 'lowest_amount':
          return (a.orderAmount || 0) - (b.orderAmount || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [orders, filters]);

  const handleClearFilters = () => {
    setFilters({
      searchQuery: '',
      stage: 'all',
      paymentStatus: 'all',
      dateRange: 'all_time',
      sortBy: 'newest',
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFAF5] text-[#2A1B1E] flex flex-col selection:bg-[#FFB7B1] selection:text-[#521722] font-instrumentsans">
      
      {/* 1. Header */}
      <Header
        settings={settings}
        onOpenNewOrder={() => handleOpenNewOrder('New Chats')}
        onOpenSettings={() => setIsSettingsOpen(true)}
        googleUser={googleUser}
        isSyncingSheets={isSyncingSheets}
        onTriggerSheetsSync={handleTriggerSheetsSync}
        spreadsheetUrl={spreadsheetUrl}
      />

      {/* 2. Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-6 lg:px-8 py-3.5 sm:py-7">
        
        {/* Dashboard Overview Cards */}
        <DashboardOverview orders={orders} />

        {/* Search, Filter & Stage Selector */}
        <SearchAndFilters
          filters={filters}
          onFilterChange={(updated) => setFilters((prev) => ({ ...prev, ...updated }))}
          onClearFilters={handleClearFilters}
          totalFilteredCount={filteredOrders.length}
          totalOrdersCount={orders.length}
        />

        {/* Kanban Board with 5 Dedicated Columns */}
        <KanbanBoard
          orders={filteredOrders}
          onOrderStageChange={handleStageChange}
          onAddOrderToStage={(stage) => handleOpenNewOrder(stage)}
          onViewDetails={(order) => setInspectingOrder(order)}
          onEdit={(order) => handleOpenEditOrder(order)}
          onDelete={(order) => handleDeleteOrder(order)}
          activeFilterStage={filters.stage}
        />

      </main>

      {/* 3. Footer */}
      <footer className="mt-auto border-t-2 border-[#9A3442] bg-[#FDFAF5] py-6 text-center text-xs text-[#2A1B1E]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#9A3442] rotate-45 shrink-0" />
            <span className="font-fraunces font-bold text-[#9A3442] tracking-tight text-xs sm:text-sm">
              {settings.businessName}
            </span>
            <span className="text-[#9A3442] font-bold">·</span>
            <span className="font-fraunces italic text-[#6B1F2C] text-xs sm:text-[13px]">
              {settings.brandTagline || 'Comfort you can trust.'}
            </span>
          </div>

          <div className="text-xs text-[#6B5A5D] font-spacemono font-bold uppercase tracking-wider flex items-center gap-2">
            <span>{settings.location}</span>
            <span className="text-[#9A3442]">·</span>
            <span className="text-[#9A3442]">{settings.businessRegNumber}</span>
          </div>

          <div className="text-xs text-[#6B5A5D] flex items-center gap-1.5 font-spacemono uppercase tracking-wider text-[11px]">
            <span>Innerwear · Private Studio</span>
            <span className="text-[#9A3442]">·</span>
            <Heart className="w-3.5 h-3.5 text-[#9A3442] fill-[#9A3442]" />
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      
      {/* Create / Edit Order Modal */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setEditingOrder(null);
        }}
        onSave={handleSaveOrder}
        onDelete={handleDeleteOrder}
        initialOrder={editingOrder}
        defaultStage={defaultOrderStage}
      />

      {/* Order Details Quick Inspector Modal */}
      <OrderDetailsModal
        order={inspectingOrder}
        onClose={() => setInspectingOrder(null)}
        onEdit={(order) => {
          setInspectingOrder(null);
          handleOpenEditOrder(order);
        }}
        onMoveStage={(orderId, nextStage) => {
          handleStageChange(orderId, nextStage);
        }}
      />

      {/* Studio Settings & Backup Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings(newSettings)}
        orders={orders}
        onRestoreOrders={handleRestoreOrders}
        onClearAllData={handleClearAllData}
        onRequestConfirm={(cfg) => setConfirmationConfig({ ...cfg, isOpen: true })}
        googleUser={googleUser}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
        onSyncSheets={handleExecuteSheetsSync}
        isSyncingSheets={isSyncingSheets}
        spreadsheetUrl={spreadsheetUrl}
        lastSyncedAt={lastSyncedAt}
      />

      {/* Confirmation Dialog */}
      <ConfirmationModal
        isOpen={confirmationConfig.isOpen}
        title={confirmationConfig.title}
        message={confirmationConfig.message}
        confirmLabel={confirmationConfig.confirmLabel}
        isDestructive={confirmationConfig.isDestructive}
        onConfirm={confirmationConfig.onConfirm}
        onCancel={() => setConfirmationConfig((c) => ({ ...c, isOpen: false }))}
      />

      {/* Floating Success Celebration Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#9A3442] text-white px-5 py-3 rounded-[14px] shadow-[4px_4px_0_#3D0F17] flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200 border-2 border-[#9A3442] font-instrumentsans text-xs sm:text-sm">
          <CheckCircle2 className="w-4 h-4 text-[#FFB7B1] shrink-0" />
          <span className="font-semibold tracking-tight">
            {toastMessage}
          </span>
        </div>
      )}

    </div>
  );
}
