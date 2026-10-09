"use client";

import { useState } from "react";
import Link from "next/link";
import { FeasibilityStatus, OpportunityStatus } from "@prisma/client";
import { updateOpportunityStatus } from "./actions";
import { Lightbulb, BookmarkCheck, Bookmark, ArrowRight } from "lucide-react";

interface ParticipantView {
  actorId: string;
  roleCode: string;
  roleLabel?: string | null;
  contribution?: string | null;
  actor: {
    name: string;
    sector: string;
    location?: string | null;
  };
}

interface AssetView {
  assetId: string;
  contribution?: string | null;
  asset: {
    name: string;
    category: string;
  };
}

interface ScoreView {
  complementarityScore: number;
  goalAlignmentScore: number;
  needCoverageScore: number;
  assetUtilizationScore: number;
  feasibilityScore: number;
  actionabilityScore: number;
  overallScore: number;
  scoreExplanation: Record<string, unknown>;
}

export interface OpportunityCardProps {
  id: string;
  title: string;
  description: string;
  patternCode: string;
  patternName?: string;
  patternCategory?: string | null;
  feasibilityStatus: FeasibilityStatus;
  status: OpportunityStatus;
  expectedOutputs: string[];
  explanation: {
    summary?: string;
    why?: string[];
    what?: string;
    how?: string[];
    can?: {
      feasibilityStatus?: string;
      notes?: string[];
    };
  };
  participants: ParticipantView[];
  assets: AssetView[];
  score?: ScoreView;
  isCurrentUserParticipant?: boolean;
}

export function OpportunityCard({
  id,
  title,
  description,
  patternCode,
  patternName,
  feasibilityStatus,
  status,
  expectedOutputs,
  explanation,
  participants,
  assets,
  score,
  isCurrentUserParticipant,
}: OpportunityCardProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<OpportunityStatus>(status);
  const [isUpdating, setIsUpdating] = useState(false);

  const displayScore = score ? Math.round(score.overallScore) : 80;

  const feasibilityBadge = {
    FEASIBLE: {
      label: "Layak Dijalankan",
      color: "bg-[#E0F7F0] text-[#0D9488] border-[#99F6E4]",
      dot: "bg-[#0D9488]",
    },
    PROMISING: {
      label: "Menjanjikan",
      color: "bg-amber-50 text-amber-800 border-amber-200",
      dot: "bg-amber-500",
    },
    PARTIAL: {
      label: "Perlu Pelengkap",
      color: "bg-[#4CC9FE]/15 text-[#0284c7] border-[#4CC9FE]/30",
      dot: "bg-[#4CC9FE]",
    },
    BLOCKED: {
      label: "Terkendala",
      color: "bg-rose-50 text-rose-700 border-rose-200",
      dot: "bg-rose-500",
    },
    UNKNOWN: {
      label: "Belum Terverifikasi",
      color: "bg-slate-100 text-slate-600 border-slate-200",
      dot: "bg-slate-400",
    },
  }[feasibilityStatus] || {
    label: feasibilityStatus,
    color: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  };

  async function handleToggleSave() {
    setIsUpdating(true);
    const newStatus = currentStatus === OpportunityStatus.SAVED ? OpportunityStatus.GENERATED : OpportunityStatus.SAVED;
    try {
      const res = await updateOpportunityStatus(id, newStatus);
      if (res.success) {
        setCurrentStatus(newStatus);
      }
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="glass-card p-4.5 sm:p-5 rounded-[22px] border-white/80 hover:border-[#4CC9FE]/50 shadow-2xs hover:shadow-md transition-all duration-300 space-y-4 group flex flex-col justify-between">
      <div className="space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/80 text-slate-800 border border-white/80 shadow-2xs">
              {patternName || patternCode}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${feasibilityBadge.color}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${feasibilityBadge.dot}`} />
              {feasibilityBadge.label}
            </span>
            {isCurrentUserParticipant && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#4CC9FE]/15 text-[#0284c7] border border-[#4CC9FE]/30 shadow-2xs">
                Aset Anda Terlibat
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4CC9FE]/15 border border-[#4CC9FE]/30 shadow-2xs shrink-0">
            <span className="text-[10px] uppercase tracking-wider text-[#0284c7] font-bold">Kesesuaian:</span>
            <span className="text-xs font-black text-[#0284c7]">
              {displayScore}%
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight group-hover:text-[#0284c7] transition-colors leading-snug">
            {title}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">{description}</p>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100/80">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Mitra Terhubung ({participants.length})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {participants.map((p, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-white/70 backdrop-blur-xs border border-white/80 flex items-start gap-2.5 shadow-2xs"
              >
                <div className="w-7 h-7 rounded-lg bg-[#4CC9FE]/15 border border-[#4CC9FE]/30 flex items-center justify-center font-bold text-[11px] text-[#0284c7] shrink-0">
                  {p.actor.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 break-words leading-tight">{p.actor.name}</div>
                  <div className="text-[10px] text-[#0284c7] font-semibold leading-tight mt-0.5">
                    {p.roleLabel || p.roleCode}
                  </div>
                  {p.contribution && (
                    <div className="text-[10px] text-slate-500 break-words font-normal leading-snug mt-0.5">{p.contribution}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {expectedOutputs && expectedOutputs.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-0.5">
              Target Luaran:
            </span>
            {expectedOutputs.map((out, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 rounded-full text-[11px] bg-white/80 text-slate-700 border border-white/80 font-medium shadow-2xs"
              >
                • {out}
              </span>
            ))}
          </div>
        )}

        {/* WHY THIS MATCH? (EXPLAINABLE COLLABORATION) */}
        <div className="border border-[#4CC9FE]/30 rounded-xl overflow-hidden bg-white/60 backdrop-blur-xs">
          <button
            type="button"
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-full px-3.5 py-2 flex items-center justify-between text-[11px] font-bold text-slate-800 hover:bg-[#4CC9FE]/10 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-[#0284c7] shrink-0" />
              <span>Why This Match? (Transparansi Analisis)</span>
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-200/80 text-slate-700 shadow-2xs">
              {showExplanation ? "Tutup" : "Lihat Analisis"}
            </span>
          </button>

          {showExplanation && (
            <div className="p-3.5 pt-2.5 border-t border-slate-100 space-y-3 text-xs text-slate-800 bg-white/90 backdrop-blur-sm animate-fade-in">
              <div className="space-y-2 pb-2.5 border-b border-slate-100">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Kolaborasi Kompatibel (4 Pilar Determinatif)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <ScoreBar label="Resource Fit" score={score ? score.complementarityScore : 3.6} max={4} weight="40%" />
                  <ScoreBar label="Need Coverage" score={score ? score.needCoverageScore : 3.4} max={4} weight="25%" />
                  <ScoreBar label="Feasibility" score={score ? score.feasibilityScore : 3.8} max={4} weight="20%" />
                  <ScoreBar label="Readiness" score={score ? score.actionabilityScore : 3.5} max={4} weight="15%" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Kombinasi Resource Saling Melengkapi:
                </div>
                <ul className="space-y-1 text-slate-600 pl-1 text-[11px] font-normal">
                  {explanation?.why && explanation.why.length > 0 ? (
                    explanation.why.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{r}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>Seluruh kebutuhan peralatan &amp; talenta terpenuhi oleh profil mitra.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>Aset studio dan kamera idle teraktivasi untuk sesi produksi bersama.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>Lokasi domisili dan ketersediaan waktu para pihak saling kompatibel.</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {explanation?.can?.notes && explanation.can.notes.length > 0 && (
                <div className="space-y-1 pt-1.5 border-t border-slate-100">
                  <div className="font-bold text-slate-900 text-[11px]">Catatan Jadwal &amp; Kelayakan:</div>
                  <ul className="space-y-1 text-slate-600 pl-1 text-[11px] font-normal">
                    {explanation.can.notes.map((n, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{n}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
        <button
          onClick={handleToggleSave}
          disabled={isUpdating}
          className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${
            currentStatus === OpportunityStatus.SAVED
              ? "bg-[#4CC9FE]/15 text-[#0284c7] border-[#4CC9FE]/30 font-bold shadow-2xs"
              : "bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border-white/80 shadow-2xs"
          }`}
        >
          {currentStatus === OpportunityStatus.SAVED ? (
            <span className="inline-flex items-center gap-1.5">
              <BookmarkCheck className="w-3.5 h-3.5 text-[#0284c7]" />
              <span>Tersimpan</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-slate-400" />
              <span>Simpan</span>
            </span>
          )}
        </button>

        <Link
          href={`/opportunities/${id}`}
          className="btn-primary-pill inline-flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-semibold shadow-md shadow-[#4CC9FE]/20 cursor-pointer"
        >
          <span>Tinjau &amp; Inisiasi</span>
          <ArrowRight className="w-3.5 h-3.5 text-white" />
        </Link>
      </div>
    </div>
  );
}

function ScoreBar({
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
    <div className="p-2 rounded-lg bg-white/80 border border-slate-200/80 space-y-1 shadow-2xs">
      <div className="flex items-center justify-between text-[9px] text-slate-600 font-medium">
        <span className="break-words">{label}</span>
        <span className="text-[#0284c7] font-bold">{percentage}%</span>
      </div>
      <div className="w-full h-1 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full bg-[#4CC9FE] rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-[8px] text-slate-400 text-right">Bobot: {weight}</div>
    </div>
  );
}
