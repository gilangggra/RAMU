"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { respondToInvitationAction } from "@/app/projects/actions";
import { Check, X, Loader2, Sparkles, Handshake, ArrowRight } from "lucide-react";

interface InvitationResponseButtonsProps {
  interestId: string;
  briefId: string;
  roleLabel?: string;
  initiatorName?: string;
  compact?: boolean;
  onRespond?: (status: "ACCEPTED" | "DECLINED") => void;
}

export function InvitationResponseButtons({
  interestId,
  briefId,
  roleLabel,
  initiatorName,
  compact = false,
  onRespond,
}: InvitationResponseButtonsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [resultStatus, setResultStatus] = useState<"ACCEPTED" | "DECLINED" | null>(null);
  const [collabId, setCollabId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRespond = (response: "ACCEPT" | "DECLINE") => {
    if (response === "DECLINE") {
      const confirmText = initiatorName
        ? `Apakah Anda yakin ingin menolak undangan kolaborasi dari ${initiatorName}?`
        : "Apakah Anda yakin ingin menolak undangan kolaborasi ini?";
      if (!confirm(confirmText)) return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      const res = await respondToInvitationAction(interestId, response);
      if (res.success) {
        setResultStatus(res.status as "ACCEPTED" | "DECLINED");
        if (res.collaborationId) {
          setCollabId(res.collaborationId);
        }
        if (onRespond) {
          onRespond(res.status as "ACCEPTED" | "DECLINED");
        }
        router.refresh();
      } else {
        setErrorMessage(res.error || "Gagal menanggapi undangan.");
      }
    });
  };

  if (resultStatus === "ACCEPTED") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-fade-in">
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>Undangan Diterima!</span>
        </span>
        {collabId && (
          <Link
            href={`/collaborations/${collabId}`}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#4CC9FE] hover:bg-[#38b6eb] text-white text-xs font-semibold transition-all shadow-md shadow-[#4CC9FE]/20"
          >
            <Handshake className="w-3.5 h-3.5 text-white" />
            <span>Buka Workspace</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    );
  }

  if (resultStatus === "DECLINED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold animate-fade-in">
        <X className="w-3.5 h-3.5 text-slate-500" />
        <span>Undangan Ditolak</span>
      </span>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
      {errorMessage && (
        <span className="text-[11px] text-rose-600 font-medium">{errorMessage}</span>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleRespond("ACCEPT")}
          disabled={isPending}
          title="Terima undangan kolaborasi ini"
          className={`inline-flex items-center gap-1.5 rounded-full font-semibold transition-all cursor-pointer disabled:opacity-50 ${
            compact
              ? "px-3.5 py-1 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
              : "px-4 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:scale-102"
          }`}
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
          ) : (
            <Check className="w-3.5 h-3.5 text-white" />
          )}
          <span>Terima Undangan</span>
        </button>

        <button
          type="button"
          onClick={() => handleRespond("DECLINE")}
          disabled={isPending}
          title="Tolak undangan kolaborasi ini"
          className={`inline-flex items-center gap-1 rounded-full font-semibold transition-all cursor-pointer disabled:opacity-50 ${
            compact
              ? "px-3 py-1 text-[11px] bg-white/80 hover:bg-rose-50 hover:text-rose-700 text-slate-600 border border-slate-200/80"
              : "px-3.5 py-2 text-xs bg-white/80 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-slate-600 border border-slate-200/80 shadow-2xs"
          }`}
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
          ) : (
            <X className="w-3.5 h-3.5" />
          )}
          <span>Tolak</span>
        </button>
      </div>
    </div>
  );
}
