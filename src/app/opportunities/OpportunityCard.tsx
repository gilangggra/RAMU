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
      color: "bg-[#FFF7ED] text-[#E66A48] border-[#F9D8C4]",
      dot: "bg-[#E66A48]",
    },
    PARTIAL: {
      label: "Perlu Pelengkap",
      color: "bg-[#E2F4FD] text-[#2563EB] border-[#BFDBFE]",
      dot: "bg-[#2563EB]",
    },
    BLOCKED: {
      label: "Terkendala",
      color: "bg-rose-50 text-rose-700 border-rose-200",
      dot: "bg-rose-500",
    },
    UNKNOWN: {
      label: "Belum Terverifikasi",
      color: "bg-stone-100 text-stone-600 border-stone-200",
      dot: "bg-stone-400",
    },
  }[feasibilityStatus] || {
    label: feasibilityStatus,
    color: "bg-stone-100 text-stone-600 border-stone-200",
    dot: "bg-stone-400",
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
    <div className="p-6 sm:p-7 rounded-[28px] bg-white/95 border border-stone-200/80 hover:border-[#E66A48]/50 shadow-xs hover:shadow-md transition-all duration-300 space-y-6 group flex flex-col justify-between">
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFF7ED] text-[#E66A48] border border-[#F9D8C4]">
              {patternName || patternCode}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${feasibilityBadge.color}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${feasibilityBadge.dot}`} />
              {feasibilityBadge.label}
            </span>
            {isCurrentUserParticipant && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EDE8FF] text-[#7C3AED] border border-[#DDD6FE]">
                Melibatkan Aset Anda
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-stone-50 border border-stone-200 shadow-2xs">
            <div className="text-[10px] uppercase tracking-wider text-[#9E98A8] font-bold">Skor Keselarasan</div>
            <div className="text-base font-black text-[#E66A48]">
              {displayScore}%
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-bold text-[#27213D] tracking-tight group-hover:text-[#E66A48] transition-colors">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-[#716B7E] leading-relaxed">{description}</p>
        </div>

        <div className="space-y-2.5 pt-2 border-t border-stone-100">
          <div className="text-xs font-bold uppercase tracking-wider text-[#9E98A8]">
            Partisipan Kolaborasi ({participants.length})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {participants.map((p, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-stone-50/80 border border-stone-200/80 flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FFE9DE] to-[#F3EDFF] border border-[#F9D8C4] flex items-center justify-center font-bold text-xs text-[#E66A48] shrink-0">
                  {p.actor.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="text-xs font-bold text-[#27213D] truncate">{p.actor.name}</div>
                  <div className="text-[11px] text-[#E66A48] font-bold">
                    {p.roleLabel || p.roleCode}
                  </div>
                  {p.contribution && (
                    <div className="text-[11px] text-[#716B7E] line-clamp-1">{p.contribution}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {expectedOutputs && expectedOutputs.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-[#9E98A8] uppercase tracking-wider mr-1">
              Output:
            </span>
            {expectedOutputs.map((out, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg text-xs bg-stone-50 text-[#27213D] border border-stone-200"
              >
                • {out}
              </span>
            ))}
          </div>
        )}

        {/* Transparency Accordion */}
        <div className="border border-stone-200 rounded-2xl overflow-hidden bg-stone-50/50">
          <button
            type="button"
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-[#27213D] hover:bg-stone-100/60 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[#FFB800] shrink-0" />
              <span>Transparansi Rekomendasi Engine (Mengapa Cocok?)</span>
            </span>
            <span className="text-sm font-bold text-[#716B7E]">{showExplanation ? "−" : "+"}</span>
          </button>

          {showExplanation && (
            <div className="p-4 pt-3 border-t border-stone-200 space-y-4 text-xs text-[#27213D] bg-white animate-fade-in">
              {score && (
                <div className="space-y-2 pt-1 pb-3 border-b border-stone-100">
                  <div className="text-[11px] font-bold text-[#9E98A8] uppercase tracking-wider">
                    Analisis 6 Dimensi Kesesuaian
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <ScoreBar label="Komplementaritas" score={score.complementarityScore} max={4} weight="25%" />
                    <ScoreBar label="Kelayakan" score={score.feasibilityScore} max={4} weight="20%" />
                    <ScoreBar label="Keselarasan Goal" score={score.goalAlignmentScore} max={4} weight="15%" />
                    <ScoreBar label="Kebutuhan Terpenuhi" score={score.needCoverageScore} max={4} weight="15%" />
                    <ScoreBar label="Kejelasan Aksi" score={score.actionabilityScore} max={4} weight="15%" />
                    <ScoreBar label="Pemanfaatan Aset" score={score.assetUtilizationScore} max={4} weight="10%" />
                  </div>
                </div>
              )}

              {explanation?.why && explanation.why.length > 0 && (
                <div className="space-y-1.5">
                  <div className="font-bold text-[#27213D]">Dasar Pertimbangan Komplementaritas:</div>
                  <ul className="list-disc list-inside space-y-1 text-[#716B7E] pl-1">
                    {explanation.why.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {explanation?.can?.notes && explanation.can.notes.length > 0 && (
                <div className="space-y-1.5">
                  <div className="font-bold text-[#27213D]">Catatan Kelayakan & Koordinasi:</div>
                  <ul className="list-disc list-inside space-y-1 text-[#716B7E] pl-1">
                    {explanation.can.notes.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-stone-100">
        <button
          onClick={handleToggleSave}
          disabled={isUpdating}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
            currentStatus === OpportunityStatus.SAVED
              ? "bg-[#FFF7ED] text-[#E66A48] border-[#F9D8C4] font-bold"
              : "bg-white hover:bg-stone-50 text-[#716B7E] hover:text-[#27213D] border-stone-200"
          }`}
        >
          {currentStatus === OpportunityStatus.SAVED ? (
            <span className="inline-flex items-center gap-1.5">
              <BookmarkCheck className="w-3.5 h-3.5 text-[#E66A48]" />
              <span>Tersimpan</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-[#716B7E]" />
              <span>Simpan Peluang</span>
            </span>
          )}
        </button>

        <Link
          href={`/opportunities/${id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E66A48] hover:bg-[#D45938] text-white font-bold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer"
        >
          <span>Rincian & Rencana Kolaborasi</span>
          <ArrowRight className="w-3.5 h-3.5" />
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
    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
      <div className="flex items-center justify-between text-[10px] text-[#716B7E]">
        <span className="truncate">{label}</span>
        <span className="text-[#E66A48] font-bold">{percentage}%</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-stone-200 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#FFB800] to-[#E66A48] rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-[9px] text-[#9E98A8] text-right">Bobot: {weight}</div>
    </div>
  );
}
