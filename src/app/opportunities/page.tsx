import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { getOpportunities } from "@/application/opportunityService";
import { RunEngineButton } from "./RunEngineButton";
import { OpportunityCard } from "./OpportunityCard";
import { AppShell } from "@/components/layout/AppShell";
import { Sparkles } from "lucide-react";

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ feasibility?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const actor = await prisma.actor.findFirst({
    where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    orderBy: { createdAt: "asc" },
  });

  if (!actor) redirect("/onboarding");

  const params = await searchParams;
  const feasibilityFilter = params?.feasibility || "ALL";

  let opportunities = await getOpportunities({
    feasibility: feasibilityFilter === "ALL" ? undefined : feasibilityFilter,
  });

  if (opportunities.length === 0 && feasibilityFilter === "ALL") {
    const actorCount = await prisma.actor.count({ where: { status: "ACTIVE" } });
    if (actorCount >= 2) {
      const { generateAndSaveOpportunities } = await import("@/application/opportunityService");
      await generateAndSaveOpportunities({ focusActorId: actor.id });
      opportunities = await getOpportunities();
    }
  }

  const totalCount = opportunities.length;
  const feasibleCount = opportunities.filter((o) => o.feasibilityStatus === "FEASIBLE").length;
  const promisingCount = opportunities.filter((o) => o.feasibilityStatus === "PROMISING").length;
  const partialCount = opportunities.filter((o) => o.feasibilityStatus === "PARTIAL").length;

  return (
    <AppShell actor={actor} activeRoute="/opportunities">
      <div className="space-y-8">
        <section className="p-8 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.04)] relative overflow-hidden space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF7ED] border border-[#F9D8C4] text-xs font-semibold text-[#E66A48]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E66A48] animate-pulse" />
                Phase 3: Opportunity Engine Aktif
              </div>
              <h1 className="text-3xl font-extrabold text-[#27213D] tracking-tight">
                Katalog Peluang Kolaborasi Kreatif
              </h1>
              <p className="text-sm text-[#716B7E] max-w-2xl leading-relaxed">
                Hasil sintesis deterministik 12 tahap dari perpaduan aset, sasaran bisnis, dan kapabilitas perajin kriya nusantara. Setiap peluang dilengkapi evaluasi kelayakan dan alasan terukur.
              </p>
            </div>

            <div className="shrink-0">
              <RunEngineButton actorName={actor.name} />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-stone-100">
            <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/70">
              <div className="text-xs font-semibold text-[#716B7E]">Total Peluang</div>
              <div className="text-2xl font-black text-[#27213D] mt-0.5">{totalCount}</div>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
              <div className="text-xs text-emerald-800 font-semibold">Layak (Feasible)</div>
              <div className="text-2xl font-black text-emerald-950 mt-0.5">{feasibleCount}</div>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
              <div className="text-xs text-amber-800 font-semibold">Menjanjikan</div>
              <div className="text-2xl font-black text-amber-950 mt-0.5">{promisingCount}</div>
            </div>
            <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200/80">
              <div className="text-xs text-sky-800 font-semibold">Perlu Pelengkap</div>
              <div className="text-2xl font-black text-sky-950 mt-0.5">{partialCount}</div>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-2 border-b border-stone-200/80 pb-3">
          {[
            { key: "ALL", label: "Semua Peluang" },
            { key: "FEASIBLE", label: "Layak Dijalankan (Feasible)" },
            { key: "PROMISING", label: "Menjanjikan (Promising)" },
            { key: "PARTIAL", label: "Perlu Pelengkap (Partial)" },
          ].map((tab) => {
            const isActive = feasibilityFilter === tab.key;
            return (
              <Link
                key={tab.key}
                href={tab.key === "ALL" ? "/opportunities" : `/opportunities?feasibility=${tab.key}`}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#27213D] text-white shadow-md shadow-[#27213D]/10"
                    : "bg-white border border-stone-200/80 text-[#716B7E] hover:text-[#27213D] hover:bg-stone-50"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {opportunities.length === 0 ? (
          <div className="p-12 text-center rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.03)] space-y-4">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-amber-500" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-[#27213D]">Belum Ada Peluang yang Cocok</h3>
            <p className="text-sm text-[#716B7E] max-w-md mx-auto">
              Klik tombol &quot;Jalankan Opportunity Engine&quot; di atas untuk mensintesis kombinasi aset dan kebutuhan antar-aktor yang tersedia.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {opportunities.map((opp) => {
              const isCurrentUserParticipant = opp.participants.some((p) => p.actorId === actor.id);
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
                  explanation={(opp.explanation as any) || {}}
                  participants={opp.participants}
                  assets={opp.assets}
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
                          scoreExplanation: (latestScore.scoreExplanation as any) || {},
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
    </AppShell>
  );
}
