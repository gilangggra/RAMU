"use client";

import { useState, useTransition } from "react";
import { expressInterestAction } from "@/app/projects/actions";
import { Clock, Send, Check, Circle, Sparkles } from "lucide-react";

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
  actorAssets: ActorAsset[];
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
  actorAssets,
}: RoleSlotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [localStatus, setLocalStatus] = useState(currentActorInterestStatus);
  const [error, setError] = useState<string | null>(null);

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
  const alreadyApplied = !isInitiator && !!localStatus;

  return (
    <div
      className={`p-5 rounded-2xl border transition-all space-y-4 ${
        isFilled
          ? "bg-emerald-50/40 border-emerald-200/80"
          : "bg-white/95 border-stone-200/80 hover:border-amber-400/60 shadow-2xs"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
              isFilled
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : "bg-stone-100 text-stone-600 border border-stone-200"
            }`}
          >
            {isFilled ? <Check className="w-5 h-5 text-emerald-600" /> : <Circle className="w-3.5 h-3.5 text-stone-400" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-[#1E1B2E] text-sm">{roleLabel}</h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                {CATEGORY_LABELS[assetCategory] || assetCategory}
              </span>
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

      <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
        <div className="text-stone-500 text-[11px]">
          Kebutuhan: 1 Kolaborator • Sinergi Berbasis Aset & Portofolio
        </div>

        <div>
          {canApply && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs shadow-[0_4px_16px_rgba(251,191,36,0.25)] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-stone-950" />
              <span>Ajukan Kolaborasi</span>
              <span className="text-[10px]">{isOpen ? "▲" : "▼"}</span>
            </button>
          )}

          {alreadyApplied && (
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Minat Anda Terkirim ({localStatus})</span>
            </span>
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
