"use client";

import React, { useState } from "react";
import { updateActorSpecs } from "@/app/settings/actions";
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
    id: "Barter / Trade for Content",
    icon: Repeat,
    title: "Barter / Trade for Content",
    desc: "Pertukaran nilai: brand menyediakan produk/jasa, kreator menyediakan konten berkualitas.",
  },
  {
    id: "Co-Branding & Kolaborasi Koleksi",
    icon: Handshake,
    title: "Co-Branding & Kolaborasi Koleksi",
    desc: "Kerjasama desain koleksi bersama antara brand dan kreator/desainer untuk rilis terbatas.",
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
  const [collabTypes, setCollabTypes] = useState<string[]>(initialCollabTypes);
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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-[#1E1B2E]" />
          <h2 className="text-xl font-black text-[#1E1B2E] tracking-tight">
            Preferensi Kerjasama Brand
          </h2>
        </div>
        <p className="text-sm text-stone-500 leading-relaxed">
          Atur jenis kolaborasi yang terbuka, kompensasi, dan profil kreator ideal yang Anda cari.
          Informasi ini akan tampil publik di tab{" "}
          <strong className="text-[#1E1B2E]">&ldquo;Kerjasama&rdquo;</strong> pada profil direktori brand Anda.
        </p>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-900 leading-relaxed">
          Sebagai brand di RAMU, halaman ini menggantikan &ldquo;Paket Tarif&rdquo; — karena brand adalah pihak yang{" "}
          <strong>mencari</strong> kreator, bukan pihak yang menawarkan jasa berbayar.
        </p>
      </div>

      <div className="p-6 bg-white border border-stone-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E]">
              Jenis Kerjasama yang Dibuka
            </h3>
          </div>
          <span className="text-[10px] text-stone-400 font-semibold">
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
                className={`text-left p-4 border transition-all duration-200 space-y-2 ${
                  isSelected
                    ? "bg-[#1E1B2E] border-[#1E1B2E] shadow-md"
                    : "bg-stone-50 border-stone-200 hover:border-stone-400 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <option.icon className={`w-5 h-5 ${isSelected ? "text-amber-400" : "text-stone-400"}`} />
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <div>
                  <p className={`text-xs font-black uppercase tracking-wider ${isSelected ? "text-white" : "text-[#1E1B2E]"}`}>
                    {option.title}
                  </p>
                  <p className={`text-[11px] mt-1 leading-relaxed ${isSelected ? "text-stone-300" : "text-stone-500"}`}>
                    {option.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {collabTypes.length === 0 && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2">
            Pilih minimal satu jenis kerjasama agar profil brand Anda terlihat aktif di direktori.
          </p>
        )}
      </div>

      <div className="p-6 bg-white border border-stone-200/80 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
          <CreditCard className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E]">
            Budget & Timeline Kampanye
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
              Budget / Kompensasi Kreator
            </label>
            <input
              type="text"
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value)}
              placeholder="mis. Rp 1-5 Jt per campaign, atau Sesuai scope brief"
              className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm text-stone-800 font-medium transition-colors outline-none"
            />
            <p className="text-[10px] text-stone-400">Estimasi, bukan harga pasti. Bisa berupa range angka atau deskripsi.</p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
              Timeline per Kampanye
            </label>
            <input
              type="text"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              placeholder="mis. 2-4 Minggu per Kampanye"
              className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm text-stone-800 font-medium transition-colors outline-none"
            />
            <p className="text-[10px] text-stone-400">Estimasi dari pengiriman brief hingga konten dipublikasikan.</p>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white border border-stone-200/80 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
          <Users className="w-4 h-4 text-amber-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E]">
            Profil & Persyaratan Kreator Ideal
          </h3>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
            Deskripsi Kreator yang Dicari <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            value={creatorRequirements}
            onChange={(e) => setCreatorRequirements(e.target.value)}
            placeholder="mis. Fotografer fashion dengan estetika minimalis, berpengalaman min. 1 tahun dengan brand lokal, domisili Bandung atau Jakarta..."
            className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm text-stone-800 font-medium resize-none leading-relaxed transition-colors outline-none"
          />
          <p className="text-[10px] text-stone-400">Niche, gaya visual, level pengalaman, atau follower minimum yang Anda harapkan.</p>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
            Catatan Tambahan (Opsional)
          </label>
          <textarea
            rows={2}
            value={collabNotes}
            onChange={(e) => setCollabNotes(e.target.value)}
            placeholder="mis. Prioritas kreator berbasis Bandung & Jakarta. Tidak menerima konten promosi brand kompetitor."
            className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm text-stone-800 font-medium resize-none leading-relaxed transition-colors outline-none"
          />
        </div>
      </div>

      {collabTypes.length > 0 && (
        <div className="p-5 bg-stone-50 border border-stone-200 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Pratinjau Tampilan Publik</span>
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {collabTypes.map((t) => {
                const opt = COLLAB_TYPE_OPTIONS.find((o) => o.id === t);
                const Icon = opt?.icon;
                return (
                  <span key={t} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-stone-300 text-xs font-bold text-[#1E1B2E]">
                    {Icon && <Icon className="w-3.5 h-3.5 text-stone-600 shrink-0" />}
                    <span>{t}</span>
                  </span>
                );
              })}
            </div>
            {budgetRange && <p className="text-xs text-stone-600"><strong>Budget:</strong> {budgetRange}</p>}
            {timeline && <p className="text-xs text-stone-600"><strong>Timeline:</strong> {timeline}</p>}
          </div>
        </div>
      )}

      {message && (
        <div className={`flex items-start gap-3 p-4 border text-sm font-medium ${message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
          {message.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="pt-2 flex items-center justify-between gap-4 border-t border-stone-200">
        <p className="text-xs text-stone-400 leading-relaxed">
          Preferensi ini ditampilkan secara publik di profil direktori brand Anda.
        </p>
        <button
          type="submit"
          disabled={isPending || collabTypes.length === 0}
          className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-none bg-[#1E1B2E] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
        >
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>{isPending ? "Menyimpan..." : "Simpan Preferensi Kerjasama"}</span>
        </button>
      </div>
    </form>
  );
}