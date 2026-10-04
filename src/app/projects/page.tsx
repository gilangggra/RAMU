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
  Palette,
  Inbox,
  ArrowRight,
  Sparkles,
  Zap,
  Users,
  Search,
  CheckCircle2,
  BarChart3,
} from "lucide-react";

export const metadata = {
  title: "Papan Proyek & Peluang Kolaborasi AI | RAMU",
  description:
    "Eksplorasi brief produksi komersial, temukan rekan kru, serta temukan peluang sinergi kolaborasi cerdas yang dihitung otomatis oleh AI Matching Engine RAMU.",
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
        "Silakan masuk atau daftar untuk meninjau dan melamar ke project briefs serta rekomendasi peluang AI."
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

  // Counts across all categories
  const [openBriefsCount, myBriefsCount, pendingInterestCount, aiOpportunitiesCount] =
    await Promise.all([
      prisma.projectBrief.count({ where: { status: "OPEN" } }),
      prisma.projectBrief.count({ where: { creatorActorId: actor.id } }),
      prisma.collaborationInterest.count({
        where: { actorId: actor.id, status: "PENDING" },
      }),
      prisma.opportunity.count({
        where: { status: { not: "ARCHIVED" } },
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

  const briefsToShow = activeTab === "mine" ? myBriefs : allBriefs;

  const tabs = [
    {
      key: "browse",
      label: "Papan Proyek Terbuka",
      count: openBriefsCount,
      isAi: false,
    },
    {
      key: "ai-opportunities",
      label: "Peluang Kolaborasi AI",
      count: aiOpportunitiesCount || opportunitiesData.length,
      isAi: true,
    },
    {
      key: "mine",
      label: "Brief Saya",
      count: myBriefsCount,
      isAi: false,
    },
    {
      key: "interests",
      label: "Minat Saya",
      count: pendingInterestCount,
      isAi: false,
    },
  ];

  return (
    <AppShell actor={actor} activeRoute="/projects">
      <div className="space-y-8 pb-16">
        {/* MASTHEAD HEADER */}
        <section className="pt-10 pb-8 border-b border-stone-200">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-4">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-3 mb-5">
                <span className="w-8 h-px bg-stone-300"></span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Pusat Kolaborasi Proyek &amp; Matchmaking AI
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-light text-[#1E1B2E] tracking-tight leading-[1.15] mb-5">
                Inisiasi ide &amp; temukan <br className="hidden sm:block" />
                <span className="font-serif italic text-stone-500">sinergi produksi</span> kreatif Anda.
              </h1>
              <p className="text-sm text-stone-500 font-light leading-relaxed max-w-xl">
                Jelajahi brief komersial terbuka, cari rekan kru terkurasi, atau manfaatkan kecerdasan buatan RAMU untuk menemukan peluang kolaborasi multi-pihak yang otomatis diselaraskan dengan keahlian Anda.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-6 lg:gap-8 pb-2">
              <div className="flex items-center gap-6 sm:gap-8">
                <div className="space-y-1">
                  <div className="text-3xl sm:text-4xl font-light text-[#1E1B2E]">
                    {openBriefsCount}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">
                    Proyek Terbuka
                  </div>
                </div>
                <div className="w-px h-8 bg-stone-200"></div>
                <div className="space-y-1">
                  <div className="text-3xl sm:text-4xl font-light text-amber-800 flex items-center gap-1">
                    <span>{aiOpportunitiesCount || opportunitiesData.length}</span>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-800/80">
                    Peluang AI
                  </div>
                </div>
                <div className="w-px h-8 bg-stone-200"></div>
                <div className="space-y-1">
                  <div className="text-3xl sm:text-4xl font-light text-[#1E1B2E]">
                    {myBriefsCount}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">
                    Brief Anda
                  </div>
                </div>
              </div>

              <Link
                href="/projects/new"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1E1B2E] hover:bg-black text-white font-bold text-[10px] uppercase tracking-[0.15em] transition-all shadow-sm shrink-0"
              >
                <span>+ Inisiasi Project Brief</span>
              </Link>
            </div>
          </div>
        </section>

        {/* UNIFIED NAVIGATION TABS */}
        <div className="flex items-center gap-2 sm:gap-6 border-b border-stone-200 text-xs overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Link
                key={tab.key}
                href={`/projects?tab=${tab.key}`}
                className={`pb-3.5 font-semibold transition-all relative flex items-center gap-2 cursor-pointer shrink-0 ${
                  isActive
                    ? "text-[#1E1B2E] font-bold"
                    : "text-stone-400 hover:text-stone-700"
                }`}
              >
                {tab.isAi && (
                  <Sparkles
                    className={`w-3.5 h-3.5 ${
                      isActive ? "text-amber-500" : "text-stone-400"
                    }`}
                  />
                )}
                <span className="tracking-wide">{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? tab.isAi
                          ? "bg-amber-400 text-stone-950 font-black"
                          : "bg-stone-900 text-white"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E1B2E]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* TAB 1: PAPAN PROYEK TERBUKA */}
        {activeTab === "browse" && (
          <div className="space-y-6">
            {/* PENCARIAN CERDAS & FILTER PERAN, LOKASI, KOMPENSASI */}
            <ProjectFilterBar
              currentSearch={search}
              currentRole={role}
              currentLocation={location}
              currentCompensation={compensation}
              currentView={currentView}
              userSector={actor.sector}
            />

            <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-stone-400 font-semibold px-1">
              <span>
                Menampilkan <span className="text-[#1E1B2E] font-bold">{allBriefs.length}</span> Project Brief
                {search && (
                  <span>
                    {" "}
                    untuk kata kunci{" "}
                    <span className="text-[#1E1B2E] font-medium">&ldquo;{search}&rdquo;</span>
                  </span>
                )}
                {role !== "ALL" && (
                  <span>
                    {" "}
                    dengan peran <span className="text-[#1E1B2E] font-medium">&ldquo;{role}&rdquo;</span>
                  </span>
                )}
                {compensation !== "ALL" && (
                  <span>
                    {" "}
                    skema <span className="text-[#1E1B2E] font-medium">&ldquo;{compensation}&rdquo;</span>
                  </span>
                )}
                {location !== "ALL" && (
                  <span>
                    {" "}
                    di <span className="text-[#1E1B2E] font-medium">&ldquo;{location}&rdquo;</span>
                  </span>
                )}
              </span>
            </div>

            {allBriefs.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-stone-50/50 border border-dashed border-stone-300 space-y-4">
                <div className="w-14 h-14 bg-white rounded-xl border border-stone-200 flex items-center justify-center mx-auto text-stone-400">
                  <Palette className="w-6 h-6 text-[#1E1B2E]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#1E1B2E]">
                    Tidak Ada Project Brief yang Sesuai
                  </h3>
                  <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                    {search || role !== "ALL"
                      ? "Coba ubah kata kunci pencarian atau bersihkan filter peran untuk melihat proyek kolaborasi lainnya."
                      : "Jadilah yang pertama menginisiasi project brief dan undang kolaborator dari ekosistem kreatif."}
                  </p>
                </div>
                <Link
                  href="/projects/new"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1E1B2E] hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  + Buat Project Brief Baru
                </Link>
              </div>
            ) : (
              <div
                className={
                  currentView === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 gap-6"
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

        {/* TAB 2: PELUANG KOLABORASI CERDAS AI */}
        {activeTab === "ai-opportunities" && (
          <div className="space-y-6">
            {/* AI OPPORTUNITY ENGINE BANNER */}
            <div className="p-6 bg-gradient-to-br from-amber-50/80 via-white to-stone-50 border border-amber-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-2xl">
                <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100/70 px-2 py-0.5 border border-amber-300">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>AI Complementarity Matching Engine</span>
                </div>
                <h3 className="text-lg font-bold text-[#1E1B2E] tracking-tight">
                  Peluang Kolaborasi yang Dihitung Secara Cerdas
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Sistem AI RAMU menganalisis kompatibilitas aset, ketersediaan alat, dan estetika visual para kreator di ekosistem untuk membentuk tim produksi ideal secara otomatis tanpa perlu rekrutmen manual yang panjang.
                </p>
              </div>

              <div className="shrink-0">
                <RunEngineButton actorName={actor.name} />
              </div>
            </div>

            {/* AI SCOPE & FEASIBILITY CONTROLS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
              <div className="inline-flex p-1 bg-stone-100 border border-stone-200 text-xs font-bold">
                <Link
                  href={`/projects?tab=ai-opportunities&scope=my${
                    feasibilityFilter !== "ALL" ? `&feasibility=${feasibilityFilter}` : ""
                  }`}
                  className={`px-3.5 py-1.5 transition-all ${
                    scopeFilter === "my"
                      ? "bg-[#1E1B2E] text-white shadow-2xs font-extrabold"
                      : "text-stone-500 hover:text-[#1E1B2E]"
                  }`}
                >
                  Relevan Untuk Saya
                </Link>
                <Link
                  href={`/projects?tab=ai-opportunities&scope=all${
                    feasibilityFilter !== "ALL" ? `&feasibility=${feasibilityFilter}` : ""
                  }`}
                  className={`px-3.5 py-1.5 transition-all ${
                    scopeFilter === "all"
                      ? "bg-[#1E1B2E] text-white shadow-2xs font-extrabold"
                      : "text-stone-500 hover:text-[#1E1B2E]"
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
                        className={`px-3 py-1.5 text-xs font-bold transition-all border ${
                          isActive
                            ? "bg-[#1E1B2E] text-white border-[#1E1B2E] shadow-2xs"
                            : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>

                <Link
                  href="/engine-insights"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#E66A48] hover:text-[#c45233] bg-[#FFF7ED] hover:bg-[#ffeedb] border border-[#F9D8C4] transition-colors"
                  title="Lihat sinyal pembelajaran dan validasi luaran engine AI"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Sinyal Engine AI</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* AI OPPORTUNITY CARDS */}
            {opportunitiesData.length === 0 ? (
              <div className="p-12 text-center rounded-none bg-stone-50/50 border border-dashed border-stone-300 space-y-4">
                <div className="w-14 h-14 bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#1E1B2E]">
                    Belum Ada Peluang AI yang Terdeteksi
                  </h3>
                  <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                    Klik tombol &ldquo;Segarkan Rekomendasi AI&rdquo; di atas untuk menganalisis aset dan mempertemukan Anda dengan rekan kolaborator komplementer.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* TAB 3: BRIEF SAYA */}
        {activeTab === "mine" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-stone-400 font-semibold px-1">
              <span>
                Menampilkan <span className="text-[#1E1B2E] font-bold">{myBriefs.length}</span> Project Brief Anda
              </span>
              <Link
                href="/projects/new"
                className="text-[10px] font-bold text-amber-700 hover:text-amber-800 uppercase tracking-wider"
              >
                + Tambah Brief Baru
              </Link>
            </div>

            {myBriefs.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-stone-50/50 border border-dashed border-stone-300 space-y-4">
                <div className="w-14 h-14 bg-white rounded-xl border border-stone-200 flex items-center justify-center mx-auto text-stone-400">
                  <Palette className="w-6 h-6 text-[#1E1B2E]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#1E1B2E]">
                    Belum Ada Project Brief yang Anda Buat
                  </h3>
                  <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                    Mulai proyek produksi lookbook atau kampanye kreatif Anda sekarang, lalu manfaatkan AI Smart Crew untuk mengundang talenta komplementer.
                  </p>
                </div>
                <Link
                  href="/projects/new"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1E1B2E] hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  + Inisiasi Project Brief Baru
                </Link>
              </div>
            ) : (
              <div
                className={
                  currentView === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                    : "space-y-4"
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
                    <div className="flex items-center justify-between px-1">
                      <Link
                        href={`/projects/${brief.id}#smart-crew`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span>Buka Rekomendasi Kru AI</span>
                      </Link>
                      <Link
                        href={`/projects/${brief.id}`}
                        className="text-xs font-semibold text-stone-500 hover:text-stone-800"
                      >
                        Kelola Lamaran &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MINAT SAYA */}
        {activeTab === "interests" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-stone-400 font-semibold px-1">
              <span>
                Menampilkan <span className="text-[#1E1B2E] font-bold">{myInterests.length}</span> Minat &amp; Lamaran Anda
              </span>
            </div>

            {myInterests.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-stone-50/50 border border-dashed border-stone-300 space-y-4">
                <div className="w-14 h-14 bg-white rounded-xl border border-stone-200 flex items-center justify-center mx-auto text-stone-400">
                  <Inbox className="w-6 h-6 text-[#1E1B2E]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#1E1B2E]">
                    Belum Ada Minat yang Dinyatakan
                  </h3>
                  <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                    Jelajahi proyek terbuka dan ajukan aset Anda untuk bergabung sebagai rekan kolaborator komersial.
                  </p>
                </div>
                <Link
                  href="/projects?tab=browse"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1E1B2E] hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <span>Jelajahi Proyek Terbuka</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myInterests.map((interest) => {
                  const isInvited = Boolean(interest.isInvited);
                  const statusConfig: Record<string, { label: string; color: string }> = {
                    PENDING: {
                      label: isInvited ? "Undangan Masuk" : "Menunggu Review",
                      color: isInvited
                        ? "text-purple-800 bg-purple-50 border-purple-200 font-bold"
                        : "text-amber-800 bg-amber-50 border-amber-200 font-bold",
                    },
                    ACCEPTED: {
                      label: "Diterima (Siap SPK)",
                      color: "text-emerald-800 bg-emerald-50 border-emerald-200 font-bold",
                    },
                    DECLINED: {
                      label: isInvited ? "Undangan Ditolak" : "Ditolak",
                      color: "text-rose-800 bg-rose-50 border-rose-200 font-bold",
                    },
                    WITHDRAWN: {
                      label: "Ditarik",
                      color: "text-stone-700 bg-stone-100 border-stone-200 font-bold",
                    },
                  };
                  const cfg = statusConfig[interest.status] || statusConfig.PENDING;

                  return (
                    <div
                      key={interest.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border transition-all shadow-2xs hover:shadow-sm ${
                        isInvited && interest.status === "PENDING"
                          ? "bg-purple-50/20 border-purple-200 hover:border-purple-300"
                          : "bg-white border-stone-200 hover:border-stone-800"
                      }`}
                    >
                      <Link
                        href={`/projects/${interest.briefId}`}
                        className="min-w-0 space-y-1.5 group block flex-1"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-[#1E1B2E] text-sm group-hover:text-amber-800 transition-colors truncate">
                            {interest.brief.title}
                          </span>
                          {isInvited && interest.status === "PENDING" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
                              <Sparkles className="w-2.5 h-2.5 text-purple-600" />
                              <span>Diundang Inisiator</span>
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-stone-500">
                          Peran:{" "}
                          <span className="text-[#1E1B2E] font-semibold">
                            {interest.role.roleLabel}
                          </span>
                          {" · "}
                          Inisiator: {interest.brief.creatorActor.name}
                        </div>
                        {isInvited && interest.status === "PENDING" && interest.message && (
                          <p className="text-xs text-stone-600 italic line-clamp-1 bg-white/80 p-2 rounded-lg border border-purple-100">
                            &ldquo;{interest.message}&rdquo;
                          </p>
                        )}
                      </Link>

                      <div className="flex flex-wrap items-center gap-3 shrink-0">
                        {isInvited && interest.status === "PENDING" ? (
                          <InvitationResponseButtons
                            interestId={interest.id}
                            briefId={interest.briefId}
                            roleLabel={interest.role.roleLabel}
                            initiatorName={interest.brief.creatorActor.name}
                          />
                        ) : (
                          <>
                            <span className={`px-3 py-1 text-xs rounded-full border ${cfg.color}`}>
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
                          className="text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors hidden sm:inline-block"
                        >
                          Lihat Brief &rarr;
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
