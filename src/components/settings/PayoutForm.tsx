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

    const res = await updatePayoutSettingsAction(formData);
    setIsLoading(false);

    if (res.success) {
      setMessage({ type: "success", text: res.message || "Pengaturan rekening berhasil disimpan." });
    } else {
      setMessage({ type: "error", text: res.error || "Gagal menyimpan rekening." });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Header Info */}
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-stone-700" />
          <span>Rekening Pencairan Dana (Payout Account)</span>
        </h2>
        <p className="text-xs text-stone-500 leading-relaxed">
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
      <div className="p-4 rounded-xl bg-stone-50/80 border border-stone-200/80 flex items-start gap-3 text-xs text-stone-600">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-stone-900">Perlindungan Kontrak &amp; Pembayaran Langsung</span>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            Data rekening ini akan otomatis tertera pada Surat Perjanjian Kerja (SPK) digital yang disahkan kedua belah pihak. RAMU tidak memotong fee perantara tersembunyi.
          </p>
        </div>
      </div>

      {/* Banking Fields Card */}
      <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-stone-400" />
              <span>Nama Bank <span className="text-rose-500">*</span></span>
            </label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-stone-50/60 border border-stone-200 text-stone-900 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-stone-900 focus:outline-hidden transition-all"
            >
              {POPULAR_BANKS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-stone-400" />
              <span>Nomor Rekening <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: 8271039182"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-full px-3 py-2 rounded-xl bg-stone-50/60 border border-stone-200 text-stone-900 text-xs font-mono font-medium focus:bg-white focus:ring-2 focus:ring-stone-900 focus:outline-hidden transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-800 mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-stone-400" />
            <span>Nama Pemilik Rekening (Sesuai Buku Tabungan) <span className="text-rose-500">*</span></span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: PT LENSA KREATIF / AHMAD FADILLAH"
            value={accountHolder}
            onChange={(e) => setAccountHolder(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-stone-50/60 border border-stone-200 text-stone-900 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-stone-900 focus:outline-hidden transition-all"
          />
        </div>
      </div>

      {/* Settlement Terms */}
      <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-4">
        <div>
          <label className="block text-xs font-semibold text-stone-800 mb-1.5">
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
                    ? "bg-stone-900 text-white border-stone-900 shadow-xs"
                    : "bg-stone-50/60 border-stone-200 text-stone-700 hover:bg-stone-100"
                }`}
              >
                <div className="font-bold text-xs">{option.label}</div>
                <div
                  className={`text-[10px] mt-0.5 leading-tight ${
                    defaultDpPercentage === option.val ? "text-stone-300" : "text-stone-400"
                  }`}
                >
                  {option.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-800 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-stone-400" />
            <span>Instruksi Tambahan Pembayaran (Opsional)</span>
          </label>
          <textarea
            rows={2}
            value={paymentInstructions}
            onChange={(e) => setPaymentInstructions(e.target.value)}
            placeholder="Contoh: Cantumkan kode referensi SPK pada berita transfer. Bukti transfer mohon diunggah di ruang kolaborasi..."
            className="w-full px-3 py-2 rounded-xl bg-stone-50/60 border border-stone-200 text-stone-900 text-xs focus:bg-white focus:ring-2 focus:ring-stone-900 focus:outline-hidden transition-all resize-none"
          />
        </div>
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
              <Lock className="w-3.5 h-3.5 text-stone-300" />
              <span>Simpan Rekening Pencairan</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
