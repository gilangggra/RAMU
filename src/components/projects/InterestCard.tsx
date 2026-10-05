"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { acceptCollaboratorAction, declineCollaboratorAction } from "@/app/projects/actions";
import { MapPin, AlertCircle, Check, ArrowUpRight, Handshake, ArrowRight, Sparkles } from "lucide-react";
import { ActorAvatar } from "@/components/ui/ActorAvatar";

const CATEGORY_LABELS: Record<string, string> = {
  PORTFOLIO_WORK: "Karya / Portofolio",
  EQUIPMENT: "Peralatan & Gear",
  STUDIO_SPACE: "Studio & Ruang",
  SKILL_TALENT: "Keahlian & Talenta",
  WARDROBE_PROP: "Wardrobe & Properti",
  AUDIENCE_REACH: "Jangkauan Audiens",
  PRODUCT: "Karya / Portofolio",
  MATERIAL: "Wardrobe & Properti",
  CAPABILITY: "Keahlian & Talenta",
  RESOURCE: "Peralatan & Gear",
  PRODUCTION: "Studio & Ruang",
  MARKET: "Akses Pasar",
  AUDIENCE: "Jangkauan Audiens",
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
    avatarUrl?: string | null;
    description?: string | null;
    assets: { id: string; name: string; category: string; subtype: string }[];
  };
  proposedAssets: string[];
  isInitiator: boolean;
  isInvited?: boolean;
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
  isInvited = false,
}: InterestCardProps) {
  const [isPending, startTransition] = useTransition();
  const [localStatus, setLocalStatus] = useState(status);
  const [createdCollabId, setCreatedCollabId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const proposedActorAssets = actor.assets.filter((a) =>
    proposedAssets.includes(a.id)
  );

  const statusConfig: Record<string, { label: string; color: string }> = isInvited
    ? {
        PENDING: { label: "Undangan Terkirim", color: "text-purple-800 bg-purple-50 border-purple-200 font-bold" },
        ACCEPTED: { label: "Undangan Diterima", color: "text-emerald-800 bg-emerald-50 border-emerald-200 font-bold" },
        DECLINED: { label: "Undangan Ditolak Kreator", color: "text-stone-700 bg-stone-100 border-stone-200 font-bold" },
        WITHDRAWN: { label: "Undangan Ditarik", color: "text-stone-700 bg-stone-100 border-stone-200 font-bold" },
      }
    : {
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
        if (res.collaborationId) {
          setCreatedCollabId(res.collaborationId);
        }
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
      className={`p-4 rounded-xl border space-y-3.5 transition-all ${
        localStatus === "ACCEPTED"
          ? "bg-emerald-50/40 border-emerald-200"
          : localStatus === "DECLINED"
          ? "bg-stone-50 border-stone-200 opacity-60"
          : isInvited && localStatus === "PENDING"
          ? "bg-white border-stone-300 shadow-2xs"
          : "bg-white border-stone-200/80 shadow-2xs"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <ActorAvatar name={actor.name} avatarUrl={actor.avatarUrl} className="w-9 h-9 rounded-lg" />
          <div>
            <div className="flex items-center gap-1.5">
              <Link
                href={`/directory/${actor.id}`}
                target="_blank"
                className="font-semibold text-stone-900 hover:text-stone-700 hover:underline text-xs sm:text-sm inline-flex items-center gap-1 group"
                title="Tinjau profil & portofolio"
              >
                <span>{actor.name}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors" />
              </Link>
            </div>
            <div className="text-[11px] text-stone-500 font-normal">{actor.sector}</div>
            {actor.location && (
              <div className="text-[10px] text-stone-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                <span>{actor.location}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-medium border ${cfg.color}`}
          >
            {cfg.label}
          </span>
          <span className="text-[10px] text-stone-500 font-medium">{roleLabel}</span>
        </div>
      </div>

      {actor.description && (
        <p className="text-xs text-stone-500 leading-relaxed line-clamp-2 font-normal">
          {actor.description}
        </p>
      )}

      {message && (
        <div className="p-3 rounded-lg bg-stone-50 border border-stone-200/70">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1">
            Pesan Lamaran
          </div>
          <p className="text-xs text-stone-800 leading-relaxed italic">
            &ldquo;{message}&rdquo;
          </p>
        </div>
      )}

      {proposedActorAssets.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
            Aset yang Ditawarkan ({proposedActorAssets.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {proposedActorAssets.map((asset) => (
              <span
                key={asset.id}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] bg-stone-50 text-stone-800 border border-stone-200 font-medium"
              >
                <span className="text-stone-500 font-semibold">
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
        isInvited ? (
          <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              <span className="text-[11px] text-stone-700 font-medium">
                Undangan telah dikirim ke kreator ini. Menunggu tanggapan dari mereka.
              </span>
            </div>
            <button
              onClick={handleDecline}
              disabled={isPending}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 disabled:opacity-50 text-stone-600 font-semibold text-[11px] border border-stone-200 transition-colors cursor-pointer shrink-0 shadow-2xs"
              title="Batalkan undangan ini"
            >
              {isPending ? "..." : "Batalkan Undangan"}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleAccept}
              disabled={isPending}
              className="flex-1 py-2 px-3 rounded-lg bg-stone-900 hover:bg-black disabled:opacity-50 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
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
              className="px-4 py-2 rounded-lg bg-white hover:bg-stone-50 hover:text-rose-700 hover:border-rose-200 disabled:opacity-50 text-stone-600 font-semibold text-xs border border-stone-200 transition-colors cursor-pointer shadow-2xs"
            >
              Tolak
            </button>
          </div>
        )
      )}

      {createdCollabId && (
        <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-lg flex items-center justify-between gap-3 text-xs animate-fade-in">
          <div className="flex items-center gap-2 text-emerald-800 font-semibold">
            <Handshake className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Seluruh peran terisi! Ruang kolaborasi telah aktif.</span>
          </div>
          <Link
            href={`/collaborations/${createdCollabId}`}
            className="px-3 py-1.5 bg-stone-900 hover:bg-black text-white rounded-lg font-semibold text-[11px] inline-flex items-center gap-1 shrink-0 shadow-2xs transition-colors"
          >
            <span>Buka Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
