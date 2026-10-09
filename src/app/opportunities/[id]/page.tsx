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
  Target,
  Sparkles,
  FileCheck,
  Layers,
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
      color: "bg-[#E0F7F0] text-[#0D9488] border-[#99F6E4]",
      dot: "bg-[#0D9488]",
    },
    PROMISING: {
      label: "Menjanjikan (Perlu Info Lanjut)",
      color: "bg-amber-50 text-amber-800 border-amber-200",
      dot: "bg-amber-500",
    },
    PARTIAL: {
      label: "Perlu Peran Pelengkap",
      color: "bg-[#4CC9FE]/15 text-[#0284c7] border-[#4CC9FE]/30",
      dot: "bg-[#4CC9FE]",
    },
    BLOCKED: {
      label: "Terkendala Batasan",
      color: "bg-rose-50 text-rose-700 border-rose-200",
      dot: "bg-rose-500",
    },
    UNKNOWN: {
      label: "Belum Terverifikasi",
      color: "bg-slate-100 text-slate-600 border-slate-200",
      dot: "bg-slate-400",
    },
  }[opp.feasibilityStatus] || {
    label: opp.feasibilityStatus,
    color: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  };

  const participantInfoList = opp.participants.map((p) => ({
    actorId: p.actor.id,
    name: p.actor.name,
    sector: p.actor.sector,
    roleLabel: p.roleLabel,
    roleCode: p.roleCode,
  }));

  const existingCollabId = (opp as any).collaborationPlans?.[0]?.collaboration?.id;

  return (
    <AppShell actor={actor} activeRoute="/projects">
      <div className="space-y-6 w-full max-w-7xl mx-auto pb-16">
        {/* TOP ACTION BAR: CLEAN NAVIGATION WITHOUT CLUTTERED BREADCRUMBS */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/projects?tab=ai-opportunities"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200/80 shadow-2xs transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Peluang Kompatibel</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/80 text-slate-700 border border-slate-200/80 shadow-2xs">
              Status: {opp.status}
            </span>
          </div>
        </div>

        {/* HERO SECTION: CLEAN FULL-WIDTH CARD */}
        <section className="glass-card p-6 sm:p-7 rounded-[22px] border-white/80 shadow-2xs space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/80 text-slate-800 border border-slate-200/80 shadow-2xs">
              {opp.pattern?.name || opp.patternCode}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${feasibilityBadge.color}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${feasibilityBadge.dot}`} />
              {feasibilityBadge.label}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#4CC9FE]/15 text-[#0284c7] border border-[#4CC9FE]/30 shadow-2xs">
              {opp.participants.length} Mitra Terhubung
            </span>
          </div>

          <div className="space-y-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {opp.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal max-w-4xl">
              {opp.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Target Pasar &amp; Audiens Sasaran
              </div>
              <div className="text-xs font-semibold text-slate-900">
                {targetMarket.audience || "Pasar Kreatif & Penggemar Industri Kontemporer"}
              </div>
              <div className="text-[11px] text-slate-500 font-normal">
                {targetMarket.segment || "Segmen Komersial & Editorial Terverifikasi"}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Target Luaran &amp; Output Nyata
              </div>
              <div className="flex flex-wrap gap-1.5">
                {expectedOutputs.map((out, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xl text-xs bg-white text-slate-800 border border-slate-200/80 font-medium shadow-2xs"
                  >
                    • {out}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 2-COLUMN BALANCED LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* MAIN COLUMN (8 COLS) */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. PROBLEM SOLVING & COMPLEMENTARITY */}
            <section className="glass-card p-6 sm:p-7 rounded-[22px] border-white/80 shadow-2xs space-y-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#0284c7] bg-[#4CC9FE]/15 px-2.5 py-0.5 rounded-full border border-[#4CC9FE]/30 shadow-2xs">
                  <Target className="w-3 h-3 text-[#0284c7]" />
                  <span>Nilai Problem Solving &amp; Sinergi Komplementer</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Mengapa Kolaborasi Ini Menyelesaikan Masalah Nyata?
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  RAMU mempertemukan pelaku kreatif dan pemilik aset dengan prinsip komplementaritas. Mengubah kapasitas menganggur (idle capacity) menjadi hasil produksi bernilai komersial tanpa kendala biaya sewa besar di muka.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                {/* Pillar 1: Shared Bottleneck */}
                <div className="p-4 rounded-2xl bg-white/70 border border-slate-200/80 flex flex-col justify-between space-y-3 shadow-2xs">
                  <div className="space-y-2">
                    <div className="w-7 h-7 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                      Tantangan &amp; Bottleneck Bersama
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      Pelaku kreatif terhambat biaya sewa fasilitas dan alat tinggi di awal, sementara pemilik ruang atau alat memiliki kapasitas waktu luang yang belum termonetisasi.
                    </p>
                  </div>
                  {opp.needs && opp.needs.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
                      Kebutuhan terpetakan: {opp.needs.map((n: any) => n.need?.title || n.need?.description).filter(Boolean).slice(0, 1).join(", ") || "Akses Fasilitas & Produksi"}
                    </div>
                  )}
                </div>

                {/* Pillar 2: Synergy Solution */}
                <div className="p-4 rounded-2xl bg-white/70 border border-slate-200/80 flex flex-col justify-between space-y-3 shadow-2xs">
                  <div className="space-y-2">
                    <div className="w-7 h-7 rounded-xl bg-[#4CC9FE]/15 border border-[#4CC9FE]/30 text-[#0284c7] flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                      Solusi Sinergi Komplementer
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      Menggabungkan aset peralatan ({opp.assets.slice(0, 2).map((a) => a.asset.name).join(", ") || "aset terdaftar"}) dengan talenta eksekusi untuk efisiensi biaya maksimal.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
                    Prinsip kerja: zero heavy upfront capex
                  </div>
                </div>

                {/* Pillar 3: Compensation & Rights */}
                <div className="p-4 rounded-2xl bg-white/70 border border-slate-200/80 flex flex-col justify-between space-y-3 shadow-2xs">
                  <div className="space-y-2">
                    <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                      Kompensasi &amp; Manfaat Bersama
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      Seluruh pihak memperoleh hak co-credit resmi, portofolio terverifikasi, dan pembagian fee/revenue yang dilindungi oleh draf SPK digital resmi RAMU.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
                    Perlindungan hukum: SPK digital otomatis
                  </div>
                </div>
              </div>
            </section>

            {/* 2. PARTICIPANTS & ROLES */}
            <section className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#0284c7]" />
                  <span>Aktor Partisipan &amp; Pembagian Peran</span>
                </h2>
                <span className="text-xs font-medium text-slate-500">
                  {opp.participants.length} Pelaku Kreatif Terlibat
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {opp.participants.map((p) => {
                  const actorAssetIds = new Set(p.actor.assets.map((as: any) => as.id));
                  const actorAssetsUsed = opp.assets.filter((a) => actorAssetIds.has(a.assetId));

                  return (
                    <div
                      key={p.id}
                      className="glass-card p-5 rounded-[22px] border-white/80 shadow-2xs space-y-3.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5 min-w-0">
                          <Link
                            href={`/directory/${p.actor.id}`}
                            className="text-sm font-bold text-slate-900 hover:text-[#0284c7] transition-colors inline-flex items-center gap-1.5 group/name truncate"
                          >
                            <span className="truncate">{p.actor.name}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover/name:opacity-100 transition-opacity text-[#0284c7] shrink-0" />
                          </Link>
                          <div className="text-[11px] text-slate-500 truncate">
                            {p.actor.sector} {p.actor.location ? `• ${p.actor.location}` : ""}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#4CC9FE]/15 text-[#0284c7] border border-[#4CC9FE]/30">
                            {p.roleLabel || p.roleCode}
                          </span>
                          <Link
                            href={`/directory/${p.actor.id}`}
                            className="text-[10px] font-semibold text-slate-400 hover:text-slate-800 transition-colors"
                          >
                            Profil &amp; Aset
                          </Link>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Kontribusi dalam Sinergi:
                        </div>
                        <div className="text-xs text-slate-800 leading-relaxed font-normal">
                          {p.contribution || "Menyediakan kapabilitas pendukung dan aset terdaftar"}
                        </div>
                      </div>

                      {actorAssetsUsed.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Aset yang Digunakan:
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {actorAssetsUsed.map((as, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-white text-slate-800 border border-slate-200/80 font-medium shadow-2xs"
                              >
                                <Package className="w-3.5 h-3.5 text-[#0284c7]" />
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

            {/* 3. EXPLAINABLE TRANSPARENCY */}
            <section className="glass-card p-6 sm:p-7 rounded-[22px] border-white/80 shadow-2xs space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-[#0284c7]" />
                <span>Transparansi Rekomendasi (Explainable Output)</span>
              </h2>

              <div className="space-y-3.5 text-xs text-slate-600">
                {explanation.summary && (
                  <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200/70 text-slate-900 font-medium leading-relaxed">
                    {explanation.summary}
                  </div>
                )}

                {explanation.why && explanation.why.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-bold text-xs uppercase tracking-wider text-slate-500">
                      Dasar Pertimbangan Komplementaritas:
                    </div>
                    <ul className="list-disc list-inside space-y-1.5 text-slate-700 pl-1 font-normal">
                      {explanation.why.map((r: string, i: number) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {explanation.how && explanation.how.length > 0 && (
                  <div className="space-y-2.5 pt-3 border-t border-slate-100">
                    <div className="font-bold text-xs uppercase tracking-wider text-slate-500">
                      Tahapan Pelaksanaan yang Disarankan:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {explanation.how.map((step: string, i: number) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-white border border-slate-200/70 flex items-start gap-2.5 shadow-2xs"
                        >
                          <span className="w-5 h-5 rounded-full bg-[#4CC9FE]/20 text-[#0284c7] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="text-xs text-slate-800 leading-relaxed font-normal">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 4. FEEDBACK SECTION */}
            <OpportunityFeedbackSection
              opportunityId={opp.id}
              feedbacks={(opp as any).feedbacks || []}
              currentActorId={actor.id}
            />
          </div>

          {/* SIDEBAR COLUMN (4 COLS): STICKY ACTION & COMPATIBILITY AUDIT */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-20 space-y-5">
              {/* CARD 1: 4-PILLAR SCORE & INITIATE CTA */}
              <div className="glass-card p-6 rounded-[22px] border-white/80 shadow-2xs space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                    Kesesuaian 4 Pilar Engine
                  </span>
                  <span className="text-[10px] font-bold text-[#0284c7] bg-[#4CC9FE]/15 px-2.5 py-0.5 rounded-full border border-[#4CC9FE]/30">
                    Audit Determinatif
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#4CC9FE]/15 to-sky-50/80 border border-[#4CC9FE]/30 text-center space-y-1 shadow-2xs">
                  <div className="text-4xl font-black text-[#0284c7]">
                    {displayScore}%
                  </div>
                  <div className="text-xs text-slate-700 font-bold">
                    {displayScore >= 75 ? "Kecocokan Sangat Tinggi" : "Kecocokan Terverifikasi"}
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal">
                    Kompatibilitas aset, jadwal, dan peran memenuhi standar platform
                  </div>
                </div>

                {latestScore && (
                  <div className="space-y-2.5 pt-1">
                    <ScoreBarDetail
                      label="Resource Fit"
                      score={latestScore.complementarityScore}
                      max={4}
                      weight="40%"
                    />
                    <ScoreBarDetail
                      label="Need Coverage"
                      score={latestScore.needCoverageScore}
                      max={4}
                      weight="25%"
                    />
                    <ScoreBarDetail
                      label="Feasibility Check"
                      score={latestScore.feasibilityScore}
                      max={4}
                      weight="20%"
                    />
                    <ScoreBarDetail
                      label="Readiness Score"
                      score={latestScore.actionabilityScore}
                      max={4}
                      weight="15%"
                    />
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <InitiateCollaborationButton
                    opportunityId={opp.id}
                    existingCollaborationId={existingCollabId}
                    opportunityTitle={opp.title}
                    patternName={opp.pattern?.name || opp.patternCode}
                    participants={participantInfoList}
                    initialBudget="Rp 15.000.000"
                    initialTimeline="3-4 Minggu"
                    className="w-full justify-center !py-3 !text-xs sm:!text-sm shadow-md shadow-[#4CC9FE]/25"
                  />
                  <p className="text-[11px] text-slate-500 text-center font-normal leading-relaxed">
                    Kirim proposal inisiasi untuk menyepakati anggaran, timeline, dan membuka workspace resmi bersama mitra.
                  </p>
                </div>
              </div>

              {/* CARD 2: CONSTRAINT EVALUATION */}
              {opp.constraintEvaluations && opp.constraintEvaluations.length > 0 && (
                <div className="glass-card p-5 rounded-[22px] border-white/80 shadow-2xs space-y-3.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#0284c7]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Audit Batasan &amp; Kelayakan
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {opp.constraintEvaluations.map((ev) => (
                      <div
                        key={ev.id}
                        className="p-3 rounded-xl bg-white border border-slate-200/70 flex items-start gap-2.5 text-xs shadow-2xs"
                      >
                        <div className="shrink-0 mt-0.5">
                          {ev.status === "PASSED" ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : ev.status === "WARNING" ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 leading-snug">{ev.reason}</p>
                          {ev.possibleResolution && (
                            <p className="text-[10px] text-slate-500 mt-0.5 font-normal">
                              Saran: {ev.possibleResolution}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CARD 3: LEGAL & SECURITY GUARANTEE */}
              <div className="glass-card p-5 rounded-[22px] border-slate-700/60 shadow-md space-y-2.5 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#4CC9FE]" />
                  <h3 className="text-xs font-bold text-white tracking-wide">
                    Standar Kesepakatan RAMU
                  </h3>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
                  Seluruh kolaborasi yang diinisiasi dilindungi draf SPK digital resmi dengan klausul pembagian hak kekayaan intelektual (IP), pencantuman co-credit, serta komitmen transparansi para pihak.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function ScoreBarDetail({
  label,
  score,
  max,
  weight,
}: {
  label: string;
  score: number;
  max: number;
  weight: string;
}) {
  const percentage = Math.min(100, Math.round((score / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700 text-[11px]">{label}</span>
        <span className="text-[#0284c7] font-bold text-[11px]">{percentage}%</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#4CC9FE] to-[#0284c7] rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[10px] text-slate-400">
        <span>Bobot: {weight}</span>
        <span>{score.toFixed(1)} / {max}</span>
      </div>
    </div>
  );
}
