"use client";

import React, { useState } from "react";
import { updateActorSpecs } from "@/app/settings/actions";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  CreditCard,
  Users,
  Sparkles,
  Info,
  Gift,
  TrendingUp,
  Repeat,
  Handshake,
} from "lucide-react";

const COLLAB_TYPE_OPTIONS = [
  {
    id: "Paid Campaign",
    icon: CreditCard,
    title: "Paid Campaign",
    desc: "Kreator dibayar sesuai rate card mereka. Cocok untuk campaign terstruktur dengan brief yang jelas.",
  },
  {
    id: "Product Seeding / Gifting",
    icon: Gift,
    title: "Product Seeding / Gifting",
    desc: "Kirimkan produk gratis kepada kreator pilihan untuk konten organik tanpa kewajiban posting.",
  },
  {
    id: "Revenue Share / Affiliate",
    icon: TrendingUp,
    title: "Revenue Share / Affiliate",
    desc: "Kreator mendapatkan komisi dari setiap konversi/penjualan via kode unik mereka.",
  },
  {
    id: "Resource Sharing / Content Exchange",
    icon: Repeat,
    title: "Resource Sharing / Content Exchange",
    desc: "Pertukaran nilai komplementer: brand menyediakan produk/jasa, kreator menyediakan konten berkualitas.",
  },
  {
    id: "Co-Branding & Kolaborasi Koleksi",
    icon: Handshake,
    title: "Co-Branding & Kolaborasi Koleksi",
    desc: "Kerjasama rilis koleksi bersama antara dua brand atau brand dan kreator untuk edisi terbatas.",
  },
  {
    id: "Casting Open",
    icon: Users,
    title: "Casting Open",
    desc: "Buka casting terbuka untuk model, fotografer, atau kreator untuk proyek tertentu.",
  },
];

interface BrandCollabFormProps {
  initialCollabTypes: string[];
  initialBudgetRange: string;
  initialTimeline: string;
  initialCreatorRequirements: string;
  initialCollabNotes: string;
}

export function BrandCollabForm({
  initialCollabTypes,
  initialBudgetRange,
  initialTimeline,
  initialCreatorRequirements,
  initialCollabNotes,
}: BrandCollabFormProps) {
  const [collabTypes, setCollabTypes] = useState<string[]>(() =>
    (initialCollabTypes || []).map((t) =>
      t === "Barter / Trade for Content" ? "Resource Sharing / Content Exchange" : t
    )
  );
  const [budgetRange, setBudgetRange] = useState(initialBudgetRange);
  const [timeline, setTimeline] = useState(initialTimeline);
  const [creatorRequirements, setCreatorRequirements] = useState(initialCreatorRequirements);
  const [collabNotes, setCollabNotes] = useState(initialCollabNotes);

  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const toggleType = (id: string) => {
    setCollabTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("collab_types", JSON.stringify(collabTypes));
    formData.append("budget_range", budgetRange);
    formData.append("collab_timeline", timeline);
    formData.append("creator_requirements", creatorRequirements);
    formData.append("collab_notes", collabNotes);

    const result = await updateActorSpecs(formData);

    if (result.success) {
      setMessage({ type: "success", text: "Preferensi kerjasama berhasil disimpan dan ditampilkan di profil direktori brand Anda." });
    } else {
      setMessage({ type: "error", text: result.error || "Gagal menyimpan. Coba lagi." });
    }
    setIsPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-xl bg-sky-50 text-[#0284c7] border border-sky-200/60 inline-flex">
            <Briefcase className="w-4 h-4" />
          </span>
          <h2 className="text-xl font-black text-[#27213D] tracking-tight">
            Preferensi Kerjasama Brand
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#716B7E] leading-relaxed">
          Atur jenis kolaborasi yang terbuka, kompensasi, dan profil kreator ideal yang Anda cari.
          Informasi ini akan tampil publik di tab{" "}
          <strong className="text-[#27213D]">&ldquo;Kerjasama&rdquo;</strong> pada profil direktori brand Anda.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/60 flex items-start gap-3">
        <Info className="w-4 h-4 text-[#0284c7] shrink-0 mt-0.5" />
        <p className="text-xs text-[#0284c7] font-medium leading-relaxed">
          Sebagai brand di RAMU, halaman ini menggantikan &ldquo;Paket Tarif&rdquo; — karena brand adalah pihak yang{" "}
          <strong>mencari</strong> kreator, bukan pihak yang menawarkan jasa berbayar.
        </p>
      </div>

      <div className="p-6 rounded-[24px] bg-white border border-stone-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600 inline-flex">
              <Briefcase className="w-3.5 h-3.5" />
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#27213D]">
              Jenis Kerjasama yang Dibuka
            </h3>
          </div>
          <span className="text-xs font-bold text-[#0284c7] bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200/60">
            {collabTypes.length} dipilih
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {COLLAB_TYPE_OPTIONS.map((option) => {
            const isSelected = collabTypes.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleType(option.id)}
                className={`text-left p-4 rounded-2xl border transition-all duration-200 space-y-2 cursor-pointer ${
                  isSelected
                    ? "bg-[#4CC9FE] border-[#4CC9FE] shadow-md shadow-[#4CC9FE]/20 text-white"
                    : "bg-stone-50/70 border-stone-200 hover:border-[#4CC9FE]/60 hover:bg-white text-[#27213D]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <option.icon className={`w-5 h-5 ${isSelected ? "text-white" : "text-[#716B7E]"}`} />
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <p className={`text-xs font-black uppercase tracking-wider ${isSelected ? "text-white" : "text-[#27213D]"}`}>
                    {option.title}
                  </p>
                  <p className={`text-[11px] mt-1 leading-relaxed ${isSelected ? "text-sky-50" : "text-[#716B7E]"}`}>
                    {option.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {collabTypes.length === 0 && (
          <p className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-xl">
            Pilih minimal satu jenis kerjasama agar profil brand Anda terlihat aktif di direktori.
          </p>
        )}
      </div>

      <div className="p-6 rounded-[24px] bg-white border border-stone-200/80 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
          <span className="p-1 rounded-lg bg-sky-50 text-[#0284c7] inline-flex">
            <CreditCard className="w-3.5 h-3.5" />
          </span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#27213D]">
            Budget &amp; Timeline Kampanye
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#27213D] uppercase tracking-wider block">
              Budget / Kompensasi Kreator
            </label>
            <CurrencyInput
              value={budgetRange}
              onChange={(val) => setBudgetRange(val)}
              placeholder="Rp 2.500.000 per kampanye"
              className="w-full px-4 py-2.5 rounded-xl bg-stone-50/70 border border-stone-200 focus:bg-white focus:border-[#4CC9FE] text-xs sm:text-sm text-[#27213D] font-medium transition-colors outline-hidden focus:ring-2 focus:ring-[#4CC9FE]/20"
            />
            <p className="text-[11px] text-[#716B7E]">Estimasi, bukan harga pasti. Bisa berupa range angka atau deskripsi.</p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#27213D] uppercase tracking-wider block">
              Timeline per Kampanye
            </label>
            <input
              type="text"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              placeholder="mis. 2-4 Minggu per Kampanye"
              className="w-full px-4 py-2.5 rounded-xl bg-stone-50/70 border border-stone-200 focus:bg-white focus:border-[#4CC9FE] text-xs sm:text-sm text-[#27213D] font-medium transition-colors outline-hidden focus:ring-2 focus:ring-[#4CC9FE]/20 placeholder:text-[#716B7E]/50"
            />
            <p className="text-[11px] text-[#716B7E]">Estimasi dari pengiriman brief hingga konten dipublikasikan.</p>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-[24px] bg-white border border-stone-200/80 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
          <span className="p-1 rounded-lg bg-amber-50 text-amber-600 inline-flex">
            <Users className="w-3.5 h-3.5" />
          </span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#27213D]">
            Profil &amp; Persyaratan Kreator Ideal
          </h3>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#27213D] uppercase tracking-wider block">
            Deskripsi Kreator yang Dicari <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            value={creatorRequirements}
            onChange={(e) => setCreatorRequirements(e.target.value)}
            placeholder="mis. Fotografer fashion dengan estetika minimalis, berpengalaman min. 1 tahun dengan brand lokal, domisili Bandung atau Jakarta..."
            className="w-full px-4 py-2.5 rounded-xl bg-stone-50/70 border border-stone-200 focus:bg-white focus:border-[#4CC9FE] text-xs sm:text-sm text-[#27213D] font-medium resize-none leading-relaxed transition-colors outline-hidden focus:ring-2 focus:ring-[#4CC9FE]/20 placeholder:text-[#716B7E]/50"
          />
          <p className="text-[11px] text-[#716B7E]">Niche, gaya visual, level pengalaman, atau follower minimum yang Anda harapkan.</p>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#27213D] uppercase tracking-wider block">
            Catatan Tambahan (Opsional)
          </label>
          <textarea
            rows={2}
            value={collabNotes}
            onChange={(e) => setCollabNotes(e.target.value)}
            placeholder="mis. Prioritas kreator berbasis Bandung & Jakarta. Tidak menerima konten promosi brand kompetitor."
            className="w-full px-4 py-2.5 rounded-xl bg-stone-50/70 border border-stone-200 focus:bg-white focus:border-[#4CC9FE] text-xs sm:text-sm text-[#27213D] font-medium resize-none leading-relaxed transition-colors outline-hidden focus:ring-2 focus:ring-[#4CC9FE]/20 placeholder:text-[#716B7E]/50"
          />
        </div>
      </div>

      {collabTypes.length > 0 && (
        <div className="p-6 rounded-[24px] bg-gradient-to-br from-sky-50/70 via-white to-stone-50 border border-sky-200/60 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0284c7]" />
            <span className="text-xs font-bold text-[#27213D] uppercase tracking-wider">
              Ringkasan Profil Kerjasama Brand
            </span>
          </div>
          <div className="space-y-2 bg-white/80 p-4 rounded-2xl border border-stone-200/70 text-xs">
            <div className="flex flex-wrap gap-1.5">
              {collabTypes.map((t) => {
                const opt = COLLAB_TYPE_OPTIONS.find((o) => o.id === t);
                const Icon = opt?.icon;
                return (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-[#0284c7] font-bold text-xs border border-sky-200/60"
                  >
                    {Icon && <Icon className="w-3.5 h-3.5 text-[#0284c7] shrink-0" />}
                    <span>{t}</span>
                  </span>
                );
              })}
            </div>
            {budgetRange && <p className="text-xs text-[#27213D] pt-1"><strong>Budget:</strong> <span className="text-[#716B7E]">{budgetRange}</span></p>}
            {timeline && <p className="text-xs text-[#27213D]"><strong>Timeline:</strong> <span className="text-[#716B7E]">{timeline}</span></p>}
          </div>
        </div>
      )}

      {message && (
        <div className={`flex items-start gap-3 p-4 rounded-2xl border text-xs font-semibold ${message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
          {message.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-200">
        <p className="text-xs text-[#716B7E] leading-relaxed">
          Preferensi ini ditampilkan secara publik di profil direktori brand Anda.
        </p>
        <button
          type="submit"
          disabled={isPending || collabTypes.length === 0}
          className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-[#4CC9FE] text-white font-bold text-xs sm:text-sm hover:bg-[#38bbf5] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-[#4CC9FE]/25"
        >
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>{isPending ? "Menyimpan..." : "Simpan Preferensi Kerjasama"}</span>
        </button>
      </div>
    </form>
  );
}