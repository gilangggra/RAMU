"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Check, X, Loader2, ExternalLink } from "lucide-react";
import { confirmCoCredit, rejectCoCredit } from "@/app/api/assets/actions";
import Link from "next/link";
import { ActorAvatar } from "@/components/ui/ActorAvatar";

export interface PendingCoCredit {
  assetId: string;
  assetName: string;
  assetImage: string;
  uploaderId: string;
  uploaderName: string;
  uploaderAvatarUrl?: string | null;
  uploaderSector: string;
  roleTagged: string;
  taggedAt?: string;
  details?: string;
  isOwnerApproval?: boolean;
}

interface CoCreditRequestsCardProps {
  requests: PendingCoCredit[];
}

export function CoCreditRequestsCard({ requests }: CoCreditRequestsCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeList, setActiveList] = useState(requests);
  const [feedback, setFeedback] = useState<{ id: string; type: "success" | "rejected"; msg: string } | null>(null);

  if (activeList.length === 0) return null;

  const handleConfirm = (req: PendingCoCredit) => {
    startTransition(async () => {
      const targetId = req.isOwnerApproval ? req.uploaderId : undefined;
      const res = await confirmCoCredit(req.assetId, targetId);
      if (res.success) {
        setFeedback({
          id: req.assetId,
          type: "success",
          msg: `Keterlibatan pada "${req.assetName}" berhasil diverifikasi! Karya ini sekarang resmi tersinkronisasi di profil portofolio.`
        });
        setTimeout(() => {
          setActiveList(prev => prev.filter(r => r.assetId !== req.assetId));
          setFeedback(null);
          router.refresh();
        }, 3000);
      }
    });
  };

  const handleReject = (req: PendingCoCredit) => {
    if (!confirm(`Apakah Anda yakin ingin menolak penyematan/klaim co-credit pada "${req.assetName}"? Tag kredit akan dibatalkan.`)) return;

    startTransition(async () => {
      const targetId = req.isOwnerApproval ? req.uploaderId : undefined;
      const res = await rejectCoCredit(req.assetId, targetId);
      if (res.success) {
        setFeedback({
          id: req.assetId,
          type: "rejected",
          msg: `Penyematan pada "${req.assetName}" telah ditolak dan dilaporkan.`
        });
        setTimeout(() => {
          setActiveList(prev => prev.filter(r => r.assetId !== req.assetId));
          setFeedback(null);
          router.refresh();
        }, 2500);
      }
    });
  };

  return (
    <section className="p-5 md:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#4CC9FE]/15 text-[#0284c7] border border-[#4CC9FE]/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#0284c7]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                Konfirmasi Keterlibatan Portofolio (Co-Credit)
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200/70">
                {activeList.length} Menunggu
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal">
              Kreator lain menandai Anda sebagai bagian tim produksi proyek ini. Konfirmasi untuk menyinkronkan karya ke profil Anda.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {activeList.map((req) => {
          const isCurrentFeedback = feedback?.id === req.assetId;

          if (isCurrentFeedback) {
            return (
              <div
                key={req.assetId}
                className={`p-4 rounded-2xl border flex items-center gap-3 ${
                  feedback.type === "success"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                    : "bg-rose-50 border-rose-300 text-rose-950"
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white ${
                  feedback.type === "success" ? "bg-emerald-600" : "bg-rose-600"
                }`}>
                  {feedback.type === "success" ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                </div>
                <p className="text-xs font-semibold leading-relaxed">{feedback.msg}</p>
              </div>
            );
          }

          return (
            <div
              key={req.assetId}
              className="p-4 rounded-2xl bg-white hover:bg-slate-50/50 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between gap-3 shadow-2xs"
            >
              <div className="flex items-start gap-3">
                <img
                  src={req.assetImage}
                  alt={req.assetName}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200">
                      {req.roleTagged}
                    </span>
                    <span className="text-xs text-slate-400">
                      {req.isOwnerApproval ? "• Mengajukan klaim" : "• Disematkan oleh"}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 truncate">
                    {req.assetName}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 truncate">
                    <ActorAvatar
                      name={req.uploaderName}
                      avatarUrl={req.uploaderAvatarUrl}
                      className="w-4 h-4 rounded-full"
                      textClassName="text-[8px]"
                    />
                    <span className="truncate text-xs font-medium">
                      {req.uploaderName} ({req.uploaderSector})
                    </span>
                  </div>
                  {req.details && (
                    <p className="text-xs text-slate-500 italic truncate font-normal">
                      &ldquo;{req.details}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleConfirm(req)}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-[#4CC9FE] hover:bg-[#38bbf5] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5 text-white" />
                  )}
                  <span>{req.isOwnerApproval ? "Setujui Kredit" : "Konfirmasi"}</span>
                </button>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleReject(req)}
                  className="py-1.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                  title={req.isOwnerApproval ? "Tolak pengajuan klaim ini" : "Tolak jika bukan Anda"}
                >
                  <X className="w-3.5 h-3.5 text-slate-400" />
                  <span>{req.isOwnerApproval ? "Tolak Klaim" : "Bukan Saya"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
