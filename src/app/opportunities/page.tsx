import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { logout } from "@/app/(auth)/actions";
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
      <section className="p-8 rounded-3xl bg-neutral-900/90 border border-neutral-800 relative overflow-hidden space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Phase 3: Opportunity Engine Aktif
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Katalog Peluang Kolaborasi Kreatif
              </h1>
              <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                Hasil sintesis deterministik 12 tahap dari perpaduan aset, sasaran bisnis, dan kapabilitas perajin kriya nusantara. Setiap peluang dilengkapi evaluasi kelayakan dan alasan terukur.
              </p>
            </div>

            <div className="shrink-0">
              <RunEngineButton actorName={actor.name} />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="text-xs text-slate-400">Total Peluang</div>
              <div className="text-xl font-black text-white">{totalCount}</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-emerald-500/20">
              <div className="text-xs text-emerald-400 font-medium">Layak (Feasible)</div>
              <div className="text-xl font-black text-emerald-300">{feasibleCount}</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-amber-500/20">
              <div className="text-xs text-amber-400 font-medium">Menjanjikan</div>
              <div className="text-xl font-black text-amber-300">{promisingCount}</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-sky-500/20">
              <div className="text-xs text-sky-400 font-medium">Perlu Pelengkap</div>
              <div className="text-xl font-black text-sky-300">{partialCount}</div>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {opportunities.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
            <div className="flex justify-center">
              <Sparkles className="w-12 h-12 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Belum Ada Peluang yang Cocok</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
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
    </AppShell>
  );
}
