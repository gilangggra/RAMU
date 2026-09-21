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
      icon: <Package className="w-6 h-6 text-[#E66A48]" />,
      label: "Aset",
      sublabel: "Kontribusi ke kolaborasi",
      count: assetCount,
      unit: "aset aktif",
      required: true,
      color: "from-[#FFE9DE] to-[#FFF4ED]",
    },
    {
      href: "/goals",
      icon: <Target className="w-6 h-6 text-[#7C3AED]" />,
      label: "Goal",
      sublabel: "Tujuan yang ingin dicapai",
      count: goalCount,
      unit: "goal aktif",
      required: true,
      color: "from-[#EDE8FF] to-[#F3EDFF]",
    },
    {
      href: "/needs",
      icon: <Search className="w-6 h-6 text-[#0D9488]" />,
      label: "Kebutuhan",
      sublabel: "Yang dibutuhkan dari rekan",
      count: needCount,
      unit: "kebutuhan aktif",
      required: false,
      color: "from-[#E0F7F0] to-[#F0FDF9]",
    },
    {
      href: "/constraints",
      icon: <ShieldAlert className="w-6 h-6 text-[#E59F00]" />,
      label: "Batasan",
      sublabel: "Constraint operasional & kapasitas",
      count: constraintCount,
      unit: "constraint",
      required: false,
      color: "from-[#FFFDE6] to-[#FFF7ED]",
    },
  ];

  return (
    <AppShell actor={primaryActor} activeRoute="/dashboard">
      {/* Welcome Hero Banner */}
      <section className="p-8 sm:p-10 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_12px_36px_rgba(39,33,61,0.04)] relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#FFE4D6]/40 via-[#EDE8FF]/30 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF7ED] border border-[#F9D8C4] text-xs font-bold text-[#E66A48] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#E66A48] animate-pulse" />
              Creative Ecosystem Hub
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#27213D] tracking-tight">
              Selamat Datang, {primaryActor.name}!
            </h1>
            <p className="text-xs sm:text-sm text-[#716B7E] max-w-xl leading-relaxed">
              Dua mode kolaborasi aktif di RAMU: <strong>Opportunity Engine</strong> (penemuan berbasis komplementaritas aset) dan <strong>Project Briefs</strong> (inisiasi proyek terbuka lintas talenta).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            {/* Project Briefs module */}
            <div className="p-4 rounded-2xl bg-[#FFF7ED]/70 border border-[#F9D8C4] space-y-2 min-w-[190px] w-full sm:w-auto shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#E66A48] uppercase tracking-wider">Project Briefs</span>
                <div className="flex items-center gap-1.5">
                  {briefStats.pendingInterestCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFB800] text-[#27213D]">
                      {briefStats.pendingInterestCount} Minat
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-[#E66A48] text-white">
                    {briefStats.openBriefCount}
                  </span>
                </div>
              </div>
              <Link
                href="/projects"
                className="inline-flex items-center justify-center w-full gap-1.5 px-3 py-2 rounded-xl bg-[#E66A48] hover:bg-[#D45938] text-white font-bold text-xs transition-colors shadow-xs"
              >
                <span>Galeri Proyek</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Opportunities module */}
            <div className="p-4 rounded-2xl bg-[#EDE8FF]/70 border border-[#DDD6FE] space-y-2 min-w-[190px] w-full sm:w-auto shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#7C3AED] uppercase tracking-wider">Peluang Engine</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-[#7C3AED] text-white">
                  {opportunityCount}
                </span>
              </div>
              <Link
                href="/opportunities"
                className="inline-flex items-center justify-center w-full gap-1.5 px-3 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs transition-colors shadow-xs"
              >
                <span>Katalog Peluang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Collaborations module */}
            <div className="p-4 rounded-2xl bg-[#E0F7F0]/70 border border-[#99F6E4] space-y-2 min-w-[190px] w-full sm:w-auto shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#0D9488] uppercase tracking-wider">Kolaborasi Aktif</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-[#0D9488] text-white">
                  {collaborationCount}
                </span>
              </div>
              <Link
                href="/collaborations"
                className="inline-flex items-center justify-center w-full gap-1.5 px-3 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs transition-colors shadow-xs"
              >
                <span>Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Project Briefs Terbuka */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#E66A48]" />
              <h2 className="text-lg font-bold text-[#27213D] tracking-tight">Project Briefs Terbuka</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF7ED] text-[#E66A48] border border-[#F9D8C4]">
                Mode Kolaboratif
              </span>
            </div>
            <p className="text-xs text-[#716B7E] mt-0.5">
              Inisiasi proyek baru atau bergabung ke proyek yang sedang mencari peran dan kapabilitas Anda.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/projects/new"
              className="px-3.5 py-2 rounded-xl bg-[#E66A48] hover:bg-[#D45938] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Inisiasi Brief Baru</span>
            </Link>
            <Link
              href="/projects"
              className="px-3 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-xs font-semibold text-[#27213D] transition-colors inline-flex items-center gap-1.5 shadow-2xs"
            >
              <span>Lihat Semua ({briefStats.openBriefCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {briefStats.recentOpenBriefs.length === 0 ? (
          <div className="p-10 rounded-3xl bg-white/95 border border-dashed border-stone-300 text-center space-y-3 shadow-xs">
            <div className="flex justify-center">
              <Lightbulb className="w-8 h-8 text-[#FFB800]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#27213D]">Belum ada brief terbuka dari pelaku kreatif lain</p>
              <p className="text-xs text-[#716B7E] mt-1 max-w-md mx-auto">
                Mulai inisiasi project brief Anda sendiri untuk mengundang kolaborator seperti videografer, fotografer, atau desainer grafis.
              </p>
            </div>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E66A48] hover:bg-[#D45938] text-white text-xs font-bold transition-all shadow-xs"
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
                className="group p-5 rounded-2xl bg-white/95 hover:bg-white border border-stone-200/80 hover:border-[#E66A48]/50 transition-all shadow-xs hover:shadow-md space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-[#716B7E] bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                      {brief.creatorActor.name}
                    </span>
                    <span className="text-[10px] text-[#E66A48] font-bold">
                      {brief.neededRoles.filter((r: any) => !r.isFilled).length} peran dibuka
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-[#27213D] group-hover:text-[#E66A48] transition-colors line-clamp-1">
                    {brief.title}
                  </h3>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {brief.neededRoles.map((role: any) => (
                      <span
                        key={role.id}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${
                          role.isFilled
                            ? "bg-stone-100 text-stone-400 line-through border-stone-200"
                            : "bg-[#FFF7ED] text-[#E66A48] border-[#F9D8C4]"
                        }`}
                      >
                        {role.roleLabel}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-[#716B7E]">
                  <span className="text-[11px] truncate max-w-[150px]">{brief.creatorActor.sector}</span>
                  <span className="text-[#E66A48] font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                    <span>Detail</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Input Layer — Data Profil Kreatif */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#27213D] tracking-tight">Input Layer — Data Profil Kreatif</h2>
            <p className="text-xs text-[#716B7E]">Fondasi data yang digunakan Opportunity Engine untuk menghitung komplementaritas.</p>
          </div>
          <span className="text-xs text-[#E66A48] font-mono font-medium">DATA_MODEL.md</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {inputModules.map((mod) => (
            <Link
              key={mod.href}
              href={mod.href}
              className="group p-5 rounded-2xl bg-white/95 border border-stone-200/80 hover:border-stone-300 hover:shadow-md transition-all duration-200 space-y-4 block shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-xl bg-stone-50 border border-stone-100 group-hover:scale-105 transition-transform">
                  {mod.icon}
                </div>
                {mod.required && (
                  <span className="text-[10px] font-bold text-[#E66A48] uppercase tracking-wider bg-[#FFF7ED] px-2 py-0.5 rounded-md border border-[#F9D8C4]">
                    Utama
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#27213D] text-sm">{mod.label}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-[#27213D] border border-stone-200">
                    {mod.count}
                  </span>
                </div>
                <p className="text-xs text-[#716B7E] leading-relaxed line-clamp-1">{mod.sublabel}</p>
              </div>
              <div className="text-[11px] text-[#9E98A8] group-hover:text-[#E66A48] transition-colors font-medium">
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

      {/* Profil Aktor Terdaftar */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-[#27213D] tracking-tight">Profil Aktor Terdaftar</h2>

        <div className="p-6 md:p-8 rounded-[28px] bg-white/95 border border-stone-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-[#27213D]">{primaryActor.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E0F7F0] text-[#0D9488] border border-[#99F6E4]">
                  {primaryActor.status}
                </span>
              </div>
              <p className="text-xs text-[#9E98A8] font-mono">ID: {primaryActor.id}</p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-[#27213D]">
                <Building2 className="w-3.5 h-3.5 text-[#E66A48]" />
                <span>{primaryActor.actorType}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-[#27213D]">
                <MapPin className="w-3.5 h-3.5 text-[#E66A48]" />
                <span>{primaryActor.location || "Lokasi belum diisi"}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase text-[#9E98A8]">Subsektor Ekonomi Kreatif</span>
              <p className="text-[#27213D] font-medium">{primaryActor.sector}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase text-[#9E98A8]">Kontak Bisnis</span>
              <p className="text-[#27213D]">{primaryActor.contactEmail || "-"}</p>
            </div>

            <div className="md:col-span-2 space-y-1">
              <span className="text-xs font-semibold uppercase text-[#9E98A8]">Deskripsi Keahlian & Fokus</span>
              <p className="text-[#716B7E] leading-relaxed text-xs sm:text-sm">
                {primaryActor.description || "Belum ada deskripsi yang ditambahkan."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
