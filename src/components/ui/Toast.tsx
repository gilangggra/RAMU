"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  id?: string;
  title?: string;
  duration?: number; // ms, default 4000
}

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration: number;
}

type Listener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l([...toasts]));
}

export const toast = {
  show(type: ToastType, message: string, options?: ToastOptions) {
    const id = options?.id || Math.random().toString(36).substring(2, 9);
    const duration = options?.duration ?? (type === "error" ? 5000 : 4000);
    const title = options?.title;

    // Remove if duplicate id
    toasts = toasts.filter((t) => t.id !== id);

    const newToast: ToastItem = { id, type, message, title, duration };
    toasts = [...toasts, newToast];
    notify();

    if (duration > 0) {
      setTimeout(() => {
        toast.dismiss(id);
      }, duration);
    }
    return id;
  },

  success(message: string, options?: ToastOptions) {
    return toast.show("success", message, options);
  },

  error(message: string, options?: ToastOptions) {
    return toast.show("error", message, options);
  },

  warning(message: string, options?: ToastOptions) {
    return toast.show("warning", message, options);
  },

  info(message: string, options?: ToastOptions) {
    return toast.show("info", message, options);
  },

  dismiss(id?: string) {
    if (id) {
      toasts = toasts.filter((t) => t.id !== id);
    } else {
      toasts = [];
    }
    notify();
  },
};

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleUpdate = (updated: ToastItem[]) => {
      setItems(updated);
    };
    listeners.add(handleUpdate);
    setItems([...toasts]);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-3 sm:px-0"
    >
      {items.map((item) => {
        const isError = item.type === "error";
        const isSuccess = item.type === "success";
        const isWarning = item.type === "warning";

        return (
          <div
            key={item.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-200 animate-in slide-in-from-top-2 fade-in ${
              isError
                ? "bg-rose-50/95 border-rose-200 text-rose-950"
                : isSuccess
                ? "bg-emerald-50/95 border-emerald-200 text-emerald-950"
                : isWarning
                ? "bg-amber-50/95 border-amber-200 text-amber-950"
                : "bg-white/95 border-stone-200 text-stone-900"
            }`}
          >
            {/* Icon */}
            <div className="shrink-0 mt-0.5">
              {isError && (
                <div className="w-8 h-8 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-600">
                  <AlertCircle className="w-4 h-4" />
                </div>
              )}
              {isSuccess && (
                <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
              {isWarning && (
                <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              )}
              {!isError && !isSuccess && !isWarning && (
                <div className="w-8 h-8 rounded-xl bg-stone-100 border border-stone-300 flex items-center justify-center text-stone-600">
                  <Info className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-1">
              {item.title ? (
                <div className="font-bold text-xs sm:text-sm tracking-tight mb-0.5">
                  {item.title}
                </div>
              ) : (
                <div className="font-bold text-[11px] sm:text-xs uppercase tracking-wider mb-0.5 opacity-70">
                  {isError
                    ? "Perhatian"
                    : isSuccess
                    ? "Berhasil"
                    : isWarning
                    ? "Peringatan"
                    : "Informasi"}
                </div>
              )}
              <div className="text-xs sm:text-sm font-medium leading-snug break-words">
                {item.message}
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => toast.dismiss(item.id)}
              className="shrink-0 p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
