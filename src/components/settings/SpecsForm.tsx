"use client";

import React, { useState, useRef } from "react";
import { updateActorSpecs } from "@/app/settings/actions";
import { ROLE_SPECS_PRESETS } from "@/lib/constants/roleSpecs";
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
  Scissors,
  ShieldCheck,
  ShoppingBag,
  Palette,
  Layers,
  Video,
  Clock,
  Check,
} from "lucide-react";

export interface SpecsFormProps {
  actorSector: string;
  actorType: string;
  actorName: string;
  initialAttributes?: Record<string, any> | null;
  embedded?: boolean;
  onSuccess?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// REUSABLE CHIP SELECTOR (Zero Form Fatigue)
// ─────────────────────────────────────────────────────────────────────────────
function TagInputWithSuggestions({
  label,
  name,
  initialValues,
  suggestions,
  placeholder,
  helperText,
  required,
}: {
  label: string;
  name: string;
  initialValues?: string[] | string;
  suggestions?: string[];
  placeholder?: string;
  helperText?: string;
  required?: boolean;
}) {
  const parseInit = (): string[] => {
    if (!initialValues) return [];
    if (Array.isArray(initialValues)) return initialValues;
    return initialValues
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const [tags, setTags] = useState<string[]>(parseInit);
  const [customInput, setCustomInput] = useState("");

  const toggleTag = (item: string) => {
    setTags((prev) =>
      prev.includes(item) ? prev.filter((t) => t !== item) : [...prev, item]
    );
  };

  const addCustomTag = () => {
    const trimmed = customInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
      setCustomInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomTag();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {tags.length > 0 && (
          <span className="text-[10px] text-stone-400 font-medium">
            {tags.length} item aktif
          </span>
        )}
      </div>

      <input type="hidden" name={name} value={tags.join(", ")} />

      {/* Selected tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 bg-stone-50 border border-stone-200">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-[#1E1B2E] text-white"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => toggleTag(tag)}
                className="hover:text-rose-300 ml-1 text-sm leading-none cursor-pointer"
                title="Hapus"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input custom */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Ketik kustom lalu tekan Tambah..."}
          className="flex-1 px-3.5 py-2 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-xs font-medium text-stone-800"
        />
        <button
          type="button"
          onClick={addCustomTag}
          className="px-3.5 py-2 bg-stone-200 text-stone-800 text-xs font-bold hover:bg-stone-300 transition-colors cursor-pointer"
        >
          + Tambah
        </button>
      </div>

      {/* Suggestions / Chips */}
      {suggestions && suggestions.length > 0 && (
        <div className="space-y-1 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
            Pilihan Cepat (Klik untuk memilih):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((sug) => {
              const isSelected = tags.includes(sug);
              return (
                <button
                  key={sug}
                  type="button"
                  onClick={() => toggleTag(sug)}
                  className={`text-[11px] font-semibold px-2.5 py-1 border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#1E1B2E] text-white border-[#1E1B2E]"
                      : "bg-white text-stone-600 border-stone-200 hover:border-stone-400 hover:text-stone-900"
                  }`}
                >
                  {isSelected ? "✓ " : "+ "}
                  {sug}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {helperText && (
        <span className="text-[10px] text-stone-400 block">{helperText}</span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SPECS FORM
// ─────────────────────────────────────────────────────────────────────────────
export function SpecsForm({
  actorSector,
  actorType,
  actorName,
  initialAttributes,
  embedded = false,
  onSuccess,
}: SpecsFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const sectorLower = actorSector.toLowerCase();
  const isBrand =
    actorType === "BRAND" ||
    (actorType as string) === "MSME" ||
    actorType === "COLLECTIVE" ||
    sectorLower.includes("brand") ||
    sectorLower.includes("label") ||
    sectorLower.includes("agency");

  const isModel = !isBrand && (sectorLower.includes("model") || sectorLower.includes("talent"));
  const isPhotographer = !isBrand && (sectorLower.includes("photographer") || sectorLower.includes("fotografi"));
  const isVideographer = !isBrand && (sectorLower.includes("video") || sectorLower.includes("film") || sectorLower.includes("cinema"));
  const isMUA = !isBrand && (sectorLower.includes("mua") || sectorLower.includes("makeup") || sectorLower.includes("hair"));
  const isStylist = !isBrand && (sectorLower.includes("stylist") || sectorLower.includes("wardrobe"));
  const isDesigner = !isBrand && (sectorLower.includes("designer") || sectorLower.includes("desain"));
  const isStudio = !isBrand && !isModel && !isPhotographer && !isVideographer && !isMUA && !isStylist && !isDesigner && (actorType === "STUDIO" || sectorLower.includes("studio"));

  const attrs = initialAttributes || {};

  // Comp card polaroid state for models
  const existingCompCard = Array.isArray(attrs.comp_card) ? attrs.comp_card : [];
  const [polaroidPreviews, setPolaroidPreviews] = useState<Array<{ url: string; type: string; caption: string }>>([
    {
      url: existingCompCard[0]?.url || "",
      type: existingCompCard[0]?.type || "Headshot / Close-up",
      caption: existingCompCard[0]?.caption || "Foto Headshot Natural (Tanpa Makeup Berlebih)",
    },
    {
      url: existingCompCard[1]?.url || "",
      type: existingCompCard[1]?.type || "Profile Side Angle",
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
      onSuccess?.();
    } else {
      setMessage({ type: "error", text: result.error || "Gagal menyimpan spesifikasi." });
    }

    setIsPending(false);
  }

  return (
    <div className={`bg-white rounded-none ${embedded ? "border-0" : "border border-stone-200 shadow-xs"} overflow-hidden`}>
      {/* HEADER SECTION */}
      <div className="p-6 sm:p-8 border-b border-stone-100 bg-stone-50/50">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">
          {isPhotographer && (
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 border border-emerald-200">
              Fotografi &amp; Tata Cahaya
            </span>
          )}
          {isStudio && (
            <span className="text-blue-700 bg-blue-50 px-2.5 py-0.5 border border-blue-200">
              Spesifikasi Ruang Studio &amp; Cyclorama
            </span>
          )}
          {isBrand && (
            <span className="text-amber-800 bg-amber-50 px-2.5 py-0.5 border border-amber-200">
              Brand Fesyen / UMKM Ekosistem
            </span>
          )}
          {isModel && (
            <span className="text-purple-700 bg-purple-50 px-2.5 py-0.5 border border-purple-200">
              Comp Card &amp; Standar Agensi Model
            </span>
          )}
          {isMUA && (
            <span className="text-rose-700 bg-rose-50 px-2.5 py-0.5 border border-rose-200">
              Makeup &amp; Hair Styling Studio
            </span>
          )}
          {isStylist && (
            <span className="text-indigo-700 bg-indigo-50 px-2.5 py-0.5 border border-indigo-200">
              Wardrobe Styling &amp; Kurasi
            </span>
          )}
          {isDesigner && (
            <span className="text-pink-700 bg-pink-50 px-2.5 py-0.5 border border-pink-200">
              Atelier &amp; Desain Busana
            </span>
          )}
          {isVideographer && (
            <span className="text-cyan-700 bg-cyan-50 px-2.5 py-0.5 border border-cyan-200">
              Sinematografi &amp; Cinema Gear
            </span>
          )}
          <span>{actorSector}</span>
        </div>

        <h2 className="text-xl font-bold text-[#1E1B2E]">
          {isPhotographer
            ? `Spesifikasi Teknis & Inventaris Kamera ${actorName}`
            : isStudio
            ? `Dimensi Ruang, Cyclorama & Fasilitas ${actorName}`
            : isBrand
            ? `DNA Koleksi, Sampel Fisik & Spesifikasi Brand ${actorName}`
            : isModel
            ? `Comp Card & Karakteristik Fisik ${actorName}`
            : isMUA
            ? `Kit Rias, Sanitasi & Kapasitas On-Set ${actorName}`
            : isStylist
            ? `Inventaris Styling & Wardrobe Equipment ${actorName}`
            : isDesigner
            ? `Kapasitas Atelier, Pola & Koleksi Sampel ${actorName}`
            : isVideographer
            ? `Cinema Camera Suite & Audio Kit ${actorName}`
            : `Spesifikasi Kolaborasi ${actorName}`}
        </h2>

        <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
          RAMU menggunakan triad spesifikasi (Kapabilitas, Sumber Daya Fisik, dan Batasan Operasional) agar sistem pencocokan kolaborasi dapat menghitung kompatibilitas proyek secara akurat dan transparan.
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

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 1. PHOTOGRAPHER SPECIFICATIONS                                     */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {isPhotographer && (
          <div className="space-y-8">
            {/* SEKSI 1: CAPABILITIES */}
            <div className="p-5 bg-stone-50/70 border border-stone-200 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E]">
                  1. Kapabilitas &amp; Spesialisasi Fotografi
                </h3>
              </div>

              <TagInputWithSuggestions
                label="Spesialisasi Genre"
                name="specialties"
                initialValues={attrs.specialties || ["Fashion", "Lookbook", "Editorial"]}
                suggestions={ROLE_SPECS_PRESETS.PHOTOGRAPHER.quickSpecialties}
                placeholder="Fashion, Lookbook, Commercial, Campaign..."
              />

              <TagInputWithSuggestions
                label="Kapabilitas Produksi On-Set"
                name="capabilities"
                initialValues={attrs.capabilities || ["Studio Photography", "Outdoor Photography", "Model & Lookbook"]}
                suggestions={ROLE_SPECS_PRESETS.PHOTOGRAPHER.quickCapabilities}
                placeholder="Studio Photography, Tethered Shooting, Drone Aerial..."
              />
            </div>

            {/* SEKSI 2: RESOURCES & EQUIPMENT */}
            <div className="p-5 bg-stone-50/70 border border-stone-200 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                <Camera className="w-4 h-4 text-emerald-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E]">
                  2. Inventaris Kamera &amp; Peralatan Fisik (Hardware)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="primary_camera" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Kamera Utama (Primary Body) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="primary_camera"
                    name="primary_camera"
                    defaultValue={attrs.primary_camera || "Sony A7 IV"}
                    placeholder="Sony A7 IV / Canon EOS R5 / Hasselblad"
                    required
                    className="w-full px-4 py-2.5 bg-white border border-stone-200 focus:border-[#1E1B2E] text-xs font-medium text-stone-800"
                  />
                  <div className="flex flex-wrap gap-1 pt-1">
                    {ROLE_SPECS_PRESETS.PHOTOGRAPHER.quickCameras.slice(0, 4).map((cam) => (
                      <button
                        key={cam}
                        type="button"
                        onClick={() => {
                          const el = document.getElementById("primary_camera") as HTMLInputElement;
                          if (el) el.value = cam;
                        }}
                        className="text-[10px] px-2 py-0.5 bg-white border border-stone-200 hover:border-stone-400 text-stone-600"
                      >
                        + {cam}
                      </button>
                    ))}
                  </div>
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
                    placeholder="Sony A7 III / Canon EOS R6"
                    className="w-full px-4 py-2.5 bg-white border border-stone-200 focus:border-[#1E1B2E] text-xs font-medium text-stone-800"
                  />
                  <span className="text-[10px] text-stone-400">Jaminan kelancaran saat kamera utama kendala</span>
                </div>
              </div>

              <TagInputWithSuggestions
                label="Koleksi Lensa Optik"
                name="lenses"
                initialValues={attrs.lenses || ["FE 24-70mm f/2.8 GM II", "FE 85mm f/1.4 GM"]}
                suggestions={ROLE_SPECS_PRESETS.PHOTOGRAPHER.quickLenses}
                placeholder="FE 24-70mm f/2.8, FE 85mm f/1.4..."
              />

              <TagInputWithSuggestions
                label="Lighting &amp; Strobe Kit"
                name="lighting_gear"
                initialValues={attrs.lighting_gear || ["Godox AD600 Pro", "Octabox 120cm"]}
                suggestions={ROLE_SPECS_PRESETS.PHOTOGRAPHER.quickLighting}
                placeholder="Godox AD600 Pro, Octabox 120cm, C-Stands..."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-2 p-3 bg-white border border-stone-200 cursor-pointer hover:bg-stone-50">
                  <input
                    type="checkbox"
                    name="tethering_available"
                    value="true"
                    defaultChecked={Boolean(attrs.tethering_available)}
                    className="w-4 h-4 rounded-none accent-[#1E1B2E]"
                  />
                  <div className="text-xs font-bold text-[#1E1B2E]">
                    Tethering Monitor On-Set
                    <span className="block text-[10px] font-normal text-stone-400">Klien bisa langsung mereview foto real-time</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 bg-white border border-stone-200 cursor-pointer hover:bg-stone-50">
                  <input
                    type="checkbox"
                    name="drone_aerial"
                    value="true"
                    defaultChecked={Boolean(attrs.drone_aerial)}
                    className="w-4 h-4 rounded-none accent-[#1E1B2E]"
                  />
                  <div className="text-xs font-bold text-[#1E1B2E]">
                    Drone &amp; Aerial Photography
                    <span className="block text-[10px] font-normal text-stone-400">Layanan foto udara bersertifikat</span>
                  </div>
                </label>
              </div>
            </div>

            {/* SEKSI 3: OPERATIONAL LIMITS & DELIVERABLES */}
            <div className="p-5 bg-stone-50/70 border border-stone-200 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                <Clock className="w-4 h-4 text-emerald-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E]">
                  3. Batasan Kapasitas, Deliverables &amp; Operasional
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="shooting_duration_shift" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Durasi Shift Foto
                  </label>
                  <input
                    type="text"
                    id="shooting_duration_shift"
                    name="shooting_duration_shift"
                    defaultValue={attrs.shooting_duration_shift || "4 Jam (Half-Day) / 8 Jam (Full-Day)"}
                    placeholder="Contoh: 4 Jam Half-Day"
                    className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="max_people_onset" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Kapasitas Kru On-Set (Maks Orang)
                  </label>
                  <input
                    type="number"
                    id="max_people_onset"
                    name="max_people_onset"
                    defaultValue={attrs.max_people_onset || 8}
                    placeholder="8"
                    className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="delivery_time_days" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Turnaround Output (Hari)
                  </label>
                  <input
                    type="number"
                    id="delivery_time_days"
                    name="delivery_time_days"
                    defaultValue={attrs.delivery_time_days || 3}
                    placeholder="3"
                    className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                  />
                </div>
              </div>

              <TagInputWithSuggestions
                label="Deliverables (Output Nyata yang Diterima Brand)"
                name="deliverables"
                initialValues={attrs.deliverables || ["Foto Final Retouch High-Res", "Semua RAW File via Drive H+1", "Social Media Crops 9:16"]}
                suggestions={ROLE_SPECS_PRESETS.PHOTOGRAPHER.quickDeliverables}
                placeholder="High-Res Retouch, RAW Files, 9:16 Crops..."
              />
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 2. STUDIO SPECIFICATIONS                                           */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {isStudio && (
          <div className="space-y-8">
            {/* SEKSI 1: DIMENSI & RUANG */}
            <div className="p-5 bg-stone-50/70 border border-stone-200 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                <Building2 className="w-4 h-4 text-blue-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E]">
                  1. Dimensi Ruang &amp; Fitur Cyclorama
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="area_sqm" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Luas Area (m²) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="area_sqm"
                    name="area_sqm"
                    defaultValue={attrs.area_sqm || 120}
                    placeholder="120"
                    required
                    className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="ceiling_height_m" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Tinggi Plafon (meter) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="ceiling_height_m"
                    name="ceiling_height_m"
                    defaultValue={attrs.ceiling_height_m || 4.5}
                    placeholder="4.5"
                    required
                    className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="cyclorama_type" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Tipe Cyclorama Wall
                  </label>
                  <input
                    type="text"
                    id="cyclorama_type"
                    name="cyclorama_type"
                    defaultValue={attrs.cyclorama_type || "3-Wall Seamless Curve (White)"}
                    placeholder="3-Wall Seamless Curve (White)"
                    className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                  />
                </div>
              </div>

              <TagInputWithSuggestions
                label="Setups &amp; Backdrop Tersedia"
                name="available_setups"
                initialValues={attrs.available_setups || ["White Seamless Cyclorama", "Black Velvet Backdrop", "Set Ruang Tamu / Lifestyle"]}
                suggestions={ROLE_SPECS_PRESETS.STUDIO.quickSetups}
                placeholder="White Seamless, Black Velvet, Concrete Wall..."
              />
            </div>

            {/* SEKSI 2: KELISTRIKAN, LIGHTING & FASILITAS */}
            <div className="p-5 bg-stone-50/70 border border-stone-200 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                <Zap className="w-4 h-4 text-blue-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E]">
                  2. Kelistrikan, Lighting On-Site &amp; Fasilitas
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="electrical_capacity" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Daya Listrik Studio
                  </label>
                  <input
                    type="text"
                    id="electrical_capacity"
                    name="electrical_capacity"
                    defaultValue={attrs.electrical_capacity || "16.500 Watt (3-Phase)"}
                    placeholder="16.500 Watt (3-Phase)"
                    className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="props_available"
                      value="true"
                      defaultChecked={Boolean(attrs.props_available !== false)}
                      className="w-4 h-4 rounded-none accent-[#1E1B2E]"
                    />
                    <span className="text-xs font-bold text-[#1E1B2E]">
                      Menyediakan Properti &amp; Furniture On-Site (Stool, Podium, Cermin)
                    </span>
                  </label>
                </div>
              </div>

              <TagInputWithSuggestions
                label="Lighting &amp; Grip Tersedia On-Site"
                name="lighting_gear"
                initialValues={attrs.lighting_gear || ["Strobe Flash Godox QT600 (3x)", "Continuous LED Aputure 300d", "C-Stands (6x) & Heavy Boom Arm"]}
                suggestions={ROLE_SPECS_PRESETS.STUDIO.quickLighting}
                placeholder="Strobe QT600, Continuous LED, C-Stands..."
              />

              <TagInputWithSuggestions
                label="Fasilitas Studio Lengkap"
                name="facilities"
                initialValues={attrs.facilities || ["Makeup Room Ber-AC (3 Cermin LED)", "Ruang Ganti Privat", "Area Tunggu VIP", "AC Central Dingin", "Free Parking Kru"]}
                suggestions={ROLE_SPECS_PRESETS.STUDIO.quickFacilities}
                placeholder="Makeup Room, Ruang Ganti, Free Parking, Wi-Fi..."
              />
            </div>

            {/* SEKSI 3: KAPASITAS & OPERASIONAL */}
            <div className="p-5 bg-stone-50/70 border border-stone-200 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                <Clock className="w-4 h-4 text-blue-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E]">
                  3. Kapasitas Orang &amp; Jam Operasional
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="max_people_capacity" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Kapasitas Maks Kru (Orang)
                  </label>
                  <input
                    type="number"
                    id="max_people_capacity"
                    name="max_people_capacity"
                    defaultValue={attrs.max_people_capacity || 15}
                    placeholder="15"
                    className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="operating_hours" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Jam Operasional
                  </label>
                  <input
                    type="text"
                    id="operating_hours"
                    name="operating_hours"
                    defaultValue={attrs.operating_hours || "08:00 – 22:00 WIB (Setiap Hari)"}
                    placeholder="08:00 – 22:00 WIB"
                    className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                  <label htmlFor="overtime_policy" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Ketentuan Overtime
                  </label>
                  <input
                    type="text"
                    id="overtime_policy"
                    name="overtime_policy"
                    defaultValue={attrs.overtime_policy || "Toleransi 15 Menit, Overtime Rp 150.000 / 30 Menit"}
                    placeholder="Toleransi 15 menit..."
                    className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 3. FASHION BRAND / UMKM SPECIFICATIONS                             */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {isBrand && (
          <div className="space-y-8">
            {/* SEKSI 1: BRAND IDENTITY & DNA */}
            <div className="p-5 bg-stone-50/70 border border-stone-200 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                <ShoppingBag className="w-4 h-4 text-amber-800" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E]">
                  1. Identitas Brand &amp; DNA Desain
                </h3>
              </div>

              <TagInputWithSuggestions
                label="Kategori Koleksi Brand"
                name="brand_category"
                initialValues={attrs.brand_category || ["Women's Fashion", "Modest / Hijab"]}
                suggestions={ROLE_SPECS_PRESETS.BRAND.quickCategories}
                placeholder="Women's Fashion, Men's Fashion, Modest..."
              />

              <TagInputWithSuggestions
                label="Jenis Produk Utama"
                name="product_types"
                initialValues={attrs.product_types || ["Ready-to-Wear Clothing", "Outerwear & Blazer"]}
                suggestions={ROLE_SPECS_PRESETS.BRAND.quickProductTypes}
                placeholder="Ready-to-Wear, Outerwear, Dresses, Bags..."
              />

              <TagInputWithSuggestions
                label="Target Pasar Brand"
                name="target_market"
                initialValues={attrs.target_market || ["Gen Z (18-24)", "Young Adults (25-35)"]}
                suggestions={ROLE_SPECS_PRESETS.BRAND.quickTargetMarkets}
                placeholder="Gen Z, Young Adults, Professional..."
              />

              <div className="space-y-1.5">
                <label htmlFor="design_dna" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  DNA &amp; Karakter Desain Brand
                </label>
                <textarea
                  id="design_dna"
                  name="design_dna"
                  rows={2}
                  defaultValue={attrs.design_dna || "Minimalist Modern Silhouettes dengan Sentuhan Wastra Tenun Kontemporer"}
                  placeholder="Ceritakan estetika utama, siluet, dan filosofi rancangan brand Anda..."
                  className="w-full px-4 py-2.5 bg-white border border-stone-200 text-xs font-medium text-stone-800 leading-relaxed"
                />
              </div>
            </div>

            {/* SEKSI 2: RESOURCES & PHYSICAL SAMPLES */}
            <div className="p-5 bg-stone-50/70 border border-stone-200 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                <Scissors className="w-4 h-4 text-amber-800" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E]">
                  2. Sumber Daya Fisik, Sampel Busana &amp; Material
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="sample_sizes_ready" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Ukuran Sampel Siap Foto
                  </label>
                  <input
                    type="text"
                    id="sample_sizes_ready"
                    name="sample_sizes_ready"
                    defaultValue={attrs.sample_sizes_ready || "S, M (Siap Fitting On-Set)"}
                    placeholder="S, M / All-size"
                    className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="sample_skus_count" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Jumlah Look/SKU Siap Foto
                  </label>
                  <input
                    type="number"
                    id="sample_skus_count"
                    name="sample_skus_count"
                    defaultValue={attrs.sample_skus_count || 15}
                    placeholder="15"
                    className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="capacity_monthly" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Kapasitas Produksi Bulanan
                  </label>
                  <input
                    type="text"
                    id="capacity_monthly"
                    name="capacity_monthly"
                    defaultValue={attrs.capacity_monthly || "500 - 1.000 Pcs / Bulan"}
                    placeholder="500 - 1.000 Pcs"
                    className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                  />
                </div>
              </div>

              <TagInputWithSuggestions
                label="Karakteristik Bahan &amp; Kain yang Digunakan"
                name="fabric_materials"
                initialValues={attrs.fabric_materials || ["Linen Organik", "Katun Rayon Twill", "Sutra ATBM Garut"]}
                suggestions={ROLE_SPECS_PRESETS.BRAND.quickFabrics}
                placeholder="Linen, Katun Rayon, Sutra ATBM, Tencel..."
              />
            </div>

            {/* SEKSI 3: COLLABORATION PREFERENCES */}
            <div className="p-5 bg-stone-50/70 border border-stone-200 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                <Sparkles className="w-4 h-4 text-amber-800" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E]">
                  3. Kebutuhan Kolaborasi Proyek &amp; Format Kerjasama
                </h3>
              </div>

              <TagInputWithSuggestions
                label="Partner Kreator yang Dicari untuk Kolaborasi"
                name="collaboration_needs"
                initialValues={attrs.collaboration_needs || ["Photographer", "Model", "MUA/Stylist", "Studio"]}
                suggestions={ROLE_SPECS_PRESETS.BRAND.quickCollabNeeds}
                placeholder="Photographer, Model, MUA, Studio, Designer..."
              />

              <TagInputWithSuggestions
                label="Tipe Kampanye Proyek yang Sedang Dibuka"
                name="campaign_types"
                initialValues={attrs.campaign_types || ["Lookbook Musiman (Spring/Summer)", "Product Launch Koleksi Baru"]}
                suggestions={ROLE_SPECS_PRESETS.BRAND.quickCampaignTypes}
                placeholder="Product Launch, Lookbook, Social Media Reels..."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="budget_range" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Rentang Anggaran Kolaborasi (Rp)
                  </label>
                  <input
                    type="text"
                    id="budget_range"
                    name="budget_range"
                    defaultValue={attrs.budget_range || "Rp 5.000.000 – Rp 15.000.000 per Kampanye"}
                    placeholder="Rp 5.000.000 – Rp 15.000.000"
                    className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="collab_timeline" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Target Timeline Pengerjaan
                  </label>
                  <input
                    type="text"
                    id="collab_timeline"
                    name="collab_timeline"
                    defaultValue={attrs.collab_timeline || "2 – 4 Minggu dari Brief hingga Peluncuran"}
                    placeholder="2 – 4 Minggu"
                    className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 4. MODEL / TALENT SPECIFICATIONS                                   */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {isModel && (
          <div className="space-y-8">
            {/* SEKSI 1: VITAL MEASUREMENTS */}
            <div className="p-5 bg-stone-50/70 border border-stone-200 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
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
                    defaultValue={attrs.height_cm || 175}
                    placeholder="175"
                    required
                    className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="weight_kg" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Berat Badan (kg)
                  </label>
                  <input
                    type="number"
                    id="weight_kg"
                    name="weight_kg"
                    defaultValue={attrs.weight_kg || 52}
                    placeholder="52"
                    className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="bust_waist_hips" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Dada - Pinggang - Pinggul <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="bust_waist_hips"
                    name="bust_waist_hips"
                    defaultValue={attrs.bust_waist_hips || "84-60-89 cm"}
                    placeholder="84-60-89 cm"
                    required
                    className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="clothing_size" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Ukuran Baju Sampel <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="clothing_size"
                    name="clothing_size"
                    defaultValue={attrs.clothing_size || "S / 36 EU"}
                    placeholder="S / 36 EU"
                    required
                    className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="shoe_size" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Ukuran Sepatu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="shoe_size"
                    name="shoe_size"
                    defaultValue={attrs.shoe_size || "39 EU"}
                    placeholder="39 EU"
                    required
                    className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="experience_years" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Pengalaman (Tahun)
                  </label>
                  <input
                    type="number"
                    id="experience_years"
                    name="experience_years"
                    defaultValue={attrs.experience_years || 4}
                    placeholder="4"
                    className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                  />
                </div>
              </div>
            </div>

            {/* SEKSI 2: CAPABILITIES & POLAROID COMP CARDS */}
            <div className="p-5 bg-stone-50/70 border border-stone-200 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                <Camera className="w-4 h-4 text-purple-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E]">
                  2. Foto Polaroid Comp Card (3 Sudut Pandang Casting)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {polaroidPreviews.map((slot, idx) => (
                  <div key={idx} className="p-3 bg-white border border-stone-200 space-y-2">
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
                    <input type="hidden" name={`polaroid_url_${idx}`} value={slot.url} />
                    <input type="hidden" name={`polaroid_type_${idx}`} value={slot.type} />

                    <div
                      onClick={() => fileInputRefs[idx].current?.click()}
                      className="aspect-[3/4] w-full bg-stone-50 border border-dashed border-stone-300 hover:border-[#1E1B2E] transition-all flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group select-none"
                    >
                      {slot.url ? (
                        <>
                          <img src={slot.url} alt={slot.type} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold gap-1">
                            <Upload className="w-4 h-4" />
                            <span>Ganti Foto</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-3 space-y-1 text-stone-400">
                          <Upload className="w-5 h-5 mx-auto text-stone-400" />
                          <span className="text-[10px] font-bold block text-stone-600">Unggah Polaroid</span>
                          <span className="text-[9px] text-stone-400 block">Maks 10 MB</span>
                        </div>
                      )}
                    </div>

                    <input
                      type="text"
                      name={`polaroid_caption_${idx}`}
                      defaultValue={slot.caption}
                      placeholder={`Keterangan ${slot.type}`}
                      className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 text-[11px] font-medium text-stone-800"
                    />
                  </div>
                ))}
              </div>

              <TagInputWithSuggestions
                label="Bidang &amp; Spesialisasi Modeling"
                name="specialties"
                initialValues={attrs.specialties || ["Fashion Editorial", "Commercial Lookbook", "Runway Catwalk"]}
                suggestions={ROLE_SPECS_PRESETS.MODEL.quickSpecialties}
                placeholder="Fashion Editorial, Lookbook, Runway..."
              />

              <TagInputWithSuggestions
                label="Kapabilitas &amp; Ekspresi On-Set"
                name="capabilities"
                initialValues={attrs.capabilities || ["Runway Catwalk", "Editorial High-Fashion Pose", "Lifestyle Motion & Video TVC"]}
                suggestions={ROLE_SPECS_PRESETS.MODEL.quickCapabilities}
                placeholder="Runway, High-Fashion Pose, Acting..."
              />
            </div>

            {/* SEKSI 3: OPERATIONAL POLICIES & LIMITS */}
            <div className="p-5 bg-stone-50/70 border border-stone-200 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                <ShieldCheck className="w-4 h-4 text-purple-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E]">
                  3. Batasan Operasional &amp; Kebijakan Wardrobe
                </h3>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="wardrobe_restrictions" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Batasan &amp; Preferensi Wardrobe
                </label>
                <input
                  type="text"
                  id="wardrobe_restrictions"
                  name="wardrobe_restrictions"
                  defaultValue={attrs.wardrobe_restrictions || "Casual, Formal, Modest (No Swimwear / No Sheer)"}
                  placeholder="Casual, Formal, Modest / Hijab..."
                  className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                />
                <div className="flex flex-wrap gap-1 pt-1">
                  {ROLE_SPECS_PRESETS.MODEL.quickWardrobePolicies.map((pol) => (
                    <button
                      key={pol}
                      type="button"
                      onClick={() => {
                        const el = document.getElementById("wardrobe_restrictions") as HTMLInputElement;
                        if (el) el.value = pol;
                      }}
                      className="text-[10px] px-2 py-0.5 bg-white border border-stone-200 hover:border-stone-400 text-stone-600"
                    >
                      + {pol}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label htmlFor="travel_radius" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Jangkauan Lokasi Kerja
                  </label>
                  <input
                    type="text"
                    id="travel_radius"
                    name="travel_radius"
                    defaultValue={attrs.travel_radius || "Jabodetabek & Luar Kota dengan Akomodasi"}
                    placeholder="Jabodetabek / Seluruh Indonesia"
                    className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="chaperone_allowed"
                      value="true"
                      defaultChecked={Boolean(attrs.chaperone_allowed !== false)}
                      className="w-4 h-4 rounded-none accent-[#1E1B2E]"
                    />
                    <span className="text-xs font-bold text-[#1E1B2E]">
                      Didampingi Manajer / Chaperone di Lokasi Shoot
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 5. MUA / STYLIST SPECIFICATIONS                                    */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {(isMUA || isStylist) && (
          <div className="space-y-8">
            {/* SEKSI 1: CAPABILITIES */}
            <div className="p-5 bg-stone-50/70 border border-stone-200 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                <Palette className="w-4 h-4 text-rose-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E]">
                  1. Keahlian &amp; Cakupan Layanan
                </h3>
              </div>

              <TagInputWithSuggestions
                label="Spesialisasi Look &amp; Styling"
                name="specialties"
                initialValues={attrs.specialties || ["Fashion Editorial Makeup", "Commercial Lookbook Glow", "High-Definition 4K Beauty"]}
                suggestions={ROLE_SPECS_PRESETS.MUA_STYLIST.quickSpecialties}
                placeholder="Fashion Editorial, Lookbook Glow, High-Definition 4K..."
              />

              <TagInputWithSuggestions
                label="Cakupan Layanan On-Set"
                name="services"
                initialValues={attrs.services || ["Makeup HD 4K Tahan Panas", "Hair Styling & Hijab Do Rapi", "Touch-Up On-Set Standby"]}
                suggestions={ROLE_SPECS_PRESETS.MUA_STYLIST.quickServices}
                placeholder="Makeup HD 4K, Hair Styling, Wardrobe Styling..."
              />
            </div>

            {/* SEKSI 2: KIT & EQUIPMENT */}
            <div className="p-5 bg-stone-50/70 border border-stone-200 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                <Sparkles className="w-4 h-4 text-rose-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E]">
                  2. Peralatan Rias, Wardrobe Gear &amp; Standar Sanitasi
                </h3>
              </div>

              <TagInputWithSuggestions
                label="Brand Makeup Kit Utama"
                name="primary_kit_brands"
                initialValues={attrs.primary_kit_brands || ["Charlotte Tilbury", "MAC Cosmetics", "Dior Backstage", "NARS"]}
                suggestions={ROLE_SPECS_PRESETS.MUA_STYLIST.quickKitBrands}
                placeholder="Charlotte Tilbury, MAC, Dior Backstage, NARS..."
              />

              <TagInputWithSuggestions
                label="Peralatan On-Set &amp; Wardrobe Tools"
                name="onset_equipment"
                initialValues={attrs.onset_equipment || ["Garment Steamer Uap Panas", "Gantungan Baju Roll Portable", "Klem Fitting Busana Studio"]}
                suggestions={ROLE_SPECS_PRESETS.MUA_STYLIST.quickOnsetGear}
                placeholder="Garment Steamer, Gantungan Baju Roll, Klem Fitting..."
              />

              <div className="space-y-1.5">
                <label htmlFor="sanitation_standards" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Standar Higienitas &amp; Sanitasi Kuas
                </label>
                <input
                  type="text"
                  id="sanitation_standards"
                  name="sanitation_standards"
                  defaultValue={
                    Array.isArray(attrs.sanitation_standards)
                      ? attrs.sanitation_standards.join(", ")
                      : "Disinfektan Kuas 70% Alkohol, Palet Stainless Steel, Aplikator Sekali Pakai (Disposable)"
                  }
                  placeholder="Disinfektan Kuas 70% Alkohol..."
                  className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                />
              </div>
            </div>

            {/* SEKSI 3: CAPACITY LIMITS */}
            <div className="p-5 bg-stone-50/70 border border-stone-200 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                <Clock className="w-4 h-4 text-rose-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E]">
                  3. Batasan Kapasitas &amp; Durasi Operasional
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="max_heads_per_session" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Maks Model per Shift (Kepala)
                  </label>
                  <input
                    type="number"
                    id="max_heads_per_session"
                    name="max_heads_per_session"
                    defaultValue={attrs.max_heads_per_session || 3}
                    placeholder="3"
                    className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="prep_time_minutes" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Waktu Rias per Look (Menit)
                  </label>
                  <input
                    type="number"
                    id="prep_time_minutes"
                    name="prep_time_minutes"
                    defaultValue={attrs.prep_time_minutes || 90}
                    placeholder="90"
                    className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="touchup_standby_hours" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Durasi Standby On-Set (Jam)
                  </label>
                  <input
                    type="number"
                    id="touchup_standby_hours"
                    name="touchup_standby_hours"
                    defaultValue={attrs.touchup_standby_hours || 8}
                    placeholder="8"
                    className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 6. FASHION DESIGNER SPECIFICATIONS                                 */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {isDesigner && (
          <div className="space-y-8">
            {/* SEKSI 1: DESIGN DISCIPLINES */}
            <div className="p-5 bg-stone-50/70 border border-stone-200 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                <Scissors className="w-4 h-4 text-pink-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E]">
                  1. Disiplin Desain Busana &amp; DNA Atelier
                </h3>
              </div>

              <TagInputWithSuggestions
                label="Spesialisasi Desain Busana"
                name="specialties"
                initialValues={attrs.specialties || attrs.design_disciplines || ["Apparel Ready-to-Wear", "Contemporary Couture", "Wastra Nusantara & Batik"]}
                suggestions={ROLE_SPECS_PRESETS.DESIGNER.quickSpecialties}
                placeholder="Ready-to-Wear, Contemporary Couture, Wastra..."
              />

              <TagInputWithSuggestions
                label="Kapabilitas Teknis Perancangan"
                name="capabilities"
                initialValues={attrs.capabilities || ["Moodboard & Trend Research", "Digital 2D Tech-Pack", "Pola Presisi (Pattern Making)", "Sampel Fisik Busana (Toille)"]}
                suggestions={ROLE_SPECS_PRESETS.DESIGNER.quickCapabilities}
                placeholder="Moodboard, Tech-Pack, Pola Presisi, Toille..."
              />

              <div className="space-y-1.5">
                <label htmlFor="style_dna" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  DNA Desain &amp; Karakter Siluet
                </label>
                <textarea
                  id="style_dna"
                  name="style_dna"
                  rows={2}
                  defaultValue={attrs.style_dna || "Siluet Deconstructed dengan Sentuhan Draping Wastra & Palet Earth-Tone"}
                  placeholder="Deskripsikan karakter siluet, estetika, dan DNA desain Anda..."
                  className="w-full px-4 py-2.5 bg-white border border-stone-200 text-xs font-medium text-stone-800 leading-relaxed"
                />
              </div>
            </div>

            {/* SEKSI 2: WORKSHOP & SAMPLE ARCHIVE */}
            <div className="p-5 bg-stone-50/70 border border-stone-200 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                <Layers className="w-4 h-4 text-pink-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E]">
                  2. Sumber Daya Workshop, Material &amp; Koleksi Sampel
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-2 p-3 bg-white border border-stone-200 cursor-pointer hover:bg-stone-50">
                  <input
                    type="checkbox"
                    name="sample_collection_ready"
                    value="true"
                    defaultChecked={Boolean(attrs.sample_collection_ready !== false)}
                    className="w-4 h-4 rounded-none accent-[#1E1B2E]"
                  />
                  <div className="text-xs font-bold text-[#1E1B2E]">
                    Menyediakan Sampel Siap Dipinjamkan (Wardrobe Pulling)
                    <span className="block text-[10px] font-normal text-stone-400">Untuk pemotretan lookbook brand partner &amp; editorial</span>
                  </div>
                </label>

                <div className="space-y-1.5">
                  <label htmlFor="sample_portfolio_count" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Jumlah Arsip Busana Siap Pakai (Look)
                  </label>
                  <input
                    type="number"
                    id="sample_portfolio_count"
                    name="sample_portfolio_count"
                    defaultValue={attrs.sample_portfolio_count || 25}
                    placeholder="25"
                    className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                  />
                </div>
              </div>

              <TagInputWithSuggestions
                label="Material &amp; Kain yang Sering Diolah"
                name="materials_swatches"
                initialValues={attrs.materials_swatches || ["Kain Tenun Lurik & Sutra", "Linen Premium Import", "Deadstock Eco-Fabric"]}
                suggestions={ROLE_SPECS_PRESETS.DESIGNER.quickMaterials}
                placeholder="Tenun Lurik, Linen Premium, Deadstock Eco-Fabric..."
              />
            </div>

            {/* SEKSI 3: PRODUCTION CAPACITY & COLLAB */}
            <div className="p-5 bg-stone-50/70 border border-stone-200 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                <Clock className="w-4 h-4 text-pink-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E]">
                  3. Kapasitas Produksi &amp; Format Kolaborasi
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="sample_turnaround_days" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Turnaround Sampel Prototipe (Hari)
                  </label>
                  <input
                    type="text"
                    id="sample_turnaround_days"
                    name="sample_turnaround_days"
                    defaultValue={attrs.sample_turnaround_days || "7 – 14 Hari Kerja per Prototipe"}
                    placeholder="7 – 14 Hari Kerja"
                    className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="batch_production_capacity" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Kapasitas Batch Produksi Busana
                  </label>
                  <input
                    type="text"
                    id="batch_production_capacity"
                    name="batch_production_capacity"
                    defaultValue={attrs.batch_production_capacity || "100 – 300 Pcs per Batch Koleksi Kapsul"}
                    placeholder="100 – 300 Pcs per Batch"
                    className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                  />
                </div>
              </div>

              <TagInputWithSuggestions
                label="Format Kolaborasi yang Terbuka"
                name="collab_types"
                initialValues={attrs.collab_types || ["Co-Branding Koleksi Kapsul", "Peminjaman Wardrobe Lookbook", "Kemitraan Desain Brand UMKM"]}
                suggestions={ROLE_SPECS_PRESETS.DESIGNER.quickCollabTypes}
                placeholder="Co-Branding, Wardrobe Loan, Desain Kapsul..."
              />
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 7. VIDEOGRAPHER SPECIFICATIONS                                     */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {isVideographer && (
          <div className="space-y-8">
            <div className="p-5 bg-stone-50/70 border border-stone-200 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                <Video className="w-4 h-4 text-cyan-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E]">
                  Peralatan Sinematografi &amp; Cinema Rig
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="primary_cinema_camera" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Kamera Sinema Utama
                  </label>
                  <input
                    type="text"
                    id="primary_cinema_camera"
                    name="primary_cinema_camera"
                    defaultValue={attrs.primary_cinema_camera || attrs.primary_camera || "Sony FX3 / FX6"}
                    placeholder="Sony FX3 / RED Komodo / BMPCC 6K"
                    className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="stabilizer_gimbal" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Stabilizer / Gimbal Rig
                  </label>
                  <input
                    type="text"
                    id="stabilizer_gimbal"
                    name="stabilizer_gimbal"
                    defaultValue={attrs.stabilizer_gimbal || "DJI RS 3 Pro Gimbal"}
                    placeholder="DJI RS 3 Pro Gimbal"
                    className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                  />
                </div>
              </div>

              <TagInputWithSuggestions
                label="Lensa Cine &amp; Video Optik"
                name="cine_lenses"
                initialValues={attrs.cine_lenses || attrs.lenses || ["Sony FE 24-70mm f/2.8 GM", "Sirui Anamorphic 50mm"]}
                placeholder="24-70mm f/2.8, Cine Primes..."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label htmlFor="audio_rig" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Perangkat Audio On-Set
                  </label>
                  <input
                    type="text"
                    id="audio_rig"
                    name="audio_rig"
                    defaultValue={attrs.audio_rig || "DJI Mic 2 Wireless + Rode NTG3 Shotgun"}
                    placeholder="DJI Mic 2, Rode VideoMic Pro..."
                    className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="max_resolution" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Resolusi Video Maksimal
                  </label>
                  <input
                    type="text"
                    id="max_resolution"
                    name="max_resolution"
                    defaultValue={attrs.max_resolution || "4K 60fps / 10-Bit 4:2:2 (S-Log3)"}
                    placeholder="4K 60fps 10-bit 4:2:2"
                    className="w-full px-3 py-2 bg-white border border-stone-200 text-xs font-medium text-stone-800"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBMIT BUTTON BAR */}
        <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-stone-500 text-xs">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Tersinkronisasi otomatis dengan profil direktori publik &amp; algoritma matching.</span>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-none bg-[#1E1B2E] text-white font-bold text-sm hover:bg-black transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-xs cursor-pointer"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isPending ? "Menyimpan Spesifikasi..." : "Simpan Spesifikasi Terstruktur"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
