import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  itemName: string;
  itemDetails?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonText?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  itemName,
  itemDetails,
  onConfirm,
  onCancel,
  confirmButtonText = 'تأكيد الحذف النهائي',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-rose-900/60 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
        {/* Accent strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500" />

        <div className="flex items-start gap-4 mt-1">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
          </div>

          <div className="flex-1 space-y-1">
            <h3 className="text-lg font-black text-white">{title}</h3>
            <p className="text-xs text-slate-400">
              أنت على وشك حذف هذا العنصر وجميع السجلات والدفعات التابعة له:
            </p>
          </div>

          <button
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Item Box */}
        <div className="my-5 p-3.5 bg-rose-950/20 border border-rose-800/40 rounded-xl space-y-1">
          <div className="font-bold text-white text-sm break-words">{itemName}</div>
          {itemDetails && (
            <div className="text-xs text-rose-300/80 font-mono">{itemDetails}</div>
          )}
        </div>

        <p className="text-xs text-rose-400 font-semibold flex items-center gap-1.5 mb-5">
          <span>⚠️ تحذير: لا يمكن التراجع عن عملية الحذف بعد تأكيدها.</span>
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold rounded-xl transition"
          >
            إلغاء وتراجع
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>{confirmButtonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
