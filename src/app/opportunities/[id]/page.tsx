import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { getOpportunityById } from "@/application/opportunityService";
import { InitiateCollaborationButton } from "../InitiateCollaborationButton";
import { OpportunityFeedbackSection } from "./OpportunityFeedbackSection";
import { AppShell } from "@/components/layout/AppShell";
import {
  Users,
  Package,
  BarChart2,
  Lightbulb,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  ArrowUpRight,
} from "lucide-react";

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
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

  const { id } = await params;
  const opp = await getOpportunityById(id);

  if (!opp) {
    notFound();
  }

  const latestScore = opp.scores?.[0];
  const displayScore = latestScore ? Math.round(latestScore.overallScore) : 0;
  const explanation = (opp.explanation as any) || {};
  const targetMarket = (opp.targetMarket as any) || {};
  const expectedOutputs = (opp.expectedOutputs as string[]) || [];

  const feasibilityBadge = {
    FEASIBLE: {
      label: "Layak Dijalankan",
      color: "bg-emerald-50 text-emerald-800 border-emerald-200",
      dot: "bg-emerald-500",
    },
    PROMISING: {
      label: "Menjanjikan (Perlu Info Lanjut)",
      color: "bg-amber-50 text-amber-800 border-amber-200",
      dot: "bg-amber-500",
    },
    PARTIAL: {
      label: "Perlu Peran Pelengkap",
      color: "bg-sky-50 text-sky-800 border-sky-200",
      dot: "bg-sky-500",
    },
    BLOCKED: {
      label: "Terkendala Batasan",
      color: "bg-rose-50 text-rose-800 border-rose-200",
      dot: "bg-rose-500",
    },
    UNKNOWN: {
      label: "Belum Terverifikasi",
      color: "bg-stone-50 text-stone-700 border-stone-200",
      dot: "bg-stone-400",
    },
  }[opp.feasibilityStatus] || {
    label: opp.feasibilityStatus,
    color: "bg-stone-50 text-stone-700 border-stone-200",
    dot: "bg-stone-400",
  };

  return (
    <AppShell actor={actor} activeRoute="/opportunities">
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#716B7E] hover:text-[#27213D] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Kembali ke Semua Peluang</span>
          </Link>

          <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-[#27213D] border border-stone-200">
            Status: {opp.status}
          </span>
        </div>

        {/* Hero Section */}
        <section className="p-8 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.04)] relative overflow-hidden space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-[#1E1B2E] border border-stone-200">
                  {opp.pattern?.name || opp.patternCode}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold border ${feasibilityBadge.color}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${feasibilityBadge.dot}`} />
                  {feasibilityBadge.label}
                </span>
              </div>

              <h1 className="text-3xl font-extrabold text-[#27213D] tracking-tight leading-tight">
                {opp.title}
              </h1>
              <p className="text-sm text-[#716B7E] max-w-2xl leading-relaxed">
                {opp.description}
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-amber-50/80 border border-amber-200/80 text-center shrink-0 min-w-[140px] space-y-1 shadow-xs">
              <div className="text-[11px] uppercase tracking-wider text-amber-800 font-bold">Kesesuaian</div>
              <div className="text-4xl font-black text-[#27213D]">
                {displayScore}%
              </div>
              <div className="text-[10px] text-emerald-700 font-bold">
                {displayScore > 0 ? "Kecocokan Tinggi" : "Belum Dihitung"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-100">
            <div className="space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#716B7E]">Target Pasar & Audiens</div>
              <div className="text-xs font-semibold text-[#27213D]">
                {targetMarket.audience || "Pasar Urban & Penggemar Fashion Kontemporer"}
              </div>
              <div className="text-[11px] text-[#716B7E]">
                {targetMarket.segment || "Segmen Konsumen Fashion & Editorial Premium"}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#716B7E]">Hasil Output Nyata</div>
              <div className="flex flex-wrap gap-1.5">
                {expectedOutputs.map((out, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg text-xs bg-stone-100 text-[#27213D] border border-stone-200/80 font-medium"
                  >
                    • {out}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Participants */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#27213D] tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              <span>Aktor Partisipan & Pembagian Peran</span>
            </h2>
            <span className="text-xs font-medium text-[#716B7E]">{opp.participants.length} Pelaku Kreatif</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opp.participants.map((p) => {
              const actorAssetIds = new Set(p.actor.assets.map((as: any) => as.id));
              const actorAssetsUsed = opp.assets.filter((a) => actorAssetIds.has(a.assetId));

              return (
                <div
                  key={p.id}
                  className="p-6 rounded-[28px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.03)] space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <Link
                        href={`/directory/${p.actor.id}`}
                        className="text-base font-bold text-[#27213D] hover:text-amber-600 transition-colors inline-flex items-center gap-1.5 group/name"
                      >
                        <span>{p.actor.name}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover/name:opacity-100 transition-opacity text-amber-600" />
                      </Link>
                      <div className="text-xs text-[#716B7E]">
                        {p.actor.sector} • {p.actor.location || "Indonesia"}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {p.roleLabel || p.roleCode}
                      </span>
                      <Link
                        href={`/directory/${p.actor.id}`}
                        className="text-[11px] font-bold text-stone-500 hover:text-[#1E1B2E] transition-colors inline-flex items-center gap-1"
                      >
                        <span>Profil &amp; Aset</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1">
                    <div className="text-[11px] font-bold text-[#716B7E] uppercase tracking-wider">Kontribusi:</div>
                    <div className="text-xs text-[#27213D] leading-relaxed">{p.contribution || "Menyediakan kapabilitas pendukung"}</div>
                  </div>

                  {actorAssetsUsed.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-[#716B7E] uppercase tracking-wider">Aset yang Digunakan:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {actorAssetsUsed.map((as, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-white text-[#27213D] border border-stone-200 font-medium shadow-2xs"
                          >
                            <Package className="w-3.5 h-3.5 text-amber-500" />
                            <span>{as.asset.name}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 6 Dimension Scoring */}
        {latestScore && (
          <section className="p-6 sm:p-8 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.04)] space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#27213D] tracking-tight flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-amber-500" />
                <span>Analisis 6 Dimensi Kesesuaian (Scoring Model)</span>
              </h2>
              <span className="text-xs text-amber-800 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Skor Akhir: {displayScore}/100
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <DetailScoreCard
                label="Komplementaritas"
                score={latestScore.complementarityScore}
                max={4}
                weight="25%"
                desc="Kekuatan sinergi perpaduan aset & bahan"
              />
              <DetailScoreCard
                label="Kelayakan (Feasibility)"
                score={latestScore.feasibilityScore}
                max={4}
                weight="20%"
                desc="Kesiapan peran wajib & batasan kapasitas"
              />
              <DetailScoreCard
                label="Keselarasan Goal"
                score={latestScore.goalAlignmentScore}
                max={4}
                weight="15%"
                desc="Dukungan terhadap target usaha partisipan"
              />
              <DetailScoreCard
                label="Kebutuhan Terpenuhi"
                score={latestScore.needCoverageScore}
                max={4}
                weight="15%"
                desc="Penyelesaian hambatan/kebutuhan nyata"
              />
              <DetailScoreCard
                label="Kejelasan Aksi"
                score={latestScore.actionabilityScore}
                max={4}
                weight="15%"
                desc="Kejelasan luaran & pembagian peran"
              />
              <DetailScoreCard
                label="Pemanfaatan Aset"
                score={latestScore.assetUtilizationScore}
                max={4}
                weight="10%"
                desc="Rasio optimalisasi aset yang tersedia"
              />
            </div>
          </section>
        )}

        {/* Explainable Output */}
        <section className="p-6 sm:p-8 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.04)] space-y-6">
          <h2 className="text-lg font-bold text-[#27213D] tracking-tight flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <span>Transparansi Rekomendasi (Explainable Output)</span>
          </h2>

          <div className="space-y-4 text-xs text-[#716B7E]">
            {explanation.summary && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-[#27213D] font-medium leading-relaxed">
                {explanation.summary}
              </div>
            )}

            {explanation.why && explanation.why.length > 0 && (
              <div className="space-y-2">
                <div className="font-bold text-sm text-[#27213D]">Dasar Pertimbangan Komplementaritas:</div>
                <ul className="list-disc list-inside space-y-1.5 text-[#27213D]/90 pl-1">
                  {explanation.why.map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {explanation.how && explanation.how.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-stone-100">
                <div className="font-bold text-sm text-[#27213D]">Tahapan Pelaksanaan yang Disarankan:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {explanation.how.map((step: string, i: number) => (
                    <div key={i} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-xs text-[#27213D] leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Constraint Audit */}
        <section className="p-6 sm:p-8 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.04)] space-y-4">
          <h2 className="text-lg font-bold text-[#27213D] tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            <span>Audit Batasan & Kelayakan (Constraint Check)</span>
          </h2>

          <div className="space-y-2.5">
            {opp.constraintEvaluations.map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-xl bg-stone-50 border border-stone-200/70 flex items-start gap-3"
              >
                <div className="shrink-0 mt-0.5">
                  {ev.status === "PASSED" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : ev.status === "WARNING" ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500" />
                  )}
                </div>
                <div className="text-xs space-y-0.5">
                  <div className="text-[#27213D] font-medium">{ev.reason}</div>
                  {ev.possibleResolution && (
                    <div className="text-[#716B7E] text-[11px]">Saran resolusi: {ev.possibleResolution}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Feedback Section */}
        <OpportunityFeedbackSection
          opportunityId={opp.id}
          feedbacks={(opp as any).feedbacks || []}
          currentActorId={actor.id}
        />

        {/* CTA Banner */}
        <section className="p-8 rounded-[32px] bg-gradient-to-br from-[#FFF7ED] via-white to-amber-50/40 border border-[#F9D8C4] text-center space-y-4 shadow-sm">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-[#27213D]">Siap Mewujudkan Peluang Ini?</h3>
            <p className="text-xs text-[#716B7E] max-w-md mx-auto">
              Buka ruang kerja kolaborasi untuk menyepakati ketentuan kerja sama, anggaran, dan pembagian tugas bersama mitra.
            </p>
          </div>

          <div className="inline-flex items-center justify-center pt-2">
            <InitiateCollaborationButton opportunityId={opp.id} />
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function DetailScoreCard({
  label,
  score,
  max,
  weight,
  desc,
}: {
  label: string;
  score: number;
  max: number;
  weight: string;
  desc: string;
}) {
  const percentage = Math.min(100, Math.round((score / max) * 100));
  return (
    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-2.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-[#27213D] truncate">{label}</span>
        <span className="text-amber-800 font-black">{percentage}%</span>
      </div>
      <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[10px] text-[#716B7E]">
        <span>Bobot: {weight}</span>
        <span className="font-semibold text-[#27213D]">{score.toFixed(1)} / {max}</span>
      </div>
      <div className="text-[10px] text-[#716B7E] leading-tight line-clamp-2">{desc}</div>
    </div>
  );
}
