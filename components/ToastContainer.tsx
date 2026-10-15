'use client';

import React, { useEffect, useState } from 'react';
import { 
  notificationManager, 
  ToastItem, 
  ConfirmDialogOptions 
} from '../lib/toast';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Trash2, 
  HelpCircle 
} from 'lucide-react';

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmData, setConfirmData] = useState<{
    options: ConfirmDialogOptions;
    resolve: (val: boolean) => void;
  } | null>(null);

  useEffect(() => {
    const unsubToasts = notificationManager.subscribeToasts((items) => {
      setToasts([...items]);
    });

    const unsubConfirm = notificationManager.subscribeConfirm((options, resolve) => {
      if (options && resolve) {
        setConfirmData({ options, resolve });
      } else {
        setConfirmData(null);
      }
    });

    return () => {
      unsubToasts();
      unsubConfirm();
    };
  }, []);

  const handleConfirmAction = (result: boolean) => {
    if (confirmData) {
      confirmData.resolve(result);
      setConfirmData(null);
    }
  };

  return (
    <>
      {/* ============================================================== */}
      {/* 1. FLOATING TOAST NOTIFICATIONS (TOP-RIGHT)                    */}
      {/* ============================================================== */}
      <div 
        aria-live="polite" 
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-3 sm:px-0"
      >
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          const isWarning = t.type === 'warning';
          const isInfo = t.type === 'info';

          const iconColor = isSuccess 
            ? 'text-emerald-600 bg-emerald-50 border-emerald-200' 
            : isError 
            ? 'text-rose-600 bg-rose-50 border-rose-200'
            : isWarning
            ? 'text-amber-600 bg-amber-50 border-amber-200'
            : 'text-blue-600 bg-blue-50 border-blue-200';

          const borderLeftColor = isSuccess
            ? 'border-l-4 border-l-emerald-500'
            : isError
            ? 'border-l-4 border-l-rose-500'
            : isWarning
            ? 'border-l-4 border-l-amber-500'
            : 'border-l-4 border-l-blue-500';

          return (
            <div
              key={t.id}
              className={`pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 ${borderLeftColor} p-3.5 flex items-start gap-3 transition-all duration-300 animate-in fade-in slide-in-from-top-3`}
            >
              <div className={`p-1.5 rounded-xl border shrink-0 ${iconColor}`}>
                {isSuccess && <CheckCircle2 className="w-4 h-4" />}
                {isError && <AlertCircle className="w-4 h-4" />}
                {isWarning && <AlertTriangle className="w-4 h-4" />}
                {isInfo && <Info className="w-4 h-4" />}
              </div>

              <div className="flex-1 min-w-0 pr-1">
                <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  {t.title}
                </p>
                {t.message && (
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {t.message}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => notificationManager.removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                aria-label="Tutup notifikasi"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* 2. MODERN CONFIRMATION MODAL DIALOG                            */}
      {/* ============================================================== */}
      {confirmData && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-sm sm:max-w-md w-full p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Header with Icon */}
            <div className="flex items-start gap-3.5">
              <div className={`p-3 rounded-2xl shrink-0 ${
                confirmData.options.isDestructive 
                  ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}>
                {confirmData.options.isDestructive ? (
                  <Trash2 className="w-6 h-6" />
                ) : (
                  <HelpCircle className="w-6 h-6" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base font-extrabold text-slate-900">
                  {confirmData.options.title || 'Konfirmasi Tindakan'}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {confirmData.options.message}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleConfirmAction(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                {confirmData.options.cancelText || 'Batal'}
              </button>

              <button
                type="button"
                onClick={() => handleConfirmAction(true)}
                className={`px-5 py-2 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer ${
                  confirmData.options.isDestructive
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-[#132257] hover:bg-blue-900 text-white'
                }`}
              >
                {confirmData.options.confirmText || (confirmData.options.isDestructive ? 'Ya, Hapus' : 'Ya, Lanjutkan')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
