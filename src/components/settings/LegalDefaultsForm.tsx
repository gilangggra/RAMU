"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Award,
  Lock,
  Save,
  HelpCircle,
} from "lucide-react";
import { updateLegalDefaultsAction } from "@/app/settings/actions";

export interface LegalDefaultsData {
  customClauses?: string;
  defaultLicensing?: string;
  autoNda?: boolean;
  requireSampleCare?: boolean;
  coCreditRule?: string;
}

interface LegalDefaultsFormProps {
  initialData?: LegalDefaultsData | null;
}

export function LegalDefaultsForm({ initialData }: LegalDefaultsFormProps) {
  const [customClauses, setCustomClauses] = useState(
    initialData?.customClauses ||
      "1. Batas maksimal revisi sebanyak 2 (dua) kali.\n2. Overtime sesi kerja dikenakan biaya tambahan Rp 150.000/jam setelah durasi dasar 8 jam.\n3. Pembatalan sepihak H-1 pelaksanaan dikenakan penalti DP 50%."
  );
  const [defaultLicensing, setDefaultLicensing] = useState(
    initialData?.defaultLicensing || "COMMERCIAL_LIMITED"
  );
  const [autoNda, setAutoNda] = useState<boolean>(
    initialData?.autoNda !== undefined ? initialData.autoNda : true
  );
  const [requireSampleCare, setRequireSampleCare] = useState<boolean>(
    initialData?.requireSampleCare !== undefined ? initialData.requireSampleCare : true
  );
  const [coCreditRule, setCoCreditRule] = useState(
    initialData?.coCreditRule || "Wajib mencantumkan kredit resmi (@handle) pada takarir dan tag media sosial."
  );

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (customClauses.length > 1500) {
      setMessage({ type: "error", text: "Klausul tambahan melebihi batas maksimal 1.500 karakter." });
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("customClauses", customClauses.trim());
    formData.append("defaultLicensing", defaultLicensing);
    formData.append("autoNda", String(autoNda));
    formData.append("requireSampleCare", String(requireSampleCare));
    formData.append("coCreditRule", coCreditRule.trim());

    const res = await updateLegalDefaultsAction(formData);
    setIsLoading(false);

    if (res.success) {
      setMessage({ type: "success", text: res.message || "Template klausul SPK berhasil disimpan." });
    } else {
      setMessage({ type: "error", text: res.error || "Gagal menyimpan template SPK." });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Header Info */}
      <div className="space-y-1">
        <h2 className="text-xl font-black text-[#27213D] tracking-tight flex items-center gap-2.5">
          <span className="p-1.5 rounded-xl bg-sky-50 text-[#0284c7] border border-sky-200/60 inline-flex">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <span>Template SPK &amp; Ketentuan Hak Cipta</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#716B7E] leading-relaxed">
          Atur klausul standar, lisensi karya cipta, dan perlindungan hukum yang otomatis disematkan ke dalam Surat Perjanjian Kerja (SPK) digital Anda.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-2.5 text-xs font-semibold animate-fade-in ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Licensing Card */}
      <div className="p-6 rounded-[24px] bg-white border border-stone-200/80 shadow-xs space-y-5">
        <div>
          <label className="block text-xs font-bold text-[#27213D] mb-1.5 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#716B7E]" />
            <span>Model Lisensi Penggunaan Aset Visual (Default)</span>
          </label>
          <select
            value={defaultLicensing}
            onChange={(e) => setDefaultLicensing(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/70 border border-stone-200 text-[#27213D] text-xs font-medium focus:bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 focus:outline-hidden transition-all"
          >
            <option value="COMMERCIAL_LIMITED">
              Komersial Terbatas (Hak tayang 1 tahun media digital &amp; lookbook)
            </option>
            <option value="COMMERCIAL_EXCLUSIVE">
              Komersial Eksklusif Penuh (Billboard, cetak nasional, dan kampanye brand)
            </option>
            <option value="EDITORIAL_ONLY">
              Editorial &amp; Non-Komersial (Pameran, portofolio bersama, &amp; majalah)
            </option>
            <option value="FULL_BUYOUT">
              Full Buyout (Pengalihan penuh hak ekonomi aset visual kepada klien)
            </option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#27213D] mb-1.5">
            Klausul Atribusi &amp; Hak Co-Credits
          </label>
          <input
            type="text"
            value={coCreditRule}
            onChange={(e) => setCoCreditRule(e.target.value)}
            placeholder="Contoh: Wajib mencantumkan kredit resmi (@handle) pada media sosial..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/70 border border-stone-200 text-[#27213D] text-xs font-medium focus:bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 focus:outline-hidden transition-all placeholder:text-[#716B7E]/50"
          />
        </div>
      </div>

      {/* Protective Agreements */}
      <div className="p-6 rounded-[24px] bg-white border border-stone-200/80 shadow-xs space-y-4">
        <span className="text-xs font-bold text-[#27213D] block">
          Proteksi Otomatis pada Setiap SPK
        </span>

        <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-stone-50/70 border border-stone-200/80 cursor-pointer hover:bg-stone-100/60 transition-colors">
          <input
            type="checkbox"
            checked={autoNda}
            onChange={(e) => setAutoNda(e.target.checked)}
            className="mt-0.5 rounded text-[#4CC9FE] focus:ring-[#4CC9FE]/20 accent-[#4CC9FE]"
          />
          <div className="text-xs">
            <span className="font-bold text-[#27213D] block">
              Sertakan Klausul Kerahasiaan (Non-Disclosure Agreement / NDA)
            </span>
            <span className="text-[11px] text-[#716B7E] leading-relaxed block mt-0.5">
              Mewajibkan kedua pihak menjaga kerahasiaan konsep, sampel koleksi, dan aset pra-rilis sebelum peluncuran resmi.
            </span>
          </div>
        </label>

        <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-stone-50/70 border border-stone-200/80 cursor-pointer hover:bg-stone-100/60 transition-colors">
          <input
            type="checkbox"
            checked={requireSampleCare}
            onChange={(e) => setRequireSampleCare(e.target.checked)}
            className="mt-0.5 rounded text-[#4CC9FE] focus:ring-[#4CC9FE]/20 accent-[#4CC9FE]"
          />
          <div className="text-xs">
            <span className="font-bold text-[#27213D] block">
              Klausul Garansi Keamanan Sampel Busana &amp; Alat
            </span>
            <span className="text-[11px] text-[#716B7E] leading-relaxed block mt-0.5">
              Menegaskan ganti rugi atau pertanggungjawaban jika terjadi kerusakan sampel busana atau peralatan studio di lokasi on-set.
            </span>
          </div>
        </label>
      </div>

      {/* Custom Clauses Textarea */}
      <div className="p-6 rounded-[24px] bg-white border border-stone-200/80 shadow-xs space-y-2.5">
        <label className="block text-xs font-bold text-[#27213D] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#716B7E]" />
            <span>Klausul Tambahan Khusus (Custom Terms)</span>
          </span>
          <span className={`text-[10px] font-mono ${customClauses.length > 1500 ? "text-rose-600 font-bold" : "text-[#716B7E]"}`}>
            {customClauses.length} / 1500 karakter
          </span>
        </label>
        <textarea
          rows={5}
          value={customClauses}
          onChange={(e) => setCustomClauses(e.target.value)}
          placeholder="Tuliskan butir-butir syarat kerja khusus Anda..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/70 border border-stone-200 text-[#27213D] text-xs font-medium focus:bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 focus:outline-hidden transition-all leading-relaxed font-mono resize-none placeholder:text-[#716B7E]/50"
        />
      </div>

      {/* Live Preview Card */}
      <div className="p-6 rounded-[24px] bg-gradient-to-br from-sky-50/70 via-white to-stone-50 border border-sky-200/60 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-sky-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-emerald-100 text-emerald-600 inline-flex">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-[#27213D] tracking-wide">Pratinjau Klausul Dokumen SPK</span>
          </div>
          <span className="text-[10px] text-[#0284c7] font-bold tracking-wider uppercase bg-sky-100/70 px-2.5 py-0.5 rounded-full font-mono">DOKUMEN RESMI RAMU</span>
        </div>
        <div className="text-[11px] text-[#27213D] space-y-2.5 leading-relaxed bg-white/90 p-4 rounded-2xl border border-stone-200/70 font-mono">
          <div><strong className="text-[#27213D] font-bold">Model Lisensi:</strong> <span className="text-[#716B7E]">{defaultLicensing}</span></div>
          <div><strong className="text-[#27213D] font-bold">Atribusi &amp; Kredit:</strong> <span className="text-[#716B7E]">{coCreditRule || "-"}</span></div>
          <div><strong className="text-[#27213D] font-bold">NDA Kerahasiaan:</strong> <span className="text-[#716B7E]">{autoNda ? "Aktif &amp; Mengikat" : "Tidak disertakan"}</span></div>
          <div><strong className="text-[#27213D] font-bold">Jaminan Sampel &amp; Alat:</strong> <span className="text-[#716B7E]">{requireSampleCare ? "Wajib Ganti Rugi Kerusakan" : "Standar"}</span></div>
          {customClauses && (
            <div className="pt-2 border-t border-stone-200/70">
              <strong className="text-[#27213D] block mb-1">Ketentuan Khusus:</strong>
              <p className="whitespace-pre-line text-[#716B7E] text-[10px]">{customClauses}</p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#4CC9FE] hover:bg-[#38bbf5] active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#4CC9FE]/25 transition-all cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Template SPK</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
