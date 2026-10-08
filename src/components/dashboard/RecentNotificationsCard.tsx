"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Bell,
  Target,
  Handshake,
  Briefcase,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CheckCheck,
  Loader2,
  Filter,
} from "lucide-react";
import { NotificationItem } from "@/application/notificationService";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/app/api/notifications/actions";

function formatRelativeTime(dateInput: Date | string): string {
  const date = new Date(dateInput);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return "Baru saja";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} menit lalu`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`;
  if (diffSec < 172800) return "Kemarin";
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function getNotificationBadge(type: string) {
  switch (type) {
    case "INTEREST_RECEIVED":
      return {
        icon: Target,
        label: "Peminat Brief",
        badgeBg: "bg-[#4CC9FE]/15 text-[#0284c7] border-[#4CC9FE]/30",
        iconColor: "text-[#0284c7]",
      };
    case "INTEREST_ACCEPTED":
      return {
        icon: CheckCircle2,
        label: "Lamaran Diterima",
        badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
        iconColor: "text-emerald-700",
      };
    case "COLLABORATION_STARTED":
      return {
        icon: Handshake,
        label: "Kolaborasi Aktif",
        badgeBg: "bg-purple-50 text-purple-700 border-purple-200/60",
        iconColor: "text-purple-700",
      };
    case "BOOKING_RECEIVED":
    case "BOOKING_UPDATE":
      return {
        icon: Briefcase,
        label: "Pemesanan SPK",
        badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
        iconColor: "text-indigo-700",
      };
    case "INTEREST_DECLINED":
      return {
        icon: AlertCircle,
        label: "Status Brief",
        badgeBg: "bg-rose-50 text-rose-700 border-rose-200/60",
        iconColor: "text-rose-600",
      };
    default:
      return {
        icon: Bell,
        label: "Pemberitahuan",
        badgeBg: "bg-slate-100 text-slate-700 border-slate-200",
        iconColor: "text-slate-500",
      };
  }
}

export function RecentNotificationsCard({
  notifications = [],
}: {
  notifications: NotificationItem[];
}) {
  const [items, setItems] = useState<NotificationItem[]>(notifications);
  const [filterMode, setFilterMode] = useState<"ALL" | "UNREAD">("ALL");
  const [isPending, startTransition] = useTransition();

  const unreadCount = items.filter((n) => !n.is_read).length;

  const handleMarkAsRead = (id: string) => {
    // Optimistic local update
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    startTransition(async () => {
      await markNotificationReadAction(id);
    });
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0 || isPending) return;
    // Optimistic local update
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    startTransition(async () => {
      await markAllNotificationsReadAction();
    });
  };

  const displayedItems = filterMode === "UNREAD" ? items.filter((n) => !n.is_read) : items;

  return (
    <div className="p-5 md:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3.5 gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#4CC9FE]/15 border border-[#4CC9FE]/30 flex items-center justify-center text-[#0284c7] shrink-0">
            <Bell className="w-4 h-4 text-[#0284c7]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Notifikasi &amp; Aktivitas</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[#4CC9FE] text-white">
                  {unreadCount} baru
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-normal">
              Status lamaran brief, pembaruan workspace, dan pesanan komersial.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200/80 text-[11px] font-medium">
            <button
              onClick={() => setFilterMode("ALL")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterMode === "ALL"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Semua ({items.length})
            </button>
            <button
              onClick={() => setFilterMode("UNREAD")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterMode === "UNREAD"
                  ? "bg-white text-[#0284c7] shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Belum Dibaca ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold text-slate-600 hover:text-[#0284c7] hover:bg-[#4CC9FE]/10 border border-slate-200 transition-colors disabled:opacity-50"
              title="Tandai semua notifikasi telah dibaca"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0284c7]" />
              ) : (
                <CheckCheck className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span className="hidden md:inline">Tandai Dibaca</span>
            </button>
          )}
        </div>
      </div>

      {displayedItems.length === 0 ? (
        <div className="py-8 text-center rounded-2xl bg-white border border-dashed border-slate-200 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xs font-bold text-slate-900">
            {filterMode === "UNREAD" ? "Semua notifikasi telah dibaca" : "Belum ada notifikasi baru"}
          </p>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto font-normal">
            {filterMode === "UNREAD"
              ? "Tidak ada pembaruan belum dibaca saat ini."
              : "Pemberitahuan lamaran kru dan pesanan jasa akan muncul di sini."}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayedItems.map((notif) => {
            const badge = getNotificationBadge(notif.type);
            const Icon = badge.icon;

            return (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.is_read) handleMarkAsRead(notif.id);
                }}
                className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  !notif.is_read
                    ? "bg-[#4CC9FE]/8 border-[#4CC9FE]/30 shadow-2xs"
                    : "bg-white hover:bg-slate-50/70 border-slate-200/80 hover:border-slate-300 shadow-2xs"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Icon className={`w-3.5 h-3.5 ${badge.iconColor}`} />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badge.badgeBg}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        • {formatRelativeTime(notif.created_at)}
                      </span>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[#4CC9FE] inline-block shadow-xs" title="Belum dibaca" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 font-normal leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>

                {notif.link && (
                  <Link
                    href={notif.link}
                    onClick={() => {
                      if (!notif.is_read) handleMarkAsRead(notif.id);
                    }}
                    className="btn-primary-pill inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold shrink-0 self-end sm:self-center"
                  >
                    <span>Buka</span>
                    <ArrowRight className="w-3 h-3 text-white" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
