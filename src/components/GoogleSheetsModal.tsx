import React from 'react';
import { 
  X, 
  ExternalLink, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  LogOut, 
  FileSpreadsheet,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Order } from '../types/order';
import { exportOrdersToCSV } from '../utils/spreadsheetExport';
import { AuthErrorInfo } from '../services/googleAuth';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  googleUser: User | null;
  onGoogleSignIn: () => Promise<void>;
  onGoogleSignOut: () => Promise<void>;
  onSyncSheets: () => Promise<void>;
  isSyncingSheets: boolean;
  spreadsheetUrl: string | null;
  lastSyncedAt: string | null;
  authError: AuthErrorInfo | null;
  onClearAuthError: () => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  orders,
  googleUser,
  onGoogleSignIn,
  onGoogleSignOut,
  onSyncSheets,
  isSyncingSheets,
  spreadsheetUrl,
  lastSyncedAt,
  authError,
  onClearAuthError,
}) => {
  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'your domain';

  const handleExportCSV = () => {
    exportOrdersToCSV(orders);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1A1A1A]/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-lg bg-white rounded-[16px] border-2 border-[#9A3442] shadow-[8px_8px_0_#9A3442] overflow-hidden flex flex-col font-instrumentsans text-[#2A1B1E]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b-2 border-[#9A3442] flex items-center justify-between bg-[#FDFAF5] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white border-2 border-[#9A3442] flex items-center justify-center shadow-[2px_2px_0_#9A3442] text-[#9A3442]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-fraunces font-bold text-base sm:text-lg text-[#9A3442] tracking-tight leading-none">
                Google Sheets &amp; Spreadsheet Center
              </h2>
              <p className="font-spacemono text-[10px] text-[#6B5A5D] uppercase tracking-wider mt-1">
                Minatzee Boutique Order Records
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full hover:bg-[#FFC9C2] border-2 border-transparent hover:border-[#9A3442] text-[#9A3442] flex items-center justify-center transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto kanban-scroll text-xs">
          
          {/* Detailed Error Banner (When Firebase Auth throws domain/popup error) */}
          {authError && (
            <div className="p-3.5 rounded-[12px] bg-[#FFF8F7] border-2 border-[#6B1E2B] shadow-[2px_2px_0_#6B1E2B] text-xs text-[#4A141D] space-y-2">
              <div className="flex items-center justify-between font-spacemono font-bold text-xs uppercase tracking-wider text-[#6B1E2B]">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-[#6B1E2B] shrink-0" />
                  <span>{authError.title}</span>
                </div>
                <button
                  onClick={onClearAuthError}
                  type="button"
                  className="text-[#6B1E2B] hover:text-[#3D0F17] underline text-[10px]"
                >
                  Dismiss
                </button>
              </div>

              <p className="leading-relaxed font-instrumentsans">
                {authError.message}
              </p>

              {authError.isDomainError && (
                <div className="pt-1.5 border-t border-[#6B1E2B]/20 text-[11px] space-y-1">
                  <p className="font-semibold text-[#6B1E2B]">
                    Why this happens on published URLs (like Vercel):
                  </p>
                  <p className="text-[#5C4649] leading-tight">
                    Google Firebase security requires the domain <strong>{currentHost}</strong> to be added under <em>Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains</em>.
                  </p>
                  <p className="text-[#2F6B4F] font-semibold pt-1">
                    ✓ Recommended instant solution: Use the direct 1-click spreadsheet export below, which opens immediately in Google Sheets with zero configuration!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Section 1: Live Cloud Sync (Google Drive / Sheets) */}
          <div className="p-4 rounded-[14px] border-2 border-[#9A3442] bg-[#FDFAF5] shadow-[2px_2px_0_#9A3442] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#9A3442] rotate-45 shrink-0" />
                <h3 className="font-spacemono font-bold text-xs uppercase tracking-wider text-[#9A3442]">
                  Live Google Drive &amp; Sheets Sync
                </h3>
              </div>

              {googleUser ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-spacemono font-bold bg-[#EAF1EC] text-[#2F6B4F] border border-[#2F6B4F]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2F6B4F]" />
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-spacemono font-bold bg-[#FAF6F2] text-[#6B5A5D] border border-[#CFBFA9]">
                  Not Connected
                </span>
              )}
            </div>

            <p className="text-xs text-[#2E2425]/85 leading-relaxed">
              Creates and maintains a dedicated, private spreadsheet titled <strong>&ldquo;Minatzee Order Studio - Boutique Orders&rdquo;</strong> in your personal Google Drive.
            </p>

            {googleUser ? (
              <div className="space-y-3 pt-1">
                {/* Connected User Card */}
                <div className="p-3 bg-white rounded-[10px] border-2 border-[#E9DDD9] flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {googleUser.photoURL ? (
                      <img
                        src={googleUser.photoURL}
                        alt="Profile"
                        className="w-8 h-8 rounded-full border border-[#9A3442] shrink-0 object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#9A3442] text-white flex items-center justify-center font-bold font-spacemono text-xs shrink-0">
                        {(googleUser.email || 'M').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-fraunces font-bold text-xs text-[#9A3442] truncate">
                        {googleUser.displayName || 'Google Account'}
                      </p>
                      <p className="font-spacemono text-[11px] text-[#6B5A5D] truncate">
                        {googleUser.email}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onGoogleSignOut}
                    type="button"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border-2 border-[#9A3442] bg-white hover:bg-[#F3C6CB] text-[#9A3442] text-[10px] font-spacemono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[1px_1px_0_#9A3442]"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Disconnect</span>
                  </button>
                </div>

                {/* Sync Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    onClick={onSyncSheets}
                    disabled={isSyncingSheets}
                    type="button"
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#9A3442] hover:bg-[#822936] text-white text-xs font-instrumentsans font-semibold transition-all border-2 border-[#9A3442] shadow-[3px_3px_0_#9A3442] hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer disabled:opacity-60"
                  >
                    {isSyncingSheets ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Syncing Orders to Drive...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                        <span>Sync Now ({orders.length} orders)</span>
                      </>
                    )}
                  </button>

                  {spreadsheetUrl && (
                    <a
                      href={spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-full border-2 border-[#2F6B4F] bg-[#EAF1EC] hover:bg-[#D5E8D9] text-[#2F6B4F] text-xs font-spacemono font-bold uppercase tracking-wider transition-all shadow-[2px_2px_0_#2F6B4F] hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer"
                    >
                      <span>Open Sheet</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {lastSyncedAt && (
                  <p className="text-[11px] font-spacemono text-[#6B5A5D] text-center sm:text-left">
                    Last synced to Google Drive: <strong>{lastSyncedAt}</strong>
                  </p>
                )}
              </div>
            ) : (
              <div className="pt-1">
                {/* Official Sign in with Google Button */}
                <button
                  type="button"
                  onClick={onGoogleSignIn}
                  disabled={isSyncingSheets}
                  className="w-full inline-flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-full bg-white hover:bg-[#FDF1EF] border-2 border-[#9A3442] text-[#9A3442] text-xs font-spacemono font-bold uppercase tracking-wider shadow-[3px_3px_0_#9A3442] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H6v-2h3v2zm0-4H6v-2h3v2zm0-4H6V7h3v2zm4 8h-3v-2h3v2zm0-4h-3v-2h3v2zm0-4h-3V7h3v2zm5 8h-4v-2h4v2zm0-4h-4v-2h4v2zm0-4h-4V7h4v2z" />
                  </svg>
                  <span>Connect Google Account for Live Sync</span>
                </button>
              </div>
            )}
          </div>

          {/* Section 2: 1-Click Instant Spreadsheet Export (Works 100% everywhere without auth) */}
          <div className="p-4 rounded-[14px] border-2 border-[#2F6B4F] bg-[#EAF1EC]/70 shadow-[2px_2px_0_#2F6B4F] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#2F6B4F] rotate-45 shrink-0" />
                <h3 className="font-spacemono font-bold text-xs uppercase tracking-wider text-[#2F6B4F]">
                  Instant Spreadsheet Export (No Login Required)
                </h3>
              </div>
              <span className="px-2 py-0.5 bg-white text-[#2F6B4F] border border-[#2F6B4F] rounded-full text-[10px] font-spacemono font-bold">
                100% Reliable
              </span>
            </div>

            <p className="text-xs text-[#20503A] leading-relaxed">
              Downloads a ready-to-open spreadsheet file containing all current <strong>{orders.length} orders</strong> with prices, stages, customer WhatsApp numbers, and payment balances. Compatible with Google Sheets, Excel, and Numbers.
            </p>

            <button
              onClick={handleExportCSV}
              type="button"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#2F6B4F] hover:bg-[#20503A] text-white text-xs font-instrumentsans font-semibold transition-all border-2 border-[#2F6B4F] shadow-[3px_3px_0_#20503A] hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.2]" />
              <span>Download Spreadsheet (.csv for Google Sheets / Excel)</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t-2 border-[#9A3442] bg-[#FDFAF5] flex items-center justify-between text-[11px] font-spacemono text-[#6B5A5D]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2F6B4F]" />
            <span>Private boutique data</span>
          </span>
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-1.5 rounded-full border-2 border-[#9A3442] bg-white hover:bg-[#FFC9C2] text-[#9A3442] font-spacemono font-bold uppercase text-[11px] transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
