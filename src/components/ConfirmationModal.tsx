import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-[#1A1A1A]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-md bg-white rounded-[14px] border-2 border-[#9A3442] shadow-[8px_8px_0_#9A3442] p-5 sm:p-6 overflow-hidden font-instrumentsans text-[#2A1B1E]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3.5">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 shadow-[2px_2px_0_#9A3442] ${
            isDestructive 
              ? 'bg-[#FBE9EB] text-[#6B1E2B] border-[#6B1E2B]' 
              : 'bg-[#FDF1EF] text-[#9A3442] border-[#9A3442]'
          }`}>
            <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-fraunces font-bold text-base sm:text-lg text-[#9A3442] mb-1">
              {title}
            </h3>
            <p className="text-xs text-[#5C4649] leading-relaxed font-normal">
              {message}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="w-7 h-7 rounded-full text-[#9A3442] hover:bg-[#FDF1EF] border-2 border-transparent hover:border-[#9A3442] flex items-center justify-center cursor-pointer transition-all"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          {/* Secondary button: Outline Pill */}
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-full bg-white hover:bg-[#FDF1EF] border-2 border-[#9A3442] text-[#9A3442] text-xs font-spacemono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[2px_2px_0_#9A3442] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0"
          >
            {cancelLabel}
          </button>
          {/* Primary button: Solid Wine Pill */}
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2 rounded-full text-xs font-instrumentsans font-semibold transition-all cursor-pointer border-2 border-[#9A3442] shadow-[3px_3px_0_#9A3442] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 ${
              isDestructive
                ? 'bg-[#822936] hover:bg-[#6B1F2C] text-white'
                : 'bg-[#9A3442] hover:bg-[#822936] text-white'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
