import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { getDirectoryActors } from "@/application/directoryService";
import { getOpportunities, generateAndSaveOpportunities } from "@/application/opportunityService";
import { AppShell } from "@/components/layout/AppShell";
import { DirectoryFilterBar } from "@/components/directory/DirectoryFilterBar";
import { ActorCard } from "@/components/directory/ActorCard";
import { ActorAvatar } from "@/components/ui/ActorAvatar";
import { InitiateCollaborationButton } from "@/app/opportunities/InitiateCollaborationButton";
import { RunEngineButton } from "@/app/opportunities/RunEngineButton";
import {
  Users,
  Sparkles,
  Plus,
  Compass,
  Zap,
  Inbox,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Package,
  MessageSquare,
  Lightbulb,
} from "lucide-react";

export const metadata = {
  title: "Direktori Talenta & Rekomendasi Mitra | RAMU",
  description:
    "Eksplorasi studio foto, fotografer, model, stylist, fashion brand, dan rekomendasi kecocokan komplementer di dalam ekosistem RAMU.",
};

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    search?: string;
    actorType?: string;
    sector?: string;
    location?: string;
    style?: string;
    compensation?: string;
    sortBy?: string;
  }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?redirectTo=/directory&message=${encodeURIComponent(
        "Silakan masuk atau daftar akun untuk mengakses direktori lengkap pelaku kreatif dan studio."
      )}`
    );
  }

  const actor = await prisma.actor.findFirst({
    where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    include: {
      owner: { select: { avatarUrl: true } },
      needs: {
        where: { status: "ACTIVE" },
        select: { category: true },
      },
      createdProjectBriefs: {
        where: { status: "OPEN" },
        include: {
          neededRoles: true,
        },
        orderBy: { createdAt: "desc" },
      },
      assets: {
        where: { status: "ACTIVE" },
        select: { id: true, name: true, category: true, subtype: true, attributes: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (!actor) redirect("/onboarding");

  const params = await searchParams;
  const tab = params?.tab === "matched" ? "matched" : "all";
  const search = params?.search || "";
  const actorType = params?.actorType || "ALL";
  const sector = params?.sector || "ALL";
  const location = params?.location || "ALL";
  const style = params?.style || "ALL";
  const compensation = params?.compensation || "ALL";
  const sortBy = params?.sortBy || "recommended";

  const [actors, allActors] = await Promise.all([
    getDirectoryActors({ search, actorType, sector, location, style, compensation, sortBy }),
    prisma.actor.findMany({
      where: { status: { not: "ARCHIVED" } },
      select: { actorType: true },
    }),
  ]);

  const actorNeeds = actor.needs ?? [];
  const actorBriefs = actor.createdProjectBriefs ?? [];
  const wantedCategories = new Set<string>([
    ...actorNeeds.map((n) => n.category as string),
    ...actorBriefs.flatMap((b) =>
      b.neededRoles.map((r) => r.assetCategory as string).filter(Boolean)
    ),
  ]);

  const scoreMap = new Map<string, number>();
  if (wantedCategories.size > 0) {
    for (const a of actors) {
      if (a.id === actor.id) continue;
      const actorCats = new Set<string>(a.assets.map((asset) => asset.category as string));
      let matches = 0;
      for (const cat of wantedCategories) {
        if (actorCats.has(cat)) matches++;
      }
      if (matches > 0) {
        scoreMap.set(a.id, Math.min(100, Math.round((matches / wantedCategories.size) * 100)));
      }
    }
  }

  // Sort actors smartly
  const sortedActors = [...actors].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "portfolio") {
      return (b._count?.assets || b.assets.length) - (a._count?.assets || a.assets.length);
    }
    if (sortBy === "recent") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    // "recommended" (AI Complementarity Score first, then portfolio richness)
    const scoreA = scoreMap.get(a.id) || 0;
    const scoreB = scoreMap.get(b.id) || 0;
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    return (b._count?.assets || b.assets.length) - (a._count?.assets || a.assets.length);
  });

  const matchedCount = Array.from(scoreMap.values()).filter((s) => s > 0).length;
  const matchedActors = sortedActors.filter((a) => (scoreMap.get(a.id) || 0) > 0);
  const totalActors = allActors.length;

  // Data for tab="matched"
  const myActiveBrief = actor.createdProjectBriefs[0] || null;
  let rawOpportunities: any[] = [];

  if (tab === "matched") {
    rawOpportunities = await getOpportunities({ actorId: actor.id });
  }

  // Consistent matched count across tabs so badge doesn't jump
  const matchedOpportunitiesCount =
    tab === "matched"
      ? rawOpportunities.length
      : await prisma.opportunity.count({
          where: { participants: { some: { actorId: actor.id } } },
        });

  const aiMatchBadgeCount =
    matchedOpportunitiesCount > 0 ? matchedOpportunitiesCount : matchedCount;

  // Filter & sort opportunities based on search, sector, location, sortBy
  let filteredOpportunities = rawOpportunities;

  if (tab === "matched") {
    if (search) {
      const s = search.toLowerCase();
      filteredOpportunities = filteredOpportunities.filter((opp) => {
        const partner =
          opp.participants.find((p: any) => p.actorId !== actor.id) || opp.participants[0];
        return (
          opp.title.toLowerCase().includes(s) ||
          opp.description?.toLowerCase().includes(s) ||
          partner?.actor?.name?.toLowerCase().includes(s) ||
          partner?.actor?.sector?.toLowerCase().includes(s)
        );
      });
    }

    if (sector && sector !== "ALL") {
      const s = sector.toLowerCase();
      filteredOpportunities = filteredOpportunities.filter((opp) => {
        const partner =
          opp.participants.find((p: any) => p.actorId !== actor.id) || opp.participants[0];
        const sec = (partner?.actor?.sector || "").toLowerCase();
        const role = (partner?.roleLabel || "").toLowerCase();
        if (s.includes("photo") || s.includes("foto"))
          return sec.includes("photo") || role.includes("photo") || sec.includes("foto");
        if (s.includes("design") || s.includes("desain"))
          return sec.includes("design") || role.includes("design") || sec.includes("desain");
        if (s.includes("brand") || s.includes("umkm"))
          return sec.includes("brand") || sec.includes("umkm") || sec.includes("label");
        if (s.includes("model")) return sec.includes("model") || role.includes("model");
        if (s.includes("mua") || s.includes("stylist"))
          return sec.includes("mua") || sec.includes("stylist") || sec.includes("makeup");
        if (s.includes("studio")) return sec.includes("studio");
        return sec.includes(s) || role.includes(s);
      });
    }

    if (location && location !== "ALL") {
      const loc = location.toLowerCase();
      filteredOpportunities = filteredOpportunities.filter((opp) => {
        const partner =
          opp.participants.find((p: any) => p.actorId !== actor.id) || opp.participants[0];
        return partner?.actor?.location?.toLowerCase().includes(loc);
      });
    }

    // Sort opportunities
    filteredOpportunities.sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "name") {
        const partnerA =
          a.participants.find((p: any) => p.actorId !== actor.id) || a.participants[0];
        const partnerB =
          b.participants.find((p: any) => p.actorId !== actor.id) || b.participants[0];
        return (partnerA?.actor?.name || "").localeCompare(partnerB?.actor?.name || "");
      }
      // Default: highest score first
      const scoreA = a.scores?.[0]?.overallScore ?? 85;
      const scoreB = b.scores?.[0]?.overallScore ?? 85;
      return scoreB - scoreA;
    });
  }

  return (
    <AppShell actor={actor} activeRoute="/directory">
      <div className="space-y-6 w-full max-w-7xl mx-auto">
        {/* 1. CLEAN HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0284c7]" />
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                RAMU Ecosystem • Direktori &amp; Rekomendasi Mitra
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Direktori Talenta &amp; Rekomendasi Mitra
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Katalog kurasi talenta kreatif, studio, dan brand se-Indonesia dengan rekomendasi
              kecocokan deterministik berbasis kebutuhan proyek aktif Anda.
            </p>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/showcase"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 text-xs font-semibold shadow-2xs transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-slate-500" />
              <span>Karya &amp; Inspirasi</span>
            </Link>
            <Link
              href="/projects/new"
              className="btn-primary-pill inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-[#4CC9FE]/25 shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>Inisiasi Brief Baru</span>
            </Link>
          </div>
        </header>

        {/* 2. UNIFIED DISCOVERY BAR (MODE SWITCHER + SEARCH + CATEGORY PILLS + FILTERS) */}
        <DirectoryFilterBar
          currentTab={tab}
          totalActors={totalActors}
          matchedCount={aiMatchBadgeCount}
          currentSearch={search}
          currentSector={sector}
          currentLocation={location}
          currentStyle={style}
          currentCompensation={compensation}
          currentSort={sortBy}
        />

        {/* 3. CONDITIONAL TAB CONTENT */}
        {tab === "matched" ? (
          /* TAB 2: REKOMENDASI KECOCOKAN AI & SINERGI (CLEAN & ELEGANT) */
          <div className="space-y-5">
            {/* COMPACT ACTIVE BRIEF OR ONBOARDING RIBBON */}
            {myActiveBrief ? (
              <div className="p-4 rounded-[20px] bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 truncate">
                        Brief Aktif: {myActiveBrief.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0">
                        Presisi Komplementer
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      Peran:{" "}
                      {myActiveBrief.neededRoles?.map((r: any) => r.roleLabel).join(", ") ||
                        "Kolaborasi Terbuka"}{" "}
                      • Lokasi: {myActiveBrief.location || "Indonesia"} • Kompensasi:{" "}
                      {myActiveBrief.compensationModel || "PAID"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/projects/${myActiveBrief.id}`}
                    className="btn-primary-pill px-3.5 py-1.5 text-xs text-white font-semibold"
                  >
                    <span>Tinjau Brief</span>
                    <ArrowRight className="w-3 h-3 text-white" />
                  </Link>
                  <Link
                    href="/projects/new"
                    className="px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 text-xs transition-colors"
                  >
                    + Brief Baru
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-[20px] bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-transparent border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">Maksimalkan Presisi Rekomendasi Mitra</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Anda belum mempublikasikan brief proyek aktif. Sistem saat ini mencocokkan profil
                      berdasarkan komplementaritas aset dan keahlian umum. Publikasikan brief untuk akurasi peran dan jadwal maksimal.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href="/projects/new"
                    className="btn-primary-pill px-4 py-2 text-xs text-white font-semibold shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-white" />
                    <span>+ Buat Brief Kebutuhan Proyek</span>
                  </Link>
                </div>
              </div>
            )}

            {/* RESULTS HEADER & ENGINE REFRESH BUTTON */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 pt-1">
              <div className="text-xs text-slate-500 font-medium">
                Menampilkan{" "}
                <strong className="text-slate-900">{filteredOpportunities.length}</strong> peluang
                kolaborasi sinergis terverifikasi
                {sector !== "ALL" && (
                  <span>
                    {" "}
                    untuk peran <strong className="text-slate-900">&ldquo;{sector}&rdquo;</strong>
                  </span>
                )}
                {search && (
                  <span>
                    {" "}
                    dengan kata kunci <strong className="text-slate-900">&ldquo;{search}&rdquo;</strong>
                  </span>
                )}
              </div>

              <div className="shrink-0">
                <RunEngineButton actorName={actor.name} />
              </div>
            </div>

            {/* OPPORTUNITIES 2-COLUMN BALANCED GRID */}
            {filteredOpportunities.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredOpportunities.map((opp) => {
                  const latestScore = opp.scores?.[0];
                  const overallScore = Math.min(
                    100,
                    Math.round(latestScore?.overallScore ?? 85)
                  );
                  const partner =
                    opp.participants.find((p: any) => p.actorId !== actor.id) ||
                    opp.participants[0];
                  const explanation = (opp.explanation as any) || {};
                  const whyList: string[] =
                    explanation.why && explanation.why.length > 0
                      ? explanation.why
                      : [
                          `${partner?.actor?.name} menyediakan kapabilitas ${partner?.roleLabel || partner?.actor?.sector} yang sesuai`,
                          `Komplementaritas aset dan peran wajib terpenuhi`,
                          `Kesesuaian domisili dan kapasitas operasional terverifikasi`,
                        ];

                  const fit = Math.min(
                    40,
                    Math.round(((latestScore?.complementarityScore ?? 3.6) / 4) * 40)
                  );
                  const coverage = Math.min(
                    25,
                    Math.round(((latestScore?.needCoverageScore ?? 3.4) / 4) * 25)
                  );
                  const feasibility = Math.min(
                    20,
                    Math.round(((latestScore?.feasibilityScore ?? 3.2) / 4) * 20)
                  );
                  const readiness = Math.min(
                    15,
                    Math.round(((latestScore?.actionabilityScore ?? 3.5) / 4) * 15)
                  );

                  const partnerAsset = opp.assets.find(
                    (a: any) => a.asset && a.asset.name
                  );

                  const existingCollab = (opp as any).collaborationPlans?.[0]?.collaboration;

                  return (
                    <div
                      key={opp.id}
                      className="p-5 rounded-[24px] bg-white border border-slate-200/80 hover:border-[#4CC9FE]/60 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                    >
                      {/* Top Partner Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <ActorAvatar
                            name={partner?.actor?.name || "Mitra"}
                            avatarUrl={partner?.actor?.avatarUrl || partner?.actor?.owner?.avatarUrl}
                            className="w-11 h-11 rounded-full border border-slate-200/80 shadow-2xs shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link
                                href={`/directory/${partner?.actor?.id}`}
                                className="text-sm font-bold text-slate-900 hover:text-[#0284c7] transition-colors truncate"
                              >
                                {partner?.actor?.name || "Mitra Kolaborasi"}
                              </Link>
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200/60 shrink-0">
                                {partner?.actor?.sector || partner?.roleLabel}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{partner?.actor?.location || "Indonesia"}</span>
                            </p>
                          </div>
                        </div>

                        {/* Compatibility Score & Status Badge */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {existingCollab && (
                            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Kolaborasi Aktif</span>
                            </span>
                          )}
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#4CC9FE]/15 border border-[#4CC9FE]/30 shrink-0">
                            <Zap className="w-3 h-3 text-[#0284c7]" />
                            <span className="text-xs font-black text-[#0284c7]">{overallScore}% Cocok</span>
                          </div>
                        </div>
                      </div>

                      {/* Collaborative Project Synergy Box */}
                      <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1.5 text-xs">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Rancangan Sinergi Proyek
                        </div>
                        <Link
                          href={`/opportunities/${opp.id}`}
                          className="font-bold text-slate-900 text-sm hover:text-[#0284c7] transition-colors inline-flex items-center gap-1.5 group/title"
                        >
                          <span className="group-hover/title:underline line-clamp-1">{opp.title}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover/title:text-[#0284c7] group-hover/title:translate-x-0.5 transition-all shrink-0" />
                        </Link>
                        <p className="text-xs text-slate-600 leading-relaxed font-light line-clamp-2">
                          {opp.description}
                        </p>
                        {partnerAsset && (
                          <div className="pt-1 flex items-center gap-1.5 text-[11px] text-slate-700 font-medium">
                            <Package className="w-3.5 h-3.5 text-[#0284c7] shrink-0" />
                            <span className="truncate">Resource: <strong>{partnerAsset.asset.name}</strong></span>
                            <span className="text-[9px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full font-bold shrink-0">
                              Aset Siap Kolaborasi
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Key Synergy Reason Chips */}
                      <div className="flex flex-wrap gap-1.5">
                        {whyList.slice(0, 2).map((item: string, i: number) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100/80 text-slate-700 text-[10px] font-medium border border-slate-200/60"
                          >
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span className="line-clamp-1 max-w-[240px]">{item}</span>
                          </span>
                        ))}
                      </div>

                      {/* 4 Pillars Breakdown & Actions */}
                      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-500 font-medium">
                          <span className="bg-slate-100 px-2 py-0.5 rounded-full">Aset {fit}/40</span>
                          <span className="bg-slate-100 px-2 py-0.5 rounded-full">Peran {coverage}/25</span>
                          <span className="bg-slate-100 px-2 py-0.5 rounded-full">Jadwal {feasibility}/20</span>
                          <span className="bg-slate-100 px-2 py-0.5 rounded-full">Kesiapan {readiness}/15</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            href={`/opportunities/${opp.id}`}
                            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs transition-colors"
                          >
                            <span>Detail</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                          </Link>

                          <Link
                            href="/messages"
                            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                          >
                            <MessageSquare className="w-3 h-3 text-slate-500" />
                            <span>Pesan</span>
                          </Link>

                          <InitiateCollaborationButton
                            opportunityId={opp.id}
                            existingCollaborationId={existingCollab?.id}
                            opportunityTitle={opp.title}
                            patternName={opp.pattern?.name || opp.patternCode}
                            participants={opp.participants.map((p: any) => ({
                              name: p.actor.name,
                              sector: p.actor.sector,
                              roleLabel: p.roleLabel,
                              roleCode: p.roleCode,
                            }))}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center rounded-[24px] bg-white border border-slate-200/80 shadow-2xs space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#4CC9FE]/15 text-[#0284c7] flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">
                    Tidak Ada Peluang Sesuai Kriteria Filter
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Coba sesuaikan kata kunci pencarian, pilih peran lain, atau klik &ldquo;Segarkan Rekomendasi Mitra&rdquo;.
                  </p>
                </div>
              </div>
            )}

            {/* COMPLEMENTARY TALENTS GRID */}
            {matchedActors.length > 0 && (
              <div className="pt-6 border-t border-slate-200/80 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Talenta Sinergis Komplementer Langsung ({matchedActors.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Profil talenta dan studio yang memiliki peralatan atau keahlian sesuai dengan kebutuhan proyek Anda.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {matchedActors.map((item) => (
                    <ActorCard
                      key={item.id}
                      actor={item}
                      complementarityScore={scoreMap.get(item.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* TAB 1: SEMUA DIREKTORI TALENTA & STUDIO */
          <div className="space-y-4">
            {/* RESULTS COUNTER & AI QUICK-LINK */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
              <div className="text-xs text-slate-500 font-medium">
                Menampilkan <span className="text-slate-900 font-bold">{sortedActors.length}</span>{" "}
                portofolio talenta terverifikasi
                {search && (
                  <span>
                    {" "}
                    untuk pencarian <strong className="text-slate-900">&ldquo;{search}&rdquo;</strong>
                  </span>
                )}
              </div>

              {matchedCount > 0 && (
                <Link
                  href="/directory?tab=matched"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#4CC9FE]/15 hover:bg-[#4CC9FE]/25 border border-[#4CC9FE]/30 text-[#0284c7] rounded-full text-xs font-semibold self-start sm:self-auto shadow-2xs transition-colors group cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-[#0284c7] shrink-0" />
                  <span>
                    <strong className="font-bold">{matchedCount} entitas</strong> cocok dengan brief Anda — Buka Mitra Kompatibel
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}
            </div>

            {/* CARDS GRID */}
            {sortedActors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedActors.map((item) => (
                  <ActorCard
                    key={item.id}
                    actor={item}
                    complementarityScore={scoreMap.get(item.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6 rounded-[24px] bg-white border border-slate-200/80 shadow-2xs space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-400">
                  <Inbox className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h3 className="text-sm font-bold text-slate-900">Tidak Ada Hasil Ditemukan</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Coba sesuaikan kata kunci pencarian atau ubah kriteria filter untuk melihat
                    portofolio pelaku kreatif lainnya.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/directory"
                    className="btn-primary-pill px-4 py-2 text-white text-xs font-semibold shadow-md shadow-[#4CC9FE]/25 inline-block"
                  >
                    Tampilkan Semua Talenta
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
