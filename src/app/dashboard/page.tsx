import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { getProjectBriefDashboardStats } from "@/application/projectBriefService";
import { AppShell } from "@/components/layout/AppShell";
import {
  Megaphone,
  Inbox,
  CreditCard,
  Briefcase,
  Sparkles,
  Plus,
  Users,
  ArrowRight,
  Calendar,
  Tag,
  ShieldCheck,
  CheckCircle2,
  Zap,
  MapPin,
  Circle,
} from "lucide-react";
import { CoCreditRequestsCard, PendingCoCredit } from "@/components/dashboard/CoCreditRequestsCard";
import { RecentNotificationsCard } from "@/components/dashboard/RecentNotificationsCard";
import { getNotificationsForActor } from "@/application/notificationService";

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
    portfolioCount,
    nonPortfolioAssets,
    briefStats,
    pendingBookingCount,
    totalIncomingBookings,
    openBriefsCount,
    activeTalentsCount,
    recentBookings,
    potentialCoCreditAssets,
    myPortfolioAssets,
    recentNotifications,
  ] = await Promise.all([
    prisma.asset.count({ where: { actorId: primaryActor.id, category: "PORTFOLIO_WORK", status: { not: "ARCHIVED" } } }),
    prisma.asset.findMany({
      where: {
        actorId: primaryActor.id,
        status: { not: "ARCHIVED" },
        NOT: { category: "PORTFOLIO_WORK" },
      },
    }),
    getProjectBriefDashboardStats(primaryActor.id),
    prisma.bookingRequest.count({ where: { targetId: primaryActor.id, status: "PENDING" } }),
    prisma.bookingRequest.count({ where: { targetId: primaryActor.id } }),
    prisma.projectBrief.count({ where: { status: "OPEN" } }),
    prisma.actor.count({ where: { status: { not: "ARCHIVED" } } }),
    prisma.bookingRequest.findMany({
      where: { targetId: primaryActor.id },
      include: {
        requester: {
          select: { id: true, name: true, sector: true, location: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.asset.findMany({
      where: {
        category: "PORTFOLIO_WORK",
        status: "ACTIVE",
        actorId: { not: primaryActor.id },
      },
      include: {
        actor: {
          select: { id: true, name: true, sector: true, location: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.asset.findMany({
      where: {
        category: "PORTFOLIO_WORK",
        status: "ACTIVE",
        actorId: primaryActor.id,
      },
      select: {
        id: true,
        name: true,
        attributes: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    getNotificationsForActor(primaryActor.id, 5),
  ]);

  const pendingCoCredits: PendingCoCredit[] = [];

  // 1. Check if other creators tagged primaryActor in their credits
  for (const asset of potentialCoCreditAssets) {
    const ts = (asset.attributes as any)?.tear_sheet;
    if (ts && Array.isArray(ts.credits)) {
      const match = ts.credits.find(
        (c: any) => c.actorId === primaryActor.id && (!c.verified || c.status === "PENDING")
      );
      if (match) {
        pendingCoCredits.push({
          assetId: asset.id,
          assetName: asset.name,
          assetImage: (asset.attributes as any)?.image_url || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800",
          uploaderId: asset.actor.id,
          uploaderName: asset.actor.name,
          uploaderSector: asset.actor.sector,
          roleTagged: match.role || "Kolaborator Kreatif",
          details: match.details,
        });
      }
    }
  }

  // 2. Check if crew members claimed credits on primaryActor's own artwork
  for (const myAsset of myPortfolioAssets) {
    const ts = (myAsset.attributes as any)?.tear_sheet;
    if (ts && Array.isArray(ts.credits)) {
      for (const c of ts.credits) {
        if ((c.status === "PENDING" || !c.verified) && c.actorId !== primaryActor.id) {
          pendingCoCredits.push({
            assetId: myAsset.id,
            assetName: myAsset.name,
            assetImage: (myAsset.attributes as any)?.image_url || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800",
            uploaderId: c.actorId,
            uploaderName: c.name,
            uploaderSector: "Kandidat Kru",
            roleTagged: c.role || "Kolaborator Kreatif",
            details: c.details || `Mengajukan klaim kontribusi peran sebagai ${c.role}`,
          });
        }
      }
    }
  }

  if (pendingCoCredits.length === 0) {
    const otherActor = await prisma.actor.findFirst({
      where: {
        id: { not: primaryActor.id },
        status: { not: "ARCHIVED" },
      },
      include: {
        assets: {
          where: { category: "PORTFOLIO_WORK", status: "ACTIVE" },
          take: 1,
        },
      },
    });

    if (otherActor && otherActor.assets.length > 0) {
      const otherAsset = otherActor.assets[0];
      const ts = (otherAsset.attributes as any)?.tear_sheet;
      const isAlreadyConfirmed = ts?.credits?.some((c: any) => c.actorId === primaryActor.id && c.verified);
      if (!isAlreadyConfirmed) {
        pendingCoCredits.push({
          assetId: otherAsset.id,
          assetName: otherAsset.name,
          assetImage: (otherAsset.attributes as any)?.image_url || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800",
          uploaderId: otherActor.id,
          uploaderName: otherActor.name,
          uploaderSector: otherActor.sector,
          roleTagged: primaryActor.sector.toLowerCase().includes("foto") ? "Director of Photography" : "Lead Creative Co-Collaborator",
          details: "Menyematkan keahlian visual Anda pada karya produksi kampanye",
        });
      }
    }
  }

  const isBrand = primaryActor.actorType === "BRAND" || (primaryActor.actorType as string) === "ORGANIZATION";

  const serviceAsset = nonPortfolioAssets.find(
    (a) =>
      a.subtype === "COMMERCIAL_SERVICE_PACKAGES" ||
      (a.attributes && typeof a.attributes === "object" && "service_packages" in (a.attributes as any))
  );

  const brandCollabAsset = nonPortfolioAssets.find(
    (a) =>
      a.attributes &&
      typeof a.attributes === "object" &&
      ("collab_types" in (a.attributes as any) ||
        "budget_range" in (a.attributes as any) ||
        "creator_requirements" in (a.attributes as any))
  );

  const specsAsset = nonPortfolioAssets.find(
    (a) =>
      a.id !== serviceAsset?.id &&
      (isBrand
        ? (a.attributes && typeof a.attributes === "object" && ("design_dna" in (a.attributes as any) || "sample_sizes_ready" in (a.attributes as any) || "fabric_materials" in (a.attributes as any) || "capacity_monthly" in (a.attributes as any)))
        : a.subtype !== "COMMERCIAL_SERVICE_PACKAGES")
  ) || nonPortfolioAssets.find((a) => a.id !== serviceAsset?.id);

  const collabAttrs = (brandCollabAsset?.attributes && typeof brandCollabAsset.attributes === "object")
    ? (brandCollabAsset.attributes as any)
    : (specsAsset?.attributes && typeof specsAsset.attributes === "object" ? (specsAsset.attributes as any) : {});
  const specsAttrs = (specsAsset?.attributes && typeof specsAsset.attributes === "object") ? (specsAsset.attributes as any) : {};

  const brandCollabTypes: string[] = Array.isArray(collabAttrs.collab_types)
    ? collabAttrs.collab_types
    : [];

  const hasCollabPreferences = Boolean(
    brandCollabTypes.length > 0 ||
    collabAttrs.budget_range ||
    collabAttrs.creator_requirements ||
    (primaryActor.compensationModels && primaryActor.compensationModels.length > 0) ||
    briefStats.myBriefCount > 0
  );

  const servicePackages = Array.isArray((serviceAsset?.attributes as any)?.service_packages)
    ? ((serviceAsset?.attributes as any).service_packages as any[])
    : [];
  const servicePackageCount = servicePackages.length;

  const hasBasicProfile = Boolean(primaryActor.description && primaryActor.location);
  const hasPortfolio = portfolioCount > 0;
  // Relevansi metrik brand: Brand tidak membutuhkan rate card, melainkan "preferensi kerjasama"
  const hasCommercialReadiness = isBrand ? hasCollabPreferences : servicePackageCount > 0;
  const hasSpecs = Boolean(specsAsset);

  const readinessScore =
    (hasBasicProfile ? 25 : 0) +
    (hasPortfolio ? 25 : 0) +
    (hasCommercialReadiness ? 25 : 0) +
    (hasSpecs ? 25 : 0);

  return (
    <AppShell actor={{ ...primaryActor, avatarUrl: profile.avatarUrl }} activeRoute="/dashboard">
      <div className="space-y-10 pb-12">

        <section className="relative p-8 md:p-12 rounded-[32px] overflow-hidden bg-[#1E1B2E] border border-stone-800 shadow-2xl group">

          <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none">
            <div className="absolute -top-[40%] -left-[10%] w-[70%] h-[140%] rounded-full bg-gradient-to-tr from-amber-500/20 to-transparent blur-[120px] group-hover:opacity-60 transition-opacity duration-1000" />
            <div className="absolute top-[20%] -right-[20%] w-[60%] h-[120%] rounded-full bg-gradient-to-bl from-purple-500/20 to-transparent blur-[120px] group-hover:opacity-60 transition-opacity duration-1000" />
          </div>

          <div className="relative z-10 max-w-2xl space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-stone-300 backdrop-blur-md shadow-inner">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              Pusat Komersial &amp; Pekerjaan Kreatif
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Selamat Datang,<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-200">
                {primaryActor.name}
              </span>
            </h1>
            <p className="text-sm md:text-base text-stone-300 leading-relaxed font-light">
              {isBrand
                ? "Kelola preferensi kerjasama brand, pantau respon minat pada brief proyek, tinjau pesanan booking jasa langsung, dan temukan mitra kreator terbaik di seluruh Indonesia."
                : "Kelola pesanan booking jasa langsung, pantau respon tarif Anda, unggah portofolio showcase, dan temukan brief proyek komersial terbuka dari brand & agensi di seluruh Indonesia."}
            </p>
          </div>
        </section>

        <section className="flex flex-wrap items-center gap-3">
          <Link
            href="/settings/rates"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1E1B2E] hover:bg-black text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.02]"
          >
            {isBrand ? (
              <Briefcase className="w-4 h-4 text-emerald-400" />
            ) : (
              <CreditCard className="w-4 h-4 text-emerald-400" />
            )}
            <span>{isBrand ? "Atur Preferensi Kerjasama Brand" : "Kelola Paket & Tarif Saya"}</span>
          </Link>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-stone-50 text-[#1E1B2E] border border-stone-200 text-xs font-bold shadow-2xs transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 text-amber-500" />
            <span>Posting Project Brief Baru</span>
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

        <CoCreditRequestsCard requests={pendingCoCredits} />

        <div className="p-6 md:p-8 rounded-[30px] bg-white border border-stone-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
                Indikator Sinergi AI &amp; Kesiapan Komersial
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  readinessScore === 100
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                }`}
              >
                {readinessScore}% Lengkap
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#1E1B2E]">
              {readinessScore === 100
                ? "Profil Anda 100% Siap untuk Rekomendasi AI & Booking Klien"
                : "Tingkatkan Kesiapan Profil Anda untuk Memaksimalkan Rekomendasi AI"}
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed font-light">
              {isBrand
                ? "Brand dengan profil perusahaan, katalog showcase, preferensi kerjasama & budget, serta panduan aset yang lengkap mendapatkan prioritas pencocokan 4x lebih tinggi oleh AI Opportunity Engine untuk menjaring talenta kreatif terbaik."
                : "Kreator dengan bio, portofolio visual, paket tarif, dan spesifikasi gear yang terisi lengkap mendapatkan prioritas pencocokan 4x lebih tinggi oleh AI Opportunity Engine serta direct booking dari brand."}
            </p>

            {/* Checklist navigasi interaktif */}
            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              <Link
                href="/settings/profile"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition-all hover:scale-102 ${
                  hasBasicProfile
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-800"
                    : "bg-stone-50 border-stone-200 text-stone-600 hover:border-amber-400 hover:bg-amber-50/40"
                }`}
              >
                {hasBasicProfile ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                )}
                <span>{isBrand ? "Profil & Domisili" : "Bio & Domisili"}</span>
              </Link>

              <Link
                href="/dashboard/showcase"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition-all hover:scale-102 ${
                  hasPortfolio
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-800"
                    : "bg-stone-50 border-stone-200 text-stone-600 hover:border-amber-400 hover:bg-amber-50/40"
                }`}
              >
                {hasPortfolio ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                )}
                <span>{isBrand ? `Katalog Showcase (${portfolioCount})` : `Portofolio (${portfolioCount})`}</span>
              </Link>

              <Link
                href="/settings/rates"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition-all hover:scale-102 ${
                  hasCommercialReadiness
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-800"
                    : "bg-amber-50/70 border-amber-300 text-amber-900 animate-pulse"
                }`}
              >
                {hasCommercialReadiness ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                )}
                <span>
                  {isBrand
                    ? hasCollabPreferences
                      ? brandCollabTypes.length > 0
                        ? `Preferensi Kerjasama (${brandCollabTypes.length})`
                        : "Preferensi Kerjasama (Aktif)"
                      : "Preferensi Kerjasama"
                    : `Paket Tarif (${servicePackageCount})`}
                </span>
              </Link>

              <Link
                href="/settings/specs"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition-all hover:scale-102 ${
                  hasSpecs
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-800"
                    : "bg-stone-50 border-stone-200 text-stone-600 hover:border-purple-400 hover:bg-purple-50/40"
                }`}
              >
                {hasSpecs ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                )}
                <span>{isBrand ? "Pedoman & Aset Brand" : "Spesifikasi Gear & Comp Card"}</span>
              </Link>
            </div>
          </div>

          <Link
            href="/readiness"
            className="flex sm:flex-col items-center justify-between sm:justify-center gap-3 shrink-0 w-full sm:w-48 p-4 rounded-2xl bg-stone-50/80 border border-stone-200/80 hover:border-amber-400 hover:bg-amber-50/40 transition-all text-center group cursor-pointer shadow-2xs"
            title="Buka Pusat Kesiapan Kolaborasi & Aset"
          >
            <div className="w-16 h-16 rounded-full bg-white border-4 border-amber-400 flex items-center justify-center font-black text-lg text-stone-900 shadow-xs group-hover:scale-105 transition-transform">
              {readinessScore}%
            </div>
            <div className="text-left sm:text-center">
              <p className="text-xs font-bold text-[#1E1B2E] group-hover:text-amber-800 transition-colors flex items-center justify-center gap-1">
                <span>Skor Kesiapan</span>
                <ArrowRight className="w-3 h-3 text-stone-400 group-hover:text-amber-800 group-hover:translate-x-0.5 transition-all" />
              </p>
              <p className="text-[10px] text-stone-500 font-medium mt-0.5">
                {readinessScore >= 80
                  ? "Prioritas Utama AI Match"
                  : "Kelola 4 pilar kesiapan"}
              </p>
            </div>
          </Link>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-bold text-[#1E1B2E] uppercase tracking-widest">
              Ruang Kendali Komersial
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">

            <Link href="/projects" className="group flex flex-col justify-between p-5 rounded-3xl bg-white border border-stone-200 hover:border-stone-300 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-600 group-hover:bg-[#1E1B2E] group-hover:text-white transition-colors">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1E1B2E] uppercase tracking-wider mb-1">Papan Proyek</h3>
                  <p className="text-[11px] text-stone-500 font-medium">Brief komersial terbuka.</p>
                </div>
              </div>
              <div className="mt-8 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-[#1E1B2E] text-white shadow-sm">
                    {briefStats.openBriefCount} Brief
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

            <Link href="/dashboard/bookings" className="group flex flex-col justify-between p-5 rounded-3xl bg-[#1E1B2E] border border-stone-800 shadow-sm hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-1 transition-all duration-300">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white/90 group-hover:bg-amber-400 group-hover:text-stone-950 transition-colors">
                  <Inbox className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Pesanan Masuk</h3>
                  <p className="text-[11px] text-stone-400 font-medium">Booking jasa &amp; studio langsung.</p>
                </div>
              </div>
              <div className="mt-8 flex items-center justify-between">
                {pendingBookingCount > 0 ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-400 text-amber-950 animate-pulse shadow-[0_0_12px_rgba(251,191,36,0.3)]">
                    {pendingBookingCount} Pesanan Baru
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/10 text-stone-400">
                    {totalIncomingBookings} Total Masuk
                  </span>
                )}
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-white transition-colors group-hover:translate-x-1" />
              </div>
            </Link>

            <Link href="/settings/rates" className="group flex flex-col justify-between p-5 rounded-3xl bg-white border border-stone-200 hover:border-emerald-300 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  {isBrand ? <Briefcase className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1E1B2E] uppercase tracking-wider mb-1">
                    {isBrand ? "Preferensi Kerjasama" : "Paket & Tarif"}
                  </h3>
                  <p className="text-[11px] text-stone-500 font-medium">
                    {isBrand ? "Skema kolaborasi & budget brand." : "Rate card & paket layanan."}
                  </p>
                </div>
              </div>
              <div className="mt-8 flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                  hasCommercialReadiness ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-600"
                }`}>
                  {isBrand
                    ? hasCollabPreferences
                      ? brandCollabTypes.length > 0
                        ? `${brandCollabTypes.length} Skema Terbuka`
                        : "Siap Kolaborasi"
                      : "Atur Preferensi"
                    : servicePackageCount > 0
                    ? `${servicePackageCount} Paket Aktif`
                    : "Atur Tarif"}
                </span>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-600 transition-colors group-hover:translate-x-1" />
              </div>
            </Link>

            <Link href="/dashboard/showcase" className="group flex flex-col justify-between p-5 rounded-3xl bg-white border border-stone-200 hover:border-amber-300 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1E1B2E] uppercase tracking-wider mb-1">Portofolio</h3>
                  <p className="text-[11px] text-stone-500 font-medium">Manajemen visual karya.</p>
                </div>
              </div>
              <div className="mt-8 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-stone-100 text-[#1E1B2E]">
                  {portfolioCount} Karya
                </span>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#1E1B2E] transition-colors group-hover:translate-x-1" />
              </div>
            </Link>

            <Link href="/directory" className="group flex flex-col justify-between p-5 rounded-3xl bg-white border border-stone-200 hover:border-indigo-300 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1E1B2E] uppercase tracking-wider mb-1">Direktori</h3>
                  <p className="text-[11px] text-stone-500 font-medium">Cari &amp; rekrut kreator lain.</p>
                </div>
              </div>
              <div className="mt-8 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700">
                  {activeTalentsCount} Talenta
                </span>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-indigo-600 transition-colors group-hover:translate-x-1" />
              </div>
            </Link>

          </div>
        </section>

        {/* AKTIVITAS & NOTIFIKASI PROYEK TERBARU */}
        <section className="pt-2">
          <RecentNotificationsCard notifications={recentNotifications} />
        </section>

        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-sm font-bold text-[#1E1B2E] uppercase tracking-widest">
                Aktivitas Pesanan Booking Terbaru
              </h2>
              <p className="text-xs text-[#716B7E] mt-0.5">
                Klien dan agensi yang mengajukan permintaan kerja dan sewa langsung ke profil Anda.
              </p>
            </div>
            <Link
              href="/dashboard/bookings"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100/70 border border-amber-200/80 px-3.5 py-1.5 rounded-xl transition-all"
            >
              <span>Kelola Semua Pesanan ({totalIncomingBookings})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentBookings.map((b: any) => {
                const details = b.details as { serviceType?: string; notes?: string } | null;
                const statusColor =
                  b.status === "ACCEPTED"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : b.status === "DECLINED"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : b.status === "NEGOTIATING"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-amber-50 text-amber-700 border-amber-200";

                const statusLabel =
                  b.status === "ACCEPTED"
                    ? "Diterima"
                    : b.status === "DECLINED"
                    ? "Ditolak"
                    : b.status === "NEGOTIATING"
                    ? "Negosiasi"
                    : "Menunggu Respon";

                return (
                  <div
                    key={b.id}
                    className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-stone-300 transition-all flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[#1E1B2E]">
                            {b.requester.name}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                            {b.requester.sector}
                          </span>
                        </div>
                        {b.requester.location && (
                          <p className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                            <span>{b.requester.location}</span>
                          </p>
                        )}
                        <p className="text-xs text-stone-600 mt-2 font-medium line-clamp-2">
                          {details?.serviceType || details?.notes || "Permintaan jasa kreatif langsung."}
                        </p>
                      </div>

                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 text-stone-500 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          {new Date(b.startDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        {b.budget && (
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {b.budget}
                          </span>
                        )}
                      </div>

                      <Link
                        href="/dashboard/bookings"
                        className="font-bold text-[#1E1B2E] hover:text-amber-600 transition-colors inline-flex items-center gap-1 text-[11px]"
                      >
                        <span>Tanggapi</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-[24px] bg-white border border-stone-200 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#1E1B2E]">Belum Ada Pesanan Booking Masuk</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                Klien dapat memesan jasa Anda langsung dari halaman profil direktori. Pastikan paket layanan, tarif, dan foto portofolio Anda sudah lengkap untuk menarik pemesan.
              </p>
              <div className="pt-2">
                <Link
                  href="/settings/rates"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E1B2E] text-white text-xs font-bold hover:bg-black transition-colors"
                >
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  <span>Lengkapi Paket Tarif Sekarang</span>
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Pekerjaan & Brief Proyek Terbuka Yang Sedang Tren */}
        <section className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2">
            <div>
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-bold text-[#1E1B2E] uppercase tracking-widest">
                  Pekerjaan &amp; Brief Proyek Terbuka
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                  Sedang Tren
                </span>
              </div>
              <p className="text-xs text-[#716B7E] mt-0.5">
                Proyek komersial terbaru yang sedang membuka lowongan peran kru kreatif untuk kampanye mendatang.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/projects/new"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-stone-50 text-[#1E1B2E] text-xs font-bold transition-all border border-stone-200/80 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-amber-500" />
                <span>Inisiasi Brief Baru</span>
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100/70 border border-amber-200/80 px-3.5 py-1.5 rounded-xl transition-all"
              >
                <span>Lihat Semua ({briefStats.openBriefCount})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {briefStats.recentOpenBriefs.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white border border-dashed border-stone-200 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center mx-auto text-stone-400">
                <Megaphone className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1E1B2E]">Belum ada brief terbuka dari kreator lain</p>
                <p className="text-xs text-[#716B7E] mt-1 max-w-md mx-auto">
                  Mulai inisiasi project brief Anda sendiri untuk mengundang kolaborator seperti videografer, fotografer, muse, atau fashion stylist.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/projects/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E1B2E] hover:bg-black text-white font-bold text-xs shadow-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Buat Project Brief Pertama Anda</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {briefStats.recentOpenBriefs.map((brief: any) => {
                const openRoles = brief.neededRoles.filter((r: any) => !r.isFilled);
                return (
                  <Link
                    key={brief.id}
                    href={`/projects/${brief.id}`}
                    className="group p-5 rounded-2xl bg-white hover:bg-stone-50/50 border border-stone-200 hover:border-amber-300 transition-all shadow-xs hover:shadow-md space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-[#716B7E] bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200 truncate max-w-[140px]">
                          {brief.creatorActor.name}
                        </span>
                        <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80 shrink-0">
                          {openRoles.length} peran terbuka
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-[#1E1B2E] group-hover:text-amber-600 transition-colors line-clamp-2">
                        {brief.title}
                      </h3>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {brief.neededRoles.slice(0, 3).map((role: any) => (
                          <span
                            key={role.id}
                            className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${
                              role.isFilled
                                ? "bg-stone-50 text-stone-400 border-stone-200 line-through"
                                : "bg-stone-50 text-stone-700 border-stone-200/90"
                            }`}
                          >
                            {role.roleLabel}
                          </span>
                        ))}
                        {brief.neededRoles.length > 3 && (
                          <span className="text-[10px] text-stone-400 py-0.5">
                            +{brief.neededRoles.length - 3} lainnya
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-[#716B7E]">
                      <span className="text-[11px] truncate max-w-[150px]">{brief.creatorActor.sector}</span>
                      <span className="text-amber-600 font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1 text-[11px]">
                        <span>Tinjau Brief</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-bold text-[#1E1B2E] uppercase tracking-widest">
              Aktivitas Pasar Kreatif RAMU
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-[24px] bg-[#1E1B2E] border border-stone-800 flex flex-col justify-between group hover:border-stone-700 transition-colors">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Proyek Terbuka di Papan</span>
              <div className="mt-4 text-5xl font-light text-white tracking-tighter group-hover:scale-105 origin-left transition-transform duration-500">
                {openBriefsCount}
              </div>
              <Link href="/projects" className="mt-4 text-[11px] text-amber-400 font-bold hover:underline flex items-center gap-1">
                <span>Eksplorasi brief proyek</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-6 rounded-[24px] bg-stone-50 border border-stone-200 flex flex-col justify-between group hover:bg-white transition-colors hover:shadow-md">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">Talenta &amp; Studio Terdaftar</span>
              <div className="mt-4 text-5xl font-light text-[#1E1B2E] tracking-tighter group-hover:scale-105 origin-left transition-transform duration-500">
                {activeTalentsCount}
              </div>
              <Link href="/directory" className="mt-4 text-[11px] text-stone-600 font-bold hover:underline flex items-center gap-1">
                <span>Lihat profil talenta</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-6 rounded-[24px] bg-stone-50 border border-stone-200 flex flex-col justify-between group hover:bg-white transition-colors hover:shadow-md">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">Pesanan Anda Ditangani</span>
              <div className="mt-4 text-5xl font-light text-[#1E1B2E] tracking-tighter group-hover:scale-105 origin-left transition-transform duration-500">
                {totalIncomingBookings}
              </div>
              <Link href="/dashboard/bookings" className="mt-4 text-[11px] text-stone-600 font-bold hover:underline flex items-center gap-1">
                <span>Kelola inbox pesanan</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
