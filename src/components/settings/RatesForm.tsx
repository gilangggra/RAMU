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
  HelpCircle,
  Check,
  Star,
  ShieldCheck,
  Clock,
  UserCheck,
} from "lucide-react";

export interface ServicePackage {
  title: string;
  subtitle: string;
  price: string;
  unit: string;
  popular?: boolean;
  features: string[];
}

export interface TermsAndConditionsConfig {
  dpPercentage: number;
  maxRevisions: number;
  shiftHours: number;
  overtimeRate: string;
  gracePeriodMinutes: number;
  safeSetCompliant: boolean;
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
  };
}

export function getDefaultTerms(sector: string, type: string): TermsAndConditionsConfig {
  const s = sector.toLowerCase();
  const isStudio = type === "STUDIO" || s.includes("studio");
  const isModel = !isStudio && (s.includes("model") || s.includes("talent"));
  const isMUA = !isStudio && !isModel && (s.includes("mua") || s.includes("makeup") || s.includes("hair"));
  const isStylist = !isStudio && !isModel && !isMUA && (s.includes("stylist") || s.includes("wardrobe"));
  const isVideographer = !isStudio && !isModel && !isMUA && !isStylist && (s.includes("video") || s.includes("film") || s.includes("cinema"));
  const isPhotographer = !isStudio && !isModel && !isMUA && !isStylist && !isVideographer;

  return {
    dpPercentage: 50,
    maxRevisions: 2,
    shiftHours: isStudio ? 4 : 8,
    overtimeRate: isStudio ? "Rp 150.000 / 30 menit" : "Rp 250.000 / jam",
    gracePeriodMinutes: 30,
    safeSetCompliant: true,
    roleSpecifics: {
      ...(isModel && {
        wardrobeRestrictions: "Casual, Formal, Modest / Hijab (Sesuai Moodboard Awal)",
        chaperoneAllowed: true,
        usageRightsPeriod: "1 Tahun Digital Media (Medsos & Website)",
      }),
      ...(isMUA && {
        maxHeadsIncluded: 1,
        prepTimeRequired: "90 Menit sebelum sesi foto dimulai",
        extraHeadFee: "Rp 350.000 / orang tambahan",
      }),
      ...(isStylist && {
        pullingDepositResponsibility: "Biaya sewa/deposit baju desainer dibayarkan langsung oleh klien",
        wardrobeDamageResponsibility: "Ganti rugi noda/robekan busana di set ditanggung klien",
      }),
      ...(isVideographer && {
        aspectRatiosIncluded: "1x Vertikal Reels 9:16 (30-45 detik)",
        musicLicenseIncluded: true,
        majorRevisionFeeNote: "Ganti musik latar setelah final cut dikenakan biaya re-editing",
      }),
      ...(isStudio && {
        maxCrewCapacity: 10,
        cycloramaShoeTapeRequired: true,
        overtimePerBlockFee: "Rp 150.000 per 30 menit",
      }),
      ...(isPhotographer && {
        colorAccuracyCommitment: true,
        rawFilePolicy: "File JPG resolusi tinggi (High-Res); RAW tidak diserahkan",
      }),
    },
  };
}

interface RatesFormProps {
  initialStartingRate: string;
  initialTurnaroundTime: string;
  initialPackages: ServicePackage[];
  initialTerms?: TermsAndConditionsConfig | null;
  actorSector: string;
  actorType: string;
}

export function RatesForm({
  initialStartingRate,
  initialTurnaroundTime,
  initialPackages,
  initialTerms,
  actorSector,
  actorType,
}: RatesFormProps) {
  const [startingRate, setStartingRate] = useState(initialStartingRate);
  const [turnaroundTime, setTurnaroundTime] = useState(initialTurnaroundTime);
  const [packages, setPackages] = useState<ServicePackage[]>(
    initialPackages.length > 0 ? initialPackages : []
  );
  const [terms, setTerms] = useState<TermsAndConditionsConfig>(
    initialTerms || getDefaultTerms(actorSector, actorType)
  );

  const sectorLower = actorSector.toLowerCase();
  const isStudio = actorType === "STUDIO" || sectorLower.includes("studio");
  const isModel = !isStudio && (sectorLower.includes("model") || sectorLower.includes("talent"));
  const isMUA = !isStudio && !isModel && (sectorLower.includes("mua") || sectorLower.includes("makeup") || sectorLower.includes("hair"));
  const isStylist = !isStudio && !isModel && !isMUA && (sectorLower.includes("stylist") || sectorLower.includes("wardrobe"));
  const isVideographer = !isStudio && !isModel && !isMUA && !isStylist && (sectorLower.includes("video") || sectorLower.includes("film") || sectorLower.includes("cinema"));
  const isPhotographer = !isStudio && !isModel && !isMUA && !isStylist && !isVideographer;

  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Helper to update a package field
  function handlePackageChange(index: number, field: keyof ServicePackage, value: any) {
    const updated = [...packages];
    updated[index] = { ...updated[index], [field]: value };
    setPackages(updated);
  }

  // Helper to add a deliverable feature to a package
  function handleAddFeature(pkgIndex: number) {
    const updated = [...packages];
    updated[pkgIndex] = {
      ...updated[pkgIndex],
      features: [...(updated[pkgIndex].features || []), ""],
    };
    setPackages(updated);
  }

  // Helper to update a feature
  function handleFeatureChange(pkgIndex: number, featIndex: number, value: string) {
    const updated = [...packages];
    const newFeatures = [...updated[pkgIndex].features];
    newFeatures[featIndex] = value;
    updated[pkgIndex] = { ...updated[pkgIndex], features: newFeatures };
    setPackages(updated);
  }

  // Helper to remove a feature
  function handleRemoveFeature(pkgIndex: number, featIndex: number) {
    const updated = [...packages];
    const newFeatures = updated[pkgIndex].features.filter((_, i) => i !== featIndex);
    updated[pkgIndex] = { ...updated[pkgIndex], features: newFeatures };
    setPackages(updated);
  }

  // Helper to add a new package
  function handleAddNewPackage() {
    if (packages.length >= 4) return;
    setPackages([
      ...packages,
      {
        title: `Paket Layanan ${packages.length + 1}`,
        subtitle: "Deskripsi singkat layanan yang diberikan",
        price: "Rp 1.500.000",
        unit: "per sesi",
        popular: false,
        features: ["Deliverable output berkualitas tinggi", "Termasuk 1x revisi minor"],
      },
    ]);
  }

  // Helper to remove a package
  function handleRemovePackage(index: number) {
    setPackages(packages.filter((_, i) => i !== index));
  }

  // Load Industry Recommended Benchmark Template
  function handleLoadTemplate() {
    const sectorLower = actorSector.toLowerCase();
    if (sectorLower.includes("video") || sectorLower.includes("film") || sectorLower.includes("cinema")) {
      setStartingRate("Mulai Rp 1,8 Jt / video");
      setTurnaroundTime("4 – 6 Hari Kerja");
      setPackages([
        {
          title: "Reels & TikTok Cinematic",
          subtitle: "Video fashion vertikal 9:16 untuk media sosial",
          price: "Rp 1.800.000",
          unit: "per 4 jam",
          popular: false,
          features: [
            "1-2 Video reels sinematik durasi 30-45 detik",
            "Kamera sinema 4K + Gimbal stabilization",
            "Color grading khas seluloid / warm tone",
            "Lisensi musik komersial legal",
          ],
        },
        {
          title: "Fashion Film & Campaign Video",
          subtitle: "Video kampanye sinematik lookbook untuk rilis koleksi",
          price: "Rp 3.500.000",
          unit: "per 8 jam",
          popular: true,
          features: [
            "1 Master film 4K (16:9) + 2 Cutdowns Reels (9:16)",
            "Lighting kit continuous bawaan + wireless mic",
            "Storyboarding & arahan visual on-set",
            "Gratis 2x revisi color grading & offline edit",
            "Delivery cepat 4-5 hari kerja",
          ],
        },
        {
          title: "Iklan TVC / Commercial Brand Video",
          subtitle: "Produksi video iklan komersial skala penuh",
          price: "Rp 6.000.000",
          unit: "per proyek",
          popular: false,
          features: [
            "Setup multi-kamera 4K 10-bit ProRes + Drone aerial",
            "Full audio field recording 32-bit float",
            "Color grading ACES standar bioskop di DaVinci Resolve",
            "Full commercial broadcast & advertising license",
          ],
        },
      ]);
    } else if (sectorLower.includes("model") || sectorLower.includes("talent")) {
      setStartingRate("Mulai Rp 1,0 Jt / sesi");
      setTurnaroundTime("Selesai Sesi Pemotretan");
      setPackages([
        {
          title: "Katalog & E-Commerce",
          subtitle: "Foto produk katalog marketplace & webstore",
          price: "Rp 1.000.000",
          unit: "per 3-4 jam",
          popular: false,
          features: [
            "Maksimal 15 look / pergantian busana",
            "Pose katalog bersih & profesional",
            "Pilihan eksposur tag akun Instagram",
            "Termasuk fitting sebelum sesi",
          ],
        },
        {
          title: "Kampanye Lookbook (Full Day)",
          subtitle: "Kampanye musiman koleksi baru label busana",
          price: "Rp 1.800.000",
          unit: "per 8 jam",
          popular: true,
          features: [
            "Unlimited looks dalam durasi kerja",
            "Photoshoot indoor atau outdoor",
            "Hak tayang digital & media sosial 1 tahun",
            "Fleksibel untuk konsep editorial & avant-garde",
          ],
        },
        {
          title: "Video TVC & Brand Ambassador",
          subtitle: "Iklan komersial video, billboard, atau digital ads",
          price: "Rp 3.500.000",
          unit: "per proyek",
          popular: false,
          features: [
            "Video acting & dialog / voiceover",
            "Hak guna komersial multi-channel",
            "1x Post feed & 2x Story endorsement",
            "Kontrak eksklusivitas kategori busana",
          ],
        },
      ]);
    } else if (actorType === "STUDIO" || sectorLower.includes("studio")) {
      setStartingRate("Mulai Rp 200rb / jam (Shift Rp 750rb)");
      setTurnaroundTime("Instan / Slot Booking");
      setPackages([
        {
          title: "Shift Setengah Hari",
          subtitle: "Sesi foto katalog, podcast, atau lookbook ringkas",
          price: "Rp 750.000",
          unit: "per 4 jam",
          popular: false,
          features: [
            "Akses area cyclorama wall & ruang makeup",
            "Daya listrik 16.500 Watt (3-Phase)",
            "AC dingin & high-speed Wi-Fi",
            "1 Asisten studio standby",
          ],
        },
        {
          title: "Shift Penuh (Full-Day)",
          subtitle: "Pilihan utama untuk campaign lookbook & video komersial",
          price: "Rp 1.400.000",
          unit: "per 8 jam",
          popular: true,
          features: [
            "Akses penuh seluruh area studio & fitting room",
            "Bebas ganti setup lighting & background seamless",
            "Free parking kru & loading barang mudah",
            "Termasuk 1 jam persiapan (setup/breakdown)",
            "2 Asisten studio standby",
          ],
        },
        {
          title: "Produksi Besar / 12 Jam",
          subtitle: "Untuk syuting iklan TVC, webseries, atau multi-brand",
          price: "Rp 2.200.000",
          unit: "per 12 jam",
          popular: false,
          features: [
            "Prioritas jadwal & booking slot",
            "Izin pemakaian generator / heavy-duty lighting",
            "Overtime grace period 30 menit",
            "Akses pantry & ruang tunggu VIP",
          ],
        },
      ]);
    } else {
      setStartingRate("Mulai Rp 1,5 Jt / sesi");
      setTurnaroundTime("3 – 5 Hari Kerja");
      setPackages([
        {
          title: "Paket Layanan Standar",
          subtitle: "Jasa profesional sesuai kebutuhan proyek awal",
          price: "Rp 1.200.000",
          unit: "per sesi",
          popular: false,
          features: [
            "Konsultasi brief & referensi visual",
            "Pengerjaan terstandar profesional",
            "Delivery output via Google Drive",
            "Gratis 1x revisi minor",
          ],
        },
        {
          title: "Paket Proyek Lengkap",
          subtitle: "Pengerjaan komprehensif dari konsep hingga final",
          price: "Rp 2.500.000",
          unit: "per proyek",
          popular: true,
          features: [
            "Arahan kreatif & moodboard konsep",
            "Eksekusi penuh dengan standar industri",
            "Output resolusi tinggi siap cetak & digital",
            "Gratis 2x revisi komprehensif",
            "Hak cipta komersial penuh",
          ],
        },
        {
          title: "Paket Produksi Khusus",
          subtitle: "Kustomisasi untuk volume produksi atau kampanye multi-tahap",
          price: "Mulai Rp 4.000.000",
          unit: "kustom",
          popular: false,
          features: [
            "Penyesuaian timeline & kontrak resmi",
            "Prioritas waktu kerja tim",
            "Dukungan asistensi intensif",
            "Perjanjian kerahasiaan (NDA) jika diperlukan",
          ],
        },
      ]);
    }
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
      setMessage({ type: "success", text: result.message || "Paket tarif berhasil disimpan." });
    } else {
      setMessage({ type: "error", text: result.error || "Gagal menyimpan paket tarif." });
    }

    setIsPending(false);
  }

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-[0_8px_30px_rgba(39,33,61,0.04)] overflow-hidden">
      {/* Header */}
      <div className="p-6 sm:p-8 border-b border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kustomisasi Tarif Bebas (Mandiri)</span>
          </div>
          <h2 className="text-xl font-extrabold text-[#1E1B2E]">Paket Layanan &amp; Tarif Mandiri</h2>
          <p className="text-sm text-stone-500 mt-1 max-w-xl">
            Atur sendiri paket layanan, estimasi harga, dan cakupan output yang ingin Anda tawarkan kepada calon klien.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadTemplate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 hover:border-[#1E1B2E] bg-white text-xs font-bold uppercase tracking-wider text-stone-700 hover:text-[#1E1B2E] transition-all shadow-xs shrink-0 cursor-pointer"
          title="Muat contoh paket standar industri"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Muat Rekomendasi Standar</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
        {message && (
          <div
            className={`p-4 rounded-2xl flex items-start gap-3 text-sm font-semibold ${
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

        {/* 1. Global Baseline Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-stone-50/70 border border-stone-200/80">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="startingRate" className="text-xs font-bold text-[#1E1B2E] uppercase tracking-wider">
                Estimasi Tarif Awal (Mulai Dari) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-stone-400 font-medium">Ditampilkan di kartu direktori</span>
            </div>
            <input
              type="text"
              id="startingRate"
              value={startingRate}
              onChange={(e) => setStartingRate(e.target.value)}
              required
              placeholder="Contoh: Mulai Rp 1,5 Jt / sesi"
              className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200 focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all text-sm font-medium text-stone-800"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="turnaroundTime" className="text-xs font-bold text-[#1E1B2E] uppercase tracking-wider">
                Estimasi Waktu Pengerjaan (Turnaround) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-stone-400 font-medium">Ditampilkan di ringkasan profil</span>
            </div>
            <input
              type="text"
              id="turnaroundTime"
              value={turnaroundTime}
              onChange={(e) => setTurnaroundTime(e.target.value)}
              required
              placeholder="Contoh: 3 – 5 Hari Kerja (atau Selesai On-Set)"
              className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200 focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all text-sm font-medium text-stone-800"
            />
          </div>
        </div>

        {/* 2. Custom Packages List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E1B2E]">
                Daftar Paket Layanan Komersial ({packages.length}/4)
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Klien dapat memilih salah satu paket ini secara langsung untuk melakukan booking atau rekrutmen.
              </p>
            </div>

            {packages.length < 4 && (
              <button
                type="button"
                onClick={handleAddNewPackage}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-[#1E1B2E] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Paket</span>
              </button>
            )}
          </div>

          {packages.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border-2 border-dashed border-stone-200 space-y-3">
              <p className="text-xs text-stone-500 font-medium">
                Belum ada paket kustom yang dibuat. Sistem saat ini masih menggunakan rekomendasi standar industri.
              </p>
              <button
                type="button"
                onClick={handleLoadTemplate}
                className="px-4 py-2 rounded-xl bg-[#1E1B2E] text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs"
              >
                Buat Paket dari Template
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {packages.map((pkg, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl border transition-all space-y-5 flex flex-col justify-between ${
                    pkg.popular
                      ? "bg-white border-[#1E1B2E] ring-1 ring-[#1E1B2E] shadow-sm"
                      : "bg-white border-stone-200/80 shadow-2xs"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Row: Package Number & Delete */}
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-[10px] font-bold text-stone-600 uppercase tracking-widest">
                        Paket {idx + 1}
                      </span>

                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 text-[10px] font-bold text-stone-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(pkg.popular)}
                            onChange={(e) => handlePackageChange(idx, "popular", e.target.checked)}
                            className="rounded border-stone-300 text-[#1E1B2E] focus:ring-[#1E1B2E]"
                          />
                          <span>Populer</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => handleRemovePackage(idx)}
                          className="p-1 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus paket ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title & Subtitle */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                          Nama Paket
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
                          placeholder="Misal: Sesi foto katalog 15 look untuk brand baru"
                          className="w-full px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-xs font-normal text-stone-600 focus:bg-white focus:border-[#1E1B2E]"
                        />
                      </div>
                    </div>

                    {/* Price & Unit */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-100">
                      <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                          Harga Tarif
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
                          Satuan Penagihan
                        </label>
                        <input
                          type="text"
                          value={pkg.unit}
                          onChange={(e) => handlePackageChange(idx, "unit", e.target.value)}
                          required
                          placeholder="per sesi / per 4 jam"
                          className="w-full px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-xs font-medium text-stone-600 focus:bg-white focus:border-[#1E1B2E]"
                        />
                      </div>
                    </div>

                    {/* Features Deliverables List */}
                    <div className="space-y-2 pt-2 border-t border-stone-100">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                          Poin Layanan &amp; Output
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAddFeature(idx)}
                          className="text-[10px] font-bold text-[#1E1B2E] hover:underline"
                        >
                          + Tambah Poin
                        </button>
                      </div>

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
                                className="p-1 text-stone-400 hover:text-rose-500"
                              >
                                &times;
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Ketentuan Standar Kerja & Proteksi Layanan (Terms & Conditions) */}
        <div className="space-y-6 pt-6 border-t border-stone-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-[#1E1B2E]">Standar Kerja &amp; Proteksi Layanan (Terms &amp; Conditions)</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black uppercase">
                  Proteksi 2-Arah
                </span>
              </div>
              <p className="text-xs text-stone-600 font-light">
                Atur ketentuan kerja resmi Anda. Ketentuan ini akan otomatis mengikat klien saat melakukan booking untuk mencegah penundaan pembayaran, revisi tanpa batas, dan kerja lembur tanpa bayaran.
              </p>
            </div>
          </div>

          {/* General Terms: DP, Shift Hours, Revisions, Overtime */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-stone-50 border border-stone-200/80">
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                Uang Muka (DP Kunci Tanggal)
              </label>
              <select
                value={terms.dpPercentage}
                onChange={(e) => setTerms({ ...terms, dpPercentage: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-stone-200 text-xs font-bold text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E]"
              >
                <option value={30}>30% (Fleksibel UMKM)</option>
                <option value={50}>50% (Standar Industri - Rekomendasi)</option>
                <option value={70}>70% (Proyek Produksi Berat)</option>
              </select>
              <p className="text-[10px] text-stone-400 mt-1">DP mengikat jadwal talenta.</p>
            </div>

            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                Batas Durasi Shift Standar
              </label>
              <select
                value={terms.shiftHours}
                onChange={(e) => setTerms({ ...terms, shiftHours: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-stone-200 text-xs font-bold text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E]"
              >
                <option value={3}>3 Jam (Sesi Ringkas)</option>
                <option value={4}>4 Jam (Half-Day)</option>
                <option value={6}>6 Jam (Medium Shift)</option>
                <option value={8}>8 Jam (Full-Day)</option>
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
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-stone-200 text-xs font-bold text-[#1E1B2E] focus:outline-none focus:border-[#1E1B2E]"
              />
              <p className="text-[10px] text-stone-400 mt-1">Toleransi keterlambatan 30 menit.</p>
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
          </div>

          {/* Role-Specific Specialized Terms */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="text-xs font-bold text-[#1E1B2E] uppercase tracking-wider flex items-center gap-2">
                <span>Ketentuan Spesifik Profesi:</span>
                <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px] font-bold">
                  {actorSector}
                </span>
              </span>
              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                ✓ Otomatis Diterapkan ke SPK
              </span>
            </div>

            {/* Model / Talent specifics */}
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

            {/* MUA specifics */}
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

            {/* Stylist specifics */}
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

            {/* Videographer specifics */}
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

            {/* Studio specifics */}
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

            {/* Photographer specifics */}
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

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-stone-100">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#1E1B2E] hover:bg-black text-white text-xs font-bold uppercase tracking-widest transition-all shadow-sm disabled:opacity-50 cursor-pointer"
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
      </form>
    </div>
  );
}
