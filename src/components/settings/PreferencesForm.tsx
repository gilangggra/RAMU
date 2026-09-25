"use client";

import React, { useState } from "react";
import { updatePreferences } from "@/app/settings/actions";
import { Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface PreferencesData {
  experienceLevel: string | null;
  aestheticStyles: string[];
  compensationModels: string[];
}

const COMMON_COMP_MODELS = ["Paid", "TFP", "Bagi Hasil", "Volunteer"];
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
    <div className="bg-white rounded-3xl border border-stone-200 shadow-[0_8px_30px_rgba(39,33,61,0.04)] overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-stone-100 bg-stone-50/50">
        <h2 className="text-xl font-extrabold text-[#1E1B2E]">Preferensi Kolaborasi</h2>
        <p className="text-sm text-stone-500 mt-1">
          Atur gaya visual dan model kompensasi untuk memudahkan Smart Engine merekomendasikan partner yang cocok.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
        {message && (
          <div className={`p-4 rounded-2xl flex items-start gap-3 text-sm font-semibold ${
            message.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}>
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            )}
            <p className="mt-0.5">{message.text}</p>
          </div>
        )}

        <div className="space-y-4">
          <label className="block text-xs font-bold text-[#1E1B2E] uppercase tracking-wider">
            Tingkat Pengalaman
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              name="experienceLevel"
              defaultValue={initialData.experienceLevel || ""}
              className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all text-sm font-medium text-stone-800"
            >
              <option value="">Pilih tingkat pengalaman...</option>
              {COMMON_EXPERIENCE.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="aestheticStyles" className="block text-xs font-bold text-[#1E1B2E] uppercase tracking-wider">
            Gaya Visual (Aesthetic Styles)
          </label>
          <p className="text-xs text-stone-500 mb-2">Pisahkan dengan koma (contoh: Editorial, Minimalist, Streetwear)</p>
          <input
            type="text"
            id="aestheticStyles"
            name="aestheticStyles"
            defaultValue={initialData.aestheticStyles.join(", ")}
            className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all text-sm font-medium text-stone-800"
            placeholder="Editorial, Minimalist, Vintage..."
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="compensationModels" className="block text-xs font-bold text-[#1E1B2E] uppercase tracking-wider">
            Model Kompensasi (Collaboration Models)
          </label>
          <p className="text-xs text-stone-500 mb-2">Pisahkan dengan koma (contoh: PAID, TFP, REVENUE_SHARE)</p>
          <input
            type="text"
            id="compensationModels"
            name="compensationModels"
            defaultValue={initialData.compensationModels.join(", ")}
            className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all text-sm font-medium text-stone-800 uppercase"
            placeholder="PAID, TFP..."
          />
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {COMMON_COMP_MODELS.map(model => (
              <span key={model} className="px-2 py-1 rounded-md bg-stone-100 text-stone-600 text-[10px] font-bold border border-stone-200">
                {model === "Paid" ? "PAID" : model === "Bagi Hasil" ? "REVENUE_SHARE" : model}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-stone-100 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1E1B2E] text-white font-extrabold text-sm hover:bg-black transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isPending ? "Menyimpan..." : "Simpan Preferensi"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
