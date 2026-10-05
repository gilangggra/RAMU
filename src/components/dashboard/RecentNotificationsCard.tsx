import Link from "next/link";
import {
  Bell,
  Target,
  Sparkles,
  Handshake,
  Briefcase,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { NotificationItem } from "@/application/notificationService";

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
        badgeBg: "bg-stone-100 text-stone-700 border-stone-200",
        iconColor: "text-stone-700",
      };
    case "INTEREST_ACCEPTED":
      return {
        icon: Sparkles,
        label: "Lamaran Diterima",
        badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
        iconColor: "text-emerald-700",
      };
    case "COLLABORATION_STARTED":
      return {
        icon: Handshake,
        label: "Kolaborasi Aktif",
        badgeBg: "bg-stone-100 text-stone-800 border-stone-200",
        iconColor: "text-stone-800",
      };
    case "BOOKING_RECEIVED":
    case "BOOKING_UPDATE":
      return {
        icon: Briefcase,
        label: "Pemesanan SPK",
        badgeBg: "bg-stone-100 text-stone-700 border-stone-200",
        iconColor: "text-stone-700",
      };
    case "INTEREST_DECLINED":
      return {
        icon: AlertCircle,
        label: "Status Brief",
        badgeBg: "bg-stone-100 text-stone-600 border-stone-200",
        iconColor: "text-stone-500",
      };
    default:
      return {
        icon: Bell,
        label: "Pemberitahuan",
        badgeBg: "bg-stone-50 text-stone-600 border-stone-200",
        iconColor: "text-stone-500",
      };
  }
}

export function RecentNotificationsCard({
  notifications = [],
}: {
  notifications: NotificationItem[];
}) {
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="p-5 md:p-6 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-5">
      <div className="flex items-center justify-between border-b border-stone-200/70 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700 shrink-0">
            <Bell className="w-4 h-4 text-stone-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-stone-900">Aktivitas &amp; Notifikasi Proyek</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-900 text-white">
                  {unreadCount} baru
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-500 font-normal">
              Pembaruan status lamaran kru, pembentukan workspace, dan pesanan komersial.
            </p>
          </div>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="py-8 text-center rounded-2xl bg-white border border-dashed border-stone-200 space-y-2 shadow-2xs">
          <div className="w-10 h-10 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center mx-auto text-stone-400">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-xs font-semibold text-stone-900">Semua Aktivitas Telah Terpantau</p>
          <p className="text-[11px] text-stone-400 max-w-sm mx-auto">
            Saat ada kreator yang melamar ke brief Anda atau pesanan booking baru diterima, pemberitahuan akan tampil otomatis di sini.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const badge = getNotificationBadge(notif.type);
            const Icon = badge.icon;

            return (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  !notif.is_read
                    ? "bg-gradient-to-b from-stone-50/80 to-white border-stone-300 shadow-2xs"
                    : "bg-gradient-to-b from-white to-stone-50/60 border-stone-200/80 hover:border-stone-300 shadow-2xs"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-white border border-stone-200 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Icon className={`w-4 h-4 ${badge.iconColor}`} />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${badge.badgeBg}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs font-bold text-stone-900">
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        • {formatRelativeTime(notif.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 font-normal leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>

                {notif.link && (
                  <Link
                    href={notif.link}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-all shrink-0 self-end sm:self-center shadow-2xs"
                  >
                    <span>Buka</span>
                    <ArrowRight className="w-3 h-3 text-stone-300" />
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
