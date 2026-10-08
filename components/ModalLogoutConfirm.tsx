'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, AlertTriangle, X } from 'lucide-react';

interface ModalLogoutConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName?: string;
}

export default function ModalLogoutConfirm({
  isOpen,
  onClose,
  onConfirm,
  userName = 'Pengguna'
}: ModalLogoutConfirmProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[999999] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-slate-100 flex flex-col items-center text-center space-y-4 animate-scale-in relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tombol Tutup Silang Pojok Kanan Atas */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ikon Logout Merah Lembut */}
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs border border-rose-150">
          <LogOut className="w-6 h-6 stroke-[2.2] translate-x-0.5" />
        </div>

        {/* Teks Dialog */}
        <div className="space-y-1.5">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            Keluar dari Akun?
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Halo <strong className="text-slate-800">{userName}</strong>, apakah Anda yakin ingin mengakhiri sesi dan kembali ke halaman login?
          </p>
        </div>

        {/* Tombol Aksi */}
        <div className="flex items-center gap-2.5 w-full pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onConfirm();
            }}
            className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Ya, Keluar</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
