import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { getProjectBriefDashboardStats } from "@/application/projectBriefService";
import { AppShell } from "@/components/layout/AppShell";
import {
  Package,
  Target,
  Search,
  ShieldAlert,
  Megaphone,
  Lightbulb,
  Building2,
  MapPin,
  ArrowRight,
  Plus,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    include: {
      actors: {
        where: { status: { not: "ARCHIVED" } },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
  });

  const primaryActor = profile?.actors?.[0];

  if (!primaryActor) {
    redirect("/register");
  }

  const [
    assetCount,
    goalCount,
    needCount,
    constraintCount,
    opportunityCount,
    collaborationCount,
    outcomeCount,
    briefStats,
  ] = await Promise.all([
    prisma.asset.count({ where: { actorId: primaryActor.id } }),
    prisma.goal.count({ where: { actorId: primaryActor.id } }),
    prisma.need.count({ where: { actorId: primaryActor.id } }),
    prisma.constraint.count({ where: { actorId: primaryActor.id } }),
    prisma.opportunity.count(),
    prisma.collaboration.count({
      where: {
        participants: { some: { actorId: primaryActor.id } },
      },
    }),
    prisma.outcome.count(),
    getProjectBriefDashboardStats(primaryActor.id),
  ]);

  const inputModules = [
    {
      href: "/assets",
      icon: <Package className="w-6 h-6 text-primary-400" />,
      label: "Aset",
      sublabel: "Kontribusi ke kolaborasi",
      count: assetCount,
      unit: "aset aktif",
      required: true,
    },
    {
      href: "/goals",
      icon: <Target className="w-6 h-6 text-primary-400" />,
      label: "Goal",
      sublabel: "Tujuan yang ingin dicapai",
      count: goalCount,
      unit: "goal aktif",
      required: true,
    },
    {
      href: "/needs",
      icon: <Search className="w-6 h-6 text-primary-400" />,
      label: "Kebutuhan",
      sublabel: "Yang dibutuhkan dari rekan",
      count: needCount,
      unit: "kebutuhan aktif",
      required: false,
    },
    {
      href: "/constraints",
      icon: <ShieldAlert className="w-6 h-6 text-primary-400" />,
      label: "Batasan",
      sublabel: "Constraint operasional & kapasitas",
      count: constraintCount,
      unit: "constraint",
      required: false,
    },
  ];

  return (
    <AppShell actor={primaryActor} activeRoute="/dashboard">
      <section className="p-8 rounded-3xl bg-neutral-900/90 border border-neutral-800 relative overflow-hidden space-y-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-950 border border-primary-700/50 text-xs font-semibold text-primary-300">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
              Creative Ecosystem Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-100 tracking-tight">
              Selamat Datang, {primaryActor.name}!
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl leading-relaxed">
              Dua mode kolaborasi aktif: <strong>Opportunity Engine</strong> (penemuan berbasis komplementaritas aset) dan <strong>Project Briefs</strong> (inisiasi proyek terbuka lintas profesi).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="p-4 rounded-2xl bg-neutral-950 border border-primary-800/40 space-y-2 min-w-[180px]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-primary-400 uppercase tracking-wider">Project Briefs</span>
                <div className="flex items-center gap-1.5">
                  {briefStats.pendingInterestCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-neutral-950">
                      {briefStats.pendingInterestCount} Minat
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-primary-700 text-white">
                    {briefStats.openBriefCount}
                  </span>
                </div>
              </div>
              <Link
                href="/projects"
                className="inline-flex items-center justify-center w-full gap-1.5 px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs transition-colors"
              >
                <span>Galeri Proyek</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 min-w-[180px]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Peluang Engine</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-neutral-800 text-neutral-200 border border-neutral-700">
                  {opportunityCount}
                </span>
              </div>
              <Link
                href="/opportunities"
                className="inline-flex items-center justify-center w-full gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs transition-colors"
              >
                <span>Katalog Peluang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 min-w-[180px]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Kolaborasi Aktif</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-neutral-800 text-neutral-200 border border-neutral-700">
                  {collaborationCount}
                </span>
              </div>
              <Link
                href="/collaborations"
                className="inline-flex items-center justify-center w-full gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs transition-colors"
              >
                <span>Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-primary-400" />
              <h2 className="text-lg font-bold text-neutral-100 tracking-tight">Project Briefs Terbuka</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-950 text-primary-300 border border-primary-700/50">
                Mode Kolaboratif
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Inisiasi proyek baru atau bergabung ke proyek yang sedang mencari peran dan kapabilitas Anda.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/projects/new"
              className="px-3.5 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Inisiasi Brief Baru</span>
            </Link>
            <Link
              href="/projects"
              className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white transition-colors inline-flex items-center gap-1.5"
            >
              <span>Lihat Semua ({briefStats.openBriefCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {briefStats.recentOpenBriefs.length === 0 ? (
          <div className="p-8 rounded-2xl bg-neutral-900/40 border border-dashed border-neutral-800 text-center space-y-3">
            <div className="flex justify-center">
              <Lightbulb className="w-8 h-8 text-neutral-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-200">Belum ada brief terbuka dari pelaku kreatif lain</p>
              <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
                Mulai inisiasi project brief Anda sendiri untuk mengundang kolaborator seperti videografer, fotografer, atau desainer grafis.
              </p>
            </div>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold transition-all"
            >
              <span>Buat Project Brief Pertama Anda</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {briefStats.recentOpenBriefs.map((brief: any) => (
              <Link
                key={brief.id}
                href={`/projects/${brief.id}`}
                className="group p-5 rounded-2xl bg-neutral-900/80 hover:bg-neutral-900 border border-neutral-800 hover:border-primary-700/60 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded-md border border-neutral-800">
                      {brief.creatorActor.name}
                    </span>
                    <span className="text-[10px] text-primary-300 font-semibold">
                      {brief.neededRoles.filter((r: any) => !r.isFilled).length} peran dibuka
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-neutral-100 group-hover:text-primary-300 transition-colors line-clamp-1">
                    {brief.title}
                  </h3>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {brief.neededRoles.map((role: any) => (
                      <span
                        key={role.id}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${
                          role.isFilled
                            ? "bg-neutral-950 text-neutral-500 line-through border-neutral-900"
                            : "bg-primary-950/60 text-primary-300 border-primary-700/40"
                        }`}
                      >
                        {role.roleLabel}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
                  <span className="text-[11px] truncate max-w-[150px]">{brief.creatorActor.sector}</span>
                  <span className="text-primary-400 font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                    <span>Detail</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-100 tracking-tight">Input Layer — Data Profil Kreatif</h2>
            <p className="text-xs text-neutral-400">Fondasi data yang digunakan Opportunity Engine untuk menghitung komplementaritas.</p>
          </div>
          <span className="text-xs text-primary-400 font-mono">DATA_MODEL.md</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {inputModules.map((mod) => (
            <Link
              key={mod.href}
              href={mod.href}
              className="group p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-primary-700/60 hover:bg-neutral-900 transition-all duration-200 space-y-4 block"
            >
              <div className="flex items-start justify-between">
                <div className="text-2xl">{mod.icon}</div>
                {mod.required && (
                  <span className="text-[10px] font-bold text-primary-400 uppercase tracking-wider bg-primary-950 px-2 py-0.5 rounded border border-primary-800/40">
                    Utama
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-neutral-100 text-sm">{mod.label}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-neutral-950 text-neutral-300 border border-neutral-800">
                    {mod.count}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed line-clamp-1">{mod.sublabel}</p>
              </div>
              <div className="text-[11px] text-neutral-500 group-hover:text-primary-300 transition-colors font-medium">
                {mod.count === 0 ? (
                  <span className="inline-flex items-center gap-1">
                    <span>Klik untuk menambahkan</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                ) : (
                  `${mod.count} ${mod.unit}`
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-neutral-100 tracking-tight">Profil Aktor Terdaftar</h2>

        <div className="p-6 md:p-8 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-neutral-100">{primaryActor.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-950 text-primary-300 border border-primary-700/50">
                  {primaryActor.status}
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-mono">ID: {primaryActor.id}</p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300">
                <Building2 className="w-3.5 h-3.5 text-primary-400" />
                <span>{primaryActor.actorType}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300">
                <MapPin className="w-3.5 h-3.5 text-primary-400" />
                <span>{primaryActor.location || "Lokasi belum diisi"}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase text-neutral-500">Subsektor Ekonomi Kreatif</span>
              <p className="text-neutral-200 font-medium">{primaryActor.sector}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase text-neutral-500">Kontak Bisnis</span>
              <p className="text-neutral-200">{primaryActor.contactEmail || "-"}</p>
            </div>

            <div className="md:col-span-2 space-y-1">
              <span className="text-xs font-semibold uppercase text-neutral-500">Deskripsi Keahlian & Fokus</span>
              <p className="text-neutral-300 leading-relaxed text-xs sm:text-sm">
                {primaryActor.description || "Belum ada deskripsi yang ditambahkan."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
