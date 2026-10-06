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

    const formData = new FormData();
    formData.append("customClauses", customClauses);
    formData.append("defaultLicensing", defaultLicensing);
    formData.append("autoNda", String(autoNda));
    formData.append("requireSampleCare", String(requireSampleCare));
    formData.append("coCreditRule", coCreditRule);

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
        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-stone-700" />
          <span>Template SPK &amp; Ketentuan Hak Cipta</span>
        </h2>
        <p className="text-xs text-stone-500 leading-relaxed">
          Atur klausul standar, lisensi karya cipta, dan perlindungan hukum yang otomatis disematkan ke dalam Surat Perjanjian Kerja (SPK) digital Anda.
        </p>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-medium animate-fade-in ${
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
      <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-4">
        <div>
          <label className="block text-xs font-semibold text-stone-800 mb-1.5 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-stone-400" />
            <span>Model Lisensi Penggunaan Aset Visual (Default)</span>
          </label>
          <select
            value={defaultLicensing}
            onChange={(e) => setDefaultLicensing(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-stone-50/60 border border-stone-200 text-stone-900 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-stone-900 focus:outline-hidden transition-all"
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
          <label className="block text-xs font-semibold text-stone-800 mb-1.5">
            Klausul Atribusi &amp; Hak Co-Credits
          </label>
          <input
            type="text"
            value={coCreditRule}
            onChange={(e) => setCoCreditRule(e.target.value)}
            placeholder="Contoh: Wajib mencantumkan kredit resmi (@handle) pada media sosial..."
            className="w-full px-3 py-2 rounded-xl bg-stone-50/60 border border-stone-200 text-stone-900 text-xs focus:bg-white focus:ring-2 focus:ring-stone-900 focus:outline-hidden transition-all"
          />
        </div>
      </div>

      {/* Protective Agreements */}
      <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
        <span className="text-xs font-semibold text-stone-800 block">
          Proteksi Otomatis pada Setiap SPK
        </span>

        <label className="flex items-start gap-3 p-3 rounded-xl bg-stone-50/60 border border-stone-200/80 cursor-pointer hover:bg-stone-50 transition-colors">
          <input
            type="checkbox"
            checked={autoNda}
            onChange={(e) => setAutoNda(e.target.checked)}
            className="mt-0.5 rounded text-stone-900 focus:ring-stone-900"
          />
          <div className="text-xs">
            <span className="font-semibold text-stone-900 block">
              Sertakan Klausul Kerahasiaan (Non-Disclosure Agreement / NDA)
            </span>
            <span className="text-[11px] text-stone-500 leading-relaxed block mt-0.5">
              Mewajibkan kedua pihak menjaga kerahasiaan konsep, sampel koleksi, dan aset pra-rilis sebelum peluncuran resmi.
            </span>
          </div>
        </label>

        <label className="flex items-start gap-3 p-3 rounded-xl bg-stone-50/60 border border-stone-200/80 cursor-pointer hover:bg-stone-50 transition-colors">
          <input
            type="checkbox"
            checked={requireSampleCare}
            onChange={(e) => setRequireSampleCare(e.target.checked)}
            className="mt-0.5 rounded text-stone-900 focus:ring-stone-900"
          />
          <div className="text-xs">
            <span className="font-semibold text-stone-900 block">
              Klausul Garansi Keamanan Sampel Busana &amp; Alat
            </span>
            <span className="text-[11px] text-stone-500 leading-relaxed block mt-0.5">
              Menegaskan ganti rugi atau pertanggungjawaban jika terjadi kerusakan sampel busana atau peralatan studio di lokasi on-set.
            </span>
          </div>
        </label>
      </div>

      {/* Custom Clauses Textarea */}
      <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2">
        <label className="block text-xs font-semibold text-stone-800 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-stone-400" />
            <span>Klausul Tambahan Khusus (Custom Terms)</span>
          </span>
          <span className="text-[10px] text-stone-400 font-normal">Otomatis dicetak di lampiran SPK</span>
        </label>
        <textarea
          rows={5}
          value={customClauses}
          onChange={(e) => setCustomClauses(e.target.value)}
          placeholder="Tuliskan butir-butir syarat kerja khusus Anda..."
          className="w-full px-3 py-2.5 rounded-xl bg-stone-50/60 border border-stone-200 text-stone-900 text-xs focus:bg-white focus:ring-2 focus:ring-stone-900 focus:outline-hidden transition-all leading-relaxed font-mono resize-none"
        />
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 text-stone-300" />
              <span>Simpan Template SPK</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
