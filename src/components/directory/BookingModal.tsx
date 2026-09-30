"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, Calendar, Loader2, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import { createBookingRequest } from "@/app/api/bookings/actions";
import { TermsAndConditionsConfig, getDefaultTerms } from "@/components/settings/RatesForm";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetName: string;
  targetSector: string;
  targetType: string;
  termsConfig?: TermsAndConditionsConfig | null;
}

export function BookingModal({
  isOpen,
  onClose,
  targetId,
  targetName,
  targetSector,
  targetType,
  termsConfig,
}: BookingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const effectiveTerms = termsConfig || getDefaultTerms(targetSector, targetType);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Common Fields
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");

  // Dynamic Fields
  const [details, setDetails] = useState<Record<string, string>>({});

  const todayStr = new Date().toISOString().split("T")[0];

  function handleClose() {
    setIsSuccess(false);
    setIsLoading(false);
    setStartDate("");
    setEndDate("");
    setBudget("");
    setDetails({});
    setErrorMessage(null);
    onClose();
  }

  if (!isOpen) return null;

  function handleDetailChange(key: string, value: string) {
    setDetails((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const detailsPayload: Record<string, any> = {
      ...details,
      agreedTerms: {
        dpPercentage: effectiveTerms.dpPercentage,
        maxRevisions: effectiveTerms.maxRevisions,
        shiftHours: effectiveTerms.shiftHours,
        overtimeRate: effectiveTerms.overtimeRate,
        gracePeriodMinutes: effectiveTerms.gracePeriodMinutes,
        roleSpecifics: effectiveTerms.roleSpecifics,
        safeSetCompliant: effectiveTerms.safeSetCompliant,
        clientAgreedAt: new Date().toISOString(),
      },
    };

    const result = await createBookingRequest({
      targetId,
      startDate,
      endDate: endDate || undefined,
      budget,
      details: detailsPayload,
    });

    setIsLoading(false);
    if (result.success) {
      setIsSuccess(true);
    } else {
      setErrorMessage(result.error || "Gagal mengirim permintaan.");
    }
  }

  // Polymorphic rendering based on type/sector
  const renderDynamicFields = () => {
    // 1. Studio / Space Rental
    if (targetType === "STUDIO") {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Tipe Ruangan/Studio</label>
            <input
              type="text"
              placeholder="Misal: Studio A, Podcast Room"
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-none px-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              value={details.roomType || ""}
              onChange={(e) => handleDetailChange("roomType", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Kebutuhan Tambahan (Add-ons)</label>
            <input
              type="text"
              placeholder="Misal: Tambahan Lighting, Stylist, dll"
              className="w-full bg-stone-50 border border-stone-200 rounded-none px-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              value={details.addons || ""}
              onChange={(e) => handleDetailChange("addons", e.target.value)}
            />
          </div>
        </div>
      );
    }

    // 2. Talent / Model
    if (targetSector.toLowerCase().includes("model") || targetSector.toLowerCase().includes("talent")) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Peran / Karakter</label>
            <input
              type="text"
              placeholder="Misal: Model Casual, Pemeran Utama"
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-none px-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              value={details.role || ""}
              onChange={(e) => handleDetailChange("role", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Hak Penggunaan (Usage Rights)</label>
            <input
              type="text"
              placeholder="Misal: Social Media Selamanya, TVC 1 Tahun"
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-none px-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              value={details.usageRights || ""}
              onChange={(e) => handleDetailChange("usageRights", e.target.value)}
            />
          </div>
        </div>
      );
    }

    // 3. Jasa Produksi (Fotografer, Videografer, MUA, dll) -> Default Fallback
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Lokasi Pelaksanaan</label>
          <input
            type="text"
            placeholder="Misal: Studio Indoor, Jakarta Selatan"
            required
            className="w-full bg-stone-50 border border-stone-200 rounded-none px-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            value={details.location || ""}
            onChange={(e) => handleDetailChange("location", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Output yang Diharapkan</label>
          <textarea
            placeholder="Misal: 50 Foto Edit, 1 Video Reels"
            required
            rows={2}
            className="w-full bg-stone-50 border border-stone-200 rounded-none px-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
            value={details.deliverables || ""}
            onChange={(e) => handleDetailChange("deliverables", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Link Referensi Visual (Opsional)</label>
          <input
            type="url"
            placeholder="Link Pinterest / Google Drive"
            className="w-full bg-stone-50 border border-stone-200 rounded-none px-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            value={details.referenceUrl || ""}
            onChange={(e) => handleDetailChange("referenceUrl", e.target.value)}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#27213D]/40 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-none border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200/60 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-black tracking-tight text-[#1E1B2E]">
              {targetType === "STUDIO" ? "Sewa Ruang Studio" : "Sewa Jasa Profesional (Direct Hire)"}
            </h2>
            <p className="text-xs text-stone-500 mt-1">Penugasan komersial langsung untuk {targetName}</p>
          </div>
          <button onClick={handleClose} className="p-2 text-stone-400 hover:text-[#1E1B2E] hover:bg-stone-100 rounded-none transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Professional Assurance Banner */}
        <div className="bg-emerald-50/80 border-b border-emerald-200/60 px-6 py-2.5 text-xs text-emerald-950 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-[11px] text-emerald-900 font-medium">
            Penawaran proyek kerja resmi &amp; sewa langsung melalui ekosistem <strong>RAMU Verified</strong>.
          </span>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-none bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-fade-in">
              {errorMessage}
            </div>
          )}

          {isSuccess ? (
            <div className="flex flex-col items-center justify-center text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-none flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1E1B2E] mb-2">Permintaan Terkirim!</h3>
                <p className="text-sm text-stone-500 max-w-xs mx-auto">
                  {targetName} akan menerima notifikasi booking Anda. Anda dapat memantau statusnya di Dashboard.
                </p>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href="/dashboard/bookings"
                  onClick={handleClose}
                  className="w-full sm:w-auto px-6 py-3 bg-[#1E1B2E] text-white rounded-none text-xs uppercase tracking-wider font-bold hover:bg-black transition-colors inline-flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Pantau Status di Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={handleClose}
                  className="w-full sm:w-auto px-6 py-3 bg-stone-100 text-stone-700 rounded-none text-xs uppercase tracking-wider font-bold hover:bg-stone-200 transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          ) : (
            <form id="booking-form" onSubmit={handleSubmit} className="space-y-6">
              
              {/* Common Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Mulai *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="date"
                      required
                      min={todayStr}
                      className="w-full bg-stone-50 border border-stone-200 rounded-none pl-10 pr-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Selesai (Opsional)</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="date"
                      min={startDate || todayStr}
                      className="w-full bg-stone-50 border border-stone-200 rounded-none pl-10 pr-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Penawaran Budget (Opsional)</label>
                <input
                  type="text"
                  placeholder="Misal: Rp 5.000.000 atau Rate Standar"
                  className="w-full bg-stone-50 border border-stone-200 rounded-none px-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>

              <hr className="border-stone-100" />
              
              {/* Dynamic Polymorphic Fields */}
              {renderDynamicFields()}

              {/* Ringkasan Kesepakatan & Proteksi RAMU */}
              <div className="p-4 sm:p-5 rounded-none bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-stone-50 border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-[#1E1B2E] uppercase tracking-wider">
                      Kesepakatan &amp; Proteksi Kerja RAMU
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-none bg-amber-200 text-amber-900 uppercase">
                    Standar Industri
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-stone-600 pt-1">
                  <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-none border border-stone-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#1E1B2E] block">DP {effectiveTerms.dpPercentage}% Kunci Jadwal</span>
                      <span className="text-[11px] text-stone-500 leading-tight">Jadwal resmi diikat setelah DP; pembatalan mendadak H-3 DP tidak dapat ditarik kembali.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-none border border-stone-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#1E1B2E] block">Batas {effectiveTerms.maxRevisions}x Revisi Minor</span>
                      <span className="text-[11px] text-stone-500 leading-tight">Penyesuaian tone/warna; ganti konsep total di luar brief dikenakan addendum baru.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-none border border-stone-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#1E1B2E] block">Shift {effectiveTerms.shiftHours} Jam &amp; Lembur</span>
                      <span className="text-[11px] text-stone-500 leading-tight">Overtime {effectiveTerms.overtimeRate} setelah toleransi {effectiveTerms.gracePeriodMinutes} menit.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-none border border-stone-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#1E1B2E] block">🛡️ Garansi Klien 100% Anti No-Show</span>
                      <span className="text-[11px] text-stone-500 leading-tight">Uang DP 100% dikembalikan jika talenta mangkir/tidak hadir di lokasi.</span>
                    </div>
                  </div>
                </div>

                {/* Role Specific Highlight if any */}
                {effectiveTerms.roleSpecifics.wardrobeRestrictions && (
                  <p className="text-[11px] text-stone-600 bg-white/80 p-2.5 rounded-none border border-amber-100">
                    👗 <strong>Batasan Busana:</strong> {effectiveTerms.roleSpecifics.wardrobeRestrictions}
                  </p>
                )}
                {effectiveTerms.roleSpecifics.maxHeadsIncluded && (
                  <p className="text-[11px] text-stone-600 bg-white/80 p-2.5 rounded-none border border-amber-100">
                    💄 <strong>Lingkup Rias:</strong> Maksimal {effectiveTerms.roleSpecifics.maxHeadsIncluded} orang (orang tambahan: {effectiveTerms.roleSpecifics.extraHeadFee || "biaya terpisah"}).
                  </p>
                )}
                {effectiveTerms.roleSpecifics.maxCrewCapacity && (
                  <p className="text-[11px] text-stone-600 bg-white/80 p-2.5 rounded-none border border-amber-100">
                    🏛️ <strong>Kapasitas Studio:</strong> Maksimal {effectiveTerms.roleSpecifics.maxCrewCapacity} orang di dalam area studio.
                  </p>
                )}

                {/* Mandatory Checkbox */}
                <div className="pt-2 border-t border-amber-200/60 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="agreedToTerms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    required
                    className="w-4 h-4 rounded-none text-[#1E1B2E] border-stone-300 focus:ring-[#1E1B2E] mt-0.5 cursor-pointer"
                  />
                  <label htmlFor="agreedToTerms" className="text-xs font-bold text-[#1E1B2E] cursor-pointer leading-relaxed">
                    Saya menyetujui Ketentuan Kerja Profesional RAMU di atas dan memahami komitmen DP 50%, batas revisi, serta Garansi Anti No-Show.
                  </label>
                </div>
              </div>

            </form>
          )}
        </div>

        {/* Footer */}
        {!isSuccess && (
          <div className="px-6 py-4 border-t border-stone-200/60 bg-stone-50/50 flex justify-end shrink-0 gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-6 py-3 rounded-none text-xs uppercase tracking-wider font-bold text-stone-600 hover:text-[#1E1B2E] hover:bg-stone-200/50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              form="booking-form"
              disabled={isLoading || !agreedToTerms}
              className="px-8 py-3 bg-[#1E1B2E] hover:bg-black text-white rounded-none text-xs uppercase tracking-wider font-bold transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                "Kirim Permintaan"
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
