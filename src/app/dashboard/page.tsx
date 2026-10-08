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
      <div className="w-full">
        {/* 3-COLUMN LINKEDIN WORKSPACE ARCHITECTURE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

          {/* LEFT COLUMN: IDENTITY ANCHOR & SHORTCUTS (3 Cols) */}
          <aside className="lg:col-span-3 space-y-4 lg:sticky lg:top-6">
            {/* Identity Card */}
            <div className="rounded-[24px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] overflow-hidden">
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
                    className="font-bold text-sm text-[#111827] hover:text-[#0284c7] transition-colors block"
                  >
                    {primaryActor.name}
                  </Link>
                  <p className="text-xs text-[#4B5563] font-medium">
                    {primaryActor.location || "Indonesia"}
                  </p>
                </div>

                {primaryActor.description && (
                  <p className="text-xs text-[#4B5563] mt-2 leading-relaxed">
                    {primaryActor.description}
                  </p>
                )}
              </div>

              {/* Quick Key Metrics */}
              <div className="border-t border-slate-100 mt-3.5 pt-3 px-4 pb-3 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#4B5563]">
                  <span className="font-medium">Resource Anda</span>
                  <span className="font-bold text-[#111827] tabular-nums">{inventoryResourceCount}</span>
                </div>
                <div className="flex items-center justify-between text-[#4B5563]">
                  <span className="font-medium">Brief Dibuat</span>
                  <span className="font-bold text-[#111827] tabular-nums">{briefStats.myBriefCount}</span>
                </div>
                <div className="flex items-center justify-between text-[#4B5563]">
                  <span className="font-medium">Pesanan Masuk</span>
                  <span className="font-bold text-[#111827] tabular-nums">{pendingBookingCount}</span>
                </div>
              </div>

              {/* Profile Readiness Bar */}
              <div className="border-t border-slate-100 pt-3 px-4 pb-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#4B5563]">Kesiapan Profil</span>
                  <span className="font-bold text-[#111827] tabular-nums">
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
                  href="/readiness"
                  className="font-semibold text-[#0284c7] hover:text-[#0369a1] inline-flex items-center gap-1 transition-colors"
                >
                  <span>Kelola Kesiapan Profil</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Navigasi Cepat Card */}
            <div className="p-4 sm:p-5 rounded-[24px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] space-y-1 text-xs">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2.5 py-1">
                Navigasi Cepat
              </h3>
              <Link
                href="/projects"
                className="flex items-center justify-between px-2.5 py-2 rounded-xl text-slate-700 hover:bg-[#4CC9FE]/10 hover:text-[#0284c7] transition-all font-medium group"
              >
                <div className="flex items-center gap-2.5">
                  <Megaphone className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#0284c7] transition-colors" />
                  <span>Brief Proyek</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 group-hover:bg-white group-hover:text-[#0284c7] border border-transparent group-hover:border-[#4CC9FE]/30 tabular-nums transition-colors">
                  {briefStats.openBriefCount}
                </span>
              </Link>
              <Link
                href="/readiness"
                className="flex items-center justify-between px-2.5 py-2 rounded-xl text-slate-700 hover:bg-[#4CC9FE]/10 hover:text-[#0284c7] transition-all font-medium group"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#0284c7] transition-colors" />
                  <span>Inventaris &amp; Alat</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 group-hover:bg-white group-hover:text-[#0284c7] border border-transparent group-hover:border-[#4CC9FE]/30 tabular-nums transition-colors">
                  {inventoryResourceCount}
                </span>
              </Link>
              <Link
                href="/collaborations"
                className="flex items-center justify-between px-2.5 py-2 rounded-xl text-slate-700 hover:bg-[#4CC9FE]/10 hover:text-[#0284c7] transition-all font-medium group"
              >
                <div className="flex items-center gap-2.5">
                  <Handshake className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#0284c7] transition-colors" />
                  <span>Workspace &amp; SPK</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 group-hover:bg-white group-hover:text-[#0284c7] border border-transparent group-hover:border-[#4CC9FE]/30 tabular-nums transition-colors">
                  {userCollaborations.length}
                </span>
              </Link>
              <Link
                href="/showcase"
                className="flex items-center justify-between px-2.5 py-2 rounded-xl text-slate-700 hover:bg-[#4CC9FE]/10 hover:text-[#0284c7] transition-all font-medium group"
              >
                <div className="flex items-center gap-2.5">
                  <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#0284c7] transition-colors" />
                  <span>Galeri Lookbook</span>
                </div>
              </Link>
              <Link
                href="/directory"
                className="flex items-center justify-between px-2.5 py-2 rounded-xl text-slate-700 hover:bg-[#4CC9FE]/10 hover:text-[#0284c7] transition-all font-medium group"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#0284c7] transition-colors" />
                  <span>Direktori Kreatif</span>
                </div>
              </Link>
            </div>
          </aside>

          {/* CENTER COLUMN: ACTION PROMPT & FEED (6 Cols) */}
          <main className="lg:col-span-6 space-y-4 min-w-0">
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

            {/* LinkedIn-Style Action Prompt Box */}
            <div className="p-4 sm:p-5 rounded-[24px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] space-y-3">
              <div className="flex items-center gap-3">
                <ActorAvatar
                  name={primaryActor.name}
                  avatarUrl={profile?.avatarUrl}
                  className="w-10 h-10 rounded-full shrink-0 border border-white/90 shadow-xs"
                  textClassName="text-xs font-semibold"
                />
                <Link
                  href="/projects/new"
                  className="flex-1 bg-white/70 hover:bg-white/95 border border-white/90 hover:border-[#4CC9FE]/50 text-[#4B5563] hover:text-[#111827] text-xs px-4 py-2.5 rounded-full transition-all font-medium flex items-center justify-between shadow-xs"
                >
                  <span>Mencari kolaborator atau tawarkan studio? Inisiasi brief...</span>
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
                  href="/readiness"
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-full text-slate-700 hover:text-[#0284c7] hover:bg-[#4CC9FE]/10 transition-all group"
                >
                  <Layers className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#0284c7] transition-colors" />
                  <span className="truncate font-semibold">Tawarkan Alat</span>
                </Link>
                <Link
                  href="/collaborate"
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-full text-slate-700 hover:text-[#0284c7] hover:bg-[#4CC9FE]/10 transition-all group"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#0284c7] transition-colors" />
                  <span className="truncate font-semibold">Cari Tim Cocok</span>
                </Link>
              </div>
            </div>

            {/* Dashboard Feed Container with Clean Single-Tab Display */}
            <DashboardFeedContainer
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
                      <h2 className="text-sm font-bold text-[#111827] tracking-tight">
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
                    <div className="p-8 rounded-[24px] bg-white/50 backdrop-blur-xl border border-dashed border-white/90 text-center space-y-2.5 shadow-xs">
                      <div className="w-10 h-10 rounded-full bg-white/95 border border-white/90 shadow-xs flex items-center justify-center mx-auto text-slate-400">
                        <Megaphone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#111827]">Belum ada brief terbuka</p>
                        <p className="text-xs text-[#4B5563] max-w-sm mx-auto mt-0.5">
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
                            className="p-5 sm:p-6 rounded-[24px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] hover:bg-white/75 hover:border-white transition-all space-y-3.5 group"
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
                                    className="font-bold text-sm text-[#111827] hover:text-[#0284c7] transition-colors truncate block"
                                  >
                                    {brief.creatorActor?.name}
                                  </Link>
                                  <p className="text-xs text-[#4B5563] font-medium">
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
                                <h3 className="font-bold text-sm sm:text-base text-[#111827] group-hover:text-[#0284c7] transition-colors leading-snug">
                                  {brief.title}
                                </h3>
                              </Link>
                              {brief.description && (
                                <p className="text-xs text-[#4B5563] leading-relaxed font-normal">
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
                <div className="p-5 sm:p-6 rounded-[24px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Inbox className="w-4 h-4 text-slate-700" />
                      <h2 className="text-sm font-bold text-[#111827] tracking-tight">
                        Pesanan Booking Masuk
                      </h2>
                      {pendingBookingCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#111827] text-white">
                          {pendingBookingCount} Baru
                        </span>
                      )}
                    </div>

                    <Link
                      href="/dashboard/bookings"
                      className="text-xs font-semibold text-[#0284c7] hover:text-[#0369a1] inline-flex items-center gap-1 transition-colors"
                    >
                      <span>Semua Pesanan ({totalIncomingBookings})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {recentBookings.length === 0 ? (
                    <div className="p-8 rounded-[24px] bg-white/50 backdrop-blur-xl border border-dashed border-white/90 text-center space-y-2.5 shadow-xs">
                      <div className="w-10 h-10 rounded-full bg-white/95 border border-white/90 shadow-xs flex items-center justify-center mx-auto text-slate-400">
                        <Inbox className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-bold text-[#111827]">Belum ada pesanan booking baru</p>
                      <p className="text-xs text-[#4B5563] max-w-sm mx-auto font-normal">
                        Pesanan langsung dari brand atau kreator lain akan muncul di sini.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {recentBookings.map((b: any) => {
                        const details = b.details as { serviceType?: string; notes?: string } | null;
                        const statusColor =
                          b.status === "ACCEPTED"
                            ? "bg-white/90 text-[#111827] border-white/80"
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
                                <span className="font-bold text-sm text-[#111827]">
                                  {b.requester.name}
                                </span>
                                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/90 text-slate-700 border border-white/80 shadow-2xs">
                                  {b.requester.sector}
                                </span>
                              </div>
                              <p className="text-xs text-[#4B5563] leading-relaxed">
                                {details?.serviceType || details?.notes || "Permintaan jasa kreatif langsung."}
                              </p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusColor} shadow-2xs`}>
                                {statusLabel}
                              </span>
                              <Link
                                href="/dashboard/bookings"
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
            <div className="p-4 sm:p-5 rounded-[24px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/95 border border-white/80 shadow-2xs flex items-center justify-center">
                    <Users className="w-3.5 h-3.5 text-[#0284c7]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#111827] tracking-tight">
                    Rekomendasi Rekan
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-[#4B5563]">Komplementer</span>
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
                          <p className="text-xs font-bold text-[#111827] group-hover:text-[#0284c7] transition-colors">
                            {actor.name}
                          </p>
                          <p className="text-[11px] text-[#4B5563] font-medium leading-tight mt-0.5">
                            {actor.sector} {actor.location ? `• ${actor.location}` : ""}
                          </p>
                        </div>
                      </Link>

                      <Link
                        href={`/directory/${actor.id}`}
                        className="shrink-0 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-[#4CC9FE]/15 hover:border-[#4CC9FE]/40 hover:text-[#0284c7] border border-white/80 text-xs font-semibold text-[#111827] transition-all shadow-xs"
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
            <div className="p-4 sm:p-5 rounded-[24px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/95 border border-white/80 shadow-2xs flex items-center justify-center">
                    <Calendar className="w-3.5 h-3.5 text-[#0284c7]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#111827] tracking-tight">
                    Agenda Produksi
                  </h3>
                </div>
                <span className="text-xs text-[#4B5563] font-semibold tabular-nums">
                  {agendaItems.length} Terjadwal
                </span>
              </div>

              {agendaItems.length === 0 ? (
                <div className="p-4 rounded-[20px] bg-white/50 backdrop-blur-xl border border-dashed border-white/90 text-center space-y-2">
                  <div className="w-8 h-8 rounded-full bg-white/95 border border-white/80 shadow-2xs flex items-center justify-center mx-auto text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-[#111827]">Belum Ada Agenda Aktif</p>
                  <p className="text-xs text-[#4B5563] leading-relaxed max-w-xs mx-auto font-normal">
                    Jadwal sesi foto, fitting, atau target milestone kolaborasi yang disetujui akan tercatat otomatis di sini.
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
                      <div className="flex items-center justify-between text-xs font-medium text-[#4B5563]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.dateLabel}</span>
                        </span>
                        <span className="bg-white/90 px-2 py-0.5 rounded-full border border-white/80 text-slate-700 text-[10px] font-bold shadow-2xs">
                          {item.badge}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[#111827] group-hover:text-[#0284c7] transition-colors leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#4B5563] flex items-center gap-1.5 leading-relaxed">
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

            {/* Card 3: Kepastian SPK Digital RAMU */}
            <div className="p-4 sm:p-5 rounded-[24px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/95 border border-white/80 shadow-2xs flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0284c7]" />
                </div>
                <h3 className="text-xs font-bold text-[#111827] tracking-tight">
                  Kepastian SPK Digital
                </h3>
              </div>
              <p className="text-xs text-[#4B5563] leading-relaxed font-normal">
                Setiap kesepakatan kolaborasi di RAMU dilindungi Surat Perjanjian Kerja (SPK) otomatis dan transparansi hak cipta karya bersama.
              </p>
              <div className="pt-0.5">
                <Link
                  href="/collaborations"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0284c7] hover:text-[#0369a1] transition-colors"
                >
                  <span>Buka Draf SPK Proyek</span>
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
