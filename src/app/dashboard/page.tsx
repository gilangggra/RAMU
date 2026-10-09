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
  Handshake,
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
  Eye,
  Sparkles,
  Compass,
  TrendingUp,
} from "lucide-react";
import { CoCreditRequestsCard, PendingCoCredit } from "@/components/dashboard/CoCreditRequestsCard";
import { RecentNotificationsCard } from "@/components/dashboard/RecentNotificationsCard";
import { YourResourcesCard } from "@/components/dashboard/YourResourcesCard";
import { CollaborationMatchesWidget } from "@/components/dashboard/CollaborationMatchesWidget";
import { EconomicOutcomeSection } from "@/components/dashboard/EconomicOutcomeSection";
import { DashboardFeedContainer } from "@/components/dashboard/DashboardFeedContainer";
import { OnboardingChecklistCard } from "@/components/dashboard/OnboardingChecklistCard";
import { CreativeSpotlightStrip } from "@/components/dashboard/CreativeSpotlightStrip";
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
    userOpportunities,
    fallbackOpportunities,
    complementaryActors,
    fallbackActors,
    userCollaborations,
    completedCollabCount,
    allUserOutcomes,
    acceptedBookings,
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
    prisma.opportunity.findMany({
      where: {
        status: { not: "ARCHIVED" },
        participants: { some: { actorId: primaryActor.id } },
      },
      include: {
        participants: {
          include: {
            actor: { select: { id: true, name: true, sector: true, location: true, owner: { select: { avatarUrl: true } } } },
          },
        },
        scores: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      take: 3,
      orderBy: { createdAt: "desc" },
    }),
    prisma.opportunity.findMany({
      where: { status: { not: "ARCHIVED" } },
      include: {
        participants: {
          include: {
            actor: { select: { id: true, name: true, sector: true, location: true, owner: { select: { avatarUrl: true } } } },
          },
        },
        scores: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      take: 3,
      orderBy: { createdAt: "desc" },
    }),
    prisma.actor.findMany({
      where: {
        status: { not: "ARCHIVED" },
        id: { not: primaryActor.id },
        sector: { notIn: ["Platform Administrator", primaryActor.sector] },
      },
      select: { id: true, name: true, sector: true, location: true, actorType: true, owner: { select: { avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.actor.findMany({
      where: {
        status: { not: "ARCHIVED" },
        id: { not: primaryActor.id },
        sector: { not: "Platform Administrator" },
      },
      select: { id: true, name: true, sector: true, location: true, actorType: true, owner: { select: { avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.collaboration.findMany({
      where: { participants: { some: { actorId: primaryActor.id } } },
      include: {
        participants: { include: { actor: { select: { id: true, name: true, sector: true, location: true } } } },
        milestones: {
          orderBy: { targetDate: "asc" },
        },
        outcomes: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.collaboration.count({
      where: {
        participants: { some: { actorId: primaryActor.id } },
        status: "COMPLETED",
      },
    }),
    prisma.outcome.findMany({
      where: {
        collaboration: {
          participants: { some: { actorId: primaryActor.id } },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.bookingRequest.findMany({
      where: {
        OR: [{ requesterId: primaryActor.id }, { targetId: primaryActor.id }],
        status: { in: ["ACCEPTED", "CONFIRMED"] },
      },
      include: {
        requester: { select: { id: true, name: true, sector: true, location: true } },
        target: { select: { id: true, name: true, sector: true, location: true } },
      },
      orderBy: { startDate: "asc" },
      take: 4,
    }),
  ]);

  const rawOpportunities = userOpportunities.length > 0 ? userOpportunities : fallbackOpportunities;
  const canonicalActors = complementaryActors.length > 0 ? complementaryActors : fallbackActors;
  const inventoryResourceCount = nonPortfolioAssets.length;

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
          isOwnerApproval: false,
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
            uploaderName: c.name || "Kandidat Kru",
            uploaderSector: "Kru Proyek",
            roleTagged: c.role || "Kolaborator Kreatif",
            details: c.details || `Mengajukan klaim kontribusi peran sebagai ${c.role}`,
            isOwnerApproval: true,
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

  const hasBasicProfile = Boolean(primaryActor.description && (profile?.avatarUrl || primaryActor.location));
  const hasPortfolio = portfolioCount > 0;
  const hasPortfolioOrBrief = isBrand ? (briefStats.myBriefCount > 0 || portfolioCount > 0) : portfolioCount > 0;
  const hasCommercialReadiness = isBrand ? hasCollabPreferences : servicePackageCount > 0;
  const hasSpecs = Boolean(specsAsset);

  const readinessScore =
    (hasBasicProfile ? 25 : 0) +
    (hasPortfolioOrBrief ? 25 : 0) +
    (hasCommercialReadiness ? 25 : 0) +
    (hasSpecs ? 25 : 0);

  const userInitial = primaryActor.name ? primaryActor.name.charAt(0).toUpperCase() : "R";

  const uniqueParticipantsSet = new Set<string>();
  userCollaborations.forEach((c) => {
    c.participants.forEach((p) => {
      if (p.actorId !== primaryActor.id) uniqueParticipantsSet.add(p.actorId);
    });
  });
  const totalPartnerCount = uniqueParticipantsSet.size;

  let calculatedEconomicValue = 0;
  allUserOutcomes.forEach((o) => {
    const rawRev = (o.metrics as any)?.revenueAmount;
    if (rawRev) {
      const num = Number(String(rawRev).replace(/[^0-9]/g, ""));
      if (!isNaN(num) && num > 0) calculatedEconomicValue += num;
    }
  });

  const displayEconomicValue =
    calculatedEconomicValue > 0
      ? `Rp ${calculatedEconomicValue.toLocaleString("id-ID")}`
      : "Rp 0";

  interface DashboardAgendaItem {
    id: string;
    dateLabel: string;
    badge: string;
    title: string;
    locationLabel: string;
    href: string;
  }

  const agendaItems: DashboardAgendaItem[] = [];

  // 1. From accepted bookings
  acceptedBookings.forEach((b) => {
    const isTarget = b.targetId === primaryActor.id;
    const partner = isTarget ? b.requester : b.target;
    const details = (b.details as any) || {};
    const date = new Date(b.startDate);
    const dateLabel = !isNaN(date.getTime())
      ? date.toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) + " WIB"
      : "Jadwal Terkonfirmasi";

    agendaItems.push({
      id: `booking-${b.id}`,
      dateLabel,
      badge: "SPK Booking",
      title: details.serviceType || details.notes || `Sesi Kerja bersama ${partner.name}`,
      locationLabel: partner.location || details.location || partner.name,
      href: `/dashboard/bookings/${b.id}`,
    });
  });

  // 2. From active collaborations (milestones or active status)
  userCollaborations
    .filter((c) => c.status === "ACTIVE")
    .forEach((c) => {
      const activeMilestones = c.milestones.filter((m) => m.status !== "ACHIEVED");
      if (activeMilestones.length > 0) {
        activeMilestones.slice(0, 2).forEach((m) => {
          const date = m.targetDate ? new Date(m.targetDate) : null;
          const dateLabel = date && !isNaN(date.getTime())
            ? date.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
            : "Milestone";

          agendaItems.push({
            id: `milestone-${m.id}`,
            dateLabel,
            badge: "Milestone",
            title: `${m.title} — ${c.title}`,
            locationLabel: c.participants.map((p) => p.actor.name).filter((n) => n !== primaryActor.name).join(", ") || "Workspace",
            href: `/collaborations/${c.id}`,
          });
        });
      } else {
        const date = c.targetEndAt ? new Date(c.targetEndAt) : c.startedAt ? new Date(c.startedAt) : null;
        const dateLabel = date && !isNaN(date.getTime())
          ? date.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
          : "Proyek Aktif";

        agendaItems.push({
          id: `collab-${c.id}`,
          dateLabel,
          badge: "Produksi Aktif",
          title: c.title,
          locationLabel: c.participants.map((p) => p.actor.name).filter((n) => n !== primaryActor.name).join(", ") || "Workspace",
          href: `/collaborations/${c.id}`,
        });
      }
    });
  return (
    <AppShell actor={{ ...primaryActor, avatarUrl: profile.avatarUrl }} activeRoute="/dashboard">
      <div className="w-full space-y-6">

        {/* 1. EXECUTIVE WELCOME HEADER & TOP KPI METRICS */}
        <section className="bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[24px] p-5 sm:p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  Selamat Datang, {primaryActor.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#4CC9FE]/15 text-[#0284c7] border border-[#4CC9FE]/30">
                  <Sparkles className="w-3 h-3 text-[#0284c7]" />
                  {primaryActor.sector}
                </span>
                {primaryActor.location && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {primaryActor.location}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Pusat kendali ekosistem kreatif RAMU: kelola brief kebutuhan proyek, pantau pesanan komersial, dan bangun kemitraan komplementer.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                href="/projects/new"
                className="btn-primary-pill text-xs py-2 px-4 text-white font-semibold inline-flex items-center gap-1.5 shadow-md shadow-[#4CC9FE]/20"
              >
                <Plus className="w-3.5 h-3.5 text-white" />
                <span>Inisiasi Brief</span>
              </Link>
              <Link
                href="/directory?tab=matched"
                className="px-4 py-2 rounded-full bg-white/90 hover:bg-white hover:text-[#0284c7] text-slate-800 text-xs font-semibold border border-white/90 shadow-2xs inline-flex items-center gap-1.5 transition-all"
              >
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>Rekomendasi Mitra</span>
              </Link>
              <Link
                href={`/directory/${primaryActor.id}`}
                className="px-4 py-2 rounded-full bg-white/90 hover:bg-white hover:text-[#0284c7] text-slate-800 text-xs font-semibold border border-white/90 shadow-2xs inline-flex items-center gap-1.5 transition-all"
                title="Lihat bagaimana profil Anda tampil bagi kolaborator lain"
              >
                <span>Profil Publik</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* 4 TOP KPI METRICS CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-1">
            {/* KPI 1: Brief Proyek */}
            <Link
              href="/projects"
              className="p-4 rounded-2xl bg-white/70 hover:bg-white/95 border border-white/80 transition-all group shadow-2xs space-y-2 block"
            >
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium">Brief Terbuka</span>
                <div className="w-7 h-7 rounded-full bg-[#4CC9FE]/15 text-[#0284c7] flex items-center justify-center">
                  <Megaphone className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums">
                  {briefStats.openBriefCount}
                </span>
                <span className="text-[11px] font-semibold text-[#0284c7] group-hover:underline">
                  {briefStats.myBriefCount} dibuat Anda &rarr;
                </span>
              </div>
            </Link>

            {/* KPI 2: Workspace Aktif */}
            <Link
              href="/collaborations"
              className="p-4 rounded-2xl bg-white/70 hover:bg-white/95 border border-white/80 transition-all group shadow-2xs space-y-2 block"
            >
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium">Workspace Aktif</span>
                <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Handshake className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums">
                  {userCollaborations.length}
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 group-hover:underline">
                  {completedCollabCount} selesai &rarr;
                </span>
              </div>
            </Link>

            {/* KPI 3: Pesanan Booking */}
            <Link
              href="/collaborations?section=contracts"
              className={`p-4 rounded-2xl transition-all group shadow-2xs space-y-2 block border ${
                pendingBookingCount > 0
                  ? "bg-amber-50/90 hover:bg-amber-50 border-amber-300/80 ring-2 ring-amber-400/20"
                  : "bg-white/70 hover:bg-white/95 border-white/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">Pesanan Masuk</span>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  pendingBookingCount > 0
                    ? "bg-amber-500 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600"
                }`}>
                  <Inbox className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums">
                  {totalIncomingBookings}
                </span>
                {pendingBookingCount > 0 ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white animate-pulse">
                    {pendingBookingCount} Butuh Respons!
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-500 group-hover:underline">
                    Semua tuntas &rarr;
                  </span>
                )}
              </div>
            </Link>

            {/* KPI 4: Nilai Ekonomi */}
            <Link
              href="/collaborations"
              className="p-4 rounded-2xl bg-white/70 hover:bg-white/95 border border-white/80 transition-all group shadow-2xs space-y-2 block"
            >
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium">Nilai Transaksi SPK</span>
                <div className="w-7 h-7 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-base sm:text-lg font-black text-slate-900 tabular-nums truncate">
                  {displayEconomicValue}
                </span>
                <span className="text-[11px] font-semibold text-purple-600 group-hover:underline shrink-0">
                  Terverifikasi &rarr;
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* 2. 3-COLUMN STRUCTURED WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

          {/* LEFT COLUMN: IDENTITY & BUSINESS PROFILE (3 Cols) */}
          <aside className="lg:col-span-3 space-y-4 lg:sticky lg:top-6">
            {/* Identity Card */}
            <div className="rounded-[22px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="h-18 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 relative">
                <span className="absolute top-2.5 right-2.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-white border border-white/20">
                  {primaryActor.sector}
                </span>
              </div>

              <div className="-mt-9 px-4 flex flex-col items-center text-center">
                <div className="relative">
                  <ActorAvatar
                    name={primaryActor.name}
                    avatarUrl={profile?.avatarUrl}
                    className="w-16 h-16 rounded-2xl ring-4 ring-white shadow-xs border border-slate-200"
                    textClassName="text-base font-semibold"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>

                <div className="mt-2.5 space-y-0.5">
                  <Link
                    href={`/directory/${primaryActor.id}`}
                    className="font-bold text-sm text-slate-900 hover:text-[#0284c7] transition-colors block"
                  >
                    {primaryActor.name}
                  </Link>
                  <p className="text-xs text-slate-600 font-medium">
                    {primaryActor.location || "Indonesia"}
                  </p>
                </div>

                {primaryActor.description && (
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {primaryActor.description}
                  </p>
                )}
              </div>

              {/* Quick Key Metrics */}
              <div className="border-t border-slate-100 mt-3.5 pt-3 px-4 pb-3 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-medium">Resource &amp; Fasilitas</span>
                  <span className="font-bold text-slate-900 tabular-nums">{inventoryResourceCount}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-medium">Karya Portofolio</span>
                  <span className="font-bold text-slate-900 tabular-nums">{portfolioCount}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-medium">Mitra Terhubung</span>
                  <span className="font-bold text-slate-900 tabular-nums">{totalPartnerCount}</span>
                </div>
              </div>

              {/* Profile Readiness Bar */}
              <div className="border-t border-slate-100 pt-3 px-4 pb-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-600">Kelengkapan Profil Bisnis</span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    {readinessScore}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4CC9FE] rounded-full transition-all duration-300"
                    style={{ width: `${readinessScore}%` }}
                  />
                </div>
                <Link
                  href="/settings"
                  className="font-semibold text-[#0284c7] hover:text-[#0369a1] inline-flex items-center gap-1 transition-colors"
                >
                  <span>Lengkapi Data Rekening &amp; Jasa</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Business Status & Readiness Summary (Replaced duplicate Navigasi Cepat!) */}
            <div className="p-4 sm:p-5 rounded-[22px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-900 text-xs">Status Kemitraan</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  Siap Berkolaborasi
                </span>
              </div>

              <div className="space-y-2 text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Model Kompensasi:</span>
                  <span className="font-semibold text-slate-900">
                    {primaryActor.compensationModels && primaryActor.compensationModels.length > 0
                      ? primaryActor.compensationModels.join(", ")
                      : "Negosiasi SPK"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tipe Aktor:</span>
                  <span className="font-semibold text-slate-900">
                    {primaryActor.actorType === "BRAND" ? "Brand / UMKM" : "Talenta / Studio"}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  href="/showcase"
                  className="w-full py-2 px-3 rounded-xl bg-white/80 hover:bg-white text-slate-800 font-semibold border border-white/90 text-center shadow-2xs hover:text-[#0284c7] transition-all"
                >
                  + Tambah Karya Portofolio
                </Link>
                <Link
                  href="/settings"
                  className="w-full py-1.5 text-center text-slate-500 hover:text-slate-900 font-medium transition-colors"
                >
                  Pengaturan Akun &amp; Rekening &rarr;
                </Link>
              </div>
            </div>
          </aside>

          {/* CENTER COLUMN: FEED & ACTIONS (6 Cols) */}
          <main className="lg:col-span-6 space-y-4 min-w-0">

            {/* URGENT BOOKING ALERT BANNER (If pending bookings exist) */}
            {pendingBookingCount > 0 && (
              <div className="p-4 sm:p-5 rounded-[22px] bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/5 border border-amber-300/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Inbox className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-950">
                      Ada {pendingBookingCount} Pesanan Booking Menunggu Konfirmasi Anda
                    </h3>
                    <p className="text-xs text-amber-900/80 mt-0.5">
                      Segera tanggapi dan tetapkan jadwal kesepakatan SPK resmi agar tidak kadaluarsa.
                    </p>
                  </div>
                </div>
                <Link
                  href="/collaborations?section=contracts"
                  className="px-4 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-2xs shrink-0 self-end sm:self-center"
                >
                  Tinjau Pesanan Sekarang
                </Link>
              </div>
            )}

            {/* Optional Onboarding Checklist if profile readiness < 100% */}
            {readinessScore < 100 && (
              <OnboardingChecklistCard
                actorName={primaryActor.name}
                actorSector={primaryActor.sector}
                isBrand={isBrand}
                hasAvatar={Boolean(profile?.avatarUrl)}
                hasBio={Boolean(primaryActor.description)}
                hasCommercialReadiness={hasCommercialReadiness}
                hasSpecs={hasSpecs}
                hasPortfolio={hasPortfolio}
                hasPortfolioOrBrief={hasPortfolioOrBrief}
                readinessScore={readinessScore}
              />
            )}

            {/* Action Prompt Box */}
            <div className="p-4 sm:p-5 rounded-[22px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] space-y-3">
              <div className="flex items-center gap-3">
                <ActorAvatar
                  name={primaryActor.name}
                  avatarUrl={profile?.avatarUrl}
                  className="w-10 h-10 rounded-full shrink-0 border border-white/90 shadow-xs"
                  textClassName="text-xs font-semibold"
                />
                <Link
                  href="/projects/new"
                  className="flex-1 bg-white/70 hover:bg-white/95 border border-white/90 hover:border-[#4CC9FE]/50 text-slate-600 hover:text-slate-900 text-xs px-4 py-2.5 rounded-full transition-all font-medium flex items-center justify-between shadow-xs"
                >
                  <span>Mencari kolaborator atau tawarkan studio? Inisiasi brief proyek...</span>
                  <Plus className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-slate-100 text-xs font-medium">
                <Link
                  href="/projects/new"
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-full text-slate-700 hover:text-[#0284c7] hover:bg-[#4CC9FE]/10 transition-all group"
                >
                  <Megaphone className="w-3.5 h-3.5 text-[#0284c7] transition-colors" />
                  <span className="truncate font-semibold">Inisiasi Brief</span>
                </Link>
                <Link
                  href="/showcase"
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-full text-slate-700 hover:text-[#0284c7] hover:bg-[#4CC9FE]/10 transition-all group"
                >
                  <Compass className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#0284c7] transition-colors" />
                  <span className="truncate font-semibold">Upload Karya</span>
                </Link>
                <Link
                  href="/directory?tab=matched"
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-full text-slate-700 hover:text-[#0284c7] hover:bg-[#4CC9FE]/10 transition-all group"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#0284c7] transition-colors" />
                  <span className="truncate font-semibold">Cari Tim Cocok</span>
                </Link>
              </div>
            </div>

            {/* Dashboard Feed Container with Clean Single-Tab Display */}
            <DashboardFeedContainer
              pendingBookingCount={pendingBookingCount}
              coCreditSection={<CoCreditRequestsCard requests={pendingCoCredits} />}
              matchesSection={
                <CollaborationMatchesWidget
                  matches={
                    rawOpportunities.map((o) => ({
                      id: o.id,
                      title: o.title,
                      description: o.description,
                      patternCode: o.patternCode,
                      feasibilityStatus: o.feasibilityStatus,
                      score: o.scores?.[0]?.overallScore,
                      participants: o.participants,
                    })) as any[]
                  }
                />
              }
              resourcesSection={
                <YourResourcesCard
                  actorName={primaryActor.name}
                  sector={primaryActor.sector}
                  isBrand={isBrand}
                  assets={nonPortfolioAssets as any[]}
                  totalCount={inventoryResourceCount}
                />
              }
              outcomeSection={
                <EconomicOutcomeSection
                  completedCount={completedCollabCount}
                  totalParticipants={totalPartnerCount > 0 ? totalPartnerCount : 0}
                  totalEconomicValue={displayEconomicValue}
                  resourcesActivatedCount={inventoryResourceCount}
                />
              }
              briefsSection={
                <div className="space-y-3.5">
                  {/* Brief Header with count & CTA */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-slate-700" />
                      <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                        Peluang Kolaborasi Terbuka
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#4CC9FE]/15 text-[#0284c7] border border-[#4CC9FE]/30">
                        {briefStats.openBriefCount} Aktif
                      </span>
                    </div>

                    <Link
                      href="/projects"
                      className="text-xs font-semibold text-[#0284c7] hover:text-[#0369a1] inline-flex items-center gap-1 transition-colors"
                    >
                      <span>Semua Brief</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Empty state or Brief cards */}
                  {briefStats.recentOpenBriefs.length === 0 ? (
                    <div className="p-8 rounded-[22px] bg-white/50 backdrop-blur-xl border border-dashed border-white/90 text-center space-y-2.5 shadow-xs">
                      <div className="w-10 h-10 rounded-full bg-white/95 border border-white/90 shadow-xs flex items-center justify-center mx-auto text-slate-400">
                        <Megaphone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Belum ada brief terbuka</p>
                        <p className="text-xs text-slate-600 max-w-sm mx-auto mt-0.5">
                          Inisiasi brief proyek Anda sendiri untuk mengundang kolaborator komplementer.
                        </p>
                      </div>
                      <Link
                        href="/projects/new"
                        className="btn-primary-pill inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold mt-2"
                      >
                        <Plus className="w-3.5 h-3.5 text-white" />
                        <span>Inisiasi Brief Pertama</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {briefStats.recentOpenBriefs.map((brief: any) => {
                        const openRoles = brief.neededRoles.filter((r: any) => !r.isFilled);
                        return (
                          <article
                            key={brief.id}
                            className="p-5 sm:p-6 rounded-[22px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] hover:bg-white/75 hover:border-white transition-all space-y-3.5 group"
                          >
                            {/* Creator Info Header */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <ActorAvatar
                                  name={brief.creatorActor?.name || "Kreator"}
                                  avatarUrl={brief.creatorActor?.owner?.avatarUrl}
                                  className="w-10 h-10 rounded-full shrink-0 border border-white/90 shadow-xs"
                                  textClassName="text-sm font-semibold"
                                />
                                <div className="min-w-0">
                                  <Link
                                    href={`/directory/${brief.creatorActor?.id || ""}`}
                                    className="font-bold text-sm text-slate-900 hover:text-[#0284c7] transition-colors truncate block"
                                  >
                                    {brief.creatorActor?.name}
                                  </Link>
                                  <p className="text-xs text-slate-600 font-medium">
                                    {brief.creatorActor?.sector} {brief.creatorActor?.location ? `• ${brief.creatorActor.location}` : ""}
                                  </p>
                                </div>
                              </div>

                              <span className="shrink-0 text-xs font-semibold text-slate-700 bg-white/80 px-2.5 py-0.5 rounded-full border border-white/80 shadow-2xs">
                                {openRoles.length} Peran Terbuka
                              </span>
                            </div>

                            {/* Brief Title & Description Preview */}
                            <div className="space-y-1">
                              <Link href={`/projects/${brief.id}`} className="block">
                                <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#0284c7] transition-colors leading-snug">
                                  {brief.title}
                                </h3>
                              </Link>
                              {brief.description && (
                                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                                  {brief.description}
                                </p>
                              )}
                            </div>

                            {/* Needed Roles Badges */}
                            <div className="space-y-1.5 pt-1 border-t border-slate-100">
                              <div className="flex flex-wrap gap-1.5">
                                {brief.neededRoles.map((role: any) => (
                                  <span
                                    key={role.id}
                                    className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                                      role.isFilled
                                        ? "bg-slate-50 text-slate-400 border-slate-200 line-through"
                                        : "bg-white/80 text-slate-700 border-white/80 shadow-2xs"
                                    }`}
                                  >
                                    {role.roleLabel}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Card Action Link */}
                            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                              <span className="text-xs text-slate-400">
                                Perlindungan SPK &amp; Co-Credit
                              </span>
                              <Link
                                href={`/projects/${brief.id}`}
                                className="btn-primary-pill inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
                              >
                                <span>Tinjau &amp; Lamar Peran</span>
                                <ArrowRight className="w-3.5 h-3.5 text-white" />
                              </Link>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              }
              bookingsSection={
                <div className="p-5 sm:p-6 rounded-[22px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Inbox className="w-4 h-4 text-slate-700" />
                      <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                        Pesanan Booking Masuk
                      </h2>
                      {pendingBookingCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#111827] text-white">
                          {pendingBookingCount} Baru
                        </span>
                      )}
                    </div>

                    <Link
                      href="/collaborations?section=contracts"
                      className="text-xs font-semibold text-[#0284c7] hover:text-[#0369a1] inline-flex items-center gap-1 transition-colors"
                    >
                      <span>Semua Pesanan ({totalIncomingBookings})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {recentBookings.length === 0 ? (
                    <div className="p-8 rounded-[22px] bg-white/50 backdrop-blur-xl border border-dashed border-white/90 text-center space-y-2.5 shadow-xs">
                      <div className="w-10 h-10 rounded-full bg-white/95 border border-white/90 shadow-xs flex items-center justify-center mx-auto text-slate-400">
                        <Inbox className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-bold text-slate-900">Belum ada pesanan booking baru</p>
                      <p className="text-xs text-slate-600 max-w-sm mx-auto font-normal">
                        Pesanan langsung dari brand atau kreator lain akan muncul di sini.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {recentBookings.map((b: any) => {
                        const details = b.details as { serviceType?: string; notes?: string } | null;
                        const statusColor =
                          b.status === "ACCEPTED"
                            ? "bg-white/90 text-slate-900 border-white/80"
                            : b.status === "DECLINED"
                            ? "bg-rose-50/80 text-rose-700 border-rose-200/80"
                            : "bg-white/80 text-slate-700 border-white/80";

                        const statusLabel =
                          b.status === "ACCEPTED"
                            ? "Diterima"
                            : b.status === "DECLINED"
                            ? "Ditolak"
                            : "Menunggu Respon";

                        return (
                          <div
                            key={b.id}
                            className="p-4 rounded-[20px] bg-white/75 hover:bg-white/95 border border-white/90 hover:border-white transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-900">
                                  {b.requester.name}
                                </span>
                                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/90 text-slate-700 border border-white/80 shadow-2xs">
                                  {b.requester.sector}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                {details?.serviceType || details?.notes || "Permintaan jasa kreatif langsung."}
                              </p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusColor} shadow-2xs`}>
                                {statusLabel}
                              </span>
                              <Link
                                href="/collaborations?section=contracts"
                                className="text-xs font-semibold text-[#0284c7] hover:text-[#0369a1] inline-flex items-center gap-1 transition-colors"
                              >
                                <span>Tanggapi</span>
                                <ArrowRight className="w-3.5 h-3.5" />
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

            <CreativeSpotlightStrip />
          </main>

          {/* RIGHT COLUMN: REKOMENDASI & AGENDA (3 Cols) */}
          <aside className="lg:col-span-3 space-y-4 lg:sticky lg:top-6">
            {/* Card 1: Rekomendasi Rekan Kolaborator */}
            <div className="p-4 sm:p-5 rounded-[22px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/95 border border-white/80 shadow-2xs flex items-center justify-center">
                    <Users className="w-3.5 h-3.5 text-[#0284c7]" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Rekan Komplementer
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-600">Sektor Berbeda</span>
              </div>

              <div className="space-y-3">
                {canonicalActors.slice(0, 4).map((actor) => (
                    <div key={actor.id} className="flex items-center justify-between gap-2.5">
                      <Link
                        href={`/directory/${actor.id}`}
                        className="flex items-center gap-2.5 min-w-0 group flex-1"
                      >
                        <div className="relative shrink-0">
                          <ActorAvatar
                            name={actor.name}
                            avatarUrl={actor.owner?.avatarUrl}
                            className="w-8.5 h-8.5 rounded-full border border-white/90 shadow-2xs"
                            textClassName="text-xs font-semibold"
                          />
                          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-[#0284c7] transition-colors">
                            {actor.name}
                          </p>
                          <p className="text-[11px] text-slate-600 font-medium leading-tight mt-0.5">
                            {actor.sector} {actor.location ? `• ${actor.location}` : ""}
                          </p>
                        </div>
                      </Link>

                      <Link
                        href={`/directory/${actor.id}`}
                        className="shrink-0 px-3 py-1.5 rounded-full bg-white/90 hover:bg-[#4CC9FE]/15 hover:border-[#4CC9FE]/40 hover:text-[#0284c7] border border-white/80 text-xs font-semibold text-slate-900 transition-all shadow-xs"
                      >
                        + Ajak
                      </Link>
                    </div>
                  ))}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <Link
                  href="/directory"
                  className="w-full py-1 text-center text-xs font-semibold text-[#0284c7] hover:text-[#0369a1] block transition-colors"
                >
                  Jelajahi Direktori Lengkap &rarr;
                </Link>
              </div>
            </div>

            {/* Card 2: Agenda & Jadwal Produksi */}
            <div className="p-4 sm:p-5 rounded-[22px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/95 border border-white/80 shadow-2xs flex items-center justify-center">
                    <Calendar className="w-3.5 h-3.5 text-[#0284c7]" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Agenda Produksi
                  </h3>
                </div>
                <span className="text-xs text-slate-600 font-semibold tabular-nums">
                  {agendaItems.length} Terjadwal
                </span>
              </div>

              {agendaItems.length === 0 ? (
                <div className="p-4 rounded-[20px] bg-white/50 backdrop-blur-xl border border-dashed border-white/90 text-center space-y-2">
                  <div className="w-8 h-8 rounded-full bg-white/95 border border-white/80 shadow-2xs flex items-center justify-center mx-auto text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-slate-900">Belum Ada Agenda Aktif</p>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto font-normal">
                    Jadwal sesi foto, fitting, atau milestone kolaborasi yang disetujui akan tercatat otomatis di sini.
                  </p>
                  <div className="pt-1">
                    <Link
                      href="/projects"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#0284c7] hover:text-[#0369a1] transition-colors"
                    >
                      <span>Jelajahi Brief Proyek</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {agendaItems.slice(0, 3).map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="block p-3.5 rounded-[18px] bg-white/70 hover:bg-white/95 border border-white/90 transition-all space-y-1 group shadow-xs"
                    >
                      <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.dateLabel}</span>
                        </span>
                        <span className="bg-white/90 px-2 py-0.5 rounded-full border border-white/80 text-slate-700 text-[10px] font-bold shadow-2xs">
                          {item.badge}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#0284c7] transition-colors leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-600 flex items-center gap-1.5 leading-relaxed">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{item.locationLabel}</span>
                      </p>
                    </Link>
                  ))}
                </div>
              )}

              <div className="pt-1.5 border-t border-slate-100">
                <Link
                  href="/collaborations"
                  className="w-full py-1 text-center text-xs font-semibold text-[#0284c7] hover:text-[#0369a1] block transition-colors"
                >
                  Lihat Kalender Kolaborasi &rarr;
                </Link>
              </div>
            </div>

            {/* Card 3: Jaminan Perlindungan SPK RAMU */}
            <div className="p-4 sm:p-5 rounded-[22px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/95 border border-white/80 shadow-2xs flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                  Jaminan Transaksi SPK Digital
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Setiap kesepakatan kolaborasi di RAMU dilindungi kontrak SPK otomatis, kepastian hak cipta karya, dan escrow pembayaran aman.
              </p>
              <div className="pt-0.5">
                <Link
                  href="/collaborations"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0284c7] hover:text-[#0369a1] transition-colors"
                >
                  <span>Buka Workspace &amp; SPK</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </AppShell>
  );
}

