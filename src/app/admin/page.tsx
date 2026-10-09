import { prisma } from "@/infrastructure/database/prisma";
import {
  Users,
  FolderKanban,
  ShoppingBag,
  Zap,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  ScrollText,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function safeCount(fn: () => Promise<number>): Promise<number> {
  try {
    return await fn();
  } catch (error) {
    console.error("Gagal menjalankan safeCount:", error);
    return 0;
  }
}

async function safeFindMany<T>(fn: () => Promise<T[]>): Promise<T[]> {
  try {
    return await fn();
  } catch (error) {
    console.error("Gagal menjalankan safeFindMany:", error);
    return [];
  }
}

export default async function AdminDashboardPage() {
  const [
    totalActors,
    activeActors,
    draftActors,
    totalBriefs,
    openBriefs,
    inReviewBriefs,
    totalBookings,
    pendingBookings,
    totalOpportunities,
    pendingVerifications,
    openDisputes,
    recentActors,
    recentBookings,
    recentAuditLogs,
  ] = await Promise.all([
    safeCount(() => prisma.actor.count()),
    safeCount(() => prisma.actor.count({ where: { status: "ACTIVE" } })),
    safeCount(() => prisma.actor.count({ where: { status: "DRAFT" } })),
    safeCount(() => prisma.projectBrief.count()),
    safeCount(() => prisma.projectBrief.count({ where: { status: "OPEN" } })),
    safeCount(() => prisma.projectBrief.count({ where: { status: "IN_REVIEW" } })),
    safeCount(() => prisma.bookingRequest.count()),
    safeCount(() => prisma.bookingRequest.count({ where: { status: "PENDING" } })),
    safeCount(() => prisma.opportunity.count({ where: { status: { not: "ARCHIVED" } } })),
    safeCount(() => prisma.verificationRequest.count({ where: { status: "PENDING" } })),
    safeCount(() => prisma.dispute.count({ where: { status: { in: ["OPEN", "IN_MEDIATION"] } } })),
    safeFindMany(() =>
      prisma.actor.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          sector: true,
          status: true,
        },
      })
    ),
    safeFindMany(() =>
      prisma.bookingRequest.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          requester: { select: { name: true } },
          target: { select: { name: true } },
        },
      })
    ),
    safeFindMany(() =>
      prisma.adminAuditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      })
    ),
  ]);

  const kpis = [
    {
      label: "Total Talenta & Studio",
      value: totalActors,
      sub: `${activeActors} Aktif · ${draftActors} Draf`,
      icon: Users,
      iconColor: "text-amber-600",
      href: "/admin/users",
    },
    {
      label: "Proyek Brief",
      value: totalBriefs,
      sub: `${openBriefs} Terbuka · ${inReviewBriefs} Menunggu Review`,
      icon: FolderKanban,
      iconColor: "text-purple-600",
      href: "/admin/projects",
    },
    {
      label: "Total Booking",
      value: totalBookings,
      sub: `${pendingBookings} Menunggu Respons`,
      icon: ShoppingBag,
      iconColor: "text-emerald-600",
      href: "/admin/commerce",
    },
    {
      label: "Peluang Kolaborasi",
      value: totalOpportunities,
      sub: "Dibentuk Matching Engine",
      icon: Zap,
      iconColor: "text-sky-600",
      href: "/admin/users",
    },
  ];

  const urgentQueueItems = [
    ...(pendingVerifications > 0
      ? [
        {
          title: "Verifikasi Profil & Gear",
          count: pendingVerifications,
          desc: "Permintaan lencana verifikasi dan bukti alat kerja menunggu kurasi",
          href: "/admin/verification",
          badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
          dotColor: "bg-amber-500",
        },
      ]
      : []),
    ...(inReviewBriefs > 0
      ? [
        {
          title: "Project Brief Baru",
          count: inReviewBriefs,
          desc: "Brief komersial baru membutuhkan persetujuan publikasi dari admin",
          href: "/admin/projects",
          badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
          dotColor: "bg-purple-500",
        },
      ]
      : []),
    ...(openDisputes > 0
      ? [
        {
          title: "Sengketa Proyek Aktif",
          count: openDisputes,
          desc: "Kasus komplain atau eskalasi workspace membutuhkan intervensi mediasi",
          href: "/admin/disputes",
          badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
          dotColor: "bg-rose-500",
        },
      ]
      : []),
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/70">
              Admin Control Panel • Real-time Monitoring
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827] tracking-tight mt-1">
            Ecosystem Overview
          </h1>
          <p className="text-xs text-[#4B5563] leading-relaxed font-normal mt-0.5">
            Pemantauan kesehatan platform, moderasi transaksi, dan aktivitas ekosistem RAMU secara real-time.
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-[11px] text-slate-400 font-medium">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Actionable Queue (Antrean Mendesak) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <h2 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Antrean Moderasi Mendesak
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {urgentQueueItems.length > 0 ? `${urgentQueueItems.reduce((acc, curr) => acc + curr.count, 0)} tindakan perlu ditinjau` : "Semua antrean terkendali"}
          </span>
        </div>

        {urgentQueueItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {urgentQueueItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="glass-card p-4 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#111827] uppercase tracking-wide">
                      {item.title}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${item.badgeColor}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor}`} />
                      {item.count} Menunggu
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="pt-3 flex items-center gap-1 text-xs font-semibold text-[#0284c7] group-hover:text-[#0369a1]">
                  <span>Buka Antrean Moderasi</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-950">Semua Antrean Moderasi Telah Bersih</p>
                <p className="text-[11px] text-emerald-700">Tidak ada pengajuan verifikasi, brief review, atau sengketa aktif saat ini.</p>
              </div>
            </div>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
              100% Resolved
            </span>
          </div>
        )}
      </section>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={kpi.label}
              href={kpi.href}
              className="glass-card group p-4 hover:shadow-md transition-all space-y-1"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="glass-icon-wrapper w-8 h-8 p-1.5">
                  <Icon className={`w-4 h-4 ${kpi.iconColor || "text-slate-600"}`} />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#0284c7] group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight leading-none">
                {kpi.value.toLocaleString("id-ID")}
              </div>
              <div className="mt-1 text-xs font-semibold text-slate-800">
                {kpi.label}
              </div>
              <div className="text-[10px] text-slate-400">{kpi.sub}</div>
            </Link>
          );
        })}
      </div>

      {/* Action Queue + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Audit Trail */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <ScrollText className="w-3.5 h-3.5 text-slate-500" />
            Audit Mutasi Terbaru
          </h2>
          <div className="rounded-2xl bg-white/60 backdrop-blur-md border border-white/75 p-4 space-y-3 shadow-2xs">
            {recentAuditLogs.length > 0 ? (
              <div className="space-y-2">
                {recentAuditLogs.map((log) => (
                  <Link
                    key={log.id}
                    href="/admin/audit-logs"
                    className="block p-2.5 rounded-xl hover:bg-white/80 border border-slate-100 transition-colors group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
                        {log.actionType}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-800 group-hover:text-[#0284c7] transition-colors truncate">
                        {log.targetEntity} {log.targetId ? `#${log.targetId.slice(0, 6)}` : ""}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-[#0284c7] transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                ))}
                <div className="pt-2 border-t border-slate-100 text-center">
                  <Link
                    href="/admin/audit-logs"
                    className="text-[11px] font-semibold text-[#0284c7] hover:text-[#0369a1] hover:underline"
                  >
                    Lihat seluruh audit trail →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium">
                  Belum ada log mutasi
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
            Aktivitas Terbaru Platform
          </h2>

          {/* Recent Actors */}
          <div className="rounded-2xl bg-white/60 backdrop-blur-md border border-white/75 overflow-hidden shadow-2xs">
            <div className="px-4 py-3 border-b border-white/80 bg-white/30">
              <h3 className="text-xs font-semibold text-slate-700">
                Talenta &amp; Studio Terdaftar Terbaru
              </h3>
            </div>
            <div className="divide-y divide-slate-100/60">
              {recentActors.map((actor) => (
                <div
                  key={actor.id}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-white/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center text-xs font-bold">
                      {actor.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#111827]">
                        {actor.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {actor.sector}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${actor.status === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200/70"
                      : actor.status === "DRAFT"
                        ? "bg-amber-50 text-amber-700 border-amber-200/70"
                        : "bg-slate-100 text-slate-600 border-slate-200/70"
                      }`}
                  >
                    {actor.status}
                  </span>
                </div>
              ))}
            </div>
            <div className="px-4 py-2.5 border-t border-slate-100/60 bg-white/20">
              <Link
                href="/admin/users"
                className="text-[11px] font-semibold text-[#0284c7] hover:text-[#0369a1] flex items-center gap-1 transition-colors"
              >
                <span>Lihat semua talenta</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="rounded-2xl bg-white/60 backdrop-blur-md border border-white/75 overflow-hidden shadow-2xs">
            <div className="px-4 py-3 border-b border-white/80 bg-white/30">
              <h3 className="text-xs font-semibold text-slate-700">
                Booking Terbaru
              </h3>
            </div>
            <div className="divide-y divide-slate-100/60">
              {recentBookings.length > 0 ? (
                recentBookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-white/60 transition-colors"
                  >
                    <div>
                      <p className="text-xs font-semibold text-[#111827]">
                        {b.requester?.name || "Klien"}{" "}
                        <span className="text-slate-400 font-normal">→</span>{" "}
                        {b.target?.name || "Kreator"}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(b.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <span
                      className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${b.status === "ACCEPTED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200/70"
                        : b.status === "PENDING"
                          ? "bg-amber-50 text-amber-700 border-amber-200/70"
                          : b.status === "DECLINED"
                            ? "bg-rose-50 text-rose-700 border-rose-200/70"
                            : "bg-slate-100 text-slate-600 border-slate-200/70"
                        }`}
                    >
                      {b.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-xs text-slate-400">
                  Belum ada booking
                </div>
              )}
            </div>
            <div className="px-4 py-2.5 border-t border-slate-100/60 bg-white/20">
              <Link
                href="/admin/commerce"
                className="text-[11px] font-semibold text-[#0284c7] hover:text-[#0369a1] flex items-center gap-1 transition-colors"
              >
                <span>Lihat semua transaksi</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
