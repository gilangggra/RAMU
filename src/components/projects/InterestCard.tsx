"use client";

import { useState, useTransition } from "react";
import { acceptCollaboratorAction, declineCollaboratorAction } from "@/app/projects/actions";
import { MapPin, AlertCircle, Check } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  PRODUCT: "Produk",
  MATERIAL: "Material",
  CAPABILITY: "Kapabilitas",
  RESOURCE: "Sumber Daya",
  PRODUCTION: "Produksi",
  MARKET: "Akses Pasar",
  AUDIENCE: "Audiens",
  CREATIVE_ASSET: "Aset Kreatif",
};

interface InterestCardProps {
  interestId: string;
  briefId: string;
  roleLabel: string;
  status: string;
  message?: string | null;
  actor: {
    id: string;
    name: string;
    sector: string;
    location?: string | null;
    description?: string | null;
    assets: { id: string; name: string; category: string; subtype: string }[];
  };
  proposedAssets: string[];
  isInitiator: boolean;
  onUpdate?: () => void;
}

export function InterestCard({
  interestId,
  briefId,
  roleLabel,
  status,
  message,
  actor,
  proposedAssets,
  isInitiator,
}: InterestCardProps) {
  const [isPending, startTransition] = useTransition();
  const [localStatus, setLocalStatus] = useState(status);
  const [error, setError] = useState<string | null>(null);

  const proposedActorAssets = actor.assets.filter((a) =>
    proposedAssets.includes(a.id)
  );

  const statusConfig: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Menunggu Review", color: "text-amber-800 bg-amber-50 border-amber-200 font-bold" },
    ACCEPTED: { label: "Diterima", color: "text-emerald-800 bg-emerald-50 border-emerald-200 font-bold" },
    DECLINED: { label: "Ditolak", color: "text-rose-800 bg-rose-50 border-rose-200 font-bold" },
    WITHDRAWN: { label: "Ditarik", color: "text-stone-700 bg-stone-100 border-stone-200 font-bold" },
  };

  const cfg = statusConfig[localStatus] || statusConfig.PENDING;

  function handleAccept() {
    setError(null);
    startTransition(async () => {
      const res = await acceptCollaboratorAction(interestId, briefId);
      if (res.success) {
        setLocalStatus("ACCEPTED");
      } else {
        setError(res.error || "Gagal menerima.");
      }
    });
  }

  function handleDecline() {
    setError(null);
    startTransition(async () => {
      const res = await declineCollaboratorAction(interestId, briefId);
      if (res.success) {
        setLocalStatus("DECLINED");
      } else {
        setError(res.error || "Gagal menolak.");
      }
    });
  }

  return (
    <div
      className={`p-5 rounded-2xl border space-y-4 transition-all ${
        localStatus === "ACCEPTED"
          ? "bg-emerald-50/40 border-emerald-200"
          : localStatus === "DECLINED"
          ? "bg-stone-50 border-stone-200 opacity-60"
          : "bg-white/95 border-stone-200/80 shadow-2xs"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center font-bold text-lg text-amber-800 shrink-0">
            {actor.name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-[#27213D] text-sm">{actor.name}</div>
            <div className="text-[11px] text-[#716B7E]">{actor.sector}</div>
            {actor.location && (
              <div className="text-[10px] text-[#716B7E] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                <span>{actor.location}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${cfg.color}`}
          >
            {cfg.label}
          </span>
          <span className="text-[10px] text-[#716B7E] font-medium">{roleLabel}</span>
        </div>
      </div>

      {actor.description && (
        <p className="text-xs text-[#716B7E] leading-relaxed line-clamp-2">
          {actor.description}
        </p>
      )}

      {message && (
        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#716B7E] mb-1">
            Pesan
          </div>
          <p className="text-xs text-[#27213D] leading-relaxed italic">
            &ldquo;{message}&rdquo;
          </p>
        </div>
      )}

      {proposedActorAssets.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#716B7E]">
            Aset yang Ditawarkan ({proposedActorAssets.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {proposedActorAssets.map((asset) => (
              <span
                key={asset.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] bg-white text-[#27213D] border border-stone-200 font-medium shadow-2xs"
              >
                <span className="text-[#E66A48] font-bold">
                  {CATEGORY_LABELS[asset.category] || asset.category}
                </span>
                <span>·</span>
                {asset.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="text-xs text-rose-800 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {isInitiator && localStatus === "PENDING" && (
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleAccept}
            disabled={isPending}
            className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
          >
            {isPending ? "..." : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Terima sebagai Kolaborator</span>
              </>
            )}
          </button>
          <button
            onClick={handleDecline}
            disabled={isPending}
            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 disabled:opacity-50 text-[#716B7E] font-bold text-xs border border-stone-200 transition-colors cursor-pointer"
          >
            Tolak
          </button>
        </div>
      )}
    </div>
  );
}
