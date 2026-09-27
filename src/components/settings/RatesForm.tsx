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
} from "lucide-react";

export interface ServicePackage {
  title: string;
  subtitle: string;
  price: string;
  unit: string;
  popular?: boolean;
  features: string[];
}

interface RatesFormProps {
  initialStartingRate: string;
  initialTurnaroundTime: string;
  initialPackages: ServicePackage[];
  actorSector: string;
  actorType: string;
}

export function RatesForm({
  initialStartingRate,
  initialTurnaroundTime,
  initialPackages,
  actorSector,
  actorType,
}: RatesFormProps) {
  const [startingRate, setStartingRate] = useState(initialStartingRate);
  const [turnaroundTime, setTurnaroundTime] = useState(initialTurnaroundTime);
  const [packages, setPackages] = useState<ServicePackage[]>(
    initialPackages.length > 0 ? initialPackages : []
  );

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
