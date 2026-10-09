"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  ExternalLink,
  Target,
  Sparkles,
  Handshake,
  Briefcase,
  AlertCircle,
  X,
  Clock,
  BellRing,
} from "lucide-react";
import {
  fetchMyNotificationsAction,
  markNotificationReadAction,
  markAllNotificationsReadAction,
  simulateNewInterestNotificationAction,
} from "@/app/api/notifications/actions";
import { NotificationItem } from "@/application/notificationService";
import {
  isBrowserNotificationSupported,
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission,
  registerServiceWorker,
  showBrowserPushNotification,
} from "@/lib/notifications/pushNotificationManager";

function formatRelativeTime(dateInput: Date | string): string {
  const date = new Date(dateInput);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return "Baru saja";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m lalu`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}j lalu`;
  if (diffSec < 172800) return "Kemarin";
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "INTEREST_RECEIVED":
      return <Target className="w-4 h-4 text-purple-600" />;
    case "INTEREST_ACCEPTED":
      return <Sparkles className="w-4 h-4 text-emerald-600" />;
    case "COLLABORATION_STARTED":
      return <Handshake className="w-4 h-4 text-amber-600" />;
    case "BOOKING_RECEIVED":
    case "BOOKING_UPDATE":
      return <Briefcase className="w-4 h-4 text-blue-600" />;
    case "INTEREST_DECLINED":
      return <AlertCircle className="w-4 h-4 text-rose-500" />;
    default:
      return <Bell className="w-4 h-4 text-slate-400" />;
  }
}

export function NotificationBell({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [pushPermission, setPushPermission] = useState<"granted" | "denied" | "default" | "unsupported">("unsupported");
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef<boolean>(true);

  async function loadNotifications() {
    try {
      const res = await fetchMyNotificationsAction();
      const items = res.notifications || [];

      // Detect newly arrived unread notifications and trigger browser push
      if (!isInitialLoadRef.current) {
        for (const item of items) {
          if (!seenIdsRef.current.has(item.id) && !item.is_read) {
            showBrowserPushNotification({
              title: item.title,
              message: item.message,
              link: item.link || "/projects",
              tag: item.id,
            });
          }
        }
      } else {
        isInitialLoadRef.current = false;
      }

      items.forEach((n: NotificationItem) => seenIdsRef.current.add(n.id));
      setNotifications(items);
      setUnreadCount(res.unreadCount || 0);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    if (isBrowserNotificationSupported()) {
      setPushPermission(getBrowserNotificationPermission());
      registerServiceWorker();
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    // Poll every 12 seconds for responsive real-time notifications
    const interval = setInterval(loadNotifications, 12000);
    return () => clearInterval(interval);
  }, []);

  async function handleEnablePush() {
    const granted = await requestBrowserNotificationPermission();
    setPushPermission(granted ? "granted" : getBrowserNotificationPermission());
    if (granted) {
      await showBrowserPushNotification({
        title: "Notifikasi Browser RAMU Aktif",
        message: "Anda akan mendapatkan pemberitahuan desktop langsung saat ada peminat baru yang melamar brief proyek Anda.",
        link: "/projects",
      });
    }
  }

  async function handleSimulateNewApplicant() {
    setIsSimulating(true);
    try {
      if (pushPermission === "default") {
        await requestBrowserNotificationPermission();
        setPushPermission(getBrowserNotificationPermission());
      }
      const res = await simulateNewInterestNotificationAction("Elena Rostova (Fashion Stylist)");
      if (res.success && res.notification) {
        await showBrowserPushNotification({
          title: res.notification.title,
          message: res.notification.message,
          link: res.notification.link || "/projects",
          tag: res.notification.id,
        });
        await loadNotifications();
      }
    } catch (err) {
      console.error("Gagal simulasi notifikasi:", err);
    } finally {
      setIsSimulating(false);
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  async function handleNotificationClick(item: NotificationItem) {
    if (!item.is_read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      markNotificationReadAction(item.id);
    }
    setIsOpen(false);
    if (item.link) {
      router.push(item.link);
    }
  }

  async function handleMarkAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    await markAllNotificationsReadAction();
  }

  const displayedNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.is_read)
      : notifications;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* BELL BUTTON */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) loadNotifications();
        }}
        title="Notifikasi & Pembaruan"
        className={`relative ${
          isCollapsed ? "w-9 h-9 p-0" : "p-2"
        } rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer flex items-center justify-center ${
          isOpen ? "bg-slate-100 text-slate-900" : ""
        }`}
        aria-label="Buka notifikasi"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#4CC9FE] px-1 text-[9px] font-black text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN PANEL */}
      {isOpen && (
        <div
          className={`absolute z-50 bg-white/95 backdrop-blur-xl border border-white/80 rounded-[22px] shadow-2xl overflow-hidden animate-fade-in ${
            isCollapsed
              ? "left-12 top-0 w-[320px] sm:w-[380px]"
              : "right-0 md:right-auto md:left-0 top-full mt-2 w-[320px] sm:w-[380px]"
          }`}
          style={{ maxWidth: "calc(100vw - 2rem)" }}
        >
          {/* HEADER */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">Notifikasi</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#4CC9FE]/15 text-[#0284c7] rounded-full">
                  {unreadCount} baru
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="text-[11px] font-semibold text-slate-500 hover:text-[#0284c7] transition-colors px-2 py-1 rounded-full hover:bg-white"
                  title="Tandai semua sudah dibaca"
                >
                  Tandai Dibaca
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* PERMISSION PROMPT BANNER */}
          {pushPermission === "default" && (
            <div className="px-4 py-2.5 bg-sky-500/10 border-b border-sky-200/50 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-800 min-w-0">
                <BellRing className="w-4 h-4 text-[#0284c7] shrink-0" />
                <span className="text-[11px] leading-snug">
                  Aktifkan notifikasi desktop agar tahu saat ada pelamar baru.
                </span>
              </div>
              <button
                type="button"
                onClick={handleEnablePush}
                className="shrink-0 px-3 py-1 bg-slate-900 hover:bg-black text-white text-[11px] font-bold rounded-full transition-colors cursor-pointer shadow-2xs"
              >
                Izinkan
              </button>
            </div>
          )}

          {/* FILTER TABS */}
          <div className="flex items-center px-4 pt-2 border-b border-slate-100 gap-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`pb-2 transition-all relative cursor-pointer ${
                filter === "all" ? "text-slate-900 font-bold" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <span>Semua</span>
              {filter === "all" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4CC9FE] rounded-full" />}
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`pb-2 transition-all relative cursor-pointer ${
                filter === "unread" ? "text-slate-900 font-bold" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <span>Belum Dibaca ({unreadCount})</span>
              {filter === "unread" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4CC9FE] rounded-full" />}
            </button>
          </div>

          {/* NOTIFICATION LIST */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 no-scrollbar">
            {displayedNotifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  {filter === "unread" ? "Tidak ada notifikasi baru" : "Belum ada notifikasi"}
                </p>
                <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                  Aktivitas lamaran proyek, undangan kolaborasi, dan pesanan booking akan muncul di sini.
                </p>
              </div>
            ) : (
              displayedNotifications.map((notif) => {
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer group ${
                      !notif.is_read
                        ? "bg-[#4CC9FE]/8 hover:bg-[#4CC9FE]/14"
                        : "hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform mt-0.5">
                      {getNotificationIcon(notif.type)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {formatRelativeTime(notif.created_at)}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>

                      {notif.link && (
                        <div className="pt-1 flex items-center gap-1 text-[10px] font-bold text-[#0284c7] group-hover:underline">
                          <span>Buka Detail</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-[#4CC9FE] shrink-0 mt-2" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* FOOTER ACTION BAR */}
          <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleSimulateNewApplicant}
              disabled={isSimulating}
              className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-950 font-medium transition-colors cursor-pointer disabled:opacity-50"
              title="Kirim simulasi notifikasi pelamar baru untuk menguji notifikasi browser desktop"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0284c7]" />
              <span>{isSimulating ? "Mengirim Notifikasi..." : "Uji Notifikasi Peminat Baru"}</span>
            </button>
            {pushPermission === "granted" ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Push Aktif
              </span>
            ) : pushPermission === "default" ? (
              <button
                type="button"
                onClick={handleEnablePush}
                className="text-[10px] text-[#0284c7] font-semibold hover:underline cursor-pointer"
              >
                Aktifkan Push
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
