'use client';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

type ToastListener = (toasts: ToastItem[]) => void;
type ConfirmListener = (options: ConfirmDialogOptions | null, resolve?: (val: boolean) => void) => void;

class NotificationManager {
  private toasts: ToastItem[] = [];
  private toastListeners: Set<ToastListener> = new Set();
  private confirmListener: ConfirmListener | null = null;

  subscribeToasts(listener: ToastListener) {
    this.toastListeners.add(listener);
    listener(this.toasts);
    return () => {
      this.toastListeners.delete(listener);
    };
  }

  subscribeConfirm(listener: ConfirmListener) {
    this.confirmListener = listener;
    return () => {
      this.confirmListener = null;
    };
  }

  showToast(type: ToastType, title: string, message?: string, duration: number = 4000) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newToast: ToastItem = { id, type, title, message, duration };
    this.toasts = [newToast, ...this.toasts.slice(0, 4)]; // max 5 toasts visible
    this.notifyToasts();

    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(id);
      }, duration);
    }
  }

  removeToast(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notifyToasts();
  }

  private notifyToasts() {
    this.toastListeners.forEach(listener => listener(this.toasts));
  }

  confirm(options: ConfirmDialogOptions): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.confirmListener) {
        this.confirmListener(options, resolve);
      } else {
        // Fallback jika container belum terpasang
        if (typeof window !== 'undefined') {
          resolve(window.confirm(options.message || options.title));
        } else {
          resolve(true);
        }
      }
    });
  }
}

export const notificationManager = new NotificationManager();

export const toast = {
  success: (title: string, message?: string, duration?: number) => 
    notificationManager.showToast('success', title, message, duration),
  error: (title: string, message?: string, duration?: number) => 
    notificationManager.showToast('error', title, message, duration),
  info: (title: string, message?: string, duration?: number) => 
    notificationManager.showToast('info', title, message, duration),
  warning: (title: string, message?: string, duration?: number) => 
    notificationManager.showToast('warning', title, message, duration),
};

export const confirmDialog = (options: ConfirmDialogOptions | string): Promise<boolean> => {
  if (typeof options === 'string') {
    return notificationManager.confirm({
      title: 'Konfirmasi Tindakan',
      message: options,
      confirmText: 'Lanjutkan',
      cancelText: 'Batal'
    });
  }
  return notificationManager.confirm(options);
};
