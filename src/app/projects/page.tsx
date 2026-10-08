import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { getProjectBriefs } from "@/application/projectBriefService";
import { getOpportunities } from "@/application/opportunityService";
import { ProjectBriefCard } from "@/components/projects/ProjectBriefCard";
import { ProjectFilterBar } from "@/components/projects/ProjectFilterBar";
import { RunEngineButton } from "@/app/opportunities/RunEngineButton";
import { OpportunityCard, OpportunityCardProps } from "@/app/opportunities/OpportunityCard";
import { WithdrawInterestButton } from "@/components/projects/WithdrawInterestButton";
import { InvitationResponseButtons } from "@/components/projects/InvitationResponseButtons";
import { AppShell } from "@/components/layout/AppShell";
import {
  Briefcase,
  Users,
  CircleDollarSign,
  Layers,
  Sparkles,
  Plus,
  Send,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  FileText,
  Inbox,
  BarChart3,
  Check,
} from "lucide-react";

export const metadata = {
  title: "Papan Proyek & Lowongan Kru | RAMU",
  description:
    "Eksplorasi brief produksi komersial, temukan lowongan kru kreatif, serta ajukan minat kolaborasi dengan transparansi fee dan kompensasi terjamin.",
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    search?: string;
    role?: string;
    location?: string;
    compensation?: string;
    scope?: string;
    feasibility?: string;
    actorId?: string;
    view?: string;
  }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?redirectTo=/projects&message=${encodeURIComponent(
        "Silakan masuk atau daftar untuk meninjau dan melamar ke project briefs serta rekomendasi kecocokan kolaborasi."
      )}`
    );
  }

  const actor = await prisma.actor.findFirst({
    where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    include: {
      owner: {
        select: {
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (!actor) redirect("/onboarding");

  const params = await searchParams;
  const activeTab = params?.tab || "browse";
  const search = params?.search || "";
  const role = params?.role || "ALL";
  const location = params?.location || "ALL";
  const compensation = params?.compensation || "ALL";
  const scopeFilter = params?.scope || "my";
  const feasibilityFilter = params?.feasibility || "ALL";
  const currentView = (params?.view === "list" ? "list" : "grid") as "grid" | "list";

  // Comprehensive analytics counts across database for job board ribbon
  const [
    openBriefsCount,
    myBriefsCount,
    myInterestsCount,
    aiOpportunitiesCount,
    openRolesCount,
    commercialBriefsCount,
  ] = await Promise.all([
    prisma.projectBrief.count({ where: { status: "OPEN" } }),
    prisma.projectBrief.count({ where: { creatorActorId: actor.id } }),
    prisma.collaborationInterest.count({
      where: { actorId: actor.id },
    }),
    prisma.opportunity.count({
      where: { status: { not: "ARCHIVED" } },
    }),
    prisma.projectBriefRole.count({
      where: { isFilled: false, brief: { status: "OPEN" } },
    }),
    prisma.projectBrief.count({
      where: {
        status: "OPEN",
        OR: [
          { compensationModel: { contains: "PAID", mode: "insensitive" } },
          { compensationModel: { contains: "Berbayar", mode: "insensitive" } },
        ],
      },
    }),
  ]);

  // Data fetching tailored to active tab
  const [allBriefs, myBriefs, myInterests, opportunitiesData] = await Promise.all([
    activeTab === "browse" || activeTab === "all"
      ? getProjectBriefs({
          status: "OPEN",
          search: search || undefined,
          roleCategory: role !== "ALL" ? role : undefined,
          location: location !== "ALL" ? location : undefined,
          compensationModel: compensation !== "ALL" ? compensation : undefined,
        })
      : Promise.resolve([]),
    activeTab === "mine"
      ? getProjectBriefs({ creatorActorId: actor.id, search: search || undefined })
      : Promise.resolve([]),
    activeTab === "interests"
      ? prisma.collaborationInterest.findMany({
          where: { actorId: actor.id },
          include: {
            brief: {
              include: {
                creatorActor: { select: { name: true, sector: true } },
                neededRoles: {
                  include: {
                    interests: {
                      where: { actorId: actor.id },
                      select: { status: true },
                    },
                  },
                },
              },
            },
            role: true,
          },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
    activeTab === "ai-opportunities"
      ? (async () => {
          let opps = await getOpportunities({
            actorId: scopeFilter === "my" ? actor.id : undefined,
            feasibility: feasibilityFilter === "ALL" ? undefined : feasibilityFilter,
          });

          if (opps.length === 0 && feasibilityFilter === "ALL") {
            const actorCount = await prisma.actor.count({ where: { status: "ACTIVE" } });
            if (actorCount >= 2) {
              const { generateAndSaveOpportunities } = await import(
                "@/application/opportunityService"
              );
              await generateAndSaveOpportunities({ focusActorId: actor.id });
              opps = await getOpportunities({
                actorId: scopeFilter === "my" ? actor.id : undefined,
              });
            }
          }
          return opps;
        })()
      : Promise.resolve([]),
  ]);

  const tabs = [
    {
      key: "browse",
      label: "Semua Brief Proyek",
      count: openBriefsCount,
      isAi: false,
    },
    {
      key: "ai-opportunities",
      label: "Peluang Kompatibel",
      count: aiOpportunitiesCount || opportunitiesData.length,
      isAi: false,
    },
    {
      key: "mine",
      label: "Brief Saya",
      count: myBriefsCount,
      isAi: false,
    },
    {
      key: "interests",
      label: "Pengajuan & Minat Saya",
      count: myInterestsCount,
      isAi: false,
    },
  ];

  return (
    <AppShell actor={actor} activeRoute="/projects">
      <div className="space-y-6 w-full max-w-7xl mx-auto">
        {/* 1. HEADER BANNER */}
        <section className="pb-6 border-b border-slate-200/60">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-[#4CC9FE]/30 text-[11px] font-semibold text-[#0284c7] shadow-2xs">
                <Briefcase className="w-3.5 h-3.5 text-[#0284c7]" />
                <span>Pusat Peluang &amp; Brief Proyek Kreatif</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Eksplorasi Proyek &amp; Lowongan Kru
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Eksplorasi brief produksi komersial, temukan lowongan peran kreatif yang sesuai keahlian Anda, atau inisiasi proyek baru untuk merekrut kru talenta terbaik.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
              <Link
                href="/directory"
                className="inline-flex items-center gap-1.5 px-4.5 py-2 text-xs font-semibold text-slate-700 bg-white/80 hover:bg-white border border-white/80 rounded-full shadow-2xs hover:shadow-xs transition-all"
              >
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>Direktori Talenta</span>
              </Link>
              <Link
                href="/projects/new"
                className="btn-primary-pill inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Inisiasi Brief Baru</span>
              </Link>
            </div>
          </div>

          {/* 4-Tile Job Board Analytics Ribbon (Glass Cards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {/* Tile 1: Brief Aktif */}
            <div className="glass-card p-4.5 rounded-[22px] border-white/80 shadow-2xs transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-[11px] font-medium text-slate-500">Brief Proyek Aktif</span>
                <div className="w-8 h-8 rounded-xl bg-[#4CC9FE]/15 border border-[#4CC9FE]/30 flex items-center justify-center text-[#0284c7]">
                  <Briefcase className="w-4 h-4 text-[#0284c7]" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {openBriefsCount}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Peluang produksi terbuka
              </div>
            </div>

            {/* Tile 2: Slot Peran Terbuka */}
            <div className="glass-card p-4.5 rounded-[22px] border-white/80 shadow-2xs transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-[11px] font-medium text-slate-500">Slot Peran Terbuka</span>
                <div className="w-8 h-8 rounded-xl bg-[#4CC9FE]/15 border border-[#4CC9FE]/30 flex items-center justify-center text-[#0284c7]">
                  <Users className="w-4 h-4 text-[#0284c7]" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {openRolesCount}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Fotografer, MUA, Stylist, dll
              </div>
            </div>

            {/* Tile 3: Brief Komersial Berbayar */}
            <div className="glass-card p-4.5 rounded-[22px] border-white/80 shadow-2xs transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-[11px] font-medium text-slate-500">Fee Komersial (Paid)</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600">
                  <CircleDollarSign className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {commercialBriefsCount}
              </div>
              <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
                Fee &amp; anggaran terjamin
              </div>
            </div>

            {/* Tile 4: Aktivitas Saya */}
            <div className="glass-card p-4.5 rounded-[22px] border-white/80 shadow-2xs transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-[11px] font-medium text-slate-500">Aktivitas Saya</span>
                <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200/80 flex items-center justify-center text-[#0284c7]">
                  <Send className="w-4 h-4 text-[#0284c7]" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {myInterestsCount} <span className="text-xs font-normal text-slate-400">Lamaran</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {myBriefsCount} Brief diinisiasi Anda
              </div>
            </div>
          </div>
        </section>

        {/* 2. GLASS SEGMENTED PILL TABS NAVIGATION */}
        <div className="p-1.5 bg-white/70 backdrop-blur-md rounded-full border border-white/80 inline-flex items-center gap-1.5 max-w-full overflow-x-auto no-scrollbar shadow-2xs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Link
                key={tab.key}
                href={`/projects?tab=${tab.key}`}
                className={`px-4 py-2 rounded-full text-xs transition-all relative flex items-center gap-2 cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-[#4CC9FE] text-white font-semibold shadow-md shadow-[#4CC9FE]/25"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60 font-medium"
                }`}
              >
                {tab.isAi && (
                  <Sparkles
                    className={`w-3.5 h-3.5 ${
                      isActive ? "text-white" : "text-slate-400"
                    }`}
                  />
                )}
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-white/90 text-slate-700 border border-slate-200/60 shadow-2xs"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* 3. TAB 1: PAPAN PROYEK TERBUKA (JOB BOARD) */}
        {activeTab === "browse" && (
          <div className="space-y-5">
            {/* FILTER & DISCOVERY BAR */}
            <ProjectFilterBar
              currentSearch={search}
              currentRole={role}
              currentLocation={location}
              currentCompensation={compensation}
              currentView={currentView}
              userSector={actor.sector}
            />

            {/* RESULTS METADATA BAR */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-0.5">
              <span>
                Menampilkan <strong className="text-slate-900 font-semibold">{allBriefs.length}</strong> project brief
                {search && (
                  <span>
                    {" "}
                    untuk pencarian &ldquo;{search}&rdquo;
                  </span>
                )}
                {role !== "ALL" && (
                  <span>
                    {" "}
                    dengan peran &ldquo;{role}&rdquo;
                  </span>
                )}
                {compensation !== "ALL" && (
                  <span>
                    {" "}
                    skema &ldquo;{compensation}&rdquo;
                  </span>
                )}
                {location !== "ALL" && (
                  <span>
                    {" "}
                    di &ldquo;{location}&rdquo;
                  </span>
                )}
              </span>
            </div>

            {/* EMPTY STATE OR CARDS */}
            {allBriefs.length === 0 ? (
              <div className="glass-card p-12 text-center rounded-[22px] border-dashed border-slate-300/80 space-y-4">
                <div className="w-14 h-14 bg-white/90 rounded-2xl border border-white/80 flex items-center justify-center mx-auto text-[#0284c7] shadow-xs">
                  <Briefcase className="w-6 h-6 text-[#0284c7]" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900">
                    Tidak Ada Project Brief yang Sesuai
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed font-normal">
                    {search || role !== "ALL" || compensation !== "ALL" || location !== "ALL"
                      ? "Coba ubah kata kunci pencarian atau bersihkan filter peran & kompensasi untuk melihat lowongan proyek lainnya."
                      : "Belum ada project brief terbuka saat ini. Jadilah yang pertama mempublikasikan kebutuhan kru kreatif Anda."}
                  </p>
                </div>
                <Link
                  href="/projects/new"
                  className="btn-primary-pill inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Inisiasi Brief Baru</span>
                </Link>
              </div>
            ) : (
              <div
                className={
                  currentView === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                    : "space-y-3"
                }
              >
                {allBriefs.map((brief) => (
                  <ProjectBriefCard
                    key={brief.id}
                    id={brief.id}
                    title={brief.title}
                    description={brief.description}
                    projectType={brief.projectType}
                    targetOutput={brief.targetOutput}
                    location={brief.location || brief.creatorActor.location}
                    compensationModel={brief.compensationModel}
                    status={brief.status}
                    neededRoles={brief.neededRoles}
                    creatorActor={brief.creatorActor}
                    createdAt={brief.createdAt}
                    isOwnBrief={brief.creatorActorId === actor.id}
                    budget={brief.budget}
                    timeline={brief.timeline}
                    aestheticStyle={brief.aestheticStyle}
                    userSector={actor.sector}
                    viewMode={currentView}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. TAB 2: PELUANG KOLABORASI CERDAS AI */}
        {activeTab === "ai-opportunities" && (
          <div className="space-y-5">
            {/* MATCH ENGINE HERO BANNER */}
            <div className="glass-card p-4.5 sm:p-5 rounded-[22px] border-white/80 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
              <div className="space-y-1.5 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#0284c7] bg-[#4CC9FE]/15 px-2.5 py-0.5 rounded-full border border-[#4CC9FE]/30 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-[#0284c7]" />
                  <span>Deterministic Collaboration Match Engine</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  Rekomendasi Kolaborasi &amp; Sinergi Resource Komplementer
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Sistem RAMU menganalisis kompatibilitas aset, ketersediaan alat, dan kebutuhan para kreator di ekosistem untuk membentuk tim produksi ideal secara objektif, terukur, dan transparan.
                </p>
              </div>

              <div className="shrink-0">
                <RunEngineButton actorName={actor.name} />
              </div>
            </div>

            {/* AI SCOPE & FEASIBILITY CONTROLS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
              <div className="inline-flex p-1 bg-white/70 backdrop-blur-md rounded-full border border-white/80 text-xs font-medium shadow-2xs">
                <Link
                  href={`/projects?tab=ai-opportunities&scope=my${
                    feasibilityFilter !== "ALL" ? `&feasibility=${feasibilityFilter}` : ""
                  }`}
                  className={`px-3.5 py-1.5 rounded-full transition-all ${
                    scopeFilter === "my"
                      ? "bg-[#4CC9FE] text-white shadow-xs font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Relevan Untuk Saya
                </Link>
                <Link
                  href={`/projects?tab=ai-opportunities&scope=all${
                    feasibilityFilter !== "ALL" ? `&feasibility=${feasibilityFilter}` : ""
                  }`}
                  className={`px-3.5 py-1.5 rounded-full transition-all ${
                    scopeFilter === "all"
                      ? "bg-[#4CC9FE] text-white shadow-xs font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Seluruh Ekosistem
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { key: "ALL", label: "Semua Kelayakan" },
                    { key: "FEASIBLE", label: "Layak (Feasible)" },
                    { key: "PROMISING", label: "Menjanjikan" },
                    { key: "PARTIAL", label: "Perlu Pelengkap" },
                  ].map((item) => {
                    const isActive = feasibilityFilter === item.key;
                    return (
                      <Link
                        key={item.key}
                        href={`/projects?tab=ai-opportunities&scope=${scopeFilter}${
                          item.key !== "ALL" ? `&feasibility=${item.key}` : ""
                        }`}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all border backdrop-blur-md ${
                          isActive
                            ? "bg-[#4CC9FE] text-white border-[#4CC9FE] shadow-xs font-semibold"
                            : "bg-white/80 text-slate-700 border-white/80 hover:bg-white shadow-2xs"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>

                <Link
                  href="/engine-insights"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white/80 hover:bg-white border border-white/80 rounded-full shadow-2xs transition-all"
                  title="Lihat sinyal evaluasi dan audit komplementaritas engine"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Audit Engine</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* AI OPPORTUNITY CARDS */}
            {opportunitiesData.length === 0 ? (
              <div className="glass-card p-12 text-center rounded-[22px] border-dashed border-slate-300/80 space-y-4">
                <div className="w-14 h-14 bg-white/90 rounded-2xl border border-white/80 flex items-center justify-center mx-auto text-[#0284c7] shadow-xs">
                  <Sparkles className="w-6 h-6 text-[#0284c7]" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900">
                    Belum Ada Kecocokan Resource yang Terdeteksi
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed font-normal">
                    Klik tombol &ldquo;Hitung Kompatibilitas Resource&rdquo; di atas untuk menganalisis aset dan mempertemukan Anda dengan rekan kolaborator komplementer.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {opportunitiesData.map((opp) => {
                  const isCurrentUserParticipant = opp.participants.some(
                    (p) => p.actorId === actor.id
                  );
                  const latestScore = opp.scores?.[0];

                  return (
                    <OpportunityCard
                      key={opp.id}
                      id={opp.id}
                      title={opp.title}
                      description={opp.description}
                      patternCode={opp.patternCode}
                      patternName={opp.pattern?.name}
                      patternCategory={opp.pattern?.category}
                      feasibilityStatus={opp.feasibilityStatus}
                      status={opp.status}
                      expectedOutputs={(opp.expectedOutputs as string[]) || []}
                      explanation={
                        (opp.explanation as unknown as OpportunityCardProps["explanation"]) || {}
                      }
                      participants={opp.participants.map((p) => ({
                        actorId: p.actorId,
                        roleCode: p.roleCode,
                        roleLabel: p.roleLabel,
                        contribution: p.contribution,
                        actor: {
                          name: p.actor.name,
                          sector: p.actor.sector,
                          location: p.actor.location,
                        },
                      }))}
                      assets={opp.assets.map((a) => ({
                        assetId: a.assetId,
                        contribution: a.contribution,
                        asset: {
                          name: a.asset.name,
                          category: a.asset.category,
                        },
                      }))}
                      score={
                        latestScore
                          ? {
                              complementarityScore: latestScore.complementarityScore,
                              goalAlignmentScore: latestScore.goalAlignmentScore,
                              needCoverageScore: latestScore.needCoverageScore,
                              assetUtilizationScore: latestScore.assetUtilizationScore,
                              feasibilityScore: latestScore.feasibilityScore,
                              actionabilityScore: latestScore.actionabilityScore,
                              overallScore: latestScore.overallScore,
                              scoreExplanation:
                                (latestScore.scoreExplanation as Record<string, unknown>) || {},
                            }
                          : undefined
                      }
                      isCurrentUserParticipant={isCurrentUserParticipant}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 5. TAB 3: BRIEF SAYA */}
        {activeTab === "mine" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between text-xs text-slate-500 px-0.5">
              <span>
                Menampilkan <strong className="text-slate-900 font-semibold">{myBriefs.length}</strong> project brief inisiasi Anda
              </span>
              <Link
                href="/projects/new"
                className="btn-primary-pill inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Brief Baru</span>
              </Link>
            </div>

            {myBriefs.length === 0 ? (
              <div className="glass-card p-12 text-center rounded-[22px] border-dashed border-slate-300/80 space-y-4">
                <div className="w-14 h-14 bg-white/90 rounded-2xl border border-white/80 flex items-center justify-center mx-auto text-[#0284c7] shadow-xs">
                  <FileText className="w-6 h-6 text-[#0284c7]" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900">
                    Belum Ada Project Brief yang Anda Buat
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed font-normal">
                    Mulai proyek produksi lookbook atau kampanye kreatif Anda sekarang, lalu manfaatkan AI Smart Crew untuk mengundang talenta komplementer.
                  </p>
                </div>
                <Link
                  href="/projects/new"
                  className="btn-primary-pill inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Inisiasi Project Brief Baru</span>
                </Link>
              </div>
            ) : (
              <div
                className={
                  currentView === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                    : "space-y-3"
                }
              >
                {myBriefs.map((brief) => (
                  <div key={brief.id} className="relative group space-y-2">
                    <ProjectBriefCard
                      id={brief.id}
                      title={brief.title}
                      description={brief.description}
                      projectType={brief.projectType}
                      targetOutput={brief.targetOutput}
                      location={brief.location || brief.creatorActor.location}
                      compensationModel={brief.compensationModel}
                      status={brief.status}
                      neededRoles={brief.neededRoles}
                      creatorActor={brief.creatorActor}
                      createdAt={brief.createdAt}
                      isOwnBrief={true}
                      budget={brief.budget}
                      timeline={brief.timeline}
                      aestheticStyle={brief.aestheticStyle}
                      userSector={actor.sector}
                      viewMode={currentView}
                    />
                    <div className="flex items-center justify-between px-2 text-xs">
                      <Link
                        href={`/projects/${brief.id}#smart-crew`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0284c7] hover:text-[#0284c7] bg-white/80 hover:bg-white border border-white/80 px-3.5 py-1.5 rounded-full shadow-2xs transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#0284c7]" />
                        <span>Rekomendasi Kru AI</span>
                      </Link>
                      <Link
                        href={`/projects/${brief.id}`}
                        className="text-xs font-semibold text-slate-700 hover:text-[#0284c7] flex items-center gap-1.5 transition-colors bg-white/60 hover:bg-white px-3.5 py-1.5 rounded-full border border-white/80 shadow-2xs"
                      >
                        <span>Kelola Lamaran &amp; SPK</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. TAB 4: MINAT & LAMARAN SAYA */}
        {activeTab === "interests" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between text-xs text-slate-500 px-0.5">
              <span>
                Menampilkan <strong className="text-slate-900 font-semibold">{myInterests.length}</strong> lamaran &amp; minat yang Anda ajukan
              </span>
            </div>

            {myInterests.length === 0 ? (
              <div className="glass-card p-12 text-center rounded-[22px] border-dashed border-slate-300/80 space-y-4">
                <div className="w-14 h-14 bg-white/90 rounded-2xl border border-white/80 flex items-center justify-center mx-auto text-[#0284c7] shadow-xs">
                  <Inbox className="w-6 h-6 text-[#0284c7]" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900">
                    Belum Ada Minat atau Lamaran yang Diajukan
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed font-normal">
                    Jelajahi lowongan proyek terbuka di Papan Proyek dan ajukan aset serta keahlian Anda untuk bergabung sebagai rekan kru komersial.
                  </p>
                </div>
                <Link
                  href="/projects?tab=browse"
                  className="btn-primary-pill inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold cursor-pointer"
                >
                  <span>Jelajahi Lowongan Proyek</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myInterests.map((interest) => {
                  const isInvited = Boolean(interest.isInvited);
                  const statusConfig: Record<string, { label: string; badge: string }> = {
                    PENDING: {
                      label: isInvited ? "Undangan Masuk" : "Menunggu Review",
                      badge: isInvited
                        ? "text-purple-800 bg-purple-50 border-purple-200 font-semibold"
                        : "text-amber-800 bg-amber-50 border-amber-200/80 font-semibold",
                    },
                    ACCEPTED: {
                      label: "Diterima (Siap SPK)",
                      badge: "text-emerald-800 bg-emerald-50 border-emerald-200/80 font-semibold",
                    },
                    DECLINED: {
                      label: isInvited ? "Undangan Ditolak" : "Ditolak",
                      badge: "text-rose-800 bg-rose-50 border-rose-200 font-semibold",
                    },
                    WITHDRAWN: {
                      label: "Ditarik",
                      badge: "text-slate-600 bg-slate-100 border-slate-200 font-semibold",
                    },
                  };
                  const cfg = statusConfig[interest.status] || statusConfig.PENDING;

                  return (
                    <div
                      key={interest.id}
                      className={`glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-4.5 rounded-[22px] border-white/80 hover:border-[#4CC9FE]/40 transition-all duration-300 shadow-2xs ${
                        isInvited && interest.status === "PENDING"
                          ? "bg-purple-50/30 border-purple-200/80"
                          : ""
                      }`}
                    >
                      <Link
                        href={`/projects/${interest.briefId}`}
                        className="min-w-0 space-y-1 group block flex-1"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-900 text-xs sm:text-sm group-hover:text-[#0284c7] transition-colors leading-snug">
                            {interest.brief.title}
                          </span>
                          {isInvited && interest.status === "PENDING" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                              <Sparkles className="w-2.5 h-2.5 text-purple-600" />
                              <span>Diundang Inisiator</span>
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Peran dilamar:{" "}
                          <span className="text-slate-900 font-semibold">
                            {interest.role.roleLabel}
                          </span>
                          {" · "}
                          Inisiator: {interest.brief.creatorActor.name}
                        </div>
                        {isInvited && interest.status === "PENDING" && interest.message && (
                          <p className="text-[11px] text-slate-700 italic bg-white/80 p-2 rounded-xl border border-purple-100 mt-1 leading-relaxed">
                            &ldquo;{interest.message}&rdquo;
                          </p>
                        )}
                      </Link>

                      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        {isInvited && interest.status === "PENDING" ? (
                          <InvitationResponseButtons
                            interestId={interest.id}
                            briefId={interest.briefId}
                            roleLabel={interest.role.roleLabel}
                            initiatorName={interest.brief.creatorActor.name}
                          />
                        ) : (
                          <>
                            <span className={`px-3 py-1 text-xs rounded-full border ${cfg.badge}`}>
                              {cfg.label}
                            </span>
                            {interest.status === "PENDING" && (
                              <WithdrawInterestButton
                                interestId={interest.id}
                                briefId={interest.briefId}
                                briefTitle={interest.brief.title}
                              />
                            )}
                          </>
                        )}

                        <Link
                          href={`/projects/${interest.briefId}`}
                          className="btn-primary-pill text-xs font-semibold px-4.5 py-2 hidden sm:inline-flex items-center gap-1.5"
                        >
                          <span>Lihat Brief</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
