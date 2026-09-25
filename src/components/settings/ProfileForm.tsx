"use client";

import React, { useState } from "react";
import { updateProfileBasicInfo } from "@/app/settings/actions";
import { Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface ProfileData {
  name: string;
  sector: string;
  description: string | null;
  location: string | null;
  websiteUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
}

export function ProfileForm({ initialData }: { initialData: ProfileData }) {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateProfileBasicInfo(formData);

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
        <h2 className="text-xl font-extrabold text-[#1E1B2E]">Profil Dasar</h2>
        <p className="text-sm text-stone-500 mt-1">
          Informasi ini akan ditampilkan secara publik di Direktori dan Showcase.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-xs font-bold text-[#1E1B2E] uppercase tracking-wider">
              Nama Lengkap / Stage Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={initialData.name}
              required
              className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all text-sm font-medium text-stone-800"
              placeholder="Misal: Budi Santoso"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="sector" className="text-xs font-bold text-[#1E1B2E] uppercase tracking-wider">
              Sektor / Peran Utama <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="sector"
              name="sector"
              defaultValue={initialData.sector}
              required
              className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all text-sm font-medium text-stone-800"
              placeholder="Misal: Fotografer, Model, dsb"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="description" className="text-xs font-bold text-[#1E1B2E] uppercase tracking-wider">
              Bio / Deskripsi Singkat
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={initialData.description || ""}
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all text-sm text-stone-800 resize-none"
              placeholder="Ceritakan tentang diri Anda, fokus karya, dan visi kreatif..."
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="location" className="text-xs font-bold text-[#1E1B2E] uppercase tracking-wider">
              Lokasi / Basis
            </label>
            <input
              type="text"
              id="location"
              name="location"
              defaultValue={initialData.location || ""}
              className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all text-sm font-medium text-stone-800"
              placeholder="Misal: Jakarta, Indonesia"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="contactEmail" className="text-xs font-bold text-[#1E1B2E] uppercase tracking-wider">
              Email Publik
            </label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              defaultValue={initialData.contactEmail || ""}
              className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all text-sm font-medium text-stone-800"
              placeholder="email@contoh.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="contactPhone" className="text-xs font-bold text-[#1E1B2E] uppercase tracking-wider">
              No. WhatsApp / Telepon
            </label>
            <input
              type="tel"
              id="contactPhone"
              name="contactPhone"
              defaultValue={initialData.contactPhone || ""}
              className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all text-sm font-medium text-stone-800"
              placeholder="+62..."
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="websiteUrl" className="text-xs font-bold text-[#1E1B2E] uppercase tracking-wider">
              Website / Link Portofolio Tambahan
            </label>
            <input
              type="url"
              id="websiteUrl"
              name="websiteUrl"
              defaultValue={initialData.websiteUrl || ""}
              className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all text-sm font-medium text-stone-800"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="pt-4 border-t border-stone-100 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1E1B2E] text-white font-extrabold text-sm hover:bg-black transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isPending ? "Menyimpan..." : "Simpan Perubahan"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
