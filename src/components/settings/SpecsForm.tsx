"use client";

import React, { useState, useRef } from "react";
import { updateActorSpecs } from "@/app/settings/actions";
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Camera,
  Ruler,
  Maximize2,
  Trash2,
  Upload,
  Building2,
  Film,
  Sparkles,
  Zap,
} from "lucide-react";

interface SpecsFormProps {
  actorSector: string;
  actorType: string;
  actorName: string;
  initialAttributes?: Record<string, any> | null;
}

export function SpecsForm({
  actorSector,
  actorType,
  actorName,
  initialAttributes,
}: SpecsFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const sectorLower = actorSector.toLowerCase();
  const isStudio = actorType === "STUDIO" || sectorLower.includes("studio");
  const isModel = sectorLower.includes("model") || sectorLower.includes("talent");
  const isPhotographer = sectorLower.includes("photographer") || sectorLower.includes("fotografi");
  const isVideographer = sectorLower.includes("video") || sectorLower.includes("film") || sectorLower.includes("cinema");

  const attrs = initialAttributes || {};

  const existingCompCard = Array.isArray(attrs.comp_card) ? attrs.comp_card : [];
  const [polaroidPreviews, setPolaroidPreviews] = useState<Array<{ url: string; type: string; caption: string }>>([
    {
      url: existingCompCard[0]?.url || "",
      type: existingCompCard[0]?.type || "Headshot / Close-up",
      caption: existingCompCard[0]?.caption || "Foto Headshot Natural (Tanpa Makeup Berlebih)",
    },
    {
      url: existingCompCard[1]?.url || "",
      type: existingCompCard[1]?.type || "Profile / 45° Angle",
      caption: existingCompCard[1]?.caption || "Tampak Samping Garis Rahang & Siluet",
    },
    {
      url: existingCompCard[2]?.url || "",
      type: existingCompCard[2]?.type || "Full Body Polaroid",
      caption: existingCompCard[2]?.caption || "Proporsi Tubuh Penuh (Minimalist Outfit)",
    },
  ]);

  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handlePolaroidFile = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setMessage({ type: "error", text: `Ukuran foto polaroid slot ${index + 1} maksimal 10 MB.` });
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      setPolaroidPreviews((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], url: previewUrl };
        return next;
      });
      setMessage(null);
    }
  };

  const handleRemovePolaroid = (index: number) => {
    setPolaroidPreviews((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], url: "" };
      return next;
    });
    if (fileInputRefs[index].current) {
      fileInputRefs[index].current!.value = "";
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateActorSpecs(formData);

    if (result.success) {
      setMessage({ type: "success", text: result.message || "Spesifikasi berhasil disimpan." });
    } else {
      setMessage({ type: "error", text: result.error || "Gagal menyimpan spesifikasi." });
    }

    setIsPending(false);
  }

  return (
    <div className="bg-white rounded-none border border-stone-200 shadow-xs overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-stone-100 bg-stone-50/50">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">
          {isModel && (
            <span className="text-purple-700 bg-purple-50 px-2.5 py-0.5 border border-purple-200">
              Standar Agensi Model
            </span>
          )}
          {isStudio && (
            <span className="text-blue-700 bg-blue-50 px-2.5 py-0.5 border border-blue-200">
              Spesifikasi Ruang &amp; Fasilitas
            </span>
          )}
          {(isPhotographer || isVideographer) && (
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 border border-emerald-200">
              Peralatan Produksi Visual
            </span>
          )}
          <span>{actorSector}</span>
        </div>
        <h2 className="text-xl font-bold text-[#1E1B2E]">
          {isModel
            ? "Comp Card & Spesifikasi Fisik Model"
            : isStudio
            ? "Fasilitas Studio & Area Kerja"
            : isPhotographer
            ? "Inventaris Kamera & Lighting Kit"
            : isVideographer
            ? "Cinema Gear & Video Suite"
            : "Spesifikasi Keahlian & Alat Kerja"}
        </h2>
        <p className="text-sm text-stone-500 mt-1">
          {isModel
            ? "Informasi ukuran fisik dan foto polaroid resmi untuk kebutuhan casting desainer, brand lookbook, dan agensi."
            : "Informasi teknis dan fasilitas kerja ini akan ditampilkan di tab Spesifikasi profil direktori Anda."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
        {message && (
          <div
            className={`p-4 rounded-none flex items-start gap-3 text-sm font-semibold ${
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

        {isModel && (
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                <Ruler className="w-4 h-4 text-purple-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E]">
                  1. Ukuran Tubuh Vital (Fitting &amp; Sample Specs)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="height_cm" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Tinggi Badan (cm) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="height_cm"
                    name="height_cm"
                    defaultValue={attrs.height_cm || ""}
                    placeholder="175"
                    required
                    className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all text-sm font-medium text-stone-800"
                  />
                  <span className="text-[10px] text-stone-400">Contoh: 175</span>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="weight_kg" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Berat Badan (kg)
                  </label>
                  <input
                    type="number"
                    id="weight_kg"
                    name="weight_kg"
                    defaultValue={attrs.weight_kg || ""}
                    placeholder="52"
                    className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all text-sm font-medium text-stone-800"
                  />
                  <span className="text-[10px] text-stone-400">Contoh: 52</span>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="bust_waist_hips" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Dada - Pinggang - Pinggul <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="bust_waist_hips"
                    name="bust_waist_hips"
                    defaultValue={attrs.bust_waist_hips || ""}
                    placeholder="84-60-89 cm"
                    required
                    className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all text-sm font-medium text-stone-800"
                  />
                  <span className="text-[10px] text-stone-400">Format: 84-60-89 cm</span>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="clothing_size" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Ukuran Baju Sampel <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="clothing_size"
                    name="clothing_size"
                    defaultValue={attrs.clothing_size || ""}
                    placeholder="S / 36 EU"
                    required
                    className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all text-sm font-medium text-stone-800"
                  />
                  <span className="text-[10px] text-stone-400">Contoh: S / 36 EU</span>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="shoe_size" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Ukuran Sepatu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="shoe_size"
                    name="shoe_size"
                    defaultValue={attrs.shoe_size || ""}
                    placeholder="39 EU"
                    required
                    className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all text-sm font-medium text-stone-800"
                  />
                  <span className="text-[10px] text-stone-400">Contoh: 39 EU</span>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="experience_years" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Pengalaman Kerja (Tahun)
                  </label>
                  <input
                    type="number"
                    id="experience_years"
                    name="experience_years"
                    defaultValue={attrs.experience_years || ""}
                    placeholder="5"
                    className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all text-sm font-medium text-stone-800"
                  />
                  <span className="text-[10px] text-stone-400">Jam terbang dalam modeling</span>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="video_reel_title" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Judul Showreel Video (Opsional)
                  </label>
                  <input
                    type="text"
                    id="video_reel_title"
                    name="video_reel_title"
                    defaultValue={attrs.video_reel_title || ""}
                    placeholder="Runway & Motion Lookbook Showreel 2026"
                    className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all text-sm font-medium text-stone-800"
                  />
                  <span className="text-[10px] text-stone-400">Judul klip catwalk/motion</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                <Sparkles className="w-4 h-4 text-purple-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E]">
                  2. Karakteristik &amp; Fitur Fisik Alami
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="hair_color" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Warna &amp; Tipe Rambut
                  </label>
                  <input
                    type="text"
                    id="hair_color"
                    name="hair_color"
                    defaultValue={attrs.hair_color || "Hitam Alami"}
                    placeholder="Hitam Alami / Gelombang"
                    className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all text-sm font-medium text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="eye_color" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Warna Mata
                  </label>
                  <input
                    type="text"
                    id="eye_color"
                    name="eye_color"
                    defaultValue={attrs.eye_color || "Cokelat Tua"}
                    placeholder="Cokelat Tua / Hitam"
                    className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all text-sm font-medium text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="skin_undertone" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Skin Undertone (Warna Kulit)
                  </label>
                  <input
                    type="text"
                    id="skin_undertone"
                    name="skin_undertone"
                    defaultValue={attrs.skin_undertone || "Warm Olive"}
                    placeholder="Warm Olive / Cool / Neutral"
                    className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all text-sm font-medium text-stone-800"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-purple-700" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E]">
                    3. Foto Polaroid Comp Card (3 Sudut Pandang Casting)
                  </h3>
                </div>
                <span className="text-[10px] font-semibold text-stone-400">
                  Cahaya Alami • Zero Makeup Berlebih
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {polaroidPreviews.map((slot, idx) => (
                  <div key={idx} className="p-4 bg-stone-50/70 border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#1E1B2E]">
                        Slot {idx + 1}: {slot.type}
                      </span>
                      {slot.url && (
                        <button
                          type="button"
                          onClick={() => handleRemovePolaroid(idx)}
                          className="text-[10px] text-rose-600 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                        >
                          <Trash2 className="w-3 h-3" /> Hapus
                        </button>
                      )}
                    </div>

                    <input
                      type="file"
                      name={`polaroid_file_${idx}`}
                      ref={fileInputRefs[idx]}
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={(e) => handlePolaroidFile(idx, e)}
                      className="hidden"
                    />
                    <input
                      type="hidden"
                      name={`polaroid_url_${idx}`}
                      value={slot.url}
                    />
                    <input
                      type="hidden"
                      name={`polaroid_type_${idx}`}
                      value={slot.type}
                    />

                    <div
                      onClick={() => fileInputRefs[idx].current?.click()}
                      className="aspect-[3/4] w-full bg-white border border-dashed border-stone-300 hover:border-[#1E1B2E] transition-all flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group select-none"
                    >
                      {slot.url ? (
                        <>
                          <img
                            src={slot.url}
                            alt={slot.type}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold gap-1">
                            <Upload className="w-5 h-5" />
                            <span>Ganti Foto</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-4 space-y-2 text-stone-400">
                          <Upload className="w-6 h-6 mx-auto text-stone-400" />
                          <span className="text-[11px] font-bold block text-stone-600">Unggah Foto Polaroid</span>
                          <span className="text-[9px] text-stone-400 block">JPG, PNG, atau WebP maks 10 MB</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                        Keterangan Foto
                      </label>
                      <input
                        type="text"
                        name={`polaroid_caption_${idx}`}
                        defaultValue={slot.caption}
                        placeholder={`Keterangan ${slot.type}`}
                        className="w-full px-3 py-2 rounded-none bg-white border border-stone-200 text-xs font-medium text-stone-800 focus:outline-none focus:border-[#1E1B2E]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-stone-100">
              <label htmlFor="specialties" className="text-xs font-bold text-[#1E1B2E] uppercase tracking-wider block">
                Bidang &amp; Spesialisasi Modeling (Pisahkan dengan koma)
              </label>
              <input
                type="text"
                id="specialties"
                name="specialties"
                defaultValue={
                  Array.isArray(attrs.specialties)
                    ? attrs.specialties.join(", ")
                    : "Editorial Fashion, Lookbook & Catalog, Commercial Beauty, Runway"
                }
                placeholder="Editorial Fashion, Lookbook & Catalog, Runway, Beauty Close-up"
                className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] focus:ring-2 focus:ring-[#1E1B2E]/10 transition-all text-sm font-medium text-stone-800"
              />
              <span className="text-[10px] text-stone-400 block">
                Contoh: High-Fashion Editorial, Katalog Busana, Wastra Tradisional, Commercial TVC, Runway
              </span>
            </div>
          </div>
        )}

        {(isPhotographer || isVideographer) && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
              <Camera className="w-4 h-4 text-emerald-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E]">
                Peralatan Kamera &amp; Lighting Kit
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="primary_camera" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Kamera Utama (Primary Body)
                </label>
                <input
                  type="text"
                  id="primary_camera"
                  name="primary_camera"
                  defaultValue={attrs.primary_camera || ""}
                  placeholder="Sony A7R V / Canon EOS R5 / Hasselblad"
                  className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="secondary_camera" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Kamera Cadangan (Backup Body)
                </label>
                <input
                  type="text"
                  id="secondary_camera"
                  name="secondary_camera"
                  defaultValue={attrs.secondary_camera || ""}
                  placeholder="Sony FX3 / Fujifilm X-T5"
                  className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="lenses" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Koleksi Lensa Andalan (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  id="lenses"
                  name="lenses"
                  defaultValue={Array.isArray(attrs.lenses) ? attrs.lenses.join(", ") : ""}
                  placeholder="FE 24-70mm f/2.8 GM II, FE 85mm f/1.4 GM, 50mm f/1.2 L"
                  className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="lighting_gear" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Lighting &amp; Strobe Kit (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  id="lighting_gear"
                  name="lighting_gear"
                  defaultValue={Array.isArray(attrs.lighting_gear) ? attrs.lighting_gear.join(", ") : ""}
                  placeholder="Profoto B10X, Godox AD600 Pro, Octabox 120cm, C-Stand Kit"
                  className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="drone_aerial"
                  name="drone_aerial"
                  value="true"
                  defaultChecked={Boolean(attrs.drone_aerial)}
                  className="w-4 h-4 rounded-none accent-[#1E1B2E] cursor-pointer"
                />
                <label htmlFor="drone_aerial" className="text-xs font-bold text-[#1E1B2E] cursor-pointer select-none">
                  Menyediakan Layanan Drone &amp; Aerial Shooting (Pilot Bersertifikasi)
                </label>
              </div>
            </div>
          </div>
        )}

        {isStudio && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
              <Building2 className="w-4 h-4 text-blue-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E]">
                Fasilitas Studio &amp; Area Pemotretan
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="area_sqm" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Luas Area Studio (m²)
                </label>
                <input
                  type="number"
                  id="area_sqm"
                  name="area_sqm"
                  defaultValue={attrs.area_sqm || ""}
                  placeholder="120"
                  className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="ceiling_height_m" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Tinggi Plafon (meter)
                </label>
                <input
                  type="number"
                  step="0.1"
                  id="ceiling_height_m"
                  name="ceiling_height_m"
                  defaultValue={attrs.ceiling_height_m || ""}
                  placeholder="4.5"
                  className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="cyclorama_type" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Tipe Cyclorama Wall
                </label>
                <input
                  type="text"
                  id="cyclorama_type"
                  name="cyclorama_type"
                  defaultValue={attrs.cyclorama_type || "3-Wall Seamless Curve (White)"}
                  placeholder="3-Wall Seamless Curve (White)"
                  className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="electrical_capacity" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Kapasitas Daya Listrik
                </label>
                <input
                  type="text"
                  id="electrical_capacity"
                  name="electrical_capacity"
                  defaultValue={attrs.electrical_capacity || "16.500 Watt"}
                  placeholder="16.500 Watt / 3-Phase"
                  className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="facilities" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Fasilitas Studio Lengkap (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  id="facilities"
                  name="facilities"
                  defaultValue={
                    Array.isArray(attrs.facilities)
                      ? attrs.facilities.join(", ")
                      : "Makeup Station 3 Cermin LED, Ruang Ganti Privat, Garment Steamer, Wi-Fi 200Mbps, AC Central, Coffee Corner"
                  }
                  placeholder="Makeup Station, Garment Steamer, AC, Wi-Fi, Ruang Ganti"
                  className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                />
              </div>
            </div>
          </div>
        )}

        {!isModel && !isStudio && !isPhotographer && !isVideographer && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
              <Sparkles className="w-4 h-4 text-purple-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E]">
                Spesialisasi &amp; Alat Kerja Profesional
              </h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="specialties" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Bidang Keahlian / Layanan Utama (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  id="specialties"
                  name="specialties"
                  defaultValue={Array.isArray(attrs.specialties) ? attrs.specialties.join(", ") : ""}
                  placeholder="Editorial Styling, Commercial Lookbook, High-Fashion Makeup, Pattern Making"
                  className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                />
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
          <span className="text-xs text-stone-400">
            Perubahan akan otomatis tersinkronisasi ke tab profil publik Anda.
          </span>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-3 rounded-none bg-[#1E1B2E] text-white font-bold text-sm hover:bg-black transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-xs cursor-pointer"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isPending ? "Menyimpan Spesifikasi..." : "Simpan Spesifikasi & Comp Card"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
