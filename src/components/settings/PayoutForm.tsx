"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Building2,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  Lock,
} from "lucide-react";
import { updatePayoutSettingsAction } from "@/app/settings/actions";

export interface PayoutData {
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  defaultDpPercentage?: number;
  paymentInstructions?: string;
  npwpOrNik?: string;
  taxScheme?: "NETT" | "GROSS";
  taxClassification?: "INDIVIDUAL_FREELANCE" | "UMKM_PP55" | "CORPORATE_PKP";
}

interface PayoutFormProps {
  initialData?: PayoutData | null;
}

const POPULAR_BANKS = [
  "BCA (Bank Central Asia)",
  "Bank Mandiri",
  "BNI (Bank Negara Indonesia)",
  "BRI (Bank Rakyat Indonesia)",
  "Bank Jago",
  "CIMB Niaga",
  "Permata Bank",
  "BSI (Bank Syariah Indonesia)",
  "Bank Danamon",
  "SeaBank",
  "Bank Lainnya",
];

export function PayoutForm({ initialData }: PayoutFormProps) {
  const [bankName, setBankName] = useState(initialData?.bankName || "BCA (Bank Central Asia)");
  const [accountNumber, setAccountNumber] = useState(initialData?.accountNumber || "");
  const [accountHolder, setAccountHolder] = useState(initialData?.accountHolder || "");
  const [defaultDpPercentage, setDefaultDpPercentage] = useState<number>(initialData?.defaultDpPercentage || 50);
  const [paymentInstructions, setPaymentInstructions] = useState(initialData?.paymentInstructions || "");
  const [npwpOrNik, setNpwpOrNik] = useState(initialData?.npwpOrNik || "");
  const [taxScheme, setTaxScheme] = useState<"NETT" | "GROSS">(initialData?.taxScheme || "NETT");
  const [taxClassification, setTaxClassification] = useState<"INDIVIDUAL_FREELANCE" | "UMKM_PP55" | "CORPORATE_PKP">(
    initialData?.taxClassification || "INDIVIDUAL_FREELANCE"
  );

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("bankName", bankName);
    formData.append("accountNumber", accountNumber);
    formData.append("accountHolder", accountHolder);
    formData.append("defaultDpPercentage", String(defaultDpPercentage));
    formData.append("paymentInstructions", paymentInstructions);
    formData.append("npwpOrNik", npwpOrNik);
    formData.append("taxScheme", taxScheme);
    formData.append("taxClassification", taxClassification);

    const res = await updatePayoutSettingsAction(formData);
    setIsLoading(false);

    if (res.success) {
      setMessage({ type: "success", text: res.message || "Pengaturan rekening dan kepatuhan pajak berhasil disimpan." });
    } else {
      setMessage({ type: "error", text: res.error || "Gagal menyimpan rekening." });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Header Info */}
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-slate-700" />
          <span>Rekening Pencairan Dana (Payout Account)</span>
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Rekening resmi penerima transfer dana muka (DP) dan pelunasan transaksi kolaborasi SPK RAMU langsung dari klien.
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

      {/* Security Callout */}
      <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-start gap-3 text-xs text-slate-600">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-slate-900">Perlindungan Kontrak &amp; Pembayaran Langsung</span>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Data rekening ini akan otomatis tertera pada Surat Perjanjian Kerja (SPK) digital yang disahkan kedua belah pihak. RAMU tidak memotong fee perantara tersembunyi.
          </p>
        </div>
      </div>

      {/* Banking Fields Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Nama Bank <span className="text-rose-500">*</span></span>
            </label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-50/60 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden transition-all"
            >
              {POPULAR_BANKS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              <span>Nomor Rekening <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: 8271039182"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-full px-3 py-2 rounded-xl bg-slate-50/60 border border-slate-200 text-slate-900 text-xs font-mono font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Nama Pemilik Rekening (Sesuai Buku Tabungan) <span className="text-rose-500">*</span></span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: PT LENSA KREATIF / AHMAD FADILLAH"
            value={accountHolder}
            onChange={(e) => setAccountHolder(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50/60 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden transition-all"
          />
        </div>
      </div>

      {/* Settlement Terms */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
            Skema Uang Muka (DP) Bawaan pada SPK
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { val: 50, label: "DP 50% di Awal", desc: "Pelunasan 50% saat serah terima" },
              { val: 70, label: "DP 70% di Awal", desc: "Pelunasan 30% saat serah terima" },
              { val: 100, label: "100% Upfront", desc: "Pembayaran penuh di awal" },
            ].map((option) => (
              <button
                type="button"
                key={option.val}
                onClick={() => setDefaultDpPercentage(option.val)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  defaultDpPercentage === option.val
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="font-bold text-xs">{option.label}</div>
                <div
                  className={`text-[10px] mt-0.5 leading-tight ${
                    defaultDpPercentage === option.val ? "text-slate-300" : "text-slate-400"
                  }`}
                >
                  {option.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Instruksi Tambahan Pembayaran (Opsional)</span>
          </label>
          <textarea
            rows={2}
            value={paymentInstructions}
            onChange={(e) => setPaymentInstructions(e.target.value)}
            placeholder="Contoh: Cantumkan kode referensi SPK pada berita transfer. Bukti transfer mohon diunggah di ruang kolaborasi..."
            className="w-full px-3 py-2 rounded-xl bg-slate-50/60 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden transition-all resize-none"
          />
        </div>
      </div>

      {/* Tax & Fiscal Compliance Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-700" />
              <span>Kepatuhan Pajak &amp; Bukti Potong (PPh 21 / PPh 23)</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Diperlukan untuk mempermudah brand klien menerbitkan bukti potong resmi (e-Bupot) tanpa kendala administratif.
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            Fiskal Nasional
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              NPWP / NIK Wajib Pajak (16 Digit)
            </label>
            <input
              type="text"
              placeholder="Contoh: 3171012345678901"
              value={npwpOrNik}
              onChange={(e) => setNpwpOrNik(e.target.value.replace(/[^0-9]/g, "").slice(0, 16))}
              className="w-full px-3 py-2 rounded-xl bg-slate-50/60 border border-slate-200 text-slate-900 text-xs font-mono font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden transition-all"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Bagi perorangan, NIK e-KTP berfungsi sebagai NPWP 16 digit terintegrasi.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Klasifikasi Wajib Pajak
            </label>
            <select
              value={taxClassification}
              onChange={(e) => setTaxClassification(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50/60 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden transition-all cursor-pointer"
            >
              <option value="INDIVIDUAL_FREELANCE">Tenaga Ahli Lepas / Perorangan (PPh 21)</option>
              <option value="UMKM_PP55">Pelaku Usaha UMKM (PPh Final 0.5% PP 55)</option>
              <option value="CORPORATE_PKP">Badan Usaha PT / CV (PPh 23 Jasa)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
            Default Skema Penawaran Tarif SPK
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTaxScheme("NETT")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                taxScheme === "NETT"
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100/70"
              }`}
            >
              <div className="font-bold text-xs">Nett (Bersih)</div>
              <div className={`text-[10px] mt-0.5 leading-tight ${taxScheme === "NETT" ? "text-slate-300" : "text-slate-400"}`}>
                Kreator menerima honorarium utuh, pajak PPh ditanggung/dibayar oleh pihak Klien.
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTaxScheme("GROSS")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                taxScheme === "GROSS"
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100/70"
              }`}
            >
              <div className="font-bold text-xs">Gross (Termasuk Pajak)</div>
              <div className={`text-[10px] mt-0.5 leading-tight ${taxScheme === "GROSS" ? "text-slate-300" : "text-slate-400"}`}>
                Tarif sudah termasuk pajak, Klien berhak memotong PPh dan wajib menyerahkan bukti e-Bupot.
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-slate-300" />
              <span>Simpan Rekening Pencairan</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
