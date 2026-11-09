import React, { useState, useRef } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  Trash2, 
  RotateCcw, 
  Info, 
  Check, 
  AlertCircle,
  ExternalLink,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { User } from 'firebase/auth';
import { BusinessSettings, Order } from '../types/order';
import { exportOrdersBackup, validateImportData } from '../utils/storage';
import { getInitialSeedOrders } from '../utils/helpers';
import { exportOrdersToCSV } from '../utils/spreadsheetExport';
import { FileSpreadsheet } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BusinessSettings;
  onUpdateSettings: (newSettings: BusinessSettings) => void;
  orders: Order[];
  onRestoreOrders: (restoredOrders: Order[]) => void;
  onClearAllData: () => void;
  onRequestConfirm: (config: {
    title: string;
    message: string;
    confirmLabel: string;
    isDestructive: boolean;
    onConfirm: () => void;
  }) => void;
  googleUser: User | null;
  onGoogleSignIn: () => Promise<void>;
  onGoogleSignOut: () => Promise<void>;
  onSyncSheets: () => Promise<void>;
  isSyncingSheets: boolean;
  spreadsheetUrl: string | null;
  lastSyncedAt: string | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  orders,
  onRestoreOrders,
  onClearAllData,
  onRequestConfirm,
  googleUser,
  onGoogleSignIn,
  onGoogleSignOut,
  onSyncSheets,
  isSyncingSheets,
  spreadsheetUrl,
  lastSyncedAt,
}) => {
  const [tagline, setTagline] = useState(settings.brandTagline);
  const [location, setLocation] = useState(settings.location);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      brandTagline: tagline.trim(),
      location: location.trim(),
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleExport = () => {
    exportOrdersBackup(orders, settings);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const result = validateImportData(parsed);

        if (!result.valid || !result.orders) {
          setImportError(result.message || 'Invalid backup file structure.');
          return;
        }

        setImportError(null);

        onRequestConfirm({
          title: 'Restore Orders from Backup?',
          message: `This will replace your current ${orders.length} order(s) with ${result.orders.length} orders from the uploaded backup file. This action cannot be undone.`,
          confirmLabel: 'Restore Backup',
          isDestructive: true,
          onConfirm: () => {
            onRestoreOrders(result.orders!);
            onClose();
          },
        });
      } catch {
        setImportError('Failed to parse file. Please upload a valid JSON backup file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePromptClearAll = () => {
    onRequestConfirm({
      title: 'Clear All Order Records?',
      message: 'This will permanently remove all orders from this browser. Please make sure you have exported a JSON backup first if you need to keep your records.',
      confirmLabel: 'Clear All Data',
      isDestructive: true,
      onConfirm: () => {
        onClearAllData();
        onClose();
      },
    });
  };

  const handlePromptLoadSamples = () => {
    onRequestConfirm({
      title: 'Reload Sample Orders?',
      message: 'This will reset your current board and populate it with realistic sample innerwear boutique orders.',
      confirmLabel: 'Reload Samples',
      isDestructive: false,
      onConfirm: () => {
        const samples = getInitialSeedOrders();
        onRestoreOrders(samples);
        onClose();
      },
    });
  };

  const handlePromptSyncSheets = () => {
    if (!googleUser) {
      onGoogleSignIn();
      return;
    }
    onRequestConfirm({
      title: 'Sync Orders to Google Sheets?',
      message: `This will update your 'Minatzee Order Studio - Boutique Orders' spreadsheet in Google Drive with your current ${orders.length} customer order(s), including payment notes, items, sizes, and tracking stages.`,
      confirmLabel: 'Sync to Sheets',
      isDestructive: false,
      onConfirm: () => {
        onSyncSheets();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1A1A1A]/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative w-full max-w-xl bg-white rounded-[14px] border-2 border-[#9A3442] shadow-[8px_8px_0_#9A3442] overflow-hidden flex flex-col font-instrumentsans text-[#2A1B1E]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b-2 border-[#9A3442] flex items-center justify-between bg-[#FDFAF5] shrink-0">
          <div>
            <h2 className="font-fraunces font-bold text-base sm:text-lg text-[#9A3442] tracking-tight">
              Settings &amp; Backup
            </h2>
            <div className="flex items-center gap-1.5 text-[11px] font-spacemono font-bold uppercase tracking-wider text-[#9A3442] mt-0.5">
              <span className="w-1.5 h-1.5 bg-[#9A3442] rotate-45" />
              <span>Minatzee Enterprise · Private Boutique Workspace</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#FDF1EF] border-2 border-transparent hover:border-[#9A3442] text-[#9A3442] flex items-center justify-center transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[78vh] overflow-y-auto kanban-scroll text-xs">
          
          {/* Explanation Banner */}
          <div className="p-4 rounded-[14px] bg-[#FDF1EF] border-2 border-[#9A3442] shadow-[2px_2px_0_#9A3442] flex items-start gap-3">
            <Info className="w-4 h-4 text-[#9A3442] shrink-0 mt-0.5" />
            <div className="text-[#2A1B1E] leading-relaxed text-xs">
              <strong className="text-[#9A3442] font-spacemono uppercase font-bold tracking-wider">Private Local Storage: </strong>
              Orders and records are stored directly in your private workspace browser without external subscriptions. Export regular backups to ensure your records remain safe on your device.
            </div>
          </div>

          {/* Business Information Card */}
          <form onSubmit={handleSaveInfo} className="space-y-3.5 p-4 rounded-[14px] border-2 border-[#9A3442] bg-white shadow-[2px_2px_0_#9A3442]">
            <h3 className="font-spacemono font-bold text-xs uppercase tracking-[0.14em] text-[#9A3442] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#9A3442] rotate-45" />
              Business Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#9A3442] font-semibold mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  disabled
                  value={settings.businessName}
                  className="w-full px-3.5 py-2.5 rounded-[8px] bg-[#FAF6F2] border-2 border-[#E9DDD9] text-[#6B5A5D] font-instrumentsans font-bold cursor-not-allowed text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-[#9A3442] font-semibold mb-1">
                  Registration Number
                </label>
                <input
                  type="text"
                  disabled
                  value={settings.businessRegNumber}
                  className="w-full px-3.5 py-2.5 rounded-[8px] bg-[#FAF6F2] border-2 border-[#E9DDD9] text-[#6B5A5D] font-spacemono font-medium cursor-not-allowed text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-[#9A3442] font-semibold mb-1">
                  Brand Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[8px] bg-white border-2 border-[#D98A96] focus:border-[#9A3442] focus:ring-3 focus:ring-[#FBDDD8] text-[#2E2425] font-instrumentsans text-xs sm:text-sm outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[#9A3442] font-semibold mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[8px] bg-white border-2 border-[#D98A96] focus:border-[#9A3442] focus:ring-3 focus:ring-[#FBDDD8] text-[#2E2425] font-instrumentsans text-xs sm:text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t-2 border-[#E9DDD9]">
              <span className="text-[11px] text-[#6B5A5D] font-instrumentsans">
                Specialty: Women&apos;s &amp; Children&apos;s Innerwear
              </span>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#9A3442] hover:bg-[#822936] text-white font-instrumentsans font-semibold text-xs border-2 border-[#9A3442] shadow-[2px_2px_0_#9A3442] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                {savedFeedback ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{savedFeedback ? 'Saved!' : 'Save Profile'}</span>
              </button>
            </div>
          </form>

          {/* Google Sheets Cloud Integration */}
          <div className="space-y-3.5 p-4 rounded-[12px] border-2 border-[#E9DDD9] bg-white">
            <div className="flex items-center justify-between">
              <h3 className="font-spacemono font-bold text-xs uppercase tracking-wider text-[#9A3442] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#9A3442] rotate-45" />
                Google Sheets Cloud Sync
              </h3>
              {googleUser && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-spacemono font-bold bg-[#EAF1EC] text-[#2F6B4F] border border-[#2F6B4F]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2F6B4F]" />
                  Connected
                </span>
              )}
            </div>

            <p className="text-xs text-[#2E2425]/80 font-instrumentsans leading-relaxed">
              Synchronize your boutique orders directly with a dedicated Google Spreadsheet in your private Google Drive for automated records and bookkeeping.
            </p>

            {!googleUser ? (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onGoogleSignIn}
                  disabled={isSyncingSheets}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-full border-2 border-[#9A3442] bg-white hover:bg-[#FDF1EF] text-[#9A3442] text-xs font-spacemono font-bold uppercase tracking-wider shadow-[3px_3px_0_#9A3442] hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer transition-all"
                >
                  <svg className="w-4 h-4 shrink-0 text-[#9A3442]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H6v-2h3v2zm0-4H6v-2h3v2zm0-4H6V7h3v2zm4 8h-3v-2h3v2zm0-4h-3v-2h3v2zm0-4h-3V7h3v2zm5 8h-4v-2h4v2zm0-4h-4v-2h4v2zm0-4h-4V7h4v2z" />
                  </svg>
                  <span>Connect Google Account</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                {/* Account card */}
                <div className="p-3 rounded-[10px] bg-[#FAF6F2] border-2 border-[#E9DDD9] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {googleUser.photoURL ? (
                      <img
                        src={googleUser.photoURL}
                        alt={googleUser.displayName || 'Google User'}
                        className="w-8 h-8 rounded-full border-2 border-[#9A3442] object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#9A3442] text-white flex items-center justify-center font-spacemono font-bold text-xs shrink-0">
                        {(googleUser.displayName || googleUser.email || 'M').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-fraunces font-bold text-xs sm:text-sm text-[#9A3442] truncate">
                        {googleUser.displayName || 'Google Account'}
                      </p>
                      <p className="font-spacemono text-[11px] text-[#6B5A5D] truncate">
                        {googleUser.email}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onGoogleSignOut}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border-2 border-[#9A3442] bg-white hover:bg-[#FDF1EF] text-[#9A3442] text-[11px] font-spacemono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[2px_2px_0_#9A3442] hover:-translate-x-0.5 hover:-translate-y-0.5 shrink-0"
                    title="Disconnect Google Account"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>

                {/* Sync Action and Spreadsheet Link */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePromptSyncSheets}
                    disabled={isSyncingSheets}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#9A3442] hover:bg-[#822936] text-white text-xs font-instrumentsans font-semibold transition-all border-2 border-[#9A3442] shadow-[3px_3px_0_#9A3442] hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer disabled:opacity-60"
                  >
                    {isSyncingSheets ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H6v-2h3v2zm0-4H6v-2h3v2zm0-4H6V7h3v2zm4 8h-3v-2h3v2zm0-4h-3v-2h3v2zm0-4h-3V7h3v2zm5 8h-4v-2h4v2zm0-4h-4v-2h4v2zm0-4h-4V7h4v2z" fill="#FFFFFF" />
                      </svg>
                    )}
                    <span>{isSyncingSheets ? 'Syncing with Google Sheets...' : `Sync All Orders (${orders.length})`}</span>
                  </button>

                  {spreadsheetUrl && (
                    <a
                      href={spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full border-2 border-[#9A3442] bg-white hover:bg-[#FDF1EF] text-[#9A3442] text-xs font-spacemono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[2px_2px_0_#9A3442] hover:-translate-x-0.5 hover:-translate-y-0.5"
                      title="Open spreadsheet in Google Sheets"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Sheet</span>
                    </a>
                  )}
                </div>

                {lastSyncedAt && (
                  <p className="text-[11px] text-[#2F6B4F] flex items-center gap-1 font-spacemono font-bold">
                    <Check className="w-3.5 h-3.5 text-[#2F6B4F]" />
                    <span>Last synced: {lastSyncedAt}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Backup & Restore Controls */}
          <div className="space-y-3 p-4 rounded-[12px] border-2 border-[#E9DDD9] bg-white">
            <h3 className="font-spacemono font-bold text-xs uppercase tracking-wider text-[#9A3442] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#9A3442] rotate-45" />
              Backup &amp; Restore Records
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Export Button */}
              <div className="p-3.5 rounded-[10px] bg-[#FAF6F2] border-2 border-[#E9DDD9] flex flex-col justify-between">
                <div>
                  <h4 className="font-spacemono font-bold text-xs text-[#9A3442] mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                    <Download className="w-4 h-4 text-[#9A3442]" />
                    <span>Export JSON Backup</span>
                  </h4>
                  <p className="text-xs text-[#2E2425]/70 mb-3 font-instrumentsans">
                    Download a secure file containing all your {orders.length} customer orders.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExport}
                  className="w-full py-2 px-3 rounded-full bg-white hover:bg-[#FDF1EF] text-[#9A3442] border-2 border-[#9A3442] font-spacemono font-bold text-xs uppercase tracking-wider text-center transition-all cursor-pointer shadow-[2px_2px_0_#9A3442] hover:-translate-x-0.5 hover:-translate-y-0.5"
                >
                  Download Backup File
                </button>
              </div>

              {/* Import Button */}
              <div className="p-3.5 rounded-[10px] bg-[#FAF6F2] border-2 border-[#E9DDD9] flex flex-col justify-between">
                <div>
                  <h4 className="font-spacemono font-bold text-xs text-[#9A3442] mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                    <Upload className="w-4 h-4 text-[#9A3442]" />
                    <span>Import JSON Backup</span>
                  </h4>
                  <p className="text-xs text-[#2E2425]/70 mb-3 font-instrumentsans">
                    Restore previously exported orders to this browser.
                  </p>
                </div>
                <input
                  type="file"
                  accept=".json,application/json"
                  ref={fileInputRef}
                  onChange={handleImportFile}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-full bg-white hover:bg-[#FDF1EF] text-[#9A3442] border-2 border-[#9A3442] font-spacemono font-bold text-xs uppercase tracking-wider text-center transition-all cursor-pointer shadow-[2px_2px_0_#9A3442] hover:-translate-x-0.5 hover:-translate-y-0.5"
                >
                  Choose Backup File
                </button>
              </div>

              {/* Instant CSV Spreadsheet Download */}
              <div className="col-span-1 sm:col-span-2 p-3.5 rounded-[10px] bg-[#EAF1EC] border-2 border-[#2F6B4F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[2px_2px_0_#2F6B4F]">
                <div>
                  <h4 className="font-spacemono font-bold text-xs text-[#2F6B4F] mb-0.5 flex items-center gap-1.5 uppercase tracking-wider">
                    <FileSpreadsheet className="w-4 h-4 text-[#2F6B4F]" />
                    <span>Download Spreadsheet (.csv)</span>
                  </h4>
                  <p className="text-xs text-[#20503A] font-instrumentsans">
                    Opens directly in Google Sheets, Microsoft Excel, and Apple Numbers without requiring login.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => exportOrdersToCSV(orders)}
                  className="w-full sm:w-auto shrink-0 py-2 px-4 rounded-full bg-[#2F6B4F] hover:bg-[#20503A] text-white font-instrumentsans font-semibold text-xs border-2 border-[#2F6B4F] text-center transition-all cursor-pointer shadow-[2px_2px_0_#20503A] hover:-translate-x-0.5 hover:-translate-y-0.5"
                >
                  Download CSV
                </button>
              </div>
            </div>

            {importError && (
              <div className="p-2.5 rounded-[8px] bg-[#FBE9EB] border-2 border-[#6B1E2B] text-[#6B1E2B] text-xs font-instrumentsans flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}
          </div>

          {/* Maintenance & Data Management */}
          <div className="space-y-3 p-4 rounded-[12px] border-2 border-[#E9DDD9] bg-[#FAF6F2]">
            <h3 className="font-spacemono font-bold text-xs uppercase tracking-wider text-[#9A3442] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#9A3442] rotate-45" />
              Data Management &amp; Reset
            </h3>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={handlePromptLoadSamples}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-white border-2 border-[#9A3442] hover:bg-[#FDF1EF] text-[#9A3442] text-xs font-spacemono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[2px_2px_0_#9A3442] hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#9A3442]" />
                <span>Reload Sample Orders</span>
              </button>

              <button
                type="button"
                onClick={handlePromptClearAll}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-[#FDF1EF] border-2 border-[#6B1E2B] text-[#6B1E2B] text-xs font-spacemono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[2px_2px_0_#6B1E2B] hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Order Records</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t-2 border-[#9A3442] bg-[#FDFAF5] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white hover:bg-[#FDF1EF] border-2 border-[#9A3442] text-[#9A3442] font-spacemono font-bold text-xs uppercase tracking-wider cursor-pointer shadow-[2px_2px_0_#9A3442] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
