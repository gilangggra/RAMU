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
    PENDING: { label: "Menunggu Review", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    ACCEPTED: { label: "Diterima", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    DECLINED: { label: "Ditolak", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
    WITHDRAWN: { label: "Ditarik", color: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
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
          ? "bg-emerald-500/5 border-emerald-500/20"
          : localStatus === "DECLINED"
          ? "bg-slate-900/30 border-slate-800 opacity-60"
          : "bg-slate-900/60 border-slate-800"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-violet-500/20 flex items-center justify-center font-bold text-lg text-violet-400 shrink-0">
            {actor.name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-white text-sm">{actor.name}</div>
            <div className="text-[11px] text-slate-400">{actor.sector}</div>
            {actor.location && (
              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                <span>{actor.location}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.color}`}
          >
            {cfg.label}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">{roleLabel}</span>
        </div>
      </div>

      {actor.description && (
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
          {actor.description}
        </p>
      )}

      {message && (
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Pesan
          </div>
          <p className="text-xs text-slate-300 leading-relaxed italic">
            &ldquo;{message}&rdquo;
          </p>
        </div>
      )}

      {proposedActorAssets.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Aset yang Ditawarkan ({proposedActorAssets.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {proposedActorAssets.map((asset) => (
              <span
                key={asset.id}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] bg-slate-800 text-slate-300 border border-slate-700"
              >
                <span className="text-amber-400 font-bold">
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
        <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isInitiator && localStatus === "PENDING" && (
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleAccept}
            disabled={isPending}
            className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
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
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 disabled:opacity-50 text-slate-400 font-bold text-xs border border-slate-700 transition-colors cursor-pointer"
          >
            Tolak
          </button>
        </div>
      )}
    </div>
  );
}
