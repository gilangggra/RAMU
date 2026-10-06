"use client";

import React, { useState } from "react";
import { updateServicePackagesAndRates } from "@/app/settings/actions";
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import {
  ROLE_PRESETS,
  RoleCategory,
  detectRoleCategory,
  ServicePackage,
  PackageTier,
} from "@/lib/constants/rolePresets";

export type { ServicePackage, PackageTier };

export type UsageRightsScope = "ORGANIC_SOCIAL" | "PAID_ADS_DIGITAL" | "COMMERCIAL_OOH" | "FULL_BUYOUT";
export type UsageRightsDuration = "6_MONTHS" | "1_YEAR" | "2_YEARS" | "PERPETUAL";
export type PaymentMilestoneScheme = "50_50_WATERMARK" | "30_40_30" | "100_UPFRONT";

export function getUsageScopeLabel(scope?: UsageRightsScope): string {
  switch (scope) {
    case "ORGANIC_SOCIAL":
      return "Media Sosial Organik & Website (Instagram, TikTok, Portofolio Brand)";
    case "PAID_ADS_DIGITAL":
      return "Iklan Berbayar Digital (Meta Ads, TikTok Ads, Marketplace Shopee/Tokopedia)";
    case "COMMERCIAL_OOH":
      return "Komersial Cetak & Luar Ruang (Billboard, Baliho, Packaging Toko, Event/Bazaar)";
    case "FULL_BUYOUT":
      return "Hak Pakai Eksklusif Tanpa Batas (Full Buyout All Media Selamanya)";
    default:
      return "Media Sosial Organik & Website (Instagram, TikTok, Portofolio Brand)";
  }
}

export function getUsageDurationLabel(duration?: UsageRightsDuration): string {
  switch (duration) {
    case "6_MONTHS":
      return "6 (Enam) Bulan — Kampanye Musiman";
    case "1_YEAR":
      return "1 (Satu) Tahun — Standar Industri";
    case "2_YEARS":
      return "2 (Dua) Tahun";
    case "PERPETUAL":
      return "Selamanya / Perpetual (Arsip Digital)";
    default:
      return "1 (Satu) Tahun — Standar Industri";
  }
}

export function getMilestoneSchemeLabel(scheme?: PaymentMilestoneScheme, dp: number = 50): { title: string; desc: string } {
  switch (scheme) {
    case "50_50_WATERMARK":
      return {
        title: `DP ${dp}% + Pelunasan ${100 - dp}% (Watermark Protected)`,
        desc: `Tahap I: DP ${dp}% mengunci jadwal kerja. Tahap II: Pelunasan ${100 - dp}% wajib dilunasi setelah preview bertanda-air (watermark) disetujui, sebelum master file resolusi penuh diserahkan.`,
      };
    case "30_40_30":
      return {
        title: "Termin 30% - 40% - 30% (Proyek Produksi Bertahap)",
        desc: "Tahap I: 30% Booking/DP awal. Tahap II: 40% saat produksi selesai on-set. Tahap III: 30% saat penyerahan aset final.",
      };
    case "100_UPFRONT":
      return {
        title: "Full Upfront Settlement (100% Pembayaran di Awal)",
        desc: "Kompensasi diselesaikan 100% di awal sebelum jadwal sesi dimulai sesuai lembar kesepakatan SPK resmi.",
      };
    default:
      return {
        title: `DP ${dp}% + Pelunasan ${100 - dp}% (Watermark Protected)`,
        desc: `Tahap I: DP ${dp}% mengunci jadwal kerja. Tahap II: Pelunasan ${100 - dp}% wajib dilunasi setelah preview bertanda-air (watermark) disetujui, sebelum master file resolusi penuh diserahkan.`,
      };
  }
}

export interface TermsAndConditionsConfig {
  dpPercentage: number;
  maxRevisions: number;
  shiftHours: number;
  overtimeRate: string;
  gracePeriodMinutes: number;
  safeSetCompliant: boolean;
  usageRightsScope?: UsageRightsScope;
  usageRightsDuration?: UsageRightsDuration;
  extraRevisionFee?: string;
  paymentMilestoneScheme?: PaymentMilestoneScheme;
  roleSpecifics: {
    wardrobeRestrictions?: string;
    chaperoneAllowed?: boolean;
    usageRightsPeriod?: string;
    maxHeadsIncluded?: number;
    prepTimeRequired?: string;
    extraHeadFee?: string;
    pullingDepositResponsibility?: string;
    wardrobeDamageResponsibility?: string;
    aspectRatiosIncluded?: string;
    musicLicenseIncluded?: boolean;
    majorRevisionFeeNote?: string;
    maxCrewCapacity?: number;
    cycloramaShoeTapeRequired?: boolean;
    overtimePerBlockFee?: string;
    colorAccuracyCommitment?: boolean;
    rawFilePolicy?: string;
    fittingPolicy?: string;
    dryCleaningResponsibility?: string;
    noAlteringPolicy?: string;
    brandCreditRequired?: boolean;
  };
}

export function getDefaultTerms(sector: string, type: string): TermsAndConditionsConfig {
  const role = detectRoleCategory(sector, type);
  return ROLE_PRESETS[role].defaultTerms;
}

interface RatesFormProps {
  initialStartingRate: string;
  initialTurnaroundTime: string;
  initialPackages: ServicePackage[];
  initialTerms?: TermsAndConditionsConfig | null;
  actorSector: string;
  actorType: string;
  embedded?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RatesForm({
  initialStartingRate,
  initialTurnaroundTime,
  initialPackages,
  initialTerms,
  actorSector,
  actorType,
  embedded = false,
  onSuccess,
  onCancel,
}: RatesFormProps) {
  const detectedRole = detectRoleCategory(actorSector, actorType);
  const [selectedPresetRole, setSelectedPresetRole] = useState<RoleCategory>(detectedRole);

  const [startingRate, setStartingRate] = useState(initialStartingRate);
  const [turnaroundTime, setTurnaroundTime] = useState(initialTurnaroundTime);
  const [packages, setPackages] = useState<ServicePackage[]>(
    initialPackages.length > 0 ? initialPackages : ROLE_PRESETS[detectedRole].packages
  );
  const [terms, setTerms] = useState<TermsAndConditionsConfig>(
    initialTerms || ROLE_PRESETS[detectedRole].defaultTerms
  );

  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showTermsDetails, setShowTermsDetails] = useState(false);

  const currentPreset = ROLE_PRESETS[selectedPresetRole];

  const isModel = selectedPresetRole === "MODEL";
  const isMUA = selectedPresetRole === "MUA";
  const isStylist = selectedPresetRole === "STYLIST";
  const isVideographer = selectedPresetRole === "VIDEOGRAPHER";
  const isStudio = selectedPresetRole === "STUDIO";
  const isDesigner = selectedPresetRole === "DESIGNER";
  const isPhotographer = selectedPresetRole === "PHOTOGRAPHER";

  function handlePackageChange(index: number, field: keyof ServicePackage, value: any) {
    const updated = [...packages];
    updated[index] = { ...updated[index], [field]: value };
    setPackages(updated);
  }

  function handleAddFeature(pkgIndex: number, text: string = "") {
    const updated = [...packages];
    updated[pkgIndex] = {
      ...updated[pkgIndex],
      features: [...(updated[pkgIndex].features || []), text],
    };
    setPackages(updated);
  }

  function handleFeatureChange(pkgIndex: number, featIndex: number, value: string) {
    const updated = [...packages];
    const newFeatures = [...updated[pkgIndex].features];
    newFeatures[featIndex] = value;
    updated[pkgIndex] = { ...updated[pkgIndex], features: newFeatures };
    setPackages(updated);
  }

  function handleRemoveFeature(pkgIndex: number, featIndex: number) {
    const updated = [...packages];
    const newFeatures = updated[pkgIndex].features.filter((_, i) => i !== featIndex);
    updated[pkgIndex] = { ...updated[pkgIndex], features: newFeatures };
    setPackages(updated);
  }

  function handleAddNewPackage() {
    if (packages.length >= 3) return;
    const tier = packages.length === 0 ? "STARTER" : packages.length === 1 ? "CAMPAIGN" : "COMMERCIAL";
    const tierTitle = tier === "STARTER" ? "Paket Starter / Mini" : tier === "CAMPAIGN" ? "Paket Kampanye Standar" : "Paket Komersial Lengkap";
    setPackages([
      ...packages,
      {
        tier,
        title: tierTitle,
        subtitle: "Deskripsi singkat komitmen resource dan spesifikasi output",
        price: "Rp 1.500.000",
        unit: currentPreset.commonUnits[0] || "per 4 jam",
        capacityDuration: "4 Jam (Setengah Shift)",
        deliverablesSummary: "Output terstandar kualitas tinggi",
        usageRights: "Komersial Digital (Sosmed & Web) 1 Tahun",
        equipmentIncluded: "Peralatan utama siap pakai on-set",
        features: ["Deliverable output terstandar kualitas tinggi", "Gratis 1x revisi minor"],
      },
    ]);
  }

  function handleRemovePackage(index: number) {
    setPackages(packages.filter((_, i) => i !== index));
  }

  function handleApplyRolePreset(roleKey: RoleCategory) {
    const preset = ROLE_PRESETS[roleKey];
    setSelectedPresetRole(roleKey);
    setStartingRate(preset.defaultStartingRate);
    setTurnaroundTime(preset.defaultTurnaround);
    setPackages(JSON.parse(JSON.stringify(preset.packages)));
    setTerms(JSON.parse(JSON.stringify(preset.defaultTerms)));
    setMessage({
      type: "success",
      text: `Rekomendasi standar ${preset.name} berhasil diterapkan. Anda dapat langsung menyimpan atau menyesuaikannya.`,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("startingRate", startingRate);
    formData.append("turnaroundTime", turnaroundTime);
    formData.append("packagesJson", JSON.stringify(packages));
    formData.append("termsAndConditionsJson", JSON.stringify(terms));

    const result = await updateServicePackagesAndRates(formData);

    if (result.success) {
      setMessage({ type: "success", text: result.message || "Paket tarif & aturan kerja berhasil disimpan." });
      if (onSuccess) {
        onSuccess();
      }
    } else {
      setMessage({ type: "error", text: result.error || "Gagal menyimpan paket tarif." });
    }

    setIsPending(false);
  }

  return (
    <div
      className={
        embedded
          ? "bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden"
          : "bg-white rounded-3xl border border-stone-200 shadow-[0_8px_30px_rgba(39,33,61,0.04)] overflow-hidden"
      }
    >
      {/* HEADER SECTION */}
      <div className="p-6 sm:p-8 border-b border-stone-100 bg-stone-50/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pengaturan Tarif &amp; Paket Komersial</span>
            </div>
            <h2 className="text-xl font-extrabold text-[#1E1B2E]">Tarif, Paket Layanan &amp; Ketentuan SPK</h2>
            <p className="text-sm text-stone-500 max-w-xl">
              Tentukan harga acuan, paket layanan siap booking, dan standar kerja Anda untuk mempermudah calon klien memilih jasa Anda.
            </p>
          </div>

          {/* ROLE PRESET QUICK SWITCHER */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-3 lg:w-96 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                Template Standar Profesi
              </span>
              <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-bold">
                {currentPreset.roleBadge}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedPresetRole}
                onChange={(e) => handleApplyRolePreset(e.target.value as RoleCategory)}
                className="flex-1 px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-[#1E1B2E] focus:bg-white focus:border-[#1E1B2E] transition-colors cursor-pointer"
              >
                <option value="BRAND">Fashion Brand/UMKM</option>
                <option value="DESIGNER">Fashion Designer</option>
                <option value="PHOTOGRAPHER">Photographer</option>
                <option value="MODEL">Model</option>
                <option value="MUA_STYLIST">MUA/Stylist</option>
                <option value="STUDIO">Studio</option>
              </select>

              <button
                type="button"
                onClick={() => handleApplyRolePreset(selectedPresetRole)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1E1B2E] hover:bg-black text-white text-xs font-bold shrink-0 transition-colors shadow-xs cursor-pointer"
                title="Muat ulang paket & harga rekomendasi industri untuk role ini"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Isi Standar</span>
              </button>
            </div>
            <p className="text-[11px] text-stone-400 leading-tight">
              1-Klik mengisi harga, paket populer, dan proteksi SPK sesuai standar pasar.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
        {message && (
          <div
            className={`p-4 rounded-2xl flex items-start gap-3 text-sm font-semibold transition-all ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            )}
            <p className="mt-0.5">{message.text}</p>
          </div>
        )}

        {/* TOP PARAMETERS: ESTIMATED STARTING RATE & TURNAROUND */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-stone-50/70 border border-stone-200/80">
          {/* STARTING RATE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="startingRate" className="text-xs font-bold text-[#1E1B2E] uppercase tracking-wider">
                Estimasi Tarif Awal (Mulai Dari) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-stone-400 font-medium">Tampil di kartu direktori</span>
            </div>
            <input
              type="text"
              id="startingRate"
              value={startingRate}
              onChange={(e) => setStartingRate(e.target.value)}
              required
              placeholder="Contoh: Mulai Rp 1,5 Jt / sesi"
              className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200 focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all text-sm font-bold text-stone-800"
            />
            {/* QUICK RATE PILLS */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                Pilihan Cepat Standar {currentPreset.roleBadge}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentPreset.quickRates.map((qr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setStartingRate(qr)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      startingRate === qr
                        ? "bg-[#1E1B2E] text-white border-[#1E1B2E]"
                        : "bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                    }`}
                  >
                    {qr}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* TURNAROUND TIME */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="turnaroundTime" className="text-xs font-bold text-[#1E1B2E] uppercase tracking-wider">
                Estimasi Waktu Pengerjaan (Turnaround) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-stone-400 font-medium">Tampil di ringkasan profil</span>
            </div>
            <input
              type="text"
              id="turnaroundTime"
              value={turnaroundTime}
              onChange={(e) => setTurnaroundTime(e.target.value)}
              required
              placeholder="Contoh: 3 – 5 Hari Kerja (atau Selesai On-Set)"
              className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200 focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all text-sm font-bold text-stone-800"
            />
            {/* QUICK TURNAROUND PILLS */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                Pilihan Cepat Waktu Serah Terima:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentPreset.quickTurnarounds.map((qt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTurnaroundTime(qt)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      turnaroundTime === qt
                        ? "bg-[#1E1B2E] text-white border-[#1E1B2E]"
                        : "bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                    }`}
                  >
                    {qt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PACKAGES SECTION */}
        {/* PACKAGES SECTION — STANDARDIZED 3-TIER COLLABORATION RESOURCES */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E1B2E]">
                  3 Tingkatan Paket Kapasitas Kolaborasi ({packages.length}/3)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-800 border border-emerald-200/70">
                  Terstandarisasi 3 Tingkat
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5 max-w-2xl leading-relaxed">
                Tentukan komitmen resource terstruktur (waktu, deliverables, hak siar, dan alat) sebagai patokan awal kolaborasi. RAMU membandingkan <em>lingkup kapasitas</em>, bukan sekadar harga nominal.
              </p>
            </div>

            {packages.length < 3 && (
              <button
                type="button"
                onClick={handleAddNewPackage}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-[#1E1B2E] transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Tingkatan Paket</span>
              </button>
            )}
          </div>

          {/* COLLABORATIVE ECONOMY NOTICE */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-950 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Prinsip Paket di Ekosistem RAMU:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-900/90">
              Paket bukanlah produk e-commerce siap beli, melainkan <strong>unit komersial dari resource Anda</strong> yang akan dipadukan dengan resource mitra lain dalam 1 proyek bersama. Angka tarif merupakan <strong>Listed Rate / Starting Anchor</strong> yang dapat dinegosiasikan saat perumusan SPK.
            </p>
          </div>

          {packages.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border-2 border-dashed border-stone-200 space-y-3">
              <p className="text-xs text-stone-500 font-medium">
                Belum ada paket kustom yang dibuat. Muat 3 tingkatan paket rekomendasi standar industri untuk peran Anda.
              </p>
              <button
                type="button"
                onClick={() => handleApplyRolePreset(selectedPresetRole)}
                className="px-4 py-2 rounded-xl bg-[#1E1B2E] text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs"
              >
                Muat 3 Paket dari Template
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {packages.map((pkg, idx) => {
                const tier = pkg.tier || (idx === 0 ? "STARTER" : idx === 1 ? "CAMPAIGN" : "COMMERCIAL");
                const isCampaign = tier === "CAMPAIGN";

                return (
                  <div
                    key={idx}
                    className={`p-6 rounded-2xl border transition-all space-y-5 flex flex-col justify-between ${
                      isCampaign
                        ? "bg-white border-[#1E1B2E] ring-2 ring-[#1E1B2E]/10 shadow-sm"
                        : "bg-white border-stone-200 shadow-2xs"
                    }`}
                  >
                    <div className="space-y-4">
                      {/* PACKAGE HEADER & TIER */}
                      <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                        <div className="flex items-center gap-2">
                          <select
                            value={tier}
                            onChange={(e) => handlePackageChange(idx, "tier", e.target.value)}
                            className="px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-[10px] font-bold text-stone-800 uppercase tracking-widest cursor-pointer"
                          >
                            <option value="STARTER">Tier 1: Starter / Mini</option>
                            <option value="CAMPAIGN">Tier 2: Campaign (Standar)</option>
                            <option value="COMMERCIAL">Tier 3: Commercial Full</option>
                          </select>
                        </div>

                        {packages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePackage(idx)}
                            className="p-1 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Hapus tingkatan paket ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* TITLE & DESCRIPTION */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                            Nama Paket <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={pkg.title}
                            onChange={(e) => handlePackageChange(idx, "title", e.target.value)}
                            required
                            placeholder="Misal: Lookbook Half-Day"
                            className="w-full px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-xs font-bold text-[#1E1B2E] focus:bg-white focus:border-[#1E1B2E]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                            Deskripsi Singkat
                          </label>
                          <textarea
                            value={pkg.subtitle}
                            onChange={(e) => handlePackageChange(idx, "subtitle", e.target.value)}
                            rows={2}
                            placeholder="Misal: Sesi foto katalog 15 look untuk rilis koleksi baru"
                            className="w-full px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-xs font-normal text-stone-600 focus:bg-white focus:border-[#1E1B2E] resize-none"
                          />
                        </div>
                      </div>

                      {/* PRICE & BILLING UNIT */}
                      <div className="space-y-2 pt-2 border-t border-stone-100">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                              Listed Rate (Acuan) <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={pkg.price}
                              onChange={(e) => handlePackageChange(idx, "price", e.target.value)}
                              required
                              placeholder="Rp 1.500.000"
                              className="w-full px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-xs font-bold text-[#1E1B2E] focus:bg-white focus:border-[#1E1B2E]"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                              Satuan Penagihan <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={pkg.unit}
                              onChange={(e) => handlePackageChange(idx, "unit", e.target.value)}
                              required
                              placeholder="per 4 jam / per sesi"
                              className="w-full px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-xs font-medium text-stone-700 focus:bg-white focus:border-[#1E1B2E]"
                            />
                          </div>
                        </div>

                        {/* QUICK UNIT PILLS */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {currentPreset.commonUnits.map((u, uIdx) => (
                            <button
                              key={uIdx}
                              type="button"
                              onClick={() => handlePackageChange(idx, "unit", u)}
                              className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors cursor-pointer ${
                                pkg.unit === u
                                  ? "bg-[#1E1B2E] text-white border-[#1E1B2E]"
                                  : "bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100"
                              }`}
                            >
                              {u}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 4 STRUCTURED SCOPE DIMENSIONS */}
                      <div className="space-y-3 pt-3 border-t border-stone-100 bg-stone-50/60 p-3 rounded-xl border border-stone-200/60">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-700 block">
                          4 Pilar Lingkup Terstruktur (Scope):
                        </span>

                        <div>
                          <label className="text-[9px] font-bold text-stone-500 uppercase tracking-wider block mb-0.5">
                            ⏱️ 1. Kapasitas Waktu / Shift
                          </label>
                          <input
                            type="text"
                            value={pkg.capacityDuration || ""}
                            onChange={(e) => handlePackageChange(idx, "capacityDuration", e.target.value)}
                            placeholder="Contoh: 4 Jam (Setengah Shift)"
                            className="w-full px-2.5 py-1.5 rounded-md bg-white border border-stone-200 text-[11px] font-medium text-[#1E1B2E] focus:border-[#1E1B2E]"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-stone-500 uppercase tracking-wider block mb-0.5">
                            📦 2. Deliverables Nyata
                          </label>
                          <input
                            type="text"
                            value={pkg.deliverablesSummary || ""}
                            onChange={(e) => handlePackageChange(idx, "deliverablesSummary", e.target.value)}
                            placeholder="Contoh: 15 Foto Final Retouch + Semua File RAW"
                            className="w-full px-2.5 py-1.5 rounded-md bg-white border border-stone-200 text-[11px] font-medium text-[#1E1B2E] focus:border-[#1E1B2E]"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-stone-500 uppercase tracking-wider block mb-0.5">
                            ⚖️ 3. Hak Siar / Lisensi IP
                          </label>
                          <input
                            type="text"
                            value={pkg.usageRights || ""}
                            onChange={(e) => handlePackageChange(idx, "usageRights", e.target.value)}
                            placeholder="Contoh: Komersial Digital (Sosmed & Web) 1 Tahun"
                            className="w-full px-2.5 py-1.5 rounded-md bg-white border border-stone-200 text-[11px] font-medium text-[#1E1B2E] focus:border-[#1E1B2E]"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-stone-500 uppercase tracking-wider block mb-0.5">
                            🛠️ 4. Peralatan / Fasilitas Terbawa
                          </label>
                          <input
                            type="text"
                            value={pkg.equipmentIncluded || ""}
                            onChange={(e) => handlePackageChange(idx, "equipmentIncluded", e.target.value)}
                            placeholder="Contoh: Kamera Sony A7IV + 2 Lensa + 1 Strobo Kit"
                            className="w-full px-2.5 py-1.5 rounded-md bg-white border border-stone-200 text-[11px] font-medium text-[#1E1B2E] focus:border-[#1E1B2E]"
                          />
                        </div>
                      </div>

                      {/* EXTRA BULLET POINTS */}
                      <div className="space-y-2 pt-2 border-t border-stone-100">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                            Poin Rincian Tambahan ({pkg.features.length})
                          </label>
                        <button
                          type="button"
                          onClick={() => handleAddFeature(idx, "")}
                          className="text-[10px] font-bold text-[#1E1B2E] hover:underline cursor-pointer"
                        >
                          + Tambah Baris
                        </button>
                      </div>

                      {/* FEATURE LIST */}
                      <div className="space-y-1.5">
                        {pkg.features.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={feat}
                              onChange={(e) => handleFeatureChange(idx, fIdx, e.target.value)}
                              required
                              placeholder="Misal: 15 Foto final retouch resolusi tinggi"
                              className="w-full px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-[11px] text-stone-700 focus:bg-white focus:border-[#1E1B2E]"
                            />
                            {pkg.features.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveFeature(idx, fIdx)}
                                className="p-1 text-stone-400 hover:text-rose-500 cursor-pointer"
                                title="Hapus poin ini"
                              >
                                &times;
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* QUICK DELIVERABLE SUGGESTIONS */}
                      <div className="pt-2">
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                          + Tambah Cepat Deliverable Populer:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {currentPreset.quickDeliverableSuggestions.slice(0, 4).map((tag, tIdx) => (
                            <button
                              key={tIdx}
                              type="button"
                              onClick={() => {
                                if (!pkg.features.includes(tag)) {
                                  handleAddFeature(idx, tag);
                                }
                              }}
                              className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-[10px] font-medium text-stone-600 transition-colors cursor-pointer"
                            >
                              + {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* COLLAPSIBLE SPK & TERMS SECTION (CLEAN & STREAMLINED)              */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="rounded-2xl border border-stone-200 overflow-hidden bg-stone-50/40">
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-200/60">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
                <h3 className="text-sm font-bold text-[#1E1B2E]">
                  Standar Kerja &amp; Proteksi SPK (Otomatis Aktif)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[10px] font-black uppercase">
                  Proteksi 2-Arah
                </span>
              </div>
              <p className="text-xs text-stone-600 font-light">
                Kontrak kerja resmi otomatis mengikat klien saat booking untuk mencegah telat bayar, revisi tanpa batas, dan lembur gratis.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowTermsDetails(!showTermsDetails)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-300 hover:border-[#1E1B2E] text-xs font-bold text-stone-700 hover:text-[#1E1B2E] transition-all shadow-2xs shrink-0 cursor-pointer"
            >
              <span>{showTermsDetails ? "Sembunyikan Rincian SPK" : "Sesuaikan Klausul SPK"}</span>
              {showTermsDetails ? (
                <ChevronUp className="w-4 h-4 text-stone-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-stone-500" />
              )}
            </button>
          </div>

          {/* SUMMARY BADGES (SHOWN WHEN COLLAPSED) */}
          {!showTermsDetails && (
            <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-white border border-stone-200/80 space-y-0.5">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Uang Muka (DP)</span>
                <span className="text-xs font-bold text-[#1E1B2E] block">DP {terms.dpPercentage}% Kunci Jadwal</span>
                <span className="text-[10px] text-emerald-700 font-medium block">Watermark safe</span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-stone-200/80 space-y-0.5">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Batas Revisi</span>
                <span className="text-xs font-bold text-[#1E1B2E] block">Maksimal {terms.maxRevisions}x Minor</span>
                <span className="text-[10px] text-stone-500 font-medium block">Over-limit: {terms.extraRevisionFee}</span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-stone-200/80 space-y-0.5">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Durasi Shift Kerja</span>
                <span className="text-xs font-bold text-[#1E1B2E] block">{terms.shiftHours} Jam Standar</span>
                <span className="text-[10px] text-stone-500 font-medium block">Lembur: {terms.overtimeRate}</span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-stone-200/80 space-y-0.5">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Lisensi Karya</span>
                <span className="text-xs font-bold text-[#1E1B2E] block">
                  {terms.usageRightsScope === "ORGANIC_SOCIAL"
                    ? "Medsos & Web"
                    : terms.usageRightsScope === "PAID_ADS_DIGITAL"
                    ? "Digital Ads (+Meta/TikTok)"
                    : terms.usageRightsScope === "COMMERCIAL_OOH"
                    ? "Cetak & Billboard"
                    : "Full Buyout"}
                </span>
                <span className="text-[10px] text-amber-800 font-medium block">
                  {terms.usageRightsDuration === "PERPETUAL" ? "Selamanya" : "Durasi 1 Tahun"}
                </span>
              </div>
            </div>
          )}

          {/* DETAILED SPK CLAUSES (SHOWN WHEN EXPANDED) */}
          {showTermsDetails && (
            <div className="p-6 space-y-6">
              {/* ROW 1: PAYMENT & SHIFT HOURS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                    Uang Muka (DP Kunci Tanggal)
                  </label>
                  <select
                    value={terms.dpPercentage}
                    onChange={(e) => setTerms({ ...terms, dpPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E]"
                  >
                    <option value={30}>30% (Fleksibel UMKM)</option>
                    <option value={50}>50% (Standar Industri - Rekomendasi)</option>
                    <option value={70}>70% (Proyek Produksi Berat)</option>
                  </select>
                  <p className="text-[10px] text-stone-400 mt-1">DP mengikat slot jadwal talenta.</p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                    Skema Termin Pembayaran
                  </label>
                  <select
                    value={terms.paymentMilestoneScheme || "50_50_WATERMARK"}
                    onChange={(e) => setTerms({ ...terms, paymentMilestoneScheme: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E]"
                  >
                    <option value="50_50_WATERMARK">DP 50% + Pelunasan (Watermark Safe)</option>
                    <option value="30_40_30">Termin 30% - 40% - 30% (Bertahap)</option>
                    <option value="100_UPFRONT">100% Pembayaran di Awal (Full Upfront)</option>
                  </select>
                  <p className="text-[10px] text-stone-400 mt-1">Pelunasan sebelum file master diserahkan.</p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                    Batas Durasi Shift Standar
                  </label>
                  <select
                    value={terms.shiftHours}
                    onChange={(e) => setTerms({ ...terms, shiftHours: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E]"
                  >
                    <option value={3}>3 Jam (Sesi Ringkas)</option>
                    <option value={4}>4 Jam (Half-Day)</option>
                    <option value={6}>6 Jam (Medium Shift)</option>
                    <option value={8}>8 Jam (Full-Day)</option>
                    <option value={12}>12 Jam (Produksi Besar)</option>
                  </select>
                  <p className="text-[10px] text-stone-400 mt-1">Termasuk 1 jam istirahat.</p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                    Tarif Lembur (Overtime / Jam)
                  </label>
                  <input
                    type="text"
                    value={terms.overtimeRate}
                    onChange={(e) => setTerms({ ...terms, overtimeRate: e.target.value })}
                    placeholder="Rp 250.000 / jam"
                    className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E]"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Toleransi keterlambatan 30 menit.</p>
                </div>
              </div>

              {/* ROW 2: USAGE RIGHTS & REVISIONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-amber-50/40 border border-amber-200/70">
                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                    Ruang Lingkup Lisensi (Usage Scope)
                  </label>
                  <select
                    value={terms.usageRightsScope || "ORGANIC_SOCIAL"}
                    onChange={(e) => setTerms({ ...terms, usageRightsScope: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-stone-200 text-xs font-bold text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E]"
                  >
                    <option value="ORGANIC_SOCIAL">Medsos Organik &amp; Web Brand</option>
                    <option value="PAID_ADS_DIGITAL">Iklan Berbayar Digital (+Meta/TikTok Ads)</option>
                    <option value="COMMERCIAL_OOH">Komersial Cetak &amp; Luar Ruang (Billboard/OOH)</option>
                    <option value="FULL_BUYOUT">Full Buyout (All Media Selamanya)</option>
                  </select>
                  <p className="text-[10px] text-amber-800/80 mt-1">Batas media tayang yang diizinkan.</p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                    Durasi Lisensi Hak Pakai
                  </label>
                  <select
                    value={terms.usageRightsDuration || "1_YEAR"}
                    onChange={(e) => setTerms({ ...terms, usageRightsDuration: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-stone-200 text-xs font-bold text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E]"
                  >
                    <option value="6_MONTHS">6 Bulan (Musiman / Seasonal)</option>
                    <option value="1_YEAR">1 Tahun (Standar Industri)</option>
                    <option value="2_YEARS">2 Tahun</option>
                    <option value="PERPETUAL">Selamanya / Perpetual</option>
                  </select>
                  <p className="text-[10px] text-amber-800/80 mt-1">Masa berlaku hak tayang karya.</p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                    Batas Maksimal Revisi Minor
                  </label>
                  <select
                    value={terms.maxRevisions}
                    onChange={(e) => setTerms({ ...terms, maxRevisions: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-stone-200 text-xs font-bold text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E]"
                  >
                    <option value={1}>1x Revisi Minor</option>
                    <option value={2}>2x Revisi Minor (Standar)</option>
                    <option value={3}>3x Revisi Minor</option>
                  </select>
                  <p className="text-[10px] text-stone-400 mt-1">Ganti konsep = addendum baru.</p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                    Biaya Revisi Tambahan (Over-Limit)
                  </label>
                  <input
                    type="text"
                    value={terms.extraRevisionFee || "Rp 100.000 / foto tambahan"}
                    onChange={(e) => setTerms({ ...terms, extraRevisionFee: e.target.value })}
                    placeholder="Rp 100.000 / foto tambahan"
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-stone-200 text-xs font-bold text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E]"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Charge per foto/putaran ekstra.</p>
                </div>
              </div>

              {/* ROW 3: ROLE-SPECIFIC PROFESIONAL CLAUSES */}
              <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <span className="text-xs font-bold text-[#1E1B2E] uppercase tracking-wider flex items-center gap-2">
                    <span>Ketentuan Khusus Profesi:</span>
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px] font-bold">
                      {currentPreset.name}
                    </span>
                  </span>
                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Otomatis Masuk Surat Perjanjian Kerja (SPK)</span>
                  </span>
                </div>

                {/* ROLE: MODEL */}
                {isModel && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                        Batasan Busana (Wardrobe Scope)
                      </label>
                      <input
                        type="text"
                        value={terms.roleSpecifics.wardrobeRestrictions || ""}
                        onChange={(e) =>
                          setTerms({
                            ...terms,
                            roleSpecifics: { ...terms.roleSpecifics, wardrobeRestrictions: e.target.value },
                          })
                        }
                        placeholder="Misal: Casual, Modest / Hijab, Formal"
                        className="w-full px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-xs font-medium text-stone-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                        Masa Lisensi Hak Pakai (Usage Rights)
                      </label>
                      <input
                        type="text"
                        value={terms.roleSpecifics.usageRightsPeriod || ""}
                        onChange={(e) =>
                          setTerms({
                            ...terms,
                            roleSpecifics: { ...terms.roleSpecifics, usageRightsPeriod: e.target.value },
                          })
                        }
                        placeholder="Misal: 1 Tahun Digital Media (Medsos & Web)"
                        className="w-full px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-xs font-medium text-stone-800"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="chaperoneAllowed"
                        checked={terms.roleSpecifics.chaperoneAllowed ?? true}
                        onChange={(e) =>
                          setTerms({
                            ...terms,
                            roleSpecifics: { ...terms.roleSpecifics, chaperoneAllowed: e.target.checked },
                          })
                        }
                        className="w-4 h-4 rounded text-[#1E1B2E] border-stone-300 focus:ring-[#1E1B2E]"
                      />
                      <label htmlFor="chaperoneAllowed" className="text-xs font-bold text-stone-700">
                        Hak Membawa 1 Pendamping di Lokasi
                      </label>
                    </div>
                  </div>
                )}

                {/* ROLE: MUA */}
                {isMUA && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                        Batas Jumlah Wajah Dirias Termasuk Paket
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={terms.roleSpecifics.maxHeadsIncluded || 1}
                        onChange={(e) =>
                          setTerms({
                            ...terms,
                            roleSpecifics: { ...terms.roleSpecifics, maxHeadsIncluded: Number(e.target.value) },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-xs font-medium text-stone-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                        Waktu Persiapan Minimum Sebelum On-Set
                      </label>
                      <input
                        type="text"
                        value={terms.roleSpecifics.prepTimeRequired || ""}
                        onChange={(e) =>
                          setTerms({
                            ...terms,
                            roleSpecifics: { ...terms.roleSpecifics, prepTimeRequired: e.target.value },
                          })
                        }
                        placeholder="Misal: 90 Menit sebelum sesi foto"
                        className="w-full px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-xs font-medium text-stone-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                        Biaya Tambahan per Orang di Luar Paket
                      </label>
                      <input
                        type="text"
                        value={terms.roleSpecifics.extraHeadFee || ""}
                        onChange={(e) =>
                          setTerms({
                            ...terms,
                            roleSpecifics: { ...terms.roleSpecifics, extraHeadFee: e.target.value },
                          })
                        }
                        placeholder="Misal: Rp 350.000 / orang tambahan"
                        className="w-full px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-xs font-medium text-stone-800"
                      />
                    </div>
                  </div>
                )}

                {/* ROLE: STYLIST */}
                {isStylist && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                        Ketentuan Uang Sewa / Deposit Peminjaman Busana
                      </label>
                      <input
                        type="text"
                        value={terms.roleSpecifics.pullingDepositResponsibility || ""}
                        onChange={(e) =>
                          setTerms({
                            ...terms,
                            roleSpecifics: { ...terms.roleSpecifics, pullingDepositResponsibility: e.target.value },
                          })
                        }
                        placeholder="Biaya sewa/deposit baju desainer dibayarkan langsung oleh klien"
                        className="w-full px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-xs font-medium text-stone-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                        Tanggung Jawab Kerusakan / Noda Busana di Set
                      </label>
                      <input
                        type="text"
                        value={terms.roleSpecifics.wardrobeDamageResponsibility || ""}
                        onChange={(e) =>
                          setTerms({
                            ...terms,
                            roleSpecifics: { ...terms.roleSpecifics, wardrobeDamageResponsibility: e.target.value },
                          })
                        }
                        placeholder="Ganti rugi noda/robekan busana di set ditanggung klien/brand"
                        className="w-full px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-xs font-medium text-stone-800"
                      />
                    </div>
                  </div>
                )}

                {/* ROLE: VIDEOGRAPHER */}
                {isVideographer && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                        Format Output Aspek Rasio Utama
                      </label>
                      <input
                        type="text"
                        value={terms.roleSpecifics.aspectRatiosIncluded || ""}
                        onChange={(e) =>
                          setTerms({
                            ...terms,
                            roleSpecifics: { ...terms.roleSpecifics, aspectRatiosIncluded: e.target.value },
                          })
                        }
                        placeholder="Misal: 1x Reels 9:16 (30-45 detik)"
                        className="w-full px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-xs font-medium text-stone-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                        Ketentuan Ganti Musik Latar
                      </label>
                      <input
                        type="text"
                        value={terms.roleSpecifics.majorRevisionFeeNote || ""}
                        onChange={(e) =>
                          setTerms({
                            ...terms,
                            roleSpecifics: { ...terms.roleSpecifics, majorRevisionFeeNote: e.target.value },
                          })
                        }
                        placeholder="Ganti musik setelah final cut dikenakan biaya re-editing"
                        className="w-full px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-xs font-medium text-stone-800"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="musicLicenseIncluded"
                        checked={terms.roleSpecifics.musicLicenseIncluded ?? true}
                        onChange={(e) =>
                          setTerms({
                            ...terms,
                            roleSpecifics: { ...terms.roleSpecifics, musicLicenseIncluded: e.target.checked },
                          })
                        }
                        className="w-4 h-4 rounded text-[#1E1B2E] border-stone-300 focus:ring-[#1E1B2E]"
                      />
                      <label htmlFor="musicLicenseIncluded" className="text-xs font-bold text-stone-700">
                        Jaminan Musik Bebas Klaim Hak Cipta
                      </label>
                    </div>
                  </div>
                )}

                {/* ROLE: STUDIO */}
                {isStudio && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                        Kapasitas Maksimal Orang di Studio
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={terms.roleSpecifics.maxCrewCapacity || 10}
                        onChange={(e) =>
                          setTerms({
                            ...terms,
                            roleSpecifics: { ...terms.roleSpecifics, maxCrewCapacity: Number(e.target.value) },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-xs font-medium text-stone-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                        Biaya Lembur Perpanjangan Shift
                      </label>
                      <input
                        type="text"
                        value={terms.roleSpecifics.overtimePerBlockFee || ""}
                        onChange={(e) =>
                          setTerms({
                            ...terms,
                            roleSpecifics: { ...terms.roleSpecifics, overtimePerBlockFee: e.target.value },
                          })
                        }
                        placeholder="Rp 150.000 per 30 menit"
                        className="w-full px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-xs font-medium text-stone-800"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="cycloramaShoeTapeRequired"
                        checked={terms.roleSpecifics.cycloramaShoeTapeRequired ?? true}
                        onChange={(e) =>
                          setTerms({
                            ...terms,
                            roleSpecifics: { ...terms.roleSpecifics, cycloramaShoeTapeRequired: e.target.checked },
                          })
                        }
                        className="w-4 h-4 rounded text-[#1E1B2E] border-stone-300 focus:ring-[#1E1B2E]"
                      />
                      <label htmlFor="cycloramaShoeTapeRequired" className="text-xs font-bold text-stone-700">
                        Wajib Lakban Khusus Sol Sepatu
                      </label>
                    </div>
                  </div>
                )}

                {/* ROLE: DESIGNER */}
                {isDesigner && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                        Kebijakan Sesi Fitting Busana
                      </label>
                      <input
                        type="text"
                        value={terms.roleSpecifics.fittingPolicy || ""}
                        onChange={(e) =>
                          setTerms({
                            ...terms,
                            roleSpecifics: { ...terms.roleSpecifics, fittingPolicy: e.target.value },
                          })
                        }
                        placeholder="Fitting busana dilakukan H-1 atau di lokasi sebelum sesi dimulai"
                        className="w-full px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-xs font-medium text-stone-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                        Tanggung Jawab Laundry &amp; Dry Cleaning
                      </label>
                      <input
                        type="text"
                        value={terms.roleSpecifics.dryCleaningResponsibility || ""}
                        onChange={(e) =>
                          setTerms({
                            ...terms,
                            roleSpecifics: { ...terms.roleSpecifics, dryCleaningResponsibility: e.target.value },
                          })
                        }
                        placeholder="Biaya laundry/dry cleaning busana pasca-sesi ditanggung oleh klien/peminjam"
                        className="w-full px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-xs font-medium text-stone-800"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                        Larangan Modifikasi / Perombakan Busana (No Alteration)
                      </label>
                      <input
                        type="text"
                        value={terms.roleSpecifics.noAlteringPolicy || ""}
                        onChange={(e) =>
                          setTerms({
                            ...terms,
                            roleSpecifics: { ...terms.roleSpecifics, noAlteringPolicy: e.target.value },
                          })
                        }
                        placeholder="Dilarang memotong, mengubah jahitan, atau merusak siluet busana tanpa izin tertulis desainer"
                        className="w-full px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-xs font-medium text-stone-800"
                      />
                    </div>
                  </div>
                )}

                {/* ROLE: PHOTOGRAPHER */}
                {isPhotographer && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                        Kebijakan Penyerahan File Mentah (RAW)
                      </label>
                      <input
                        type="text"
                        value={terms.roleSpecifics.rawFilePolicy || ""}
                        onChange={(e) =>
                          setTerms({
                            ...terms,
                            roleSpecifics: { ...terms.roleSpecifics, rawFilePolicy: e.target.value },
                          })
                        }
                        placeholder="File JPG resolusi tinggi; RAW tidak diserahkan"
                        className="w-full px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-xs font-medium text-stone-800"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="colorAccuracyCommitment"
                        checked={terms.roleSpecifics.colorAccuracyCommitment ?? true}
                        onChange={(e) =>
                          setTerms({
                            ...terms,
                            roleSpecifics: { ...terms.roleSpecifics, colorAccuracyCommitment: e.target.checked },
                          })
                        }
                        className="w-4 h-4 rounded text-[#1E1B2E] border-stone-300 focus:ring-[#1E1B2E]"
                      />
                      <label htmlFor="colorAccuracyCommitment" className="text-xs font-bold text-stone-700">
                        Jaminan Akurasi Warna Produk Asli
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-stone-100">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Info className="w-4 h-4 text-stone-400 shrink-0" />
            <span>Tarif dan paket akan otomatis tampil di halaman profil publik &amp; form booking Anda.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-3 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs uppercase tracking-wider hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#1E1B2E] hover:bg-black text-white text-xs font-bold uppercase tracking-widest transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Paket &amp; Tarif Saya</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
