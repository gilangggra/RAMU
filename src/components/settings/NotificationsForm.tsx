"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  BellRing,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  Smartphone,
  Save,
} from "lucide-react";
import { updateNotificationSettingsAction } from "@/app/settings/actions";
import {
  isBrowserNotificationSupported,
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission,
  showBrowserPushNotification,
} from "@/lib/notifications/pushNotificationManager";

export interface NotificationPreferencesData {
  notifyBooking?: boolean;
  notifyMessage?: boolean;
  notifyBriefDigest?: boolean;
  [key: string]: boolean | string | undefined;
}

export interface NotificationAlertOption {
  /** Nama field yang dikirim ke server action (mis. "notifyBooking"). */
  key: string;
  label: string;
  description: string;
}

type NotificationSubmitAction = (
  formData: FormData
) => Promise<{ success: boolean; message?: string; error?: string }>;

const DEFAULT_ALERTS: NotificationAlertOption[] = [
  {
    key: "notifyBooking",
    label: "Pembaruan Pesanan & Surat Perjanjian Kerja (SPK)",
    description: "Dapatkan email saat ada pesanan masuk, persetujuan kontrak kerja, atau permintaan reschedule dari mitra.",
  },
  {
    key: "notifyMessage",
    label: "Pesan Baru di Messenger RAMU",
    description: "Email pemberitahuan jika Anda memiliki pesan obrolan yang belum dibaca lebih dari 15 menit.",
  },
  {
    key: "notifyBriefDigest",
    label: "Ringkasan Peluang Proyek Baru yang Kompatibel",
    description: "Rangkuman mingguan brief proyek dan kampanye baru yang cocok dengan portofolio & sektor Anda.",
  },
];

interface NotificationsFormProps {
  initialData?: NotificationPreferencesData | null;
  /** Daftar opsi email alert (default: opsi role umum). */
  alerts?: NotificationAlertOption[];
  /** Server action penyimpan (default: updateNotificationSettingsAction). */
  submitAction?: NotificationSubmitAction;
  description?: string;
  pushDescription?: string;
  pushTestMessage?: string;
  pushTestLink?: string;
}

export function NotificationsForm({
  initialData,
  alerts = DEFAULT_ALERTS,
  submitAction = updateNotificationSettingsAction,
  description = "Atur bagaimana dan kapan RAMU menghubungi Anda mengenai pesanan, jadwal reschedule, pesan, dan peluang proyek baru.",
  pushDescription = "Terima notifikasi instan langsung di layar perangkat Anda saat ada tawaran booking baru, reschedule jadwal, atau pesan darurat on-set.",
  pushTestMessage = "Anda akan menerima pemberitahuan instan saat ada pesanan atau pesan baru.",
  pushTestLink = "/collaborations?section=contracts",
}: NotificationsFormProps) {
  const [values, setValues] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      alerts.map((a) => {
        const v = initialData?.[a.key];
        return [a.key, typeof v === "boolean" ? v : true];
      })
    )
  );

  const [browserPermission, setBrowserPermission] = useState<"granted" | "denied" | "default" | "unsupported">("default");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const perm = isBrowserNotificationSupported()
      ? getBrowserNotificationPermission()
      : "unsupported";
    const timer = setTimeout(() => {
      setBrowserPermission(perm);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  async function handleRequestBrowserPush() {
    const granted = await requestBrowserNotificationPermission();
    const perm = getBrowserNotificationPermission();
    setBrowserPermission(perm);
    if (granted) {
      showBrowserPushNotification({
        title: "Notifikasi RAMU Aktif",
        message: pushTestMessage,
        link: pushTestLink,
      });
      setMessage({ type: "success", text: "Push notification peramban berhasil diaktifkan!" });
    } else if (perm === "denied") {
      setMessage({ type: "error", text: "Izin notifikasi diblokir pada peramban Anda. Silakan ubah di pengaturan peramban." });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const formData = new FormData();
    for (const a of alerts) {
      formData.append(a.key, String(values[a.key] ?? false));
    }

    const res = await submitAction(formData);
    setIsLoading(false);

    if (res.success) {
      setMessage({ type: "success", text: res.message || "Preferensi notifikasi berhasil disimpan." });
    } else {
      setMessage({ type: "error", text: res.error || "Gagal menyimpan preferensi." });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Header Info */}
      <div className="space-y-1">
        <h2 className="text-xl font-black text-[#27213D] tracking-tight flex items-center gap-2.5">
          <span className="p-1.5 rounded-xl bg-sky-50 text-[#0284c7] border border-sky-200/60 inline-flex">
            <Bell className="w-4 h-4" />
          </span>
          <span>Notifikasi &amp; Komunikasi</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#716B7E] leading-relaxed">
          {description}
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-2.5 text-xs font-semibold animate-fade-in ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Browser Push Card */}
      <div className="p-6 rounded-[24px] bg-white border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-sky-50 text-[#0284c7] border border-sky-200/60 inline-flex">
                <Smartphone className="w-3.5 h-3.5" />
              </span>
              <h3 className="text-xs font-bold text-[#27213D] uppercase tracking-wider">
                Push Notification Peramban (Desktop &amp; Ponsel)
              </h3>
            </div>
            <p className="text-[11px] text-[#716B7E] leading-relaxed max-w-md pt-1">
              {pushDescription}
            </p>
          </div>

          <div className="shrink-0">
            {browserPermission === "granted" ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Aktif di Peramban Ini</span>
              </span>
            ) : browserPermission === "denied" ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Diblokir oleh Browser</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleRequestBrowserPush}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4CC9FE] hover:bg-[#38bbf5] active:scale-[0.99] text-white text-xs font-bold transition-all shadow-md shadow-[#4CC9FE]/20 cursor-pointer"
              >
                <BellRing className="w-3.5 h-3.5 text-white" />
                <span>Aktifkan Notifikasi</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Email Preferences Card */}
      <div className="p-6 rounded-[24px] bg-white border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
          <span className="p-1.5 rounded-xl bg-sky-50 text-[#0284c7] border border-sky-200/60 inline-flex">
            <Mail className="w-3.5 h-3.5" />
          </span>
          <h3 className="text-xs font-bold text-[#27213D] uppercase tracking-wider">
            Notifikasi Surat Elektronik (Email Alerts)
          </h3>
        </div>

        {alerts.map((alert) => (
          <label
            key={alert.key}
            className="flex items-start gap-3.5 p-4 rounded-2xl bg-stone-50/70 border border-stone-200/80 cursor-pointer hover:bg-stone-100/60 transition-colors"
          >
            <input
              type="checkbox"
              checked={values[alert.key] ?? false}
              onChange={(e) => {
                const checked = e.target.checked;
                setValues((prev) => ({ ...prev, [alert.key]: checked }));
              }}
              className="mt-0.5 rounded text-[#4CC9FE] focus:ring-[#4CC9FE]/20 accent-[#4CC9FE]"
            />
            <div className="text-xs">
              <span className="font-bold text-[#27213D] block">
                {alert.label}
              </span>
              <span className="text-[11px] text-[#716B7E] leading-relaxed block mt-0.5">
                {alert.description}
              </span>
            </div>
          </label>
        ))}
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#4CC9FE] hover:bg-[#38bbf5] active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#4CC9FE]/25 transition-all cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Notifikasi</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
