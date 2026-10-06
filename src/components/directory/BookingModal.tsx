"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X, Calendar, Loader2, CheckCircle2, ArrowRight, ShieldCheck, Clock, Sparkles, Building2 } from "lucide-react";
import { createBookingRequest } from "@/app/api/bookings/actions";
import {
  ServicePackage,
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
  selectedPackage?: ServicePackage | null;
}

export function BookingModal({
  isOpen,
  onClose,
  targetId,
  targetName,
  targetSector,
  targetType,
  termsConfig,
  selectedPackage,
}: BookingModalProps) {
  const [mounted, setMounted] = useState(false);
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

  const sectorLower = targetSector.toLowerCase();
  const isBrand =
    targetType === "BRAND" ||
    (targetType as string) === "MSME" ||
    targetType === "COLLECTIVE" ||
    sectorLower.includes("brand") ||
    sectorLower.includes("label") ||
    sectorLower.includes("umkm");
  const isStudio = !isBrand && (targetType === "STUDIO" || sectorLower.includes("studio"));
  const isModel = !isBrand && !isStudio && (sectorLower.includes("model") || sectorLower.includes("talent"));
  const isDesigner = !isBrand && !isStudio && !isModel && (sectorLower.includes("design") || sectorLower.includes("fashion") || sectorLower.includes("busana"));
  const isStylist = !isBrand && !isStudio && !isModel && !isDesigner && (sectorLower.includes("stylist") || sectorLower.includes("wardrobe"));
  const isMua = !isBrand && !isStudio && !isModel && !isDesigner && !isStylist && (sectorLower.includes("mua") || sectorLower.includes("makeup") || sectorLower.includes("hair"));
  const isVideographer = !isBrand && !isStudio && !isModel && !isDesigner && !isStylist && !isMua && (sectorLower.includes("video") || sectorLower.includes("film") || sectorLower.includes("cinema"));

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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (selectedPackage) {
        if (selectedPackage.price) {
          setBudget(selectedPackage.price);
        }
        setDetails((prev) => ({
          ...prev,
          selectedPackageTitle: selectedPackage.title,
          selectedPackageTier: selectedPackage.tier || "CAMPAIGN",
          selectedPackageUnit: selectedPackage.unit,
          selectedPackageScope: selectedPackage.deliverablesSummary || selectedPackage.subtitle,
        }));
      }
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, selectedPackage]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  function handleDetailChange(key: string, value: string) {
    setDetails((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const detailsPayload: Record<string, any> = {
      ...details,
      initiatorType: "CREATIVE_COLLABORATOR",
      agreedTerms: isBrand
        ? {
            partnershipModel: details.collaborationType || "CAMPAIGN_PRODUCTION",
            initiatorRole: details.initiatorRole || "Kreator Kolaborator",
            conceptSummary: details.conceptSummary || "",
            deckUrl: details.deckUrl || "",
            ndaAgreed: true,
            coCreditsAgreed: true,
            sampleCareAgreed: true,
            clientAgreedAt: new Date().toISOString(),
          }
        : {
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
    if (isBrand) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
              Peran Anda / Tim Pengaju *
            </label>
            <input
              type="text"
              placeholder="Misal: Lead Photographer & Creative Director / Fashion Stylist / Model"
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              value={details.initiatorRole || ""}
              onChange={(e) => handleDetailChange("initiatorRole", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
              Bentuk Sinergi / Model Kerjasama *
            </label>
            <select
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
              value={details.collaborationType || "CAMPAIGN_PRODUCTION"}
              onChange={(e) => handleDetailChange("collaborationType", e.target.value)}
            >
              <option value="CAMPAIGN_PRODUCTION">Produksi Kampanye Lookbook Koleksi Baru</option>
              <option value="BARTER_SEEDING">Barter / Product Seeding & Endorsement</option>
              <option value="CO_BRANDING">Kolaborasi Koleksi Kapsul (Co-Branding)</option>
              <option value="SPONSORSHIP">Sponsorship Event / Fashion Show / Editorial</option>
              <option value="CUSTOM_BRIEF">Brief Kemitraan Khusus</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
              Ringkasan Konsep &amp; Nilai Tambah bagi Brand *
            </label>
            <textarea
              placeholder="Jelaskan secara singkat ide konsep visual, target audiens, dan keuntungan sinergi ini bagi brand..."
              required
              rows={3}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              value={details.conceptSummary || ""}
              onChange={(e) => handleDetailChange("conceptSummary", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
              Tautan Pitch Deck / Moodboard / Portofolio (Opsional)
            </label>
            <input
              type="text"
              placeholder="Link Google Drive, Pinterest, atau Behance"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              value={details.deckUrl || ""}
              onChange={(e) => handleDetailChange("deckUrl", e.target.value)}
            />
          </div>
        </div>
      );
    }

    if (isStudio) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Tipe Ruangan / Set Studio</label>
            <input
              type="text"
              placeholder="Misal: Studio A (Cyclorama), Set Ruang Tamu, Podcast Room"
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              value={details.crewCount || ""}
              onChange={(e) => handleDetailChange("crewCount", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Kebutuhan Tambahan / Add-ons</label>
            <input
              type="text"
              placeholder="Misal: Tambahan Lampu Godox/Profoto, Seamless Paper warna beige"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              value={details.fittingSchedule || ""}
              onChange={(e) => handleDetailChange("fittingSchedule", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Link Moodboard / Konsep Kampanye</label>
            <input
              type="url"
              placeholder="Link Pinterest / Google Drive"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
            value={details.deliverables || ""}
            onChange={(e) => handleDetailChange("deliverables", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Link Referensi Moodboard (Opsional)</label>
          <input
            type="url"
            placeholder="Link Pinterest / Google Drive"
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            value={details.referenceUrl || ""}
            onChange={(e) => handleDetailChange("referenceUrl", e.target.value)}
          />
        </div>
      </div>
    );
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 bg-stone-950/80 backdrop-blur-xs animate-in fade-in duration-150 overflow-hidden"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-5xl xl:max-w-6xl bg-white rounded-xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[92vh] my-auto animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >

        {/* MODAL HEADER */}
        <div className="px-6 sm:px-8 py-4 bg-stone-900 border-b border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
                  {isBrand
                    ? `Ajukan Pitch Kolaborasi ke ${targetName}`
                    : selectedPackage
                    ? `Alokasi Resource: ${selectedPackage.title}`
                    : `Inisiasi Kolaborasi & Resource — ${targetName}`}
                </h2>
                {selectedPackage?.tier && (
                  <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-amber-400 text-stone-950 rounded shrink-0">
                    {selectedPackage.tier} SCOPE
                  </span>
                )}
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-white/10 text-stone-200 border border-white/10 shrink-0">
                  {targetSector}
                </span>
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> RAMU Verified
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5 truncate">
                {isBrand
                  ? `Pengajuan proposal kemitraan & sinergi kreatif resmi untuk ${targetName}`
                  : selectedPackage
                  ? `Sertakan kapasitas terstandarisasi milik ${targetName} ke dalam proyek kolaboratif`
                  : `Padukan resource komplementer dan penerbitan SPK multi-pihak melalui ekosistem RAMU`}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-white/10 transition-colors rounded-xl cursor-pointer shrink-0 ml-4"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">
                {isBrand ? "Proposal Kolaborasi Terkirim!" : "Permintaan Alokasi Resource Terkirim!"}
              </h3>
              <p className="text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
                {isBrand
                  ? `Tim ${targetName} akan meninjau proposal Anda. Anda dapat memantau status responnya di Dashboard.`
                  : `${targetName} akan menerima notifikasi alokasi resource Anda. Anda dapat memantau statusnya di Dashboard.`}
              </p>
            </div>

            {/* 3-Step Workflow Guidance */}
            <div className="w-full max-w-md bg-stone-50 rounded-2xl border border-stone-200/90 p-4 text-left space-y-3 mt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                Apa Langkah Selanjutnya? (Alur Terpadu RAMU)
              </span>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <span className="font-bold text-stone-900 block">Konfirmasi Ketersediaan Jadwal</span>
                    <p className="text-[11px] text-stone-500">Kreator merespon brief Anda dalam waktu maksimal 24 jam.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <span className="font-bold text-stone-900 block">Penyelarasan SPK Bersama</span>
                    <p className="text-[11px] text-stone-500">Detail brief teknis, call-time, dan lisensi difinalisasi di Workspace Proyek.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <span className="font-bold text-stone-900 block">Produksi &amp; Escrow Aman</span>
                    <p className="text-[11px] text-stone-500">Dana diamankan di akun bersama dan dicairkan bertahap sesuai milestone terverifikasi.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/dashboard/bookings"
                onClick={handleClose}
                className="w-full sm:w-auto px-6 py-3 bg-stone-900 text-white rounded-xl text-xs uppercase tracking-wider font-bold hover:bg-black transition-colors inline-flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Pantau Status di Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={handleClose}
                className="w-full sm:w-auto px-6 py-3 bg-stone-100 text-stone-700 rounded-xl text-xs uppercase tracking-wider font-bold hover:bg-stone-200 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
            {/* SISI KIRI: Konteks & Ringkasan Ketentuan */}
            <div className="w-full lg:w-5/12 bg-stone-50 border-b lg:border-b-0 lg:border-r border-stone-200 p-6 sm:p-7 overflow-y-auto space-y-5">
              {/* Kartu Profil Sasaran */}
              <div className="p-5 bg-white border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    {isBrand ? "Entitas Sasaran" : "Mitra Resource Kolaborasi"}
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Terverifikasi
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">{targetName}</h3>
                  <p className="text-xs text-stone-500 font-medium">{targetSector}</p>
                </div>

                {!isBrand && (
                  <div className="pt-3 border-t border-stone-100 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-stone-50 border border-stone-200/60 space-y-0.5">
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Durasi Shift</span>
                      <span className="font-bold text-stone-900">{effectiveTerms.shiftHours} Jam Kerja</span>
                    </div>
                    <div className="p-2.5 bg-stone-50 border border-stone-200/60 space-y-0.5">
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Batas Revisi</span>
                      <span className="font-bold text-stone-900">{effectiveTerms.maxRevisions}x Minor</span>
                    </div>
                  </div>
                )}
              </div>

              {/* JIKA MEMILIH PAKET: KARTU SCOPE TERSTRUKTUR */}
              {selectedPackage && (
                <div className="p-5 bg-white border border-stone-900 ring-1 ring-stone-900/10 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                        Baseline Scope Terpilih
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-stone-100 text-stone-800">
                      {selectedPackage.tier || "Paket Acuan"}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-stone-900">{selectedPackage.title}</h4>
                    <p className="text-xs text-stone-500 mt-0.5 leading-snug">{selectedPackage.subtitle}</p>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70 space-y-1">
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      Listed Anchor Rate
                    </div>
                    <div className="text-lg font-black text-emerald-800">
                      {selectedPackage.price} <span className="text-xs font-normal text-stone-500">/ {selectedPackage.unit}</span>
                    </div>
                  </div>

                  {/* 4 Pilar Scope Rinci */}
                  <div className="space-y-2 text-xs pt-1 border-t border-stone-100">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">⏱️ 1. Kapasitas Waktu:</span>
                      <span className="font-semibold text-stone-800 block pl-3">
                        {selectedPackage.capacityDuration || `${effectiveTerms.shiftHours} Jam Kerja Sesi`}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">📦 2. Deliverables Utama:</span>
                      <span className="font-semibold text-stone-800 block pl-3">
                        {selectedPackage.deliverablesSummary || selectedPackage.features?.[0] || "Sesuai rincian paket terdaftar"}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">⚖️ 3. Hak Siar / Lisensi IP:</span>
                      <span className="font-semibold text-stone-800 block pl-3">
                        {selectedPackage.usageRights || getUsageScopeLabel(selectedUsageScope)}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">🛠️ 4. Alat &amp; Fasilitas:</span>
                      <span className="font-semibold text-stone-800 block pl-3">
                        {selectedPackage.equipmentIncluded || "Peralatan standar siap pakai on-set"}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-snug">
                    <strong>Catatan Kolaborasi:</strong> Scope di atas adalah patokan awal (anchor). Anda dapat menyesuaikan penambahan foto, shift, atau lisensi pada kolom brief di sebelah kanan.
                  </div>
                </div>
              )}

              {/* Jaminan Proteksi RAMU */}
              <div className="p-5 bg-white border border-stone-200 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                    Jaminan Transaksi &amp; SPK Sah
                  </h4>
                </div>
                <ul className="space-y-2.5 text-xs text-stone-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Perlindungan Hak Cipta:</strong> Menjamin atribusi resmi karya dan proteksi dari klaim tidak sah.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Kerahasiaan Produk (NDA):</strong> Sampel belum rilis dan aset produksi dilindungi kerahasiaannya.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Garansi Anti No-Show:</strong> Komitmen kehadiran terikat dalam SPK resmi sistem RAMU.</span>
                  </li>
                </ul>
              </div>

              {/* Hint Kru Lengkap */}
              {!isBrand && (
                <div className="p-4 bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>Butuh Kru Lengkap Sekaligus?</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed font-light">
                    Jika proyek Anda membutuhkan Fotografer, Model, dan Studio sekaligus, lebih praktis gunakan <strong>Brief Proyek Tim</strong> agar seluruh kru langsung terkoordinasi dalam satu workspace.
                  </p>
                  <Link
                    href="/projects/new"
                    onClick={handleClose}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 hover:text-black underline mt-1"
                  >
                    <span>Buka Brief Proyek Baru</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>

            {/* SISI KANAN: Formulir Pengisian Data */}
            <div className="w-full lg:w-7/12 p-6 sm:p-8 overflow-y-auto bg-white flex flex-col justify-between">
              <div>
                {errorMessage && (
                  <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-fade-in">
                    {errorMessage}
                  </div>
                )}

                <form id="booking-form" onSubmit={handleSubmit} className="space-y-6">

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                        {isBrand ? "Target Mulai *" : "Mulai *"}
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="date"
                          required
                          min={todayStr}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                        {isBrand ? "Target Rilis (Opsional)" : "Selesai (Opsional)"}
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="date"
                          min={startDate || todayStr}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                      {isBrand ? "Estimasi Anggaran / Nilai Kerjasama (Opsional)" : "Penawaran Budget (Opsional)"}
                    </label>
                    <input
                      type="text"
                      placeholder={isBrand ? "Misal: Barter Produk / Rp 5.000.000 / Terbuka Negosiasi" : "Misal: Rp 5.000.000 atau Rate Standar"}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                    />
                  </div>

                  <hr className="border-stone-100" />

                  {renderDynamicFields()}

                  {isBrand ? (
                    <div className="p-4 sm:p-5 rounded-xl bg-stone-50 border border-stone-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                            Persetujuan Kerjasama Brand
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-xl bg-stone-200 text-stone-800 uppercase">
                          Brand Partnership
                        </span>
                      </div>

                      <div className="pt-2 border-t border-stone-200 flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          id="agreedToTerms"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          required
                          className="w-4 h-4 rounded-xl text-stone-900 border-stone-300 focus:ring-[#1E1B2E] mt-0.5 cursor-pointer"
                        />
                        <label htmlFor="agreedToTerms" className="text-xs font-bold text-stone-900 cursor-pointer leading-relaxed">
                          Saya menyetujui Kode Etik Kolaborasi RAMU: menjaga kerahasiaan produk belum rilis, menghormati hak cipta bersama, dan menjaga integritas sampel busana.
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 sm:p-5 rounded-xl bg-stone-50 border border-stone-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                            Ketentuan Hak Pakai &amp; Pembayaran
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-xl bg-stone-200 text-stone-800 uppercase">
                          Standar RAMU
                        </span>
                      </div>

                      <div className="space-y-3 pt-1">
                        <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-2">
                          <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">
                            1. Ruang Lingkup Lisensi &amp; Durasi Hak Pakai (Usage Rights)
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <span className="text-[9px] text-stone-400 font-semibold block mb-0.5">Media Penayangan</span>
                              <select
                                value={selectedUsageScope}
                                onChange={(e) => setSelectedUsageScope(e.target.value as any)}
                                className="w-full bg-stone-50 border border-stone-200 text-xs font-bold text-stone-900 px-2.5 py-1.5 focus:border-stone-900"
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
                                className="w-full bg-stone-50 border border-stone-200 text-xs font-bold text-stone-900 px-2.5 py-1.5 focus:border-stone-900"
                              >
                                <option value="6_MONTHS">6 Bulan (Musiman / Seasonal)</option>
                                <option value="1_YEAR">1 Tahun (Standar Industri)</option>
                                <option value="2_YEARS">2 Tahun</option>
                                <option value="PERPETUAL">Selamanya / Perpetual</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-2">
                          <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">
                            2. Skema &amp; Termin Pembayaran Bertahap
                          </label>
                          <select
                            value={selectedMilestoneScheme}
                            onChange={(e) => setSelectedMilestoneScheme(e.target.value as any)}
                            className="w-full bg-stone-50 border border-stone-200 text-xs font-bold text-stone-900 px-2.5 py-1.5 focus:border-stone-900"
                          >
                            <option value="50_50_WATERMARK">DP 50% Kunci Jadwal + Pelunasan 50% (Watermark Protected)</option>
                            <option value="30_40_30">Termin 30% Booking - 40% On-Set - 30% Final File</option>
                            <option value="100_UPFRONT">100% Pembayaran di Awal (Full Upfront Settlement)</option>
                          </select>
                          <p className="text-[10px] text-stone-500 leading-tight">
                            {getMilestoneSchemeLabel(selectedMilestoneScheme, effectiveTerms.dpPercentage).desc}
                          </p>
                        </div>
                      </div>

                      {effectiveTerms.roleSpecifics.wardrobeRestrictions && (
                        <p className="text-[11px] text-stone-600 bg-white p-2.5 rounded-xl border border-stone-200">
                          <strong>Batasan Busana:</strong> {effectiveTerms.roleSpecifics.wardrobeRestrictions}
                        </p>
                      )}
                      {effectiveTerms.roleSpecifics.maxHeadsIncluded && (
                        <p className="text-[11px] text-stone-600 bg-white p-2.5 rounded-xl border border-stone-200">
                          <strong>Lingkup Rias:</strong> Maksimal {effectiveTerms.roleSpecifics.maxHeadsIncluded} orang (orang tambahan: {effectiveTerms.roleSpecifics.extraHeadFee || "biaya terpisah"}).
                        </p>
                      )}
                      {effectiveTerms.roleSpecifics.maxCrewCapacity && (
                        <p className="text-[11px] text-stone-600 bg-white p-2.5 rounded-xl border border-stone-200">
                          <strong>Kapasitas Studio:</strong> Maksimal {effectiveTerms.roleSpecifics.maxCrewCapacity} orang di dalam area studio.
                        </p>
                      )}

                      <div className="pt-2 border-t border-stone-200 flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          id="agreedToTerms"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          required
                          className="w-4 h-4 rounded-xl text-stone-900 border-stone-300 focus:ring-[#1E1B2E] mt-0.5 cursor-pointer"
                        />
                        <label htmlFor="agreedToTerms" className="text-xs font-bold text-stone-900 cursor-pointer leading-relaxed">
                          Saya menyetujui Ketentuan Kerja Profesional RAMU di atas: batasan hak pakai ({getUsageScopeLabel(selectedUsageScope).split(" (")[0]}), termin pembayaran bertahap, batas revisi, serta Garansi Anti No-Show.
                        </label>
                      </div>
                    </div>
                  )}

                </form>

                {/* Reassurance Banner */}
                <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-[11px] text-stone-600 flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong className="text-stone-900">Bebas Komitmen Awal:</strong> Pengajuan ini tidak memotong biaya apa pun. SPK resmi dan termin pembayaran baru disepakati bersama di Workspace Proyek.
                  </span>
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="pt-6 mt-6 border-t border-stone-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="px-6 py-3 rounded-xl text-xs uppercase tracking-wider font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="booking-form"
                  disabled={isLoading || !agreedToTerms}
                  className="px-8 py-3 bg-stone-900 hover:bg-black text-white rounded-xl text-xs uppercase tracking-wider font-bold transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Mengirim...
                    </>
                  ) : isBrand ? (
                    "Kirim Proposal Kolaborasi"
                  ) : selectedPackage ? (
                    "Sertakan Resource ke Kolaborasi"
                  ) : (
                    "Ajukan Alokasi Resource"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== "undefined" && mounted
    ? createPortal(modalContent, document.body)
    : null;
}
