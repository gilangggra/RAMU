"use client";

import { useState, useTransition } from "react";
import { expressInterestAction } from "@/app/projects/actions";
import { Clock, Send, Check, Circle } from "lucide-react";

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
  maxCollaborators,
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
  const [success, setSuccess] = useState(false);

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
        setSuccess(true);
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
          ? "bg-primary-950/20 border-primary-800/40 opacity-90"
          : "bg-neutral-900/80 border-neutral-800 hover:border-primary-700/60 shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
              isFilled
                ? "bg-primary-800/40 text-primary-300 border border-primary-600/40"
                : "bg-neutral-800 text-neutral-300 border border-neutral-700"
            }`}
          >
            {isFilled ? <Check className="w-5 h-5 text-primary-300" /> : <Circle className="w-3.5 h-3.5 text-neutral-400" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-neutral-100 text-sm">{roleLabel}</h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">
                {CATEGORY_LABELS[assetCategory] || assetCategory}
              </span>
            </div>
            {description && (
              <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isFilled ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-950 text-primary-300 border border-primary-700/50 flex items-center gap-1">
              <Check className="w-3 h-3 text-primary-300" />
              <span>Terisi</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              {interestCount > 0 ? `${interestCount} Peminat` : "Mencari"}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-xs">
        <div className="text-neutral-500 text-[11px]">
          Kebutuhan: 1 Kolaborator • Kontribusi Berbasis Aset
        </div>

        <div>
          {canApply && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Bergabung sebagai Kolaborator</span>
              <span>{isOpen ? "▲" : "▼"}</span>
            </button>
          )}

          {alreadyApplied && (
            <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Minat Anda Terkirim ({localStatus})</span>
            </span>
          )}

          {isInitiator && (
            <span className="text-[11px] font-semibold text-primary-400">
              Peran dari Proyek Anda
            </span>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="p-4 rounded-xl bg-neutral-950 border border-primary-900/60 space-y-4 animate-fade-in mt-3">
          <div>
            <h5 className="font-bold text-xs text-neutral-200">
              Tawarkan Aset & Kapabilitas Anda untuk Peran: {roleLabel}
            </h5>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Pilih aset atau keahlian dari profil Anda yang akan Anda kontribusikan pada proyek ini.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-neutral-300">Pilih Aset yang Ditawarkan:</p>
            {actorAssets.length === 0 ? (
              <p className="text-xs text-neutral-500 italic">
                Anda belum memiliki aset aktif. Anda tetap dapat mengirimkan pesan perkenalan di bawah.
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
                          ? "bg-primary-950/60 border-primary-500 text-neutral-100"
                          : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 rounded accent-emerald-600"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-neutral-200 truncate">{asset.name}</p>
                        <p className="text-[10px] text-neutral-500">{asset.subtype || asset.category}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-neutral-300">
              Catatan / Visi Kolaborasi (Opsional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ceritakan pengalaman relevan atau ide pendekatan Anda untuk proyek ini..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-primary-500 placeholder:text-neutral-600 resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-400 font-semibold">{error}</p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-900">
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 text-xs font-medium"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-bold text-xs shadow transition-all cursor-pointer"
            >
              <span>{isPending ? "Mengirim Minat..." : "Kirim Pernyataan Minat"}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
