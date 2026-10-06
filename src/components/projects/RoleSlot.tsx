"use client";

import { useState, useTransition } from "react";
import { expressInterestAction, withdrawInterestAction } from "@/app/projects/actions";
import { Clock, Send, Check, Circle, Sparkles, Undo2, Loader2 } from "lucide-react";
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
}

export function RoleSlot({
  briefId,
  roleId,
  roleLabel,
  assetCategory,
  description,
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

  const canApply = !isInitiator && !isFilled && !localStatus;
  const alreadyApplied = !isInitiator && !!localStatus && !isInvited;
  const isInvitedUser = !isInitiator && isInvited;

  return (
    <div
      id={`role-${roleId}`}
      className={`p-5 rounded-2xl border transition-all space-y-4 scroll-mt-28 ${
        isFilled
          ? "bg-emerald-50/40 border-emerald-200/80"
          : isInvitedUser && localStatus === "PENDING"
          ? "bg-gradient-to-r from-purple-50/40 via-white to-white border-purple-300 ring-2 ring-purple-400/20 shadow-md"
          : isMatched
          ? "bg-gradient-to-r from-emerald-50/30 via-white to-white border-emerald-400 shadow-md ring-2 ring-emerald-400/20"
          : "bg-white/95 border-stone-200/80 hover:border-amber-400/60 shadow-2xs"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
              isFilled
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : isInvitedUser && localStatus === "PENDING"
                ? "bg-purple-100 text-purple-800 border border-purple-300"
                : isMatched
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : "bg-stone-100 text-stone-600 border border-stone-200"
            }`}
          >
            {isFilled ? (
              <Check className="w-5 h-5 text-emerald-600" />
            ) : isInvitedUser && localStatus === "PENDING" ? (
              <Sparkles className="w-4 h-4 text-purple-600" />
            ) : isMatched ? (
              <Sparkles className="w-4 h-4 text-emerald-600" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-stone-400" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-[#1E1B2E] text-sm">{roleLabel}</h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                {CATEGORY_LABELS[assetCategory] || assetCategory}
              </span>
              {isInvitedUser && localStatus === "PENDING" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300 animate-pulse">
                  <Sparkles className="w-2.5 h-2.5 text-purple-600" />
                  <span>Undangan Khusus untuk Anda</span>
                </span>
              )}
              {isMatched && !isInvitedUser && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                  <span>Sangat Cocok Untuk Anda</span>
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                {description}
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
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              {interestCount > 0 ? `${interestCount} Peminat` : "Mencari"}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs">
        <div className="text-stone-500 text-[11px]">
          Kebutuhan: 1 Kolaborator • Sinergi Berbasis Aset & Portofolio
        </div>

        <div>
          {isInvitedUser && localStatus === "PENDING" && activeInterestId && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 p-2.5 rounded-xl bg-purple-50/80 border border-purple-200">
              <div className="flex items-center gap-1.5">
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
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Undangan Diterima • Anda adalah Kolaborator Resmi</span>
            </span>
          )}

          {isInvitedUser && localStatus === "DECLINED" && (
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-100 text-stone-600 border border-stone-200">
              Undangan Telah Ditolak
            </span>
          )}

          {canApply && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>{isOpen ? "Tutup Form Lamar" : "Lamar / Ajukan Kolaborasi"}</span>
              <span className="text-[10px]">{isOpen ? "▲" : "▼"}</span>
            </button>
          )}

          {alreadyApplied && (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Minat Terkirim ({localStatus === "PENDING" ? "Menunggu Review" : localStatus})</span>
              </span>
              {localStatus === "PENDING" && activeInterestId && (
                <button
                  type="button"
                  onClick={handleWithdraw}
                  disabled={isWithdrawing}
                  className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
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
            <span className="text-[11px] font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200">
              Peran Proyek Anda
            </span>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-4 mt-3 animate-in fade-in duration-200">
          <div>
            <h5 className="font-bold text-xs text-[#1E1B2E]">
              Tawarkan Aset & Kapabilitas Anda untuk Peran: {roleLabel}
            </h5>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Pilih aset atau keahlian dari portofolio Anda yang akan dikontribusikan pada proyek bersama ini.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-bold text-[#1E1B2E]">Pilih Aset yang Ditawarkan:</p>
            {actorAssets.length === 0 ? (
              <p className="text-xs text-stone-500 italic">
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
                          ? "bg-amber-50/80 border-amber-400 text-[#1E1B2E] shadow-2xs"
                          : "bg-white border-stone-200 text-stone-600 hover:border-stone-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 rounded accent-amber-500"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-[#1E1B2E] truncate">{asset.name}</p>
                        <p className="text-[10px] text-stone-500">{asset.subtype || asset.category}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#1E1B2E]">
              Catatan & Pendekatan Kreatif (Opsional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ceritakan gaya visual, portfolio relevan, atau konsep pendekatan Anda untuk proyek ini..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200/80 text-xs text-[#1E1B2E] focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 placeholder-stone-400 resize-none font-medium"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-600 font-bold">{error}</p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200/60">
            <button
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-1.5 rounded-lg text-stone-500 hover:text-stone-900 text-xs font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-stone-950 font-extrabold text-xs shadow-[0_4px_16px_rgba(251,191,36,0.25)] transition-all cursor-pointer"
            >
              <span>{isPending ? "Mengirim Minat..." : "Kirim Pernyataan Minat"}</span>
              <Send className="w-3.5 h-3.5 text-stone-950" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
