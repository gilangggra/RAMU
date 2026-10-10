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
  ShieldCheck,
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
}

interface NotificationsFormProps {
  initialData?: NotificationPreferencesData | null;
}

export function NotificationsForm({ initialData }: NotificationsFormProps) {
  const [notifyBooking, setNotifyBooking] = useState<boolean>(
    initialData?.notifyBooking !== undefined ? initialData.notifyBooking : true
  );
  const [notifyMessage, setNotifyMessage] = useState<boolean>(
    initialData?.notifyMessage !== undefined ? initialData.notifyMessage : true
  );
  const [notifyBriefDigest, setNotifyBriefDigest] = useState<boolean>(
    initialData?.notifyBriefDigest !== undefined ? initialData.notifyBriefDigest : true
  );

  const [browserPermission, setBrowserPermission] = useState<"granted" | "denied" | "default" | "unsupported">("default");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (isBrowserNotificationSupported()) {
      setBrowserPermission(getBrowserNotificationPermission());
    } else {
      setBrowserPermission("unsupported");
    }
  }, []);

  async function handleRequestBrowserPush() {
    const granted = await requestBrowserNotificationPermission();
    const perm = getBrowserNotificationPermission();
    setBrowserPermission(perm);
    if (granted) {
      showBrowserPushNotification({
        title: "Notifikasi RAMU Aktif",
        message: "Anda akan menerima pemberitahuan instan saat ada pesanan atau pesan baru.",
        link: "/collaborations?section=contracts",
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
    formData.append("notifyBooking", String(notifyBooking));
    formData.append("notifyMessage", String(notifyMessage));
    formData.append("notifyBriefDigest", String(notifyBriefDigest));

    const res = await updateNotificationSettingsAction(formData);
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
          Atur bagaimana dan kapan RAMU menghubungi Anda mengenai pesanan, jadwal reschedule, pesan, dan peluang proyek baru.
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
              Terima notifikasi instan langsung di layar perangkat Anda saat ada tawaran booking baru, reschedule jadwal, atau pesan darurat on-set.
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

        <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-stone-50/70 border border-stone-200/80 cursor-pointer hover:bg-stone-100/60 transition-colors">
          <input
            type="checkbox"
            checked={notifyBooking}
            onChange={(e) => setNotifyBooking(e.target.checked)}
            className="mt-0.5 rounded text-[#4CC9FE] focus:ring-[#4CC9FE]/20 accent-[#4CC9FE]"
          />
          <div className="text-xs">
            <span className="font-bold text-[#27213D] block">
              Pembaruan Pesanan &amp; Surat Perjanjian Kerja (SPK)
            </span>
            <span className="text-[11px] text-[#716B7E] leading-relaxed block mt-0.5">
              Dapatkan email saat ada pesanan masuk, persetujuan kontrak kerja, atau permintaan reschedule dari mitra.
            </span>
          </div>
        </label>

        <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-stone-50/70 border border-stone-200/80 cursor-pointer hover:bg-stone-100/60 transition-colors">
          <input
            type="checkbox"
            checked={notifyMessage}
            onChange={(e) => setNotifyMessage(e.target.checked)}
            className="mt-0.5 rounded text-[#4CC9FE] focus:ring-[#4CC9FE]/20 accent-[#4CC9FE]"
          />
          <div className="text-xs">
            <span className="font-bold text-[#27213D] block">
              Pesan Baru di Messenger RAMU
            </span>
            <span className="text-[11px] text-[#716B7E] leading-relaxed block mt-0.5">
              Email pemberitahuan jika Anda memiliki pesan obrolan yang belum dibaca lebih dari 15 menit.
            </span>
          </div>
        </label>

        <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-stone-50/70 border border-stone-200/80 cursor-pointer hover:bg-stone-100/60 transition-colors">
          <input
            type="checkbox"
            checked={notifyBriefDigest}
            onChange={(e) => setNotifyBriefDigest(e.target.checked)}
            className="mt-0.5 rounded text-[#4CC9FE] focus:ring-[#4CC9FE]/20 accent-[#4CC9FE]"
          />
          <div className="text-xs">
            <span className="font-bold text-[#27213D] block">
              Ringkasan Peluang Proyek Baru yang Kompatibel
            </span>
            <span className="text-[11px] text-[#716B7E] leading-relaxed block mt-0.5">
              Rangkuman mingguan brief proyek dan kampanye baru yang cocok dengan portofolio &amp; sektor Anda.
            </span>
          </div>
        </label>
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
