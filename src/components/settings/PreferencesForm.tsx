"use client";

import React, { useState } from "react";
import { updatePreferences } from "@/app/settings/actions";
import { Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface PreferencesData {
  experienceLevel: string | null;
  aestheticStyles: string[];
  compensationModels: string[];
}

const COMMON_COMP_MODELS = ["PAID", "REVENUE_SHARE"];
const COMMON_EXPERIENCE = ["Pemula (0-2 Tahun)", "Menengah (3-5 Tahun)", "Profesional (5+ Tahun)", "Expert"];

export function PreferencesForm({ initialData }: { initialData: PreferencesData }) {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await updatePreferences(formData);

    if (result.success) {
      setMessage({ type: "success", text: result.message || "Berhasil disimpan." });
    } else {
      setMessage({ type: "error", text: result.error || "Gagal menyimpan." });
    }
    
    setIsPending(false);
  }

  return (
    <div className="bg-white rounded-[28px] border border-stone-200/80 shadow-xs overflow-hidden max-w-2xl">
      <div className="p-6 sm:p-8 border-b border-stone-100 bg-[#FAF8F5]">
        <h2 className="text-xl font-black text-[#27213D] tracking-tight">Preferensi Kolaborasi</h2>
        <p className="text-xs sm:text-sm text-[#716B7E] mt-1">
          Atur gaya visual dan model kompensasi untuk memudahkan Smart Engine merekomendasikan partner yang cocok.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {message && (
          <div className={`p-4 rounded-2xl flex items-start gap-3 text-xs font-semibold ${
            message.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}>
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            )}
            <p>{message.text}</p>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#27213D] uppercase tracking-wider">
            Tingkat Pengalaman
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              name="experienceLevel"
              defaultValue={initialData.experienceLevel || ""}
              className="w-full px-4 py-2.5 rounded-xl bg-stone-50/70 border border-stone-200 focus:bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all text-xs sm:text-sm font-medium text-[#27213D] focus:outline-hidden"
            >
              <option value="">Pilih tingkat pengalaman...</option>
              {COMMON_EXPERIENCE.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="aestheticStyles" className="block text-xs font-bold text-[#27213D] uppercase tracking-wider">
            Gaya Visual (Aesthetic Styles)
          </label>
          <p className="text-xs text-[#716B7E] mb-2">Pisahkan dengan koma (contoh: Editorial, Minimalist, Streetwear)</p>
          <input
            type="text"
            id="aestheticStyles"
            name="aestheticStyles"
            defaultValue={initialData.aestheticStyles.join(", ")}
            className="w-full px-4 py-2.5 rounded-xl bg-stone-50/70 border border-stone-200 focus:bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all text-xs sm:text-sm font-medium text-[#27213D] focus:outline-hidden placeholder:text-[#716B7E]/50"
            placeholder="Editorial, Minimalist, Vintage..."
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="compensationModels" className="block text-xs font-bold text-[#27213D] uppercase tracking-wider">
            Model Kompensasi (Collaboration Models)
          </label>
          <p className="text-xs text-[#716B7E] mb-2">Pisahkan dengan koma (contoh: PAID, REVENUE_SHARE)</p>
          <input
            type="text"
            id="compensationModels"
            name="compensationModels"
            defaultValue={initialData.compensationModels.join(", ")}
            className="w-full px-4 py-2.5 rounded-xl bg-stone-50/70 border border-stone-200 focus:bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all text-xs sm:text-sm font-medium text-[#27213D] uppercase focus:outline-hidden placeholder:text-[#716B7E]/50"
            placeholder="PAID, REVENUE_SHARE"
          />
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {COMMON_COMP_MODELS.map(model => (
              <span key={model} className="px-3 py-1 rounded-full bg-sky-50 text-[#0284c7] text-xs font-bold border border-sky-200/60">
                {model === "PAID" ? "PAID (Fee Komersial)" : "REVENUE_SHARE (Bagi Hasil)"}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-stone-100 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-8 py-3 rounded-full bg-[#4CC9FE] text-white font-bold text-xs sm:text-sm hover:bg-[#38bbf5] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#4CC9FE]/25 cursor-pointer"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isPending ? "Menyimpan..." : "Simpan Preferensi"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
