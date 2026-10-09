"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  MapPin,
  Star,
  ChevronRight,
  Users,
  Send,
  Check,
  Loader2,
  AlertCircle,
  RotateCw,
} from "lucide-react";
import type { CrewRecommendation } from "@/application/projectBriefService";
import { inviteActorToRoleAction, refreshCrewRecommendationsAction } from "@/app/projects/actions";
import { ActorAvatar } from "@/components/ui/ActorAvatar";

const CATEGORY_LABELS: Record<string, string> = {
  PORTFOLIO_WORK: "Karya & Portofolio",
  EQUIPMENT: "Peralatan & Gear",
  STUDIO_SPACE: "Studio & Ruang",
  SKILL_TALENT: "Keahlian & Talenta",
  WARDROBE_PROP: "Wardrobe & Properti",
  AUDIENCE_REACH: "Jangkauan Audiens",
  PRODUCT: "Produk",
  MATERIAL: "Material",
  CAPABILITY: "Kapabilitas",
  RESOURCE: "Sumber Daya",
  PRODUCTION: "Produksi",
  MARKET: "Akses Pasar",
  AUDIENCE: "Audiens",
  CREATIVE_ASSET: "Aset Kreatif",
};

function getScoreTier(score: number) {
  if (score >= 85)
    return {
      bg: "bg-emerald-50",
      text: "text-emerald-800",
      border: "border-emerald-200",
    };
  if (score >= 65)
    return {
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-200",
    };
  return {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
  };
}

const REASON_COLORS: Record<string, string> = {
  "Kategori Aset Cocok": "bg-violet-50 text-violet-700 border-violet-200",
  "Gaya Visual Sesuai": "bg-pink-50 text-pink-700 border-pink-200",
  "Lokasi Sesuai": "bg-sky-50 text-sky-700 border-sky-200",
  "Model Kompensasi Sesuai": "bg-teal-50 text-teal-700 border-teal-200",
};

type InviteState = "idle" | "loading" | "invited" | "error";

interface InviteButtonProps {
  briefId: string;
  roleId: string;
  actorId: string;
  actorName: string;
}

function InviteButton({ briefId, roleId, actorId, actorName }: InviteButtonProps) {
  const [state, setState] = useState<InviteState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleInvite() {
    setErrorMsg(null);
    setState("loading");
    startTransition(async () => {
      const res = await inviteActorToRoleAction(actorId, briefId, roleId);
      if (res.success) {
        setState("invited");
      } else {
        setState("error");
        setErrorMsg(res.error ?? "Gagal mengirim undangan.");
      }
    });
  }

  if (state === "invited") {
    return (
      <div className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold cursor-default">
        <Check className="w-3.5 h-3.5 text-emerald-600" />
        <span>Undangan Terkirim</span>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="space-y-1.5">
        <div className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold cursor-default">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{errorMsg}</span>
        </div>
        <button
          onClick={() => setState("idle")}
          className="w-full text-[10px] text-slate-400 hover:text-slate-600 transition-colors font-medium cursor-pointer"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleInvite}
      disabled={isPending || state === "loading"}
      aria-label={`Undang ${actorName} ke peran ini`}
      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#4CC9FE] hover:bg-[#38b6eb] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[11px] font-semibold shadow-md shadow-[#4CC9FE]/20 hover:shadow-lg hover:shadow-[#4CC9FE]/30 transition-all cursor-pointer"
    >
      {state === "loading" ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Mengirim...</span>
        </>
      ) : (
        <>
          <Send className="w-3.5 h-3.5" />
          <span>Undang ke Peran Ini</span>
        </>
      )}
    </button>
  );
}

interface SmartCrewPanelProps {
  recommendations: CrewRecommendation[];
  briefId: string;
}

export function SmartCrewPanel({ recommendations, briefId }: SmartCrewPanelProps) {
  const router = useRouter();
  const [isRefreshing, startRefreshTransition] = useTransition();

  const handleRefresh = () => {
    startRefreshTransition(async () => {
      await refreshCrewRecommendationsAction(briefId);
      router.refresh();
    });
  };

  const activeRecs = recommendations.filter(
    (r) => !r.isFilled && r.candidates.length > 0
  );

  if (activeRecs.length === 0) return null;

  const totalCandidates = activeRecs.reduce(
    (acc, r) => acc + r.candidates.length,
    0
  );

  return (
    <section className="glass-card rounded-[22px] overflow-hidden border border-white/80 shadow-xl">

      <div className="px-6 sm:px-8 py-5 bg-gradient-to-r from-sky-50/70 via-white/80 to-indigo-50/50 backdrop-blur-md border-b border-white/80 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#4CC9FE]/15 border border-[#4CC9FE]/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-[#0284c7]" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Smart Crew Builder
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Engine RAMU menyeleksi{" "}
              <span className="font-bold text-slate-900">{totalCandidates} kandidat</span>{" "}
              dari {activeRecs.length} peran terbuka · Undang langsung dengan satu klik
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Segarkan rekomendasi kru terbaru dari ekosistem"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-semibold bg-white/80 hover:bg-white border border-slate-200/80 text-slate-700 transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            <RotateCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-[#4CC9FE]" : "text-slate-500"}`} />
            <span>{isRefreshing ? "Memperbarui..." : "Segarkan"}</span>
          </button>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#4CC9FE]/15 text-[#0284c7] border border-[#4CC9FE]/30">
            KOMPLEMENTER
          </span>
        </div>
      </div>

      <div className="bg-white/40 divide-y divide-white/60">
        {activeRecs.map((rec) => (
          <div key={rec.roleId} className="px-6 sm:px-8 py-6 space-y-4">

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/90 border border-slate-200/70 flex items-center justify-center shrink-0 shadow-2xs">
                <Users className="w-4 h-4 text-[#0284c7]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900">
                  {rec.roleLabel}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {CATEGORY_LABELS[rec.assetCategory] ?? rec.assetCategory} ·{" "}
                  {rec.candidates.length} kandidat ditemukan
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {rec.candidates.map((cand, idx) => {
                const tier = getScoreTier(cand.matchScore);
                return (
                  <div
                    key={cand.actor.id}
                    className="relative p-4.5 rounded-[22px] border border-white/80 bg-white/80 backdrop-blur-sm hover:border-[#4CC9FE]/60 hover:shadow-md transition-all duration-200 flex flex-col gap-3"
                  >

                    {idx === 0 && (
                      <span className="absolute -top-2.5 -right-2 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-[#4CC9FE] text-white border border-white/80 shadow-xs tracking-wide">
                        TOP MATCH
                      </span>
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <ActorAvatar
                          name={cand.actor.name}
                          avatarUrl={cand.actor.owner?.avatarUrl}
                          className="w-10 h-10 rounded-xl shadow-2xs"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-sm">
                            {cand.actor.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {cand.actor.sector}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold shrink-0 ${tier.bg} ${tier.text} ${tier.border}`}
                      >
                        <Star className="w-3 h-3 fill-current" />
                        <span>{cand.matchScore}%</span>
                      </div>
                    </div>

                    {cand.actor.location && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 -mt-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>{cand.actor.location}</span>
                      </div>
                    )}

                    {cand.matchReasons.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {cand.matchReasons.map((reason) => (
                          <span
                            key={reason}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                              REASON_COLORS[reason] ??
                              "bg-slate-50 text-slate-600 border-slate-200"
                            }`}
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 mt-auto">

                      <Link
                        href={`/directory/${cand.actor.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-800 text-[11px] font-semibold transition-all duration-200 shadow-2xs"
                      >
                        <span>Profil</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>

                      <div className="flex-[2]">
                        <InviteButton
                          briefId={briefId}
                          roleId={rec.roleId}
                          actorId={cand.actor.id}
                          actorName={cand.actor.name}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 sm:px-8 py-3.5 bg-white/70 backdrop-blur-xs border-t border-white/80">
        <p className="text-[11px] text-slate-500 text-center">
          Undangan dikirim atas nama kreator yang diundang · Mereka bebas menerima atau menolak · Rekomendasi berdasarkan kecocokan aset &amp; gaya visual
        </p>
      </div>
    </section>
  );
}
