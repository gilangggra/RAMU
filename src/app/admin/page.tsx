import { prisma } from "@/infrastructure/database/prisma";
import {
  Users,
  FolderKanban,
  ShoppingBag,
  Zap,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Shield,
  ScrollText,
} from "lucide-react";
import Link from "next/link";

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
    recentBriefs,
    recentBookings,
    recentAuditLogs,
  ] = await Promise.all([
    prisma.actor.count(),
    prisma.actor.count({ where: { status: "ACTIVE" } }),
    prisma.actor.count({ where: { status: "DRAFT" } }),
    prisma.projectBrief.count(),
    prisma.projectBrief.count({ where: { status: "OPEN" } }),
    prisma.projectBrief.count({ where: { status: "IN_REVIEW" } }),
    prisma.bookingRequest.count(),
    prisma.bookingRequest.count({ where: { status: "PENDING" } }),
    prisma.opportunity.count({ where: { status: { not: "ARCHIVED" } } }),
    prisma.verificationRequest.count({ where: { status: "PENDING" } }),
    prisma.dispute.count({ where: { status: { in: ["OPEN", "IN_MEDIATION"] } } }),
    prisma.actor.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { owner: { select: { email: true } } },
    }),
    prisma.projectBrief.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { creatorActor: { select: { name: true, sector: true } } },
    }),
    prisma.bookingRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        requester: { select: { name: true } },
        target: { select: { name: true } },
      },
    }),
    prisma.adminAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const kpis = [
    {
      label: "Total Talenta & Studio",
      value: totalActors,
      sub: `${activeActors} Aktif · ${draftActors} Draf`,
      icon: Users,
      color: "from-amber-100 to-amber-50",
      iconColor: "text-amber-600",
      border: "border-amber-200",
      href: "/admin/users",
    },
    {
      label: "Proyek Brief",
      value: totalBriefs,
      sub: `${openBriefs} Terbuka · ${inReviewBriefs} Menunggu Review`,
      icon: FolderKanban,
      color: "from-purple-100 to-purple-50",
      iconColor: "text-purple-600",
      border: "border-purple-200",
      href: "/admin/projects",
    },
    {
      label: "Total Booking",
      value: totalBookings,
      sub: `${pendingBookings} Menunggu Respons`,
      icon: ShoppingBag,
      color: "from-emerald-100 to-emerald-50",
      iconColor: "text-emerald-600",
      border: "border-emerald-200",
      href: "/admin/commerce",
    },
    {
      label: "Peluang Kolaborasi",
      value: totalOpportunities,
      sub: "Dibentuk Matching Engine",
      icon: Zap,
      color: "from-sky-100 to-sky-50",
      iconColor: "text-sky-600",
      border: "border-sky-200",
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
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
              Admin Dashboard
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[#27213D] tracking-tight">
            Ecosystem Overview
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Pemantauan kesehatan platform RAMU secara real-time.
          </p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-[11px] text-stone-400 font-medium">
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
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <h2 className="text-sm font-bold text-[#1E1B2E] uppercase tracking-wider">
              Antrean Moderasi Mendesak
            </h2>
          </div>
          <span className="text-xs text-stone-500 font-medium">
            {urgentQueueItems.length > 0 ? `${urgentQueueItems.reduce((acc, curr) => acc + curr.count, 0)} tindakan perlu ditinjau` : "Semua antrean terkendali"}
          </span>
        </div>

        {urgentQueueItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {urgentQueueItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="p-5 rounded-2xl bg-white border border-stone-200/90 hover:border-stone-400 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#1E1B2E] uppercase tracking-wide">
                      {item.title}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black border ${item.badgeColor}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor}`} />
                      {item.count} Menunggu
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="pt-4 flex items-center gap-1 text-xs font-bold text-amber-700 group-hover:text-amber-800">
                  <span>Buka Antrean Moderasi</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-950">Semua Antrean Moderasi Telah Bersih</p>
                <p className="text-[11px] text-emerald-700">Tidak ada pengajuan verifikasi, brief review, atau sengketa aktif saat ini.</p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-300">
              100% Resolved
            </span>
          </div>
        )}
      </section>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={kpi.label}
              href={kpi.href}
              className={`group relative p-5 rounded-2xl bg-gradient-to-br ${kpi.color} border ${kpi.border} hover:border-opacity-60 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center ${kpi.iconColor}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-stone-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="text-4xl font-black text-[#27213D] tracking-tighter leading-none">
                {kpi.value.toLocaleString("id-ID")}
              </div>
              <div className="mt-2 text-xs font-bold text-stone-600 uppercase tracking-wider">
                {kpi.label}
              </div>
              <div className="mt-0.5 text-[11px] text-stone-400">{kpi.sub}</div>
            </Link>
          );
        })}
      </div>

      {/* Action Queue + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Audit Trail */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2">
            <ScrollText className="w-3.5 h-3.5 text-amber-600" />
            Audit Mutasi Terbaru
          </h2>
          <div className="rounded-2xl bg-white border border-stone-200 p-4 space-y-3">
            {recentAuditLogs.length > 0 ? (
              <div className="space-y-2.5">
                {recentAuditLogs.map((log) => (
                  <Link
                    key={log.id}
                    href="/admin/audit-logs"
                    className="block p-2.5 rounded-xl hover:bg-stone-50 border border-stone-100 transition-colors group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                        {log.actionType}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {new Date(log.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-700 group-hover:text-amber-800 transition-colors truncate">
                        {log.targetEntity} {log.targetId ? `#${log.targetId.slice(0, 6)}` : ""}
                      </span>
                      <ArrowRight className="w-3 h-3 text-stone-300 group-hover:text-amber-600 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                ))}
                <div className="pt-2 border-t border-stone-100 text-center">
                  <Link
                    href="/admin/audit-logs"
                    className="text-[11px] font-bold text-amber-700 hover:underline"
                  >
                    Lihat seluruh audit trail →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="w-8 h-8 text-emerald-600/50 mx-auto mb-2" />
                <p className="text-xs text-stone-400 font-medium">
                  Belum ada log mutasi
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" />
            Aktivitas Terbaru Platform
          </h2>

          {/* Tabs content: Recent Actors */}
          <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-200">
              <h3 className="text-xs font-bold text-stone-600">
                Talenta & Studio Terdaftar Terbaru
              </h3>
            </div>
            <div className="divide-y divide-stone-200">
              {recentActors.map((actor) => (
                <div
                  key={actor.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-white transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 text-[10px] font-black">
                      {actor.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-800">
                        {actor.name}
                      </p>
                      <p className="text-[10px] text-stone-400">
                        {actor.sector}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      actor.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-600"
                        : actor.status === "DRAFT"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-stone-50 text-stone-400"
                    }`}
                  >
                    {actor.status}
                  </span>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-stone-200">
              <Link
                href="/admin/users"
                className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors"
              >
                <span>Lihat semua talenta</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-200">
              <h3 className="text-xs font-bold text-stone-600">
                Booking Terbaru
              </h3>
            </div>
            <div className="divide-y divide-stone-200">
              {recentBookings.length > 0 ? (
                recentBookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-white transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-stone-800">
                        {b.requester.name}{" "}
                        <span className="text-stone-400 font-normal">→</span>{" "}
                        {b.target.name}
                      </p>
                      <p className="text-[10px] text-stone-400">
                        {new Date(b.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        b.status === "ACCEPTED"
                          ? "bg-emerald-100 text-emerald-600"
                          : b.status === "PENDING"
                          ? "bg-amber-100 text-amber-600"
                          : b.status === "DECLINED"
                          ? "bg-rose-100 text-rose-600"
                          : "bg-sky-100 text-sky-600"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-xs text-stone-400">
                  Belum ada booking
                </div>
              )}
            </div>
            <div className="px-4 py-3 border-t border-stone-200">
              <Link
                href="/admin/commerce"
                className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors"
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
