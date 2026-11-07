import React from 'react';
import { Plus, Settings as SettingsIcon } from 'lucide-react';
import { BusinessSettings } from '../types/order';
import { User } from 'firebase/auth';

interface HeaderProps {
  settings: BusinessSettings;
  onOpenNewOrder: () => void;
  onOpenSettings: () => void;
  googleUser: User | null;
  isSyncingSheets: boolean;
  onTriggerSheetsSync: () => void;
  spreadsheetUrl: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onOpenNewOrder,
  onOpenSettings,
  googleUser,
  isSyncingSheets,
  onTriggerSheetsSync,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FDFAF5]/95 backdrop-blur-md border-b-2 border-[#9A3442] shadow-[0_4px_0_#9A3442]">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[64px] sm:min-h-[78px] py-1.5 sm:py-3 gap-2 sm:gap-3">
          
          {/* Left: Official Logo + Application Name + Bold Location */}
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
            <div className="shrink-0 flex items-center justify-center p-1 bg-white border-2 border-[#9A3442] rounded-xl shadow-[2px_2px_0_#9A3442]">
              <img
                src="/assets/aistudio/1279743_cb983583.png"
                alt="Minatzee Enterprise"
                className="w-8 h-8 sm:w-11 sm:h-11 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex flex-col min-w-0">
              <h1 className="font-fraunces font-bold text-base sm:text-xl md:text-2xl text-[#9A3442] tracking-tight truncate leading-tight">
                Minatzee Order Studio
              </h1>
              
              {/* Lokogoma, Abuja, Nigeria directly under title and bold */}
              <p className="font-instrumentsans font-bold text-[11px] sm:text-sm text-[#2E2425] tracking-tight leading-tight mt-0.5 truncate">
                {settings.location || 'Lokogoma, Abuja, Nigeria'}
              </p>

              {/* Eyebrow & Brand statement with Rotated Diamond */}
              <div className="flex items-center gap-1.5 mt-0.5 text-[9px] sm:text-xs">
                <span className="w-1.5 h-1.5 bg-[#9A3442] rotate-45 shrink-0" />
                <span className="font-spacemono font-bold text-[#9A3442] uppercase tracking-[0.12em] shrink-0">
                  BN 7232136
                </span>
                <span className="text-[#9A3442] font-bold hidden min-[400px]:inline">·</span>
                <span className="font-fraunces italic text-[11px] sm:text-[13px] text-[#6B1F2C] truncate hidden min-[400px]:inline">
                  {settings.brandTagline || 'Comfort you can trust.'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Google Sheets Sync Trigger (Pill button with 2px wine border and hard shadow) */}
            <button
              onClick={onTriggerSheetsSync}
              disabled={isSyncingSheets}
              type="button"
              className={`inline-flex items-center justify-center gap-1.5 p-2 sm:px-3.5 sm:py-2 rounded-full text-xs font-spacemono font-bold tracking-wider uppercase transition-all cursor-pointer border-2 border-[#9A3442] shadow-[2px_2px_0_#9A3442] sm:shadow-[3px_3px_0_#9A3442] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-none ${
                googleUser
                  ? 'bg-[#EAF1EC] text-[#2F6B4F] border-[#2F6B4F] shadow-[2px_2px_0_#2F6B4F] sm:shadow-[3px_3px_0_#2F6B4F]'
                  : 'bg-white text-[#9A3442] hover:bg-[#F3C6CB]'
              } disabled:opacity-60`}
              title={googleUser ? `Google account: ${googleUser.email}` : 'Connect Google Sheets for Cloud Sync'}
              aria-label="Google Sheets Sync"
            >
              {isSyncingSheets ? (
                <span className="w-3.5 h-3.5 border-2 border-[#9A3442] border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H6v-2h3v2zm0-4H6v-2h3v2zm0-4H6V7h3v2zm4 8h-3v-2h3v2zm0-4h-3v-2h3v2zm0-4h-3V7h3v2zm5 8h-4v-2h4v2zm0-4h-4v-2h4v2zm0-4h-4V7h4v2z" />
                </svg>
              )}
              <span className="hidden sm:inline">
                {isSyncingSheets ? 'Syncing...' : googleUser ? 'Sheets Synced' : 'Google Sheets'}
              </span>
            </button>

            {/* Primary Action Button: Add Order (.mz-btn--solid) */}
            <button
              onClick={onOpenNewOrder}
              type="button"
              className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#9A3442] hover:bg-[#822936] text-white text-xs sm:text-sm font-instrumentsans font-semibold tracking-wide transition-all duration-150 cursor-pointer border-2 border-[#9A3442] shadow-[2px_2px_0_#9A3442] sm:shadow-[3px_3px_0_#9A3442] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-none"
              aria-label="Add New Order"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              <span className="whitespace-nowrap"><span className="hidden min-[380px]:inline">Add </span>Order</span>
            </button>

            {/* Studio Settings Trigger */}
            <button
              onClick={onOpenSettings}
              type="button"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-[#F3C6CB] border-2 border-[#9A3442] text-[#9A3442] flex items-center justify-center transition-all cursor-pointer shadow-[2px_2px_0_#9A3442] sm:shadow-[3px_3px_0_#9A3442] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-none"
              title="Studio Settings & Data Backup"
              aria-label="Open Settings"
            >
              <SettingsIcon className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
