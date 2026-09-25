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
    pendingBookingCount,
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
            <Link href="/opportunities" className="group flex flex-col justify-between p-5 rounded-3xl bg-white border border-stone-200 hover:border-stone-300 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-500 group-hover:bg-[#1E1B2E] group-hover:text-white transition-colors">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1E1B2E] uppercase tracking-wider mb-1">Peluang Engine</h3>
                  <p className="text-[11px] text-stone-500 font-medium">Cari kandidat & kolaborator.</p>
                </div>
              </div>
              <div className="mt-8 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-stone-100 text-stone-600">
                  {opportunityCount} Matches
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
                  {collaborationCount} Aktif
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
                  {assetCount} Karya
                </span>
                <ArrowRight className="w-4 h-4 text-white/80 group-hover:text-white transition-colors group-hover:translate-x-1" />
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
                {opportunityCount}
              </div>
            </div>
            <div className="p-6 rounded-[24px] bg-stone-50 border border-stone-200 flex flex-col justify-between group hover:bg-white transition-colors hover:shadow-md">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">Total Kolaborasi</span>
              <div className="mt-4 text-5xl font-light text-[#1E1B2E] tracking-tighter group-hover:scale-105 origin-left transition-transform duration-500">
                {collaborationCount}
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
