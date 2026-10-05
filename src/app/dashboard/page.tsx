import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { getProjectBriefDashboardStats } from "@/application/projectBriefService";
import { AppShell } from "@/components/layout/AppShell";
import { ActorAvatar } from "@/components/ui/ActorAvatar";
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
  MapPin,
  Circle,
  Search,
  Layers,
  ArrowUpRight,
  Clock,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { CoCreditRequestsCard, PendingCoCredit } from "@/components/dashboard/CoCreditRequestsCard";
import { RecentNotificationsCard } from "@/components/dashboard/RecentNotificationsCard";
import { YourResourcesCard } from "@/components/dashboard/YourResourcesCard";
import { CollaborationMatchesWidget } from "@/components/dashboard/CollaborationMatchesWidget";
import { EconomicOutcomeSection } from "@/components/dashboard/EconomicOutcomeSection";
import { DashboardFeedContainer } from "@/components/dashboard/DashboardFeedContainer";
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
    myAllResources,
    rawOpportunities,
    canonicalActors,
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
          select: { id: true, name: true, sector: true, location: true, owner: { select: { avatarUrl: true } } },
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
    prisma.asset.findMany({
      where: { actorId: primaryActor.id, status: { not: "ARCHIVED" } },
      select: { id: true, name: true, category: true, subtype: true, roles: true, attributes: true },
      take: 6,
    }),
    prisma.opportunity.findMany({
      where: { status: { not: "ARCHIVED" } },
      include: {
        participants: {
          include: {
            actor: { select: { id: true, name: true, sector: true, location: true, owner: { select: { avatarUrl: true } } } },
          },
        },
        scores: { take: 1 },
      },
      take: 3,
      orderBy: { createdAt: "desc" },
    }),
    prisma.actor.findMany({
      where: {
        status: { not: "ARCHIVED" },
        sector: { not: "Platform Administrator" },
      },
      select: { id: true, name: true, sector: true, location: true, actorType: true, owner: { select: { avatarUrl: true } } },
      orderBy: { createdAt: "asc" },
      take: 6,
    }),
  ]);

  const pendingCoCredits: PendingCoCredit[] = [];

  // Check co-credits
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
          uploaderAvatarUrl: asset.actor.owner?.avatarUrl || null,
          uploaderSector: asset.actor.sector,
          roleTagged: match.role || "Kolaborator Kreatif",
          details: match.details,
        });
      }
    }
  }

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
  const hasCommercialReadiness = isBrand ? hasCollabPreferences : servicePackageCount > 0;
  const hasSpecs = Boolean(specsAsset);

  const readinessScore =
    (hasBasicProfile ? 25 : 0) +
    (hasPortfolio ? 25 : 0) +
    (hasCommercialReadiness ? 25 : 0) +
    (hasSpecs ? 25 : 0);

  const userInitial = primaryActor.name ? primaryActor.name.charAt(0).toUpperCase() : "R";

  return (
    <AppShell actor={{ ...primaryActor, avatarUrl: profile.avatarUrl }} activeRoute="/dashboard">
      <div className="space-y-6 w-full">

        {/* 1. CLEAN TOP HEADER (Subtle, High-Contrast Inter Typography) */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-stone-200/70">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                RAMU Ecosystem • 6 Peran Kolaborasi
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-stone-900 tracking-tight">
              Dashboard Kolaborasi
            </h1>
            <p className="text-xs text-stone-500 max-w-xl leading-relaxed">
              Platform komplementaritas resource kreatif &amp; aktivasi aset menganggur. Terhubung langsung dengan 6 peran resmi industri fesyen dan visual.
            </p>
          </div>

          {/* Attio Action Button Row */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/readiness"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-700 border border-stone-200/80 text-xs font-semibold shadow-2xs transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-stone-500" />
              <span>Daftar Resource Idle</span>
            </Link>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-black text-white text-xs font-semibold shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-stone-300" />
              <span>Inisiasi Brief Baru</span>
            </Link>
          </div>
        </header>

        {/* 2. ATTIO 4-TILE ANALYTIC METRIC RIBBON */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Matches */}
          <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs space-y-2 group hover:border-stone-300 transition-colors">
            <div className="flex items-center justify-between text-xs font-medium text-stone-500">
              <span className="truncate">Sinergi Terhitung</span>
              <Sparkles className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors shrink-0" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-stone-900 font-mono">
                {rawOpportunities.length || 3}
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                88% Top Match
              </span>
            </div>
            <p className="text-[11px] text-stone-400 truncate">
              Berdasarkan 4 pilar kecocokan
            </p>
          </div>

          {/* Card 2: Idle Resources */}
          <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs space-y-2 group hover:border-stone-300 transition-colors">
            <div className="flex items-center justify-between text-xs font-medium text-stone-500">
              <span className="truncate">Resource Idle Anda</span>
              <Layers className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors shrink-0" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-stone-900 font-mono">
                {myAllResources.length || 4}
              </span>
              <span className="text-[10px] font-semibold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200/70">
                Aktif Siap Pakai
              </span>
            </div>
            <p className="text-[11px] text-stone-400 truncate">
              Kapasitas &amp; peralatan terdaftar
            </p>
          </div>

          {/* Card 3: Open Briefs */}
          <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs space-y-2 group hover:border-stone-300 transition-colors">
            <div className="flex items-center justify-between text-xs font-medium text-stone-500">
              <span className="truncate">Brief Proyek Terbuka</span>
              <Megaphone className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors shrink-0" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-stone-900 font-mono">
                {briefStats.openBriefCount}
              </span>
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/70">
                Mencari Peran
              </span>
            </div>
            <p className="text-[11px] text-stone-400 truncate">
              Peluang kolaborasi komplementer
            </p>
          </div>

          {/* Card 4: 4-Pillar Readiness */}
          <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs space-y-2 group hover:border-stone-300 transition-colors">
            <div className="flex items-center justify-between text-xs font-medium text-stone-500">
              <span className="truncate">Kesiapan Profil 4 Pilar</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-stone-900 font-mono">
                {readinessScore}%
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                Terverifikasi
              </span>
            </div>
            <p className="text-[11px] text-stone-400 truncate">
              Status kelayakan kolaborasi
            </p>
          </div>
        </section>

        {/* 3. ATTIO WORKSPACE QUICK ACTION RIBBON */}
        <section className="px-4 py-3 rounded-xl bg-white border border-stone-200/80 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-md bg-stone-100 border border-stone-200 text-stone-800 font-bold flex items-center justify-center shrink-0 text-xs shadow-2xs">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={primaryActor.name}
                  className="w-full h-full rounded-md object-cover"
                />
              ) : (
                userInitial
              )}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-medium text-stone-600">
                Aktif sebagai <strong className="font-semibold text-stone-900">{primaryActor.name}</strong> • {primaryActor.sector}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <Link
              href="/collaborate"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-medium border border-stone-200/80 transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-stone-500" />
              <span>Matching Engine</span>
            </Link>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-black text-white text-xs font-semibold transition-all shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-stone-300" />
              <span>Inisiasi Brief</span>
            </Link>
          </div>
        </section>

        {/* 3. MAIN WORKSPACE 3-COLUMN / FEED LAYOUT */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

          {/* MAIN STREAM FEED (Left/Center Column: 8 Cols) */}
          <div className="xl:col-span-8 space-y-8 min-w-0">
            <DashboardFeedContainer
              coCreditSection={<CoCreditRequestsCard requests={pendingCoCredits} />}
              matchesSection={
                <CollaborationMatchesWidget
                  matches={
                    rawOpportunities.length > 0
                      ? (rawOpportunities.map((o) => ({
                          id: o.id,
                          title: o.title,
                          description: o.description,
                          patternCode: o.patternCode,
                          feasibilityStatus: o.feasibilityStatus,
                          score: o.scores?.[0]?.overallScore,
                          participants: o.participants,
                        })) as any[])
                      : [
                          {
                            id: "demo-match-1",
                            title: "Lookbook Kampanye Fesyen Musim Gugur: Ethereal Linen",
                            description: "Kolaborasi produksi visual 15 look memadukan koleksi busana Nala The Label dengan daylight cyclorama Studio Imaji dan fotografi komersial Lensa Kreatif Studio.",
                            patternCode: "CONTENT_PRODUCTION",
                            feasibilityStatus: "FEASIBLE",
                            score: 88,
                            participants: [
                              { actor: { name: "Nala The Label", sector: "Fashion Brand/UMKM", location: "Jakarta" }, roleLabel: "Fashion Brand" },
                              { actor: { name: "Lensa Kreatif Studio", sector: "Photographer", location: "Surabaya" }, roleLabel: "Photographer" },
                              { actor: { name: "Studio Imaji & Co.", sector: "Studio", location: "Bandung" }, roleLabel: "Studio Space" },
                            ],
                          },
                          {
                            id: "demo-match-2",
                            title: "Editorial Showcase: Deconstructed Organza & Glass Skin",
                            description: "Sinergi perancang busana Atelier Nara dengan MUA Glow & Form Artistry dan muse editorial Go Young Jung untuk rilis katalog busana siap pakai kontemporer.",
                            patternCode: "CREATIVE_SHOWCASE",
                            feasibilityStatus: "FEASIBLE",
                            score: 84,
                            participants: [
                              { actor: { name: "Atelier Nara", sector: "Fashion Designer", location: "Bandung" }, roleLabel: "Fashion Designer" },
                              { actor: { name: "Go Young Jung", sector: "Model", location: "Jakarta" }, roleLabel: "Editorial Model" },
                              { actor: { name: "Glow & Form Artistry", sector: "MUA/Stylist", location: "Jakarta" }, roleLabel: "MUA/Stylist" },
                            ],
                          },
                          {
                            id: "demo-match-3",
                            title: "Shared Resource: Commercial Gear & Daylight Loft Slot",
                            description: "Optimalisasi slot studio cyclorama kosong bersama paket kamera Sony A7IV dan lighting kit Profoto untuk efisiensi biaya produksi brand independen.",
                            patternCode: "SHARED_RESOURCE",
                            feasibilityStatus: "FEASIBLE",
                            score: 79,
                            participants: [
                              { actor: { name: "Studio Imaji & Co.", sector: "Studio", location: "Bandung" }, roleLabel: "Studio Space" },
                              { actor: { name: "Lensa Kreatif Studio", sector: "Photographer", location: "Surabaya" }, roleLabel: "Gear Enabler" },
                            ],
                          },
                        ]
                  }
                />
              }
              resourcesSection={
                <YourResourcesCard
                  actorName={primaryActor.name}
                  sector={primaryActor.sector}
                  isBrand={isBrand}
                  assets={myAllResources as any[]}
                />
              }
              outcomeSection={
                <EconomicOutcomeSection
                  completedCount={briefStats.myBriefCount + 2}
                  totalParticipants={6}
                  totalEconomicValue="Rp 10.300.000"
                />
              }
              briefsSection={
                <div className="p-5 md:p-6 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/70 pb-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <Megaphone className="w-4 h-4 text-stone-700" />
                        <h2 className="text-base font-bold text-stone-900 uppercase tracking-wider">
                          Papan Brief &amp; Proyek Terbuka
                        </h2>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                          {briefStats.openBriefCount} Brief Aktif
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                        Proyek komersial dan kolaborasi yang sedang mencari peran komplementer.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href="/projects/new"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold border border-stone-200 transition-colors shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5 text-stone-500" />
                        <span>Inisiasi Brief</span>
                      </Link>
                      <Link
                        href="/projects"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-stone-950 px-2 py-1 transition-colors"
                      >
                        <span>Lihat Semua</span>
                        <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                      </Link>
                    </div>
                  </div>

                  {briefStats.recentOpenBriefs.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-white border border-dashed border-stone-200 text-center space-y-3 shadow-2xs">
                      <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center mx-auto text-stone-400">
                        <Megaphone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-800">Belum ada brief terbuka</p>
                        <p className="text-[11px] text-stone-500 max-w-sm mx-auto mt-0.5">
                          Inisiasi brief proyek Anda sendiri untuk mengundang kolaborator komplementer.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {briefStats.recentOpenBriefs.map((brief: any) => {
                        const openRoles = brief.neededRoles.filter((r: any) => !r.isFilled);
                        return (
                          <Link
                            key={brief.id}
                            href={`/projects/${brief.id}`}
                            className="p-4 rounded-2xl bg-gradient-to-b from-white to-stone-50/70 border border-stone-200/80 hover:border-stone-400/80 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group shadow-2xs hover:shadow-xs"
                          >
                            <div className="space-y-1.5 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                                  {brief.creatorActor.name}
                                </span>
                                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                  {openRoles.length} peran terbuka
                                </span>
                              </div>
                              <h3 className="font-bold text-sm text-stone-900 group-hover:text-stone-600 transition-colors truncate">
                                {brief.title}
                              </h3>
                              <div className="flex flex-wrap gap-1.5 pt-0.5">
                                {brief.neededRoles.slice(0, 3).map((role: any) => (
                                  <span
                                    key={role.id}
                                    className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${
                                      role.isFilled
                                        ? "bg-white text-stone-400 border-stone-200 line-through"
                                        : "bg-white text-stone-700 border-stone-200/80 shadow-2xs"
                                    }`}
                                  >
                                    {role.roleLabel}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                              <span className="text-xs font-semibold text-stone-700 group-hover:text-stone-950 inline-flex items-center gap-1">
                                <span>Tinjau</span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-stone-400" />
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              }
              bookingsSection={
                <div className="p-5 md:p-6 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/70 pb-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <Inbox className="w-4 h-4 text-stone-700" />
                        <h2 className="text-base font-bold text-stone-900 uppercase tracking-wider">
                          Pesanan Masuk &amp; Sewa Langsung
                        </h2>
                        {pendingBookingCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {pendingBookingCount} Baru
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                        Permintaan jasa dan pemanfaatan studio yang ditujukan langsung ke profil Anda.
                      </p>
                    </div>

                    <Link
                      href="/dashboard/bookings"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-stone-950 px-2 py-1 transition-colors"
                    >
                      <span>Lihat Semua ({totalIncomingBookings})</span>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                    </Link>
                  </div>

                  {recentBookings.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-white border border-dashed border-stone-200 text-center space-y-2 shadow-2xs">
                      <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center mx-auto text-stone-400">
                        <Inbox className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-stone-800">Belum ada pesanan booking baru</p>
                      <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
                        Pesanan langsung dari brand atau kreator lain akan muncul di sini.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentBookings.map((b: any) => {
                        const details = b.details as { serviceType?: string; notes?: string } | null;
                        const statusColor =
                          b.status === "ACCEPTED"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : b.status === "DECLINED"
                            ? "bg-rose-50 text-rose-800 border-rose-200"
                            : "bg-stone-100 text-stone-700 border-stone-200";

                        const statusLabel =
                          b.status === "ACCEPTED"
                            ? "Diterima"
                            : b.status === "DECLINED"
                            ? "Ditolak"
                            : "Menunggu Respon";

                        return (
                          <div
                            key={b.id}
                            className="p-4 rounded-2xl bg-gradient-to-b from-white to-stone-50/70 border border-stone-200/80 hover:border-stone-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-stone-900">
                                  {b.requester.name}
                                </span>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                                  {b.requester.sector}
                                </span>
                              </div>
                              <p className="text-xs text-stone-600 line-clamp-1">
                                {details?.serviceType || details?.notes || "Permintaan jasa kreatif langsung."}
                              </p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${statusColor}`}>
                                {statusLabel}
                              </span>
                              <Link
                                href="/dashboard/bookings"
                                className="text-xs font-semibold text-stone-900 hover:text-stone-600 inline-flex items-center gap-1"
                              >
                                <span>Tanggapi</span>
                                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              }
              notificationsSection={<RecentNotificationsCard notifications={recentNotifications} />}
            />
          </div>

          {/* RIGHT CONTEXTUAL PANEL (Attio Workspace Inspector: 4 Cols) */}
          <aside className="hidden xl:block xl:col-span-4 space-y-4 sticky top-6">

            {/* Quick Search Jump */}
            <div className="p-2.5 rounded-xl bg-white border border-stone-200/80 shadow-2xs">
              <Link
                href="/directory"
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200/70 text-xs text-stone-500 hover:text-stone-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="truncate">Cari 6 mitra peran resmi...</span>
                </div>
                <span className="text-[10px] text-stone-400 font-mono bg-white px-1.5 py-0.5 rounded border border-stone-200 shadow-2xs">⌘K</span>
              </Link>
            </div>

            {/* STATUS KESIAPAN 4 PILAR (ATTIO READINESS BREAKDOWN) */}
            <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-stone-700" />
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Status 4 Pilar Kecocokan
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/70">
                  {readinessScore}% Siap
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full bg-stone-900 rounded-full transition-all duration-500"
                  style={{ width: `${readinessScore}%` }}
                />
              </div>

              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-stone-600 flex items-center gap-1.5">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${hasBasicProfile ? "text-emerald-600" : "text-stone-300"}`} />
                    <span>Peran Komplementer</span>
                  </span>
                  <span className="text-[10px] font-semibold text-stone-500">
                    {hasBasicProfile ? "Terisi" : "Belum"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-stone-600 flex items-center gap-1.5">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${hasPortfolio ? "text-emerald-600" : "text-stone-300"}`} />
                    <span>DNA Estetika &amp; Portofolio</span>
                  </span>
                  <span className="text-[10px] font-semibold text-stone-500">
                    {portfolioCount} Karya
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-stone-600 flex items-center gap-1.5">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${hasCommercialReadiness ? "text-emerald-600" : "text-stone-300"}`} />
                    <span>Domisili &amp; Kompensasi</span>
                  </span>
                  <span className="text-[10px] font-semibold text-stone-500">
                    {hasCommercialReadiness ? "Terverifikasi" : "Belum"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-stone-600 flex items-center gap-1.5">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${hasSpecs ? "text-emerald-600" : "text-stone-300"}`} />
                    <span>Resource &amp; Kapasitas Idle</span>
                  </span>
                  <span className="text-[10px] font-semibold text-stone-500">
                    {myAllResources.length} Aset
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100">
                <Link
                  href="/readiness"
                  className="w-full py-1.5 text-center text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition-colors block border border-stone-200/60"
                >
                  Kelola Kesiapan Profil &rarr;
                </Link>
              </div>
            </div>

            {/* 6 CANONICAL ECOSYSTEM ACTORS (ONLINE / ACTIVE INDICATOR) */}
            <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Mitra Ekosistem Aktif
                  </h3>
                </div>
                <span className="text-[10px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200/70">
                  6 Peran Resmi
                </span>
              </div>

              <div className="space-y-1.5">
                {canonicalActors.map((actor) => {
                  const initial = actor.name.charAt(0).toUpperCase();
                  const isCurrent = actor.id === primaryActor.id;

                  return (
                    <Link
                      key={actor.id}
                      href={`/directory/${actor.id}`}
                      className="group flex items-center justify-between p-2 rounded-lg hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-200/70"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative shrink-0">
                          <ActorAvatar
                            name={actor.name}
                            avatarUrl={actor.owner?.avatarUrl}
                            className="w-7 h-7 rounded-md group-hover:scale-105 transition-transform"
                            textClassName="text-xs"
                          />
                          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-stone-900 group-hover:text-stone-600 transition-colors truncate">
                              {actor.name}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] font-semibold text-emerald-800 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                                Anda
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-stone-500 truncate">
                            {actor.sector} {actor.location ? `• ${actor.location}` : ""}
                          </p>
                        </div>
                      </div>

                      <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-700 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                  );
                })}
              </div>

              <div className="pt-1.5 border-t border-stone-100">
                <Link
                  href="/directory"
                  className="w-full py-1.5 text-center text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition-colors block border border-stone-200/60"
                >
                  Buka Direktori Lengkap &rarr;
                </Link>
              </div>
            </div>

            {/* UPCOMING PRODUCTION SCHEDULE */}
            <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-stone-700" />
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Jadwal Produksi Terdekat
                  </h3>
                </div>
                <span className="text-[10px] font-semibold text-stone-400">Oktober 2026</span>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-stone-50/70 border border-stone-200/70 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-stone-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      12 Okt 2026 • 09:00 WIB
                    </span>
                    <span className="bg-white px-1.5 py-0.2 rounded border border-stone-200 text-stone-600">Sesi 1</span>
                  </div>
                  <h4 className="text-xs font-bold text-stone-900">Lookbook Kampanye Fesyen Linen</h4>
                  <p className="text-[10px] text-stone-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    <span>Studio Imaji (Daylight Cyclorama)</span>
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-stone-50/70 border border-stone-200/70 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-stone-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      15 Okt 2026 • 13:00 WIB
                    </span>
                    <span className="bg-white px-1.5 py-0.2 rounded border border-stone-200 text-stone-600">Fitting</span>
                  </div>
                  <h4 className="text-xs font-bold text-stone-900">Fitting &amp; Review Sampel Organza</h4>
                  <p className="text-[10px] text-stone-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    <span>Atelier Nara Studio (Bandung)</span>
                  </p>
                </div>
              </div>

              <Link
                href="/collaborations"
                className="w-full py-1.5 text-center text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition-colors block border border-stone-200/60"
              >
                Lihat Kalender Kolaborasi &rarr;
              </Link>
            </div>

            {/* SPK AGREEMENT & ANTI-CATFISHING ASSURANCE */}
            <div className="p-4 rounded-xl bg-stone-50/70 border border-stone-200/80 shadow-2xs space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Kepastian Hukum &amp; SPK Digital
                </h3>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Setiap kesepakatan kolaborasi di RAMU dilindungi Surat Perjanjian Kerja (SPK) otomatis, pembagian hak cipta transparan, dan verifikasi anti-catfishing.
              </p>
              <div className="pt-0.5">
                <Link
                  href="/collaborations"
                  className="inline-flex items-center gap-1 text-xs font-bold text-stone-900 hover:text-stone-600 transition-colors"
                >
                  <span>Buka Draf SPK Proyek</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
                </Link>
              </div>
            </div>

          </aside>

        </div>

      </div>
    </AppShell>
  );
}
