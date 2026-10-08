"use client";

import { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { expressInterestAction } from "@/app/projects/actions";
import { Sparkles, Send, X, CheckCircle2 } from "lucide-react";

interface Role {
  id: string;
  roleLabel: string;
  assetCategory: string;
  isFilled: boolean;
  interests: { actorId: string; status: string }[];
}

interface ActorAsset {
  id: string;
  name: string;
  category: string;
  subtype: string;
}

interface ApplyModalProps {
  briefId: string;
  roles: Role[];
  actorAssets: ActorAsset[];
  actorId: string;
  matchRoleId?: string; 
}

const CATEGORY_LABELS: Record<string, string> = {
  PORTFOLIO_WORK: "Karya / Portofolio",
  EQUIPMENT: "Peralatan & Gear",
  STUDIO_SPACE: "Studio & Ruang",
  SKILL_TALENT: "Keahlian & Talenta",
  WARDROBE_PROP: "Wardrobe & Properti",
  AUDIENCE_REACH: "Jangkauan Audiens",
};

export function ApplyModal({ briefId, roles, actorAssets, actorId, matchRoleId }: ApplyModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string>(matchRoleId || "");
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const availableRoles = roles.filter(r => !r.isFilled);

  const appliedRoles = roles.filter(r => r.interests.some(i => i.actorId === actorId));
  const hasApplied = appliedRoles.length > 0;

  if (availableRoles.length === 0 && !hasApplied) {
    return (
      <button disabled className="w-full py-3.5 rounded-full bg-slate-100 text-slate-400 font-semibold text-sm cursor-not-allowed">
        Semua Peran Telah Terisi
      </button>
    );
  }

  if (hasApplied) {
    return (
      <div className="w-full p-4 rounded-[22px] bg-emerald-50/80 border border-emerald-200/80 text-center">
        <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
        <p className="text-sm font-bold text-emerald-800">Lamaran Anda Terkirim</p>
        <p className="text-xs text-emerald-600 mt-1">
          Menunggu review untuk peran: {appliedRoles.map(r => r.roleLabel).join(", ")}
        </p>
      </div>
    );
  }

  function toggleAsset(id: string) {
    setSelectedAssets((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  function handleSubmit() {
    if (!selectedRoleId) {
      setError("Pilih peran yang ingin Anda lamar terlebih dahulu.");
      return;
    }

    setError(null);
    const formData = new FormData();
    formData.set("briefId", briefId);
    formData.set("roleId", selectedRoleId);
    formData.set("message", message);
    formData.set("proposedAssets", JSON.stringify(selectedAssets));

    startTransition(async () => {
      const res = await expressInterestAction(formData);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
        }, 2000);
      } else {
        setError(res.error || "Gagal menyatakan minat.");
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-3.5 rounded-full bg-[#4CC9FE] hover:bg-[#38b6eb] text-white font-semibold text-sm transition-all shadow-md shadow-[#4CC9FE]/20 flex items-center justify-center gap-2 cursor-pointer"
      >
        <Sparkles className="w-4 h-4 text-white" />
        <span>Ajukan Kolaborasi</span>
      </button>

      {isOpen && mounted && typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="bg-white/95 backdrop-blur-xl rounded-[22px] border border-white/80 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative my-auto animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 sm:p-7 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Ajukan Kolaborasi</h2>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">Pilih peran dan aset yang akan Anda kontribusikan.</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer">
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="p-6 sm:p-7 overflow-y-auto custom-scrollbar space-y-6">
                {success ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Lamaran Berhasil Terkirim!</h3>
                      <p className="text-xs text-slate-500 mt-1">Inisiator proyek akan segera meninjau profil dan aset Anda.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">1. Pilih Peran</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {availableRoles.map(role => (
                          <div 
                            key={role.id}
                            onClick={() => setSelectedRoleId(role.id)}
                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                              selectedRoleId === role.id 
                                ? "border-[#4CC9FE] bg-[#4CC9FE]/10" 
                                : "border-slate-100 hover:border-slate-200 bg-white"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-bold text-slate-900 text-xs sm:text-sm">{role.roleLabel}</p>
                                <p className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">{CATEGORY_LABELS[role.assetCategory] || role.assetCategory}</p>
                              </div>
                              {matchRoleId === role.id && (
                                <Sparkles className="w-4 h-4 text-[#4CC9FE] shrink-0" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">2. Aset yang Dikontribusikan</h3>
                        <span className="text-[11px] text-slate-400">Pilih dari profil Anda</span>
                      </div>

                      {actorAssets.length === 0 ? (
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 italic">
                          Anda belum memiliki aset di profil Anda. Anda tetap bisa melamar dengan mengisi catatan pendekatan kreatif di bawah.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {actorAssets.map((asset) => {
                            const isChecked = selectedAssets.includes(asset.id);
                            return (
                              <div
                                key={asset.id}
                                onClick={() => toggleAsset(asset.id)}
                                className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                                  isChecked
                                    ? "bg-sky-50/80 border-[#4CC9FE] shadow-2xs"
                                    : "bg-white border-slate-200/80 hover:border-slate-300"
                                }`}
                              >
                                <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isChecked ? "border-[#4CC9FE] bg-[#4CC9FE]" : "border-slate-300"}`}>
                                  {isChecked && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                </div>
                                <div className="min-w-0">
                                  <p className={`font-semibold ${isChecked ? "text-slate-900" : "text-slate-700"}`}>{asset.name}</p>
                                  <p className={`text-[10px] mt-0.5 ${isChecked ? "text-[#0284c7]" : "text-slate-400"}`}>{asset.subtype || asset.category}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">3. Pendekatan Kreatif (Opsional)</h3>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ceritakan mengapa Anda cocok untuk peran ini dan pendekatan apa yang akan Anda berikan..."
                        rows={3}
                        className="w-full p-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 placeholder-slate-400 resize-none shadow-2xs"
                      />
                    </div>

                    {error && (
                      <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-600 text-xs font-semibold border border-rose-200">
                        {error}
                      </div>
                    )}
                  </>
                )}
              </div>

              {!success && (
                <div className="p-5 border-t border-slate-100 bg-white/80 backdrop-blur-sm flex justify-end items-center gap-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-5 py-2.5 rounded-full text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isPending || !selectedRoleId}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#4CC9FE] hover:bg-[#38b6eb] disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-md shadow-[#4CC9FE]/20 cursor-pointer"
                  >
                    <span>{isPending ? "Mengirim..." : "Kirim Lamaran"}</span>
                    {!isPending && <Send className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}

            </div>
          </div>,
          document.body
        )}
    </>
  );
}
