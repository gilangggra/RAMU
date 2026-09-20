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
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      dot: "bg-emerald-400",
    },
    PROMISING: {
      label: "Menjanjikan",
      color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      dot: "bg-amber-400",
    },
    PARTIAL: {
      label: "Perlu Pelengkap",
      color: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      dot: "bg-sky-400",
    },
    BLOCKED: {
      label: "Terkendala",
      color: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      dot: "bg-rose-400",
    },
    UNKNOWN: {
      label: "Belum Terverifikasi",
      color: "bg-slate-500/10 text-slate-400 border-slate-500/20",
      dot: "bg-slate-400",
    },
  }[feasibilityStatus] || {
    label: feasibilityStatus,
    color: "bg-slate-500/10 text-slate-400 border-slate-500/20",
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
    <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/30 transition-all duration-300 backdrop-blur-md space-y-6 group">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
            {patternName || patternCode}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${feasibilityBadge.color}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${feasibilityBadge.dot}`} />
            {feasibilityBadge.label}
          </span>
          {isCurrentUserParticipant && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
              Melibatkan Aset Anda
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-700/60 shadow-inner">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Skor Kesesuaian</div>
          <div className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
            {displayScore}%
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-amber-300 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
      </div>

      <div className="space-y-3 pt-2 border-t border-slate-800/80">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Partisipan Kolaborasi ({participants.length})
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {participants.map((p, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/70 flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center font-bold text-xs text-amber-400 shrink-0">
                {p.actor.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="text-xs font-bold text-white truncate">{p.actor.name}</div>
                <div className="text-[11px] text-amber-400/90 font-medium">
                  {p.roleLabel || p.roleCode}
                </div>
                {p.contribution && (
                  <div className="text-[11px] text-slate-400 line-clamp-1">{p.contribution}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {expectedOutputs && expectedOutputs.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1">
            Output:
          </span>
          {expectedOutputs.map((out, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-lg text-xs bg-slate-800/70 text-slate-300 border border-slate-700/40"
            >
              • {out}
            </span>
          ))}
        </div>
      )}

      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40">
        <button
          type="button"
          onClick={() => setShowExplanation(!showExplanation)}
          className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-slate-900/40 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Mengapa Peluang Ini Cocok? (Transparansi Rekomendasi Engine)</span>
          </span>
          <span className="text-base">{showExplanation ? "−" : "+"}</span>
        </button>

        {showExplanation && (
          <div className="p-4 pt-2 border-t border-slate-800/80 space-y-4 text-xs text-slate-300 animate-fade-in">
            {score && (
              <div className="space-y-2 pt-1 pb-3 border-b border-slate-800/80">
                <div className="text-[11px] font-bold text-white uppercase tracking-wider">
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
                <div className="font-semibold text-slate-200">Dasar Pertimbangan Komplementaritas:</div>
                <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
                  {explanation.why.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {explanation?.can?.notes && explanation.can.notes.length > 0 && (
              <div className="space-y-1.5">
                <div className="font-semibold text-slate-200">Catatan Kelayakan & Koordinasi:</div>
                <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
                  {explanation.can.notes.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
        <button
          onClick={handleToggleSave}
          disabled={isUpdating}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
            currentStatus === OpportunityStatus.SAVED
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
              : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700/60"
          }`}
        >
          {currentStatus === OpportunityStatus.SAVED ? (
            <span className="inline-flex items-center gap-1.5">
              <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Tersimpan</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-slate-400" />
              <span>Simpan Peluang</span>
            </span>
          )}
        </button>

        <Link
          href={`/opportunities/${id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors cursor-pointer group-hover:bg-amber-500 group-hover:text-slate-950"
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
    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
      <div className="flex items-center justify-between text-[10px] text-slate-400">
        <span className="truncate">{label}</span>
        <span className="text-amber-400 font-bold">{percentage}%</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-[9px] text-slate-500 text-right">Bobot: {weight}</div>
    </div>
  );
}
