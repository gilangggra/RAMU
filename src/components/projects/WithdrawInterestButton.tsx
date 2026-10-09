"use client";

import React, { useTransition } from "react";
import { withdrawInterestAction } from "@/app/projects/actions";
import { Undo2, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/Toast";

interface WithdrawInterestButtonProps {
  interestId: string;
  briefId: string;
  briefTitle?: string;
  compact?: boolean;
}

export function WithdrawInterestButton({
  interestId,
  briefId,
  briefTitle,
  compact = false,
}: WithdrawInterestButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleWithdraw = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const titleText = briefTitle ? ` pada "${briefTitle}"` : "";
    if (!confirm(`Apakah Anda yakin ingin membatalkan/menarik pengajuan minat Anda${titleText}? Inisiator tidak akan lagi melihat lamaran ini.`)) {
      return;
    }

    startTransition(async () => {
      const res = await withdrawInterestAction(interestId, briefId);
      if (!res.success) {
        toast.error(res.error || "Gagal menarik lamaran.");
      } else {
        toast.success("Pengajuan minat berhasil ditarik.");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleWithdraw}
      disabled={isPending}
      title="Tarik / Batalkan pengajuan minat pada proyek ini"
      className={`inline-flex items-center gap-1.5 font-semibold transition-all cursor-pointer rounded-full disabled:opacity-50 ${
        compact
          ? "px-3 py-1 text-[11px] text-rose-700 hover:text-rose-800 bg-rose-50/80 hover:bg-rose-100 border border-rose-200"
          : "px-4 py-1.5 text-xs text-rose-700 hover:text-rose-800 bg-rose-50/80 hover:bg-rose-100 border border-rose-200 shadow-2xs"
      }`}
    >
      {isPending ? (
        <Loader2 className="w-3 h-3 animate-spin text-rose-600" />
      ) : (
        <Undo2 className="w-3 h-3 text-rose-600" />
      )}
      <span>{isPending ? "Menarik..." : "Tarik Lamaran"}</span>
    </button>
  );
}
