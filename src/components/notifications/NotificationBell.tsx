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
} from "lucide-react";
import {
  fetchMyNotificationsAction,
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/app/api/notifications/actions";
import { NotificationItem } from "@/application/notificationService";

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
      return <Bell className="w-4 h-4 text-stone-500" />;
  }
}

// Module-level shared store to prevent multiple mounted instances (desktop + mobile header) from firing duplicate requests
interface NotificationStore {
  notifications: NotificationItem[];
  unreadCount: number;
  lastFetched: number;
}

let sharedStore: NotificationStore = {
  notifications: [],
  unreadCount: 0,
  lastFetched: 0,
};

let inFlightPromise: Promise<NotificationStore> | null = null;
const storeListeners = new Set<(store: NotificationStore) => void>();
let globalPollingInterval: NodeJS.Timeout | null = null;

function notifyStoreListeners() {
  for (const listener of storeListeners) {
    listener({ ...sharedStore });
  }
}

async function fetchNotificationsShared(force = false): Promise<NotificationStore> {
  const now = Date.now();
  // If fresh (within 45 seconds) and not forced, return cached data immediately
  if (!force && sharedStore.lastFetched > 0 && now - sharedStore.lastFetched < 45000) {
    return sharedStore;
  }

  // If a fetch is already in flight, reuse the same promise (eliminates thundering herd)
  if (inFlightPromise) {
    return inFlightPromise;
  }

  inFlightPromise = (async () => {
    try {
      const res = await fetchMyNotificationsAction();
      sharedStore = {
        notifications: res.notifications || [],
        unreadCount: res.unreadCount ?? 0,
        lastFetched: Date.now(),
      };
      notifyStoreListeners();
      return sharedStore;
    } catch {
      return sharedStore;
    } finally {
      inFlightPromise = null;
    }
  })();

  return inFlightPromise;
}

function ensureGlobalPolling() {
  if (globalPollingInterval) return;
  globalPollingInterval = setInterval(() => {
    // Only poll when browser tab is active/visible
    if (typeof document !== "undefined" && document.visibilityState === "visible") {
      fetchNotificationsShared(true);
    }
  }, 90000); // 90 seconds
}

export function NotificationBell({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => sharedStore.notifications);
  const [unreadCount, setUnreadCount] = useState<number>(() => sharedStore.unreadCount);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const listener = (store: NotificationStore) => {
      setNotifications(store.notifications);
      setUnreadCount(store.unreadCount);
    };
    storeListeners.add(listener);

    // Initial load: uses cache if within TTL, else single deduplicated server action
    fetchNotificationsShared();
    ensureGlobalPolling();

    return () => {
      storeListeners.delete(listener);
    };
  }, []);

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
      sharedStore = {
        ...sharedStore,
        notifications: sharedStore.notifications.map((n) =>
          n.id === item.id ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, sharedStore.unreadCount - 1),
      };
      notifyStoreListeners();
      markNotificationReadAction(item.id);
    }
    setIsOpen(false);
    if (item.link) {
      router.push(item.link);
    }
  }

  async function handleMarkAllAsRead() {
    sharedStore = {
      ...sharedStore,
      notifications: sharedStore.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    };
    notifyStoreListeners();
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
          const nextOpen = !isOpen;
          setIsOpen(nextOpen);
          // Only refresh when opening if data is older than 30s
          if (nextOpen && Date.now() - sharedStore.lastFetched > 30000) {
            fetchNotificationsShared(true);
          }
        }}
        title="Notifikasi & Pembaruan"
        className={`relative p-2 rounded-xl text-stone-500 hover:text-[#1E1B2E] hover:bg-stone-100 transition-colors cursor-pointer flex items-center justify-center ${
          isOpen ? "bg-stone-100 text-[#1E1B2E]" : ""
        }`}
        aria-label="Buka notifikasi"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-black text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN PANEL */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-2 bg-white border border-stone-200/90 rounded-2xl shadow-2xl overflow-hidden animate-fade-in ${
            isCollapsed
              ? "left-0 sm:left-12 top-0 w-[320px] sm:w-[380px]"
              : "right-0 sm:left-auto w-[320px] sm:w-[380px]"
          }`}
          style={{ maxWidth: "calc(100vw - 2rem)" }}
        >
          {/* HEADER */}
          <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#1E1B2E]">Notifikasi</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-100 text-amber-800 rounded-full">
                  {unreadCount} baru
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="text-[11px] font-semibold text-stone-500 hover:text-amber-800 transition-colors px-2 py-1 rounded-lg hover:bg-white"
                  title="Tandai semua sudah dibaca"
                >
                  Tandai Dibaca
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* FILTER TABS */}
          <div className="flex items-center px-4 pt-2 border-b border-stone-100 gap-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`pb-2 transition-all relative ${
                filter === "all" ? "text-[#1E1B2E] font-bold" : "text-stone-400 hover:text-stone-600"
              }`}
            >
              <span>Semua</span>
              {filter === "all" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E1B2E]" />}
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`pb-2 transition-all relative ${
                filter === "unread" ? "text-[#1E1B2E] font-bold" : "text-stone-400 hover:text-stone-600"
              }`}
            >
              <span>Belum Dibaca ({unreadCount})</span>
              {filter === "unread" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E1B2E]" />}
            </button>
          </div>

          {/* NOTIFICATION LIST */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-stone-100 no-scrollbar">
            {displayedNotifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-stone-600">
                  {filter === "unread" ? "Tidak ada notifikasi baru" : "Belum ada notifikasi"}
                </p>
                <p className="text-[11px] text-stone-400 max-w-[200px] mx-auto">
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
                        ? "bg-amber-50/40 hover:bg-amber-50/70"
                        : "hover:bg-stone-50"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-white border border-stone-200 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform mt-0.5">
                      {getNotificationIcon(notif.type)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#1E1B2E] truncate">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-stone-400 shrink-0 font-medium">
                          {formatRelativeTime(notif.created_at)}
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>

                      {notif.link && (
                        <div className="pt-1 flex items-center gap-1 text-[10px] font-bold text-amber-800 group-hover:underline">
                          <span>Buka Detail</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-2" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
