"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, Calendar, Loader2, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import { createBookingRequest } from "@/app/api/bookings/actions";
import {
  TermsAndConditionsConfig,
  getDefaultTerms,
  UsageRightsScope,
  UsageRightsDuration,
  PaymentMilestoneScheme,
  getUsageScopeLabel,
  getUsageDurationLabel,
  getMilestoneSchemeLabel,
} from "@/components/settings/RatesForm";

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

  const [selectedUsageScope, setSelectedUsageScope] = useState<UsageRightsScope>(
    effectiveTerms.usageRightsScope || "ORGANIC_SOCIAL"
  );
  const [selectedUsageDuration, setSelectedUsageDuration] = useState<UsageRightsDuration>(
    effectiveTerms.usageRightsDuration || "1_YEAR"
  );
  const [selectedMilestoneScheme, setSelectedMilestoneScheme] = useState<PaymentMilestoneScheme>(
    effectiveTerms.paymentMilestoneScheme || "50_50_WATERMARK"
  );

  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");

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
        usageRightsScope: selectedUsageScope,
        usageRightsDuration: selectedUsageDuration,
        extraRevisionFee: effectiveTerms.extraRevisionFee || "Rp 100.000 / foto tambahan",
        paymentMilestoneScheme: selectedMilestoneScheme,
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

  const renderDynamicFields = () => {

    const sectorLower = targetSector.toLowerCase();
    const isStudio = targetType === "STUDIO" || sectorLower.includes("studio");
    const isModel = !isStudio && (sectorLower.includes("model") || sectorLower.includes("talent"));
    const isDesigner = !isStudio && !isModel && (sectorLower.includes("design") || sectorLower.includes("fashion") || sectorLower.includes("busana"));
    const isStylist = !isStudio && !isModel && !isDesigner && (sectorLower.includes("stylist") || sectorLower.includes("wardrobe"));
    const isMua = !isStudio && !isModel && !isDesigner && !isStylist && (sectorLower.includes("mua") || sectorLower.includes("makeup") || sectorLower.includes("hair"));
    const isVideographer = !isStudio && !isModel && !isDesigner && !isStylist && !isMua && (sectorLower.includes("video") || sectorLower.includes("film") || sectorLower.includes("cinema"));

    if (isStudio) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Tipe Ruangan / Set Studio</label>
            <input
              type="text"
              placeholder="Misal: Studio A (Cyclorama), Set Ruang Tamu, Podcast Room"
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-none px-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              value={details.roomType || ""}
              onChange={(e) => handleDetailChange("roomType", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Perkiraan Jumlah Kru &amp; Talent</label>
            <input
              type="text"
              placeholder="Misal: 8 Orang (Kapasitas maks studio: 10-15 orang)"
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-none px-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              value={details.crewCount || ""}
              onChange={(e) => handleDetailChange("crewCount", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Kebutuhan Tambahan / Add-ons</label>
            <input
              type="text"
              placeholder="Misal: Tambahan Lampu Godox/Profoto, Seamless Paper warna beige"
              className="w-full bg-stone-50 border border-stone-200 rounded-none px-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              value={details.addons || ""}
              onChange={(e) => handleDetailChange("addons", e.target.value)}
            />
          </div>
        </div>
      );
    }

    if (isModel) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Konsep Busana &amp; Karakter</label>
            <input
              type="text"
              placeholder="Misal: Editorial Avant-Garde, Casual Modest / Hijab"
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-none px-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              value={details.role || ""}
              onChange={(e) => handleDetailChange("role", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Lokasi Sesi &amp; Pendamping</label>
            <input
              type="text"
              placeholder="Misal: Studio A Jakarta Selatan, Talenta didampingi 1 orang"
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-none px-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              value={details.location || ""}
              onChange={(e) => handleDetailChange("location", e.target.value)}
            />
          </div>
        </div>
      );
    }

    if (isDesigner) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Jumlah Look / Busana yang Dipesan / Dipinjam</label>
            <input
              type="text"
              placeholder="Misal: 5 Look Koleksi Raya 2026, 2 Gaun Utama"
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-none px-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              value={details.lookCount || ""}
              onChange={(e) => handleDetailChange("lookCount", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Jadwal Fitting &amp; Penyerahan Busana</label>
            <input
              type="text"
              placeholder="Misal: Fitting H-1 di Studio Desainer, Pengambilan mandiri oleh tim"
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-none px-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              value={details.fittingSchedule || ""}
              onChange={(e) => handleDetailChange("fittingSchedule", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Link Moodboard / Konsep Kampanye</label>
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
    }

    if (isStylist) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Jumlah Look &amp; Arahan Gaya (Styling Direction)</label>
            <input
              type="text"
              placeholder="Misal: 8 Look Katalog, Konsep Streetwear Luxury &amp; Aksesoris"
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-none px-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              value={details.stylingLooks || ""}
              onChange={(e) => handleDetailChange("stylingLooks", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Sumber Busana / Wardrobe Source</label>
            <input
              type="text"
              placeholder="Misal: Peminjaman Desainer (Pulling) &amp; Wardrobe Klien"
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-none px-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              value={details.wardrobeSource || ""}
              onChange={(e) => handleDetailChange("wardrobeSource", e.target.value)}
            />
          </div>
        </div>
      );
    }

    if (isMua) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Jumlah Orang yang Dirias (Heads) &amp; Gaya Rias</label>
            <input
              type="text"
              placeholder="Misal: 2 Model (Gaya: Natural Clean &amp; Editorial Bold Hair)"
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-none px-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              value={details.muaHeads || ""}
              onChange={(e) => handleDetailChange("muaHeads", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Waktu Call Time / Mulai Persiapan Rias</label>
            <input
              type="text"
              placeholder="Misal: 07:00 WIB (Sesi foto mulai 09:00 WIB)"
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-none px-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              value={details.prepTime || ""}
              onChange={(e) => handleDetailChange("prepTime", e.target.value)}
            />
          </div>
        </div>
      );
    }

    if (isVideographer) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Format Luaran Video Utama</label>
            <input
              type="text"
              placeholder="Misal: 2x Reels 9:16 Vertikal (30 detik) &amp; 1x Teaser 16:9"
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-none px-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              value={details.videoFormats || ""}
              onChange={(e) => handleDetailChange("videoFormats", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Lokasi &amp; Kebutuhan Audio/Lighting</label>
            <input
              type="text"
              placeholder="Misal: Studio Indoor Jakarta, Butuh Mic Lavalier Wireless"
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-none px-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              value={details.location || ""}
              onChange={(e) => handleDetailChange("location", e.target.value)}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Lokasi Sesi Pemotretan</label>
          <input
            type="text"
            placeholder="Misal: Studio Indoor, Lokasi Outdoor Jakarta Selatan"
            required
            className="w-full bg-stone-50 border border-stone-200 rounded-none px-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            value={details.location || ""}
            onChange={(e) => handleDetailChange("location", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Output yang Diharapkan (Deliverables)</label>
          <textarea
            placeholder="Misal: 25 Foto Edit High-Res, 5 Foto Retouch Beauty, Semua Foto Kurasi (JPG)"
            required
            rows={2}
            className="w-full bg-stone-50 border border-stone-200 rounded-none px-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
            value={details.deliverables || ""}
            onChange={(e) => handleDetailChange("deliverables", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Link Referensi Moodboard (Opsional)</label>
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

      <div className="absolute inset-0 bg-[#27213D]/40 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-lg bg-white rounded-none border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

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

        <div className="bg-emerald-50/80 border-b border-emerald-200/60 px-6 py-2.5 text-xs text-emerald-950 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-[11px] text-emerald-900 font-medium">
            Penawaran proyek kerja resmi &amp; sewa langsung melalui ekosistem <strong>RAMU Verified</strong>.
          </span>
        </div>

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

              {renderDynamicFields()}

              <div className="p-4 sm:p-5 rounded-none bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-stone-50 border border-amber-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-[#1E1B2E] uppercase tracking-wider">
                      Kesepakatan &amp; Proteksi Kerja RAMU
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-none bg-amber-200 text-amber-900 uppercase">
                    Standar Industri Indonesia
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="bg-white/90 p-3 rounded-none border border-stone-200/80 space-y-2">
                    <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">
                      1. Ruang Lingkup Lisensi &amp; Durasi Hak Pakai (Usage Rights)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <span className="text-[9px] text-stone-400 font-semibold block mb-0.5">Media Penayangan</span>
                        <select
                          value={selectedUsageScope}
                          onChange={(e) => setSelectedUsageScope(e.target.value as any)}
                          className="w-full bg-stone-50 border border-stone-200 text-xs font-bold text-[#1E1B2E] px-2.5 py-1.5 focus:border-[#1E1B2E]"
                        >
                          <option value="ORGANIC_SOCIAL">Medsos Organik &amp; Web Portofolio</option>
                          <option value="PAID_ADS_DIGITAL">Iklan Berbayar Digital (+Ads)</option>
                          <option value="COMMERCIAL_OOH">Komersial Cetak &amp; Luar Ruang (Billboard)</option>
                          <option value="FULL_BUYOUT">Full Buyout (All Media Selamanya)</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-[9px] text-stone-400 font-semibold block mb-0.5">Masa Berlaku</span>
                        <select
                          value={selectedUsageDuration}
                          onChange={(e) => setSelectedUsageDuration(e.target.value as any)}
                          className="w-full bg-stone-50 border border-stone-200 text-xs font-bold text-[#1E1B2E] px-2.5 py-1.5 focus:border-[#1E1B2E]"
                        >
                          <option value="6_MONTHS">6 Bulan (Musiman / Seasonal)</option>
                          <option value="1_YEAR">1 Tahun (Standar Industri)</option>
                          <option value="2_YEARS">2 Tahun</option>
                          <option value="PERPETUAL">Selamanya / Perpetual</option>
                        </select>
                      </div>
                    </div>
                    <p className="text-[10px] text-stone-500 leading-tight">
                      Penayangan di luar lingkup ini tanpa izin tertulis dikenakan denda lisensi komersial (Extended License).
                    </p>
                  </div>

                  <div className="bg-white/90 p-3 rounded-none border border-stone-200/80 space-y-2">
                    <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">
                      2. Skema &amp; Termin Pembayaran Bertahap
                    </label>
                    <select
                      value={selectedMilestoneScheme}
                      onChange={(e) => setSelectedMilestoneScheme(e.target.value as any)}
                      className="w-full bg-stone-50 border border-stone-200 text-xs font-bold text-[#1E1B2E] px-2.5 py-1.5 focus:border-[#1E1B2E]"
                    >
                      <option value="50_50_WATERMARK">DP 50% Kunci Jadwal + Pelunasan 50% (Watermark Protected)</option>
                      <option value="30_40_30">Termin 30% Booking - 40% On-Set - 30% Final File</option>
                      <option value="100_ESCROW">100% Ditampung Aman di Rekening Escrow RAMU</option>
                    </select>
                    <p className="text-[10px] text-stone-500 leading-tight">
                      {getMilestoneSchemeLabel(selectedMilestoneScheme, effectiveTerms.dpPercentage).desc}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-stone-600">
                    <div className="flex items-start gap-2 bg-white/90 p-2.5 rounded-none border border-stone-200/80">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#1E1B2E] block">Batas {effectiveTerms.maxRevisions}x Revisi Minor</span>
                        <span className="text-[10px] text-stone-500 leading-tight">
                          Revisi ekstra: {effectiveTerms.extraRevisionFee || "Rp 100.000 / foto"}. Ganti konsep total = SPK baru.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 bg-white/90 p-2.5 rounded-none border border-stone-200/80">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#1E1B2E] block">Shift {effectiveTerms.shiftHours} Jam &amp; Lembur</span>
                        <span className="text-[10px] text-stone-500 leading-tight">
                          Overtime {effectiveTerms.overtimeRate} setelah toleransi {effectiveTerms.gracePeriodMinutes} menit.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

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
                    Saya menyetujui Ketentuan Kerja Profesional RAMU di atas: batasan hak pakai ({getUsageScopeLabel(selectedUsageScope).split(" (")[0]}), termin pembayaran bertahap, batas revisi, serta Garansi Anti No-Show.
                  </label>
                </div>
              </div>

            </form>
          )}
        </div>

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
