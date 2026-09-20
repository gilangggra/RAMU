import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { logout } from "@/app/(auth)/actions";
import { getOpportunityById } from "@/application/opportunityService";
import { InitiateCollaborationButton } from "../InitiateCollaborationButton";
import { OpportunityFeedbackSection } from "./OpportunityFeedbackSection";
import {
  Users,
  Package,
  BarChart2,
  Lightbulb,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  XCircle,
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
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      dot: "bg-emerald-400",
    },
    PROMISING: {
      label: "Menjanjikan (Perlu Info Lanjut)",
      color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      dot: "bg-amber-400",
    },
    PARTIAL: {
      label: "Perlu Peran Pelengkap",
      color: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      dot: "bg-sky-400",
    },
    BLOCKED: {
      label: "Terkendala Batasan",
      color: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      dot: "bg-rose-400",
    },
    UNKNOWN: {
      label: "Belum Terverifikasi",
      color: "bg-slate-500/10 text-slate-400 border-slate-500/20",
      dot: "bg-slate-400",
    },
  }[opp.feasibilityStatus] || {
    label: opp.feasibilityStatus,
    color: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    dot: "bg-slate-400",
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-slate-950 shadow-md shadow-amber-500/20">
                R
              </div>
              <span className="font-bold text-lg tracking-tight text-white">RAMU</span>
            </Link>
            <div className="hidden md:flex items-center gap-1 text-xs">
              <Link href="/dashboard" className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/opportunities" className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20">
                ← Kembali ke Katalog Peluang
              </Link>
              <Link href="/projects" className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors">
                Proyek (Briefs)
              </Link>
              <Link href="/collaborations" className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors">
                Kolaborasi
              </Link>
              <Link href="/engine-insights" className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors">
                Engine Insights
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-white">{actor.name}</div>
              <div className="text-[11px] text-slate-400">{actor.sector}</div>
            </div>

            <form action={logout}>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
              >
                Keluar
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
          >
            <span>←</span>
            <span>Kembali ke Semua Peluang</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-800">
              Status: {opp.status}
            </span>
          </div>
        </div>

        <section className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 relative overflow-hidden space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {opp.pattern?.name || opp.patternCode}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${feasibilityBadge.color}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${feasibilityBadge.dot}`} />
                  {feasibilityBadge.label}
                </span>
              </div>

              <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                {opp.title}
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                {opp.description}
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-700/80 text-center shrink-0 min-w-[140px] space-y-1 shadow-xl">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Kesesuaian</div>
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
                {displayScore}%
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold">
                {displayScore > 0 ? "Tinggi" : "Belum Dihitung"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
            <div className="space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Pasar & Audiens</div>
              <div className="text-xs text-slate-200">
                {targetMarket.audience || "Pasar Urban & Penggemar Kriya Kontemporer"}
              </div>
              <div className="text-[11px] text-slate-400">
                {targetMarket.segment || "Segmen Konsumen Budaya Premium"}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Hasil Output Nyata</div>
              <div className="flex flex-wrap gap-1.5">
                {expectedOutputs.map((out, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-800 text-slate-200 border border-slate-700/50"
                  >
                    • {out}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <span>Aktor Partisipan & Pembagian Peran</span>
            </h2>
            <span className="text-xs text-slate-400">{opp.participants.length} Pelaku Ekonomi Kreatif</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opp.participants.map((p) => {
              // Ambil ID aset yang digunakan pada peluang ini, filter berdasarkan aktor
              const actorAssetIds = new Set(p.actor.assets.map((as: any) => as.id));
              const actorAssetsUsed = opp.assets.filter((a) => actorAssetIds.has(a.assetId));

              return (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="text-base font-bold text-white">{p.actor.name}</div>
                      <div className="text-xs text-slate-400">
                        {p.actor.sector} • {p.actor.location || "Indonesia"}
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {p.roleLabel || p.roleCode}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Kontribusi:</div>
                    <div className="text-xs text-slate-200">{p.contribution || "Menyediakan kapabilitas pendukung"}</div>
                  </div>

                  {actorAssetsUsed.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Aset yang Digunakan:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {actorAssetsUsed.map((as, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs bg-slate-800 text-slate-300 border border-slate-700"
                          >
                            <Package className="w-3.5 h-3.5 text-slate-400" />
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

        {latestScore && (
          <section className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-amber-400" />
                <span>Analisis 6 Dimensi Kesesuaian (Scoring Model)</span>
              </h2>
              <span className="text-xs text-amber-400 font-semibold">Skor Akhir: {displayScore}/100</span>
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

        <section className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <span>Transparansi Rekomendasi (Explainable Output)</span>
          </h2>

          <div className="space-y-4 text-xs text-slate-300">
            {explanation.summary && (
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-slate-200 leading-relaxed">
                {explanation.summary}
              </div>
            )}

            {explanation.why && explanation.why.length > 0 && (
              <div className="space-y-2">
                <div className="font-bold text-sm text-white">Dasar Pertimbangan Komplementaritas:</div>
                <ul className="list-disc list-inside space-y-1.5 text-slate-300 pl-1">
                  {explanation.why.map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {explanation.how && explanation.how.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="font-bold text-sm text-white">Tahapan Pelaksanaan yang Disarankan:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {explanation.how.map((step: string, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[11px] shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-slate-300 leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span>Audit Batasan & Kelayakan (Constraint Check)</span>
          </h2>

          <div className="space-y-2">
            {opp.constraintEvaluations.map((ev) => (
              <div
                key={ev.id}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3"
              >
                <div className="shrink-0 mt-0.5">
                  {ev.status === "PASSED" ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : ev.status === "WARNING" ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                </div>
                <div className="text-xs space-y-0.5">
                  <div className="text-slate-200">{ev.reason}</div>
                  {ev.possibleResolution && (
                    <div className="text-slate-400 text-[11px]">Saran resolusi: {ev.possibleResolution}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <OpportunityFeedbackSection
          opportunityId={opp.id}
          feedbacks={(opp as any).feedbacks || []}
          currentActorId={actor.id}
        />

        <section className="p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/30 text-center space-y-4">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">Siap Mewujudkan Peluang Ini?</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Buka ruang kerja kolaborasi untuk menyepakati ketentuan kerja sama, anggaran, dan pembagian tugas bersama mitra.
            </p>
          </div>

          <div className="inline-flex items-center justify-center pt-2">
            <InitiateCollaborationButton opportunityId={opp.id} />
          </div>
        </section>
      </main>
    </div>
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
    <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-white truncate">{label}</span>
        <span className="text-amber-400 font-bold">{percentage}%</span>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[10px] text-slate-400">
        <span>Bobot: {weight}</span>
        <span>{score.toFixed(1)} / {max}</span>
      </div>
      <div className="text-[10px] text-slate-400 leading-tight line-clamp-2">{desc}</div>
    </div>
  );
}
