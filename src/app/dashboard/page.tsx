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
  ArrowRight,
  Sparkles,
  Plus,
  Users,
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
    redirect("/onboarding");
  }

  const [
    assetCount,
    portfolioCount,
    goalCount,
    needCount,
    constraintCount,
    myOpportunityCount,
    totalOpportunityCount,
    myCollaborationCount,
    totalCollaborationCount,
    outcomeCount,
    briefStats,
    pendingBookingCount,
  ] = await Promise.all([
    prisma.asset.count({ where: { actorId: primaryActor.id, status: { not: "ARCHIVED" } } }),
    prisma.asset.count({ where: { actorId: primaryActor.id, category: "PORTFOLIO_WORK", status: { not: "ARCHIVED" } } }),
    prisma.goal.count({ where: { actorId: primaryActor.id } }),
    prisma.need.count({ where: { actorId: primaryActor.id } }),
    prisma.constraint.count({ where: { actorId: primaryActor.id } }),
    prisma.opportunityParticipant.count({ where: { actorId: primaryActor.id } }),
    prisma.opportunity.count(),
    prisma.collaboration.count({
      where: {
        participants: { some: { actorId: primaryActor.id } },
      },
    }),
    prisma.collaboration.count(),
    prisma.outcome.count(),
    getProjectBriefDashboardStats(primaryActor.id),
    prisma.bookingRequest.count({ where: { targetId: primaryActor.id, status: "PENDING" } }),
  ]);



  return (
    <AppShell actor={primaryActor} activeRoute="/dashboard">
      <div className="space-y-10 pb-12">
        {/* Welcome Hero Banner */}
        <section className="relative p-8 md:p-12 rounded-[32px] overflow-hidden bg-[#1E1B2E] border border-stone-800 shadow-2xl group">
          {/* Animated Background Mesh */}
          <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none">
            <div className="absolute -top-[40%] -left-[10%] w-[70%] h-[140%] rounded-full bg-gradient-to-tr from-amber-500/20 to-transparent blur-[120px] group-hover:opacity-60 transition-opacity duration-1000" />
            <div className="absolute top-[20%] -right-[20%] w-[60%] h-[120%] rounded-full bg-gradient-to-bl from-purple-500/20 to-transparent blur-[120px] group-hover:opacity-60 transition-opacity duration-1000" />
          </div>

          <div className="relative z-10 max-w-2xl space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-stone-300 backdrop-blur-md shadow-inner">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              Creative Opportunity Engine
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Selamat Datang,<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-200">
                {primaryActor.name}
              </span>
            </h1>
            <p className="text-sm md:text-base text-stone-400 leading-relaxed font-light">
              Sistem RAMU secara deterministik mencocokkan gaya visual, ketersediaan jadwal, dan kapasitas teknis untuk merangkai kolaborasi tingkat tinggi.
            </p>
          </div>
        </section>

        {/* Quick Creator Actions */}
        <section className="flex flex-wrap items-center gap-3">
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1E1B2E] hover:bg-black text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Buat Project Brief Baru</span>
          </Link>
          <Link
            href="/dashboard/showcase"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-stone-50 text-[#1E1B2E] border border-stone-200 text-xs font-bold shadow-2xs transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Unggah Karya Portofolio</span>
          </Link>
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-stone-50 text-[#1E1B2E] border border-stone-200 text-xs font-bold shadow-2xs transition-all hover:scale-[1.02]"
          >
            <Users className="w-4 h-4 text-stone-500" />
            <span>Jelajahi Direktori Talenta</span>
          </Link>
        </section>

        {/* Onboarding Quick Guidance if parameters are incomplete */}
        {(assetCount === 0 || goalCount === 0) && (
          <div className="p-6 rounded-[28px] bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-[#1E1B2E]">Kesiapan Engine Kolaborasi</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">Perlu Dilengkapi</span>
              </div>
              <p className="text-xs text-stone-600 font-light">
                {assetCount === 0 && goalCount === 0
                  ? "Daftarkan aset/peralatan dan target kreatif Anda untuk mengaktifkan kalkulasi sinergi dan rekomendasi peluang kolaborasi otomatis."
                  : assetCount === 0
                  ? "Tambahkan minimal satu aset atau keahlian agar engine RAMU dapat mencocokkan Anda dengan proyek kolaborasi yang membutuhkan peran Anda."
                  : "Tetapkan target kreatif atau bisnis Anda untuk mendapatkan rekomendasi kolaborator dengan visi selaras."}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {assetCount === 0 && (
                <Link
                  href="/readiness?tab=assets"
                  className="px-4 py-2 rounded-xl bg-[#1E1B2E] text-white text-xs font-bold hover:bg-black transition-colors"
                >
                  + Tambah Aset
                </Link>
              )}
              {goalCount === 0 && (
                <Link
                  href="/readiness?tab=goals"
                  className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-[#1E1B2E] text-xs font-bold hover:bg-stone-50 transition-colors"
                >
                  + Pasang Target
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Action Modules Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-bold text-[#1E1B2E] uppercase tracking-widest">
              Ruang Kendali
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            
            {/* Project Briefs */}
            <Link href="/projects" className="group flex flex-col justify-between p-5 rounded-3xl bg-white border border-stone-200 hover:border-stone-300 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-500 group-hover:bg-stone-100 group-hover:text-[#1E1B2E] transition-colors">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1E1B2E] uppercase tracking-wider mb-1">Project Briefs</h3>
                  <p className="text-[11px] text-stone-500 font-medium">Buka galeri brief proyek.</p>
                </div>
              </div>
              <div className="mt-8 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-[#1E1B2E] text-white shadow-sm">
                    {briefStats.openBriefCount}
                  </span>
                  {briefStats.pendingInterestCount > 0 && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                      {briefStats.pendingInterestCount} Minat
                    </span>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#1E1B2E] transition-colors group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Opportunities */}
            <Link href="/opportunities?scope=my" className="group flex flex-col justify-between p-5 rounded-3xl bg-white border border-stone-200 hover:border-stone-300 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-500 group-hover:bg-[#1E1B2E] group-hover:text-white transition-colors">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1E1B2E] uppercase tracking-wider mb-1">Peluang Sinergi</h3>
                  <p className="text-[11px] text-stone-500 font-medium">Rekomendasi kecocokan aset Anda.</p>
                </div>
              </div>
              <div className="mt-8 flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                  myOpportunityCount > 0 ? "bg-amber-100 text-amber-900 font-bold" : "bg-stone-100 text-stone-600"
                }`}>
                  {myOpportunityCount > 0 ? `${myOpportunityCount} Cocok` : "Eksplorasi"}
                </span>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#1E1B2E] transition-colors group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Collaborations */}
            <Link href="/collaborations" className="group flex flex-col justify-between p-5 rounded-3xl bg-white border border-stone-200 hover:border-stone-300 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1E1B2E] uppercase tracking-wider mb-1">Kolaborasi</h3>
                  <p className="text-[11px] text-stone-500 font-medium">Workspace kolaborasi aktif.</p>
                </div>
              </div>
              <div className="mt-8 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-700">
                  {myCollaborationCount} Aktif
                </span>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-indigo-600 transition-colors group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Bookings */}
            <Link href="/dashboard/bookings" className="group flex flex-col justify-between p-5 rounded-3xl bg-[#1E1B2E] border border-stone-800 shadow-sm hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-1 transition-all duration-300">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white/80 group-hover:bg-white/20 group-hover:text-white transition-colors">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Pesanan Masuk</h3>
                  <p className="text-[11px] text-stone-400 font-medium">Booking layanan & studio.</p>
                </div>
              </div>
              <div className="mt-8 flex items-center justify-between">
                {pendingBookingCount > 0 ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-400 text-amber-950 animate-pulse shadow-[0_0_12px_rgba(251,191,36,0.3)]">
                    {pendingBookingCount} Baru
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/10 text-stone-400">
                    Tidak ada
                  </span>
                )}
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-white transition-colors group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Portfolio / Showcase */}
            <Link href="/dashboard/showcase" className="group flex flex-col justify-between p-5 rounded-3xl bg-gradient-to-br from-amber-500 to-[#E66A48] border border-transparent shadow-md hover:shadow-[0_20px_40px_rgba(230,106,72,0.25)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-150 transition-transform duration-700">
                <Sparkles className="w-24 h-24 text-white" />
              </div>
              <div className="space-y-4 relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner transition-colors">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Portofolio</h3>
                  <p className="text-[11px] text-white/80 font-medium">Manajemen showcase visual.</p>
                </div>
              </div>
              <div className="mt-8 flex items-center justify-between relative z-10">
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-white/20 backdrop-blur-md text-white border border-white/30">
                  {portfolioCount} Karya
                </span>
                <ArrowRight className="w-4 h-4 text-white/80 group-hover:text-white transition-colors group-hover:translate-x-1" />
              </div>
            </Link>

          </div>
        </section>

        {/* Engine Parameters & Readiness */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-sm font-bold text-[#1E1B2E] uppercase tracking-widest">
                Kesiapan Kolaborasi Profil
              </h2>
              <p className="text-xs text-[#716B7E] mt-0.5">
                Engine RAMU memadukan 4 pilar kesiapan ini untuk mencocokkan Anda dengan mitra kolaborasi yang komplementer dan realistis.
              </p>
            </div>
            <Link
              href="/readiness"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100/70 border border-amber-200/80 px-3 py-1.5 rounded-xl transition-all"
            >
              <span>Pusat Kesiapan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Assets */}
            <Link
              href="/readiness?tab=assets"
              className="p-5 rounded-[24px] bg-white border border-stone-200 hover:border-amber-400 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700 group-hover:scale-105 transition-transform">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#1E1B2E] uppercase tracking-wider">Aset &amp; Modal Kreatif</h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">Kamera, cyclorama studio, busana, atau skill.</p>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-sm font-black text-[#1E1B2E]">{assetCount} Terdaftar</span>
                <span className="text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Kelola <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>

            {/* Goals */}
            <Link
              href="/readiness?tab=goals"
              className="p-5 rounded-[24px] bg-white border border-stone-200 hover:border-purple-400 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-700 group-hover:scale-105 transition-transform">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#1E1B2E] uppercase tracking-wider">Target Capaian</h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">Editorial, komersial, atau ekspansi brand.</p>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-sm font-black text-[#1E1B2E]">{goalCount} Sasaran</span>
                <span className="text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Kelola <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>

            {/* Needs */}
            <Link
              href="/readiness?tab=needs"
              className="p-5 rounded-[24px] bg-white border border-stone-200 hover:border-blue-400 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-700 group-hover:scale-105 transition-transform">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#1E1B2E] uppercase tracking-wider">Kebutuhan Mitra</h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">Peran atau mitra yang sedang Anda cari.</p>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-sm font-black text-[#1E1B2E]">{needCount} Kebutuhan</span>
                <span className="text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Kelola <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>

            {/* Constraints */}
            <Link
              href="/readiness?tab=constraints"
              className="p-5 rounded-[24px] bg-white border border-stone-200 hover:border-rose-400 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-700 group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#1E1B2E] uppercase tracking-wider">Ketentuan &amp; Batasan</h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">Batas budget, waktu persiapan, dan ketersediaan.</p>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-sm font-black text-[#1E1B2E]">{constraintCount} Ketentuan</span>
                <span className="text-xs font-bold text-rose-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Kelola <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* Platform Stats */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-bold text-[#1E1B2E] uppercase tracking-widest">
              Statistik Global Platform
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-[24px] bg-[#1E1B2E] border border-stone-800 flex flex-col justify-between group hover:border-stone-700 transition-colors">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Total Peluang Aktif</span>
              <div className="mt-4 text-5xl font-light text-white tracking-tighter group-hover:scale-105 origin-left transition-transform duration-500">
                {totalOpportunityCount}
              </div>
            </div>
            <div className="p-6 rounded-[24px] bg-stone-50 border border-stone-200 flex flex-col justify-between group hover:bg-white transition-colors hover:shadow-md">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">Total Kolaborasi Ekosistem</span>
              <div className="mt-4 text-5xl font-light text-[#1E1B2E] tracking-tighter group-hover:scale-105 origin-left transition-transform duration-500">
                {totalCollaborationCount}
              </div>
            </div>
            <div className="p-6 rounded-[24px] bg-stone-50 border border-stone-200 flex flex-col justify-between group hover:bg-white transition-colors hover:shadow-md">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">Karya Dihasilkan</span>
              <div className="mt-4 text-5xl font-light text-[#1E1B2E] tracking-tighter group-hover:scale-105 origin-left transition-transform duration-500">
                {outcomeCount}
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
