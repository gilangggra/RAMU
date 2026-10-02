"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Check, X, Sparkles, Loader2, ExternalLink } from "lucide-react";
import { confirmCoCredit, rejectCoCredit } from "@/app/api/assets/actions";
import Link from "next/link";

export interface PendingCoCredit {
  assetId: string;
  assetName: string;
  assetImage: string;
  uploaderId: string;
  uploaderName: string;
  uploaderSector: string;
  roleTagged: string;
  taggedAt?: string;
  details?: string;
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
      const res = await confirmCoCredit(req.assetId, req.uploaderId);
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
      const res = await rejectCoCredit(req.assetId, req.uploaderId);
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
    <section className="p-6 md:p-7 rounded-[28px] bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-white border-2 border-amber-300/80 shadow-md space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-[#1E1B2E] tracking-tight">
                Permintaan Konfirmasi Co-Credit Portofolio
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono text-[10px] font-black border border-amber-300">
                {activeList.length} Menunggu
              </span>
            </div>
            <p className="text-xs text-stone-600">
              Kreator lain menyematkan Anda sebagai bagian dari tim produksi. Konfirmasi untuk mengaktifkan sertifikat anti-catfishing dan menampilkan karya ini di profil Anda.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeList.map((req) => {
          const isCurrentFeedback = feedback?.id === req.assetId;

          if (isCurrentFeedback) {
            return (
              <div
                key={req.assetId}
                className={`p-5 rounded-2xl border flex items-center gap-3 animate-fade-in ${
                  feedback.type === "success"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                    : "bg-rose-50 border-rose-300 text-rose-950"
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white ${
                  feedback.type === "success" ? "bg-emerald-600" : "bg-rose-600"
                }`}>
                  {feedback.type === "success" ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                </div>
                <p className="text-xs font-bold leading-relaxed">{feedback.msg}</p>
              </div>
            );
          }

          return (
            <div
              key={req.assetId}
              className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <img
                  src={req.assetImage}
                  alt={req.assetName}
                  className="w-20 h-20 rounded-xl object-cover border border-stone-200 shrink-0"
                />
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-mono font-bold">
                      {req.roleTagged}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      &bull; Disematkan oleh
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-stone-900 truncate">
                    {req.assetName}
                  </h4>
                  <p className="text-xs text-stone-600 truncate">
                    Oleh: <strong>{req.uploaderName}</strong> ({req.uploaderSector})
                  </p>
                  {req.details && (
                    <p className="text-[11px] text-stone-500 italic truncate">
                      &ldquo;{req.details}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleConfirm(req)}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-2xs hover:scale-[1.01] active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Konfirmasi Keterlibatan</span>
                </button>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleReject(req)}
                  className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-rose-50 hover:text-rose-700 border border-stone-200 text-stone-600 font-semibold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Tolak penyematan jika Anda tidak terlibat"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Bukan Saya</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
