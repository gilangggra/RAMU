"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { expressInterestAction, withdrawInterestAction } from "@/app/projects/actions";
import { Clock, Send, Check, Circle, Sparkles, Undo2, Loader2, CircleDollarSign } from "lucide-react";
import { InvitationResponseButtons } from "@/components/projects/InvitationResponseButtons";
import { toast } from "@/components/ui/Toast";

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

interface ActorAsset {
  id: string;
  name: string;
  category: string;
  subtype: string;
}

interface RoleSlotProps {
  briefId: string;
  roleId: string;
  roleLabel: string;
  assetCategory: string;
  description?: string | null;
  fee?: string | null;
  maxCollaborators: number;
  isFilled: boolean;
  interestCount: number;
  isInitiator: boolean;
  currentActorInterestStatus?: string | null;
  userInterestId?: string | null;
  isInvited?: boolean;
  actorAssets: ActorAsset[];
  initialOpen?: boolean;
  isMatched?: boolean;
  isGuest?: boolean;
  isAdmin?: boolean;
}

export function RoleSlot({
  briefId,
  roleId,
  roleLabel,
  assetCategory,
  description,
  fee,
  maxCollaborators: _maxCollaborators,
  isFilled,
  interestCount,
  isInitiator,
  currentActorInterestStatus,
  userInterestId,
  isInvited = false,
  actorAssets,
  initialOpen = false,
  isMatched = false,
  isGuest = false,
  isAdmin = false,
}: RoleSlotProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [message, setMessage] = useState("");
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isWithdrawing, startWithdrawTransition] = useTransition();
  const [localStatus, setLocalStatus] = useState(currentActorInterestStatus);
  const [activeInterestId, setActiveInterestId] = useState(userInterestId);
  const [error, setError] = useState<string | null>(null);

  function handleWithdraw() {
    if (!activeInterestId) return;
    if (!confirm(`Batalkan pengajuan minat Anda untuk peran "${roleLabel}"? Inisiator proyek tidak akan lagi melihat lamaran ini.`)) return;

    startWithdrawTransition(async () => {
      const res = await withdrawInterestAction(activeInterestId, briefId);
      if (res.success) {
        setLocalStatus(null);
        setActiveInterestId(null);
        setIsOpen(false);
        toast.success("Lamaran berhasil ditarik.");
      } else {
        toast.error(res.error || "Gagal menarik lamaran.");
      }
    });
  }

  function toggleAsset(id: string) {
    setSelectedAssets((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  function handleSubmit() {
    setError(null);
    const formData = new FormData();
    formData.set("briefId", briefId);
    formData.set("roleId", roleId);
    formData.set("message", message);
    formData.set("proposedAssets", JSON.stringify(selectedAssets));

    startTransition(async () => {
      const res = await expressInterestAction(formData);
      if (res.success) {
        setLocalStatus("PENDING");
        setIsOpen(false);
      } else {
        setError(res.error || "Gagal menyatakan minat.");
      }
    });
  }

  const canApply = !isAdmin && !isInitiator && !isFilled && !localStatus;
  const alreadyApplied = !isInitiator && !!localStatus && !isInvited;
  const isInvitedUser = !isInitiator && isInvited;

  return (
    <div
      id={`role-${roleId}`}
      className={`glass-card p-5 rounded-[22px] border transition-all duration-300 space-y-4 scroll-mt-28 ${
        isFilled
          ? "bg-emerald-50/40 border-emerald-200/80"
          : isInvitedUser && localStatus === "PENDING"
          ? "bg-gradient-to-r from-purple-50/50 via-white/80 to-white/90 border-purple-300 ring-2 ring-purple-400/20 shadow-md"
          : isMatched
          ? "bg-gradient-to-r from-[#4CC9FE]/15 via-white/80 to-white/90 border-[#4CC9FE]/50 shadow-md ring-2 ring-[#4CC9FE]/20"
          : "border-white/80 hover:border-[#4CC9FE]/40"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${
              isFilled
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : isInvitedUser && localStatus === "PENDING"
                ? "bg-purple-100 text-purple-800 border border-purple-300"
                : isMatched
                ? "bg-[#4CC9FE]/20 text-[#0284c7] border border-[#4CC9FE]/40"
                : "bg-white/80 text-slate-600 border border-white/80 shadow-2xs"
            }`}
          >
            {isFilled ? (
              <Check className="w-5 h-5 text-emerald-600" />
            ) : isInvitedUser && localStatus === "PENDING" ? (
              <Sparkles className="w-4 h-4 text-purple-600" />
            ) : isMatched ? (
              <Sparkles className="w-4 h-4 text-[#0284c7]" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-slate-400" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-slate-900 text-sm">{roleLabel}</h4>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/80 text-slate-600 border border-white/80 shadow-2xs">
                {CATEGORY_LABELS[assetCategory] || assetCategory}
              </span>
              {fee && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
                  <CircleDollarSign className="w-3 h-3 text-emerald-600" />
                  <span>Estimasi Fee: {fee} / Peran</span>
                </span>
              )}
              {isInvitedUser && localStatus === "PENDING" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300 animate-pulse">
                  <Sparkles className="w-2.5 h-2.5 text-purple-600" />
                  <span>Undangan Khusus untuk Anda</span>
                </span>
              )}
              {isMatched && !isInvitedUser && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#4CC9FE]/15 text-[#0284c7] border border-[#4CC9FE]/30">
                  <Sparkles className="w-2.5 h-2.5 text-[#0284c7]" />
                  <span>Sangat Cocok Untuk Anda</span>
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-slate-600 mt-1 leading-relaxed font-normal">
                {description}
              </p>
            )}
            {fee && (
              <p className="text-[10px] text-emerald-700/90 font-medium mt-1">
                Alokasi SPK: Termin I DP 50% di awal &bull; Termin II Pelunasan 50% setelah selesai.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isFilled ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Terisi</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/80 text-slate-700 border border-white/80 shadow-2xs">
              {interestCount > 0 ? `${interestCount} Peminat` : "Mencari Kru"}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
        <div className="text-slate-500 text-[11px] font-normal">
          Kebutuhan: 1 Kolaborator • Sinergi Berbasis Aset & Portofolio
        </div>

        <div>
          {isInvitedUser && localStatus === "PENDING" && activeInterestId && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 p-2.5 rounded-full bg-purple-50/80 border border-purple-200">
              <div className="flex items-center gap-1.5 pl-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="text-[11px] font-bold text-purple-900">
                  Inisiator mengundang Anda!
                </span>
              </div>
              <InvitationResponseButtons
                interestId={activeInterestId}
                briefId={briefId}
                roleLabel={roleLabel}
                compact
                onRespond={(newStatus) => setLocalStatus(newStatus)}
              />
            </div>
          )}

          {isInvitedUser && localStatus === "ACCEPTED" && (
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Undangan Diterima • Anda adalah Kolaborator Resmi</span>
            </span>
          )}

          {isInvitedUser && localStatus === "DECLINED" && (
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
              Undangan Telah Ditolak
            </span>
          )}

          {isGuest && !isFilled && !isAdmin && (
            <Link
              href={`/login?redirectTo=/projects/${briefId}`}
              className="btn-primary-pill inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Masuk untuk Ajukan Kolaborasi</span>
            </Link>
          )}

          {!isGuest && canApply && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="btn-primary-pill inline-flex items-center gap-1.5 px-4.5 py-2 text-xs font-semibold cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>{isOpen ? "Tutup Form Lamar" : "Lamar / Ajukan Kolaborasi"}</span>
              <span className="text-[10px]">{isOpen ? "▲" : "▼"}</span>
            </button>
          )}

          {isAdmin && !isFilled && (
            <span className="text-[11px] font-semibold text-slate-500 bg-white/80 px-3 py-1 rounded-full border border-slate-200/80 shadow-2xs">
              Slot Terbuka ({interestCount} Peminat)
            </span>
          )}

          {alreadyApplied && (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Minat Terkirim ({localStatus === "PENDING" ? "Menunggu Review" : localStatus})</span>
              </span>
              {localStatus === "PENDING" && activeInterestId && (
                <button
                  type="button"
                  onClick={handleWithdraw}
                  disabled={isWithdrawing}
                  className="px-3 py-1.5 rounded-full text-[11px] font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1 shadow-2xs"
                >
                  {isWithdrawing ? (
                    <Loader2 className="w-3 h-3 animate-spin text-rose-600" />
                  ) : (
                    <Undo2 className="w-3 h-3 text-rose-600" />
                  )}
                  <span>{isWithdrawing ? "Menarik..." : "Tarik Lamaran"}</span>
                </button>
              )}
            </div>
          )}

          {isInitiator && (
            <span className="text-[11px] font-semibold text-slate-600 bg-white/80 px-3 py-1 rounded-full border border-white/80 shadow-2xs">
              Peran Proyek Anda
            </span>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 space-y-4 mt-3 shadow-xs animate-in fade-in duration-200">
          <div>
            <h5 className="font-bold text-xs text-slate-900">
              Tawarkan Aset & Kapabilitas Anda untuk Peran: {roleLabel}
            </h5>
            <p className="text-[11px] text-slate-500 mt-0.5 font-normal">
              Pilih aset atau keahlian dari portofolio Anda yang akan dikontribusikan pada proyek bersama ini.
            </p>
          </div>

          {fee && (
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-900 flex items-start gap-2.5">
              <CircleDollarSign className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Estimasi Kompensasi: {fee}</span>
                <p className="text-[11px] text-emerald-800 font-normal mt-0.5 leading-relaxed">
                  Jika lamaran diterima, nominal ini otomatis dicantumkan pada draf SPK digital resmi RAMU dengan alokasi DP 50% di muka dan pelunasan 50% pasca-produksi.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-800">Pilih Aset yang Ditawarkan:</p>
            {actorAssets.length === 0 ? (
              <p className="text-xs text-slate-500 italic font-normal">
                Anda belum memiliki aset aktif di profil Anda. Anda tetap dapat mengirimkan pesan perkenalan & visi kolaborasi di bawah.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {actorAssets.map((asset) => {
                  const isChecked = selectedAssets.includes(asset.id);
                  return (
                    <div
                      key={asset.id}
                      onClick={() => toggleAsset(asset.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                        isChecked
                          ? "bg-[#4CC9FE]/15 border-[#4CC9FE]/50 text-slate-900 shadow-2xs font-semibold"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 font-normal"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 rounded accent-[#4CC9FE]"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 break-words">{asset.name}</p>
                        <p className="text-[10px] text-slate-500">{asset.subtype || asset.category}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-700">
              Catatan & Pendekatan Kreatif (Opsional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ceritakan gaya visual, portfolio relevan, atau konsep pendekatan Anda untuk proyek ini..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 placeholder-slate-400 resize-none font-normal shadow-2xs"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-600 font-bold">{error}</p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded-full text-slate-600 hover:text-slate-900 text-xs font-semibold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="btn-primary-pill inline-flex items-center gap-1.5 px-4.5 py-2 text-xs font-semibold cursor-pointer shadow-xs"
            >
              <span>{isPending ? "Mengirim Minat..." : "Kirim Pernyataan Minat"}</span>
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
