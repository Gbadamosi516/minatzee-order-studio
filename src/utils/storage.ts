import { Order, BusinessSettings } from '../types/order';
import { getInitialSeedOrders } from './helpers';

const ORDERS_STORAGE_KEY = 'minatzee_orders_v2';
const SETTINGS_STORAGE_KEY = 'minatzee_settings_v1';

export const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: 'MINATZEE ENTERPRISE',
  brandTagline: 'Comfort You Can Trust',
  location: 'Lokogoma, Abuja, Nigeria',
  businessRegNumber: 'BN: 7232136',
  ownerName: 'Minatzee',
};

/**
 * Load orders from localStorage - starts 100% clean with zero dummy data
 */
export function loadOrders(): Order[] {
  try {
    // Discard any legacy dummy data from earlier preview versions
    try {
      localStorage.removeItem('minatzee_orders_v1');
    } catch {
      // Ignore browser storage restrictions if any
    }

    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (error) {
    console.warn('Failed to load orders from localStorage:', error);
    return [];
  }
}

/**
 * Save orders to localStorage
 */
export function saveOrders(orders: Order[]): boolean {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    return true;
  } catch (error) {
    console.error('Failed to save orders to localStorage:', error);
    return false;
  }
}

/**
 * Load business settings
 */
export function loadSettings(): BusinessSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Could not parse saved settings:', e);
  }
  return DEFAULT_SETTINGS;
}

/**
 * Save business settings
 */
export function saveSettings(settings: BusinessSettings): boolean {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch (e) {
    console.error('Failed to save settings:', e);
    return false;
  }
}

/**
 * Export backup as JSON download
 */
export function exportOrdersBackup(orders: Order[], settings: BusinessSettings): void {
  const exportData = {
    app: 'Minatzee Order Studio',
    version: '1.0',
    exportDate: new Date().toISOString(),
    settings,
    ordersCount: orders.length,
    orders,
  };

  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const a = document.createElement('a');
  a.href = url;
  a.download = `minatzee_enterprise_orders_backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Validate imported data structure
 */
export function validateImportData(parsed: unknown): { valid: boolean; orders?: Order[]; message?: string } {
  if (!parsed || typeof parsed !== 'object') {
    return { valid: false, message: 'Invalid file format: Expected a JSON object.' };
  }

  const obj = parsed as Record<string, unknown>;
  const list = Array.isArray(obj.orders) ? obj.orders : (Array.isArray(parsed) ? parsed : null);

  if (!list) {
    return { valid: false, message: 'No valid "orders" list found in backup file.' };
  }

  // Validate basic order attributes
  const validOrders: Order[] = [];
  for (const item of list) {
    if (typeof item === 'object' && item !== null && 'id' in item && 'customerName' in item && 'orderStage' in item) {
      validOrders.push(item as Order);
    }
  }

  if (validOrders.length === 0 && list.length > 0) {
    return { valid: false, message: 'File contained orders, but required fields (id, customerName, orderStage) were missing.' };
  }

  return { valid: true, orders: validOrders };
}
