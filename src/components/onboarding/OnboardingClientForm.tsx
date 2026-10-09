"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  Package,
  Building,
  Users2,
  Camera,
  Video,
  Palette,
  Scissors,
  Star,
  Brush,
  Sparkles,
  MapPin,
  Building as BuildingIcon,
  Globe,
  Phone,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  AlertCircle
} from "lucide-react";
import { createActorProfile } from "@/app/onboarding/actions";

interface OnboardingClientFormProps {
  userInitialName: string;
  userInitialRole: string;
  userInitialLocation: string;
  popularLocations: string[];
  error?: string;
}

interface OfficialRoleOption {
  role: string;
  actorType: "BRAND" | "INDIVIDUAL" | "STUDIO";
  icon: React.ElementType;
  badge: string;
  desc: string;
}

const FIVE_OFFICIAL_ROLES: OfficialRoleOption[] = [
  {
    role: "Fashion Brand/UMKM",
    actorType: "BRAND",
    icon: Building,
    badge: "Brand & Klien",
    desc: "Brand mode, label busana, atau UMKM apparel yang merekrut kru & memproduksi kampanye.",
  },
  {
    role: "Photographer",
    actorType: "INDIVIDUAL",
    icon: Camera,
    badge: "Fotografi Visual",
    desc: "Fotografer fashion, editorial lookbook, katalog produk, dan kampanye komersial.",
  },
  {
    role: "Model",
    actorType: "INDIVIDUAL",
    icon: Star,
    badge: "Model & Muse",
    desc: "Model peraga busana, editorial muse, talent runway & lookbook katalog.",
  },
  {
    role: "MUA/Stylist",
    actorType: "INDIVIDUAL",
    icon: Brush,
    badge: "Beauty & Style",
    desc: "Makeup artist, hair stylist, dan penata gaya busana (wardrobe stylist) sesi pemotretan.",
  },
  {
    role: "Studio",
    actorType: "STUDIO",
    icon: Package,
    badge: "Studio Space",
    desc: "Fasilitas studio foto sewa, cyclorama wall, lighting kit & ruang produksi.",
  },
];

const AESTHETIC_STYLES = [
  "Minimalist",
  "Streetwear",
  "Luxury",
  "Cinematic",
  "Y2K",
  "High-Fashion",
  "Edgy",
  "Vintage",
  "Editorial",
  "Traditional / Wastra",
];

export function OnboardingClientForm({
  userInitialName,
  userInitialRole,
  userInitialLocation,
  popularLocations,
  error,
}: OnboardingClientFormProps) {
  const getInitialRole = (roleStr: string): OfficialRoleOption => {
    const r = (roleStr || "").toLowerCase();
    if (r.includes("brand") || r.includes("label") || r.includes("umkm") || r.includes("designer") || r.includes("desain")) {
      return FIVE_OFFICIAL_ROLES[0];
    }
    if (r.includes("model") || r.includes("talent") || r.includes("muse")) {
      return FIVE_OFFICIAL_ROLES[2];
    }
    if (r.includes("mua") || r.includes("makeup") || r.includes("stylist") || r.includes("wardrobe")) {
      return FIVE_OFFICIAL_ROLES[3];
    }
    if (r.includes("studio") || r.includes("ruang")) {
      return FIVE_OFFICIAL_ROLES[4];
    }
    return FIVE_OFFICIAL_ROLES[1]; // Default Photographer
  };

  const [selectedRole, setSelectedRole] = useState<OfficialRoleOption>(() =>
    getInitialRole(userInitialRole)
  );

  return (
    <form action={createActorProfile} className="space-y-8">
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">{error}</p>
        </div>
      )}

      {/* 1. SELEKSI 5 PERAN RESMI */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#27213D]">
            1. Peran Resmi Anda di RAMU *
          </label>
          <span className="text-[11px] text-[#716B7E] font-medium">
            Eksklusif 5 Entitas Ekosistem
          </span>
        </div>

        <input type="hidden" name="sector" value={selectedRole.role} />
        <input type="hidden" name="actorType" value={selectedRole.actorType} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FIVE_OFFICIAL_ROLES.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedRole.role === item.role;
            return (
              <button
                type="button"
                key={item.role}
                onClick={() => setSelectedRole(item)}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? "bg-[#27213D] text-white border-[#27213D] shadow-md ring-2 ring-[#FFB800]"
                    : "bg-[#FAF8F5] border-stone-200/80 hover:border-stone-300 hover:bg-stone-50 text-[#27213D]"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-[#FFB800] text-[#1E1B2E]"
                        : "bg-white text-[#716B7E] border border-stone-200"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-white/20 text-[#FFB800]"
                        : "bg-stone-200/60 text-[#716B7E]"
                    }`}
                  >
                    {item.badge}
                  </span>
                </div>
                <div>
                  <h4
                    className={`text-sm font-bold leading-tight mb-1 ${
                      isSelected ? "text-white" : "text-[#27213D]"
                    }`}
                  >
                    {item.role}
                  </h4>
                  <p
                    className={`text-[11px] leading-relaxed line-clamp-2 ${
                      isSelected ? "text-stone-300" : "text-[#716B7E]"
                    }`}
                  >
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-5 pt-4 border-t border-stone-200/70">
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="block text-xs font-bold uppercase tracking-wider text-[#27213D]"
          >
            Nama Profil / Label / Studio *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={userInitialName}
            placeholder={
              selectedRole.actorType === "BRAND"
                ? "misal: Maison Nusantara / Svarga Wear"
                : "misal: Alex Tan Photography / Studio Arkha"
            }
            className="w-full px-4 py-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 text-sm text-[#27213D] placeholder-[#716B7E]/60 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 focus:bg-white transition-all font-medium"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="bio"
            className="block text-xs font-bold uppercase tracking-wider text-[#27213D]"
          >
            Bio / Fokus Estetika & Visi Karya
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            placeholder="Ceritakan estetika desain, fokus koleksi busana, ketersediaan kamera/studio, atau konsep visual yang biasa Anda garap..."
            className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 text-sm text-[#27213D] placeholder-[#716B7E]/60 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 focus:bg-white transition-all font-medium resize-none leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="location"
              className="block text-xs font-bold uppercase tracking-wider text-[#27213D]"
            >
              Kota / Basis Kreatif *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#716B7E]">
                <MapPin className="w-4 h-4 text-[#27213D]" />
              </div>
              <input
                id="location"
                name="location"
                type="text"
                required
                defaultValue={userInitialLocation}
                placeholder="misal: Jakarta Selatan, Indonesia"
                list="locations-list"
                className="w-full pl-10 pr-10 py-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 text-sm text-[#27213D] placeholder-[#716B7E]/60 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 focus:bg-white transition-all font-medium"
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#716B7E]">
                <ChevronDown className="w-4 h-4" />
              </div>
              <datalist id="locations-list">
                {popularLocations.map((loc) => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="address"
              className="block text-xs font-bold uppercase tracking-wider text-[#27213D]"
            >
              Alamat Studio / Workshop (Opsional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#716B7E]">
                <BuildingIcon className="w-4 h-4 text-[#27213D]" />
              </div>
              <input
                id="address"
                name="address"
                type="text"
                placeholder="Nama jalan, gedung, nomor studio..."
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 text-sm text-[#27213D] placeholder-[#716B7E]/60 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="websiteUrl"
              className="block text-xs font-bold uppercase tracking-wider text-[#27213D]"
            >
              Website / Portofolio Web (Opsional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#716B7E]">
                <Globe className="w-4 h-4 text-[#27213D]" />
              </div>
              <input
                id="websiteUrl"
                name="websiteUrl"
                type="url"
                placeholder="https://instagram.com/studioanda"
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 text-sm text-[#27213D] placeholder-[#716B7E]/60 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="contactPhone"
              className="block text-xs font-bold uppercase tracking-wider text-[#27213D]"
            >
              WhatsApp / Kontak Kerja (Opsional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#716B7E]">
                <Phone className="w-4 h-4 text-[#27213D]" />
              </div>
              <input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                placeholder="+62 812-3456-7890"
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 text-sm text-[#27213D] placeholder-[#716B7E]/60 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-5 border-t border-stone-200/70 space-y-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FFB800]" />
          <h3 className="text-sm font-bold text-[#27213D]">Preferensi Smart Matching</h3>
        </div>
        <p className="text-xs text-[#716B7E] leading-relaxed -mt-4">
          Pilihan ini membantu Engine RAMU mengelompokkan portofolio dan merekomendasikan tim produksi atau brief yang paling serasi.
        </p>

        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#27213D]">
            Gaya Visual / Tema Estetika (Pilih beberapa)
          </label>
          <div className="flex flex-wrap gap-2">
            {AESTHETIC_STYLES.map((style) => (
              <label key={style} className="cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="aestheticStyles"
                  value={style}
                  className="sr-only peer"
                />
                <span className="inline-block px-3.5 py-1.5 rounded-xl text-xs font-medium bg-[#FAF8F5] text-[#27213D] border border-stone-200/80 hover:bg-[#FFF7ED] hover:border-[#F9D8C4] peer-checked:bg-[#FFB800] peer-checked:text-[#1E1B2E] peer-checked:border-[#FFB800] peer-checked:font-bold shadow-xs transition-all">
                  {style}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label
              htmlFor="experienceLevel"
              className="block text-xs font-bold uppercase tracking-wider text-[#27213D]"
            >
              Tingkat Jam Terbang
            </label>
            <select
              id="experienceLevel"
              name="experienceLevel"
              defaultValue="PROFESSIONAL"
              className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-stone-200/80 text-sm text-[#27213D] focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 transition-all cursor-pointer font-medium"
            >
              <option value="EMERGING">Pendatang Baru / Portofolio Eksplorasi</option>
              <option value="PROFESSIONAL">Profesional Berpengalaman</option>
              <option value="EXPERT">Senior / Established / Papan Atas</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#27213D]">
              Model Kompensasi yang Diterima
            </label>
            <div className="space-y-2 pt-1">
              {[
                { id: "PAID", label: "Paid (Fee Komersial Berbayar Penuh)" },
                { id: "REVENUE_SHARE", label: "Bagi Hasil (Revenue Share / Royalti Komersial)" },
              ].map((model) => (
                <label key={model.id} className="flex items-center gap-2.5 cursor-pointer group">
                  <div className="relative flex items-center justify-center shrink-0">
                    <input
                      type="checkbox"
                      name="compensationModels"
                      value={model.id}
                      className="peer sr-only"
                      defaultChecked={model.id === "PAID"}
                    />
                    <div className="w-4 h-4 rounded border border-stone-300 peer-checked:bg-[#27213D] peer-checked:border-[#27213D] transition-colors flex items-center justify-center bg-[#FAF8F5]">
                      <svg
                        className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#27213D] group-hover:text-[#FFB800] transition-colors">
                    {model.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-stone-200/70">
        <div className="h-1.5 bg-stone-200/60 rounded-full w-full overflow-hidden mb-6">
          <div className="h-full bg-[#FFB800] rounded-full w-full" />
        </div>

        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-full bg-white hover:bg-stone-50 border border-stone-200 text-[#27213D] text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Lewati</span>
          </Link>

          <button
            type="submit"
            className="px-8 py-3.5 rounded-full bg-[#FFB800] hover:bg-[#FFA800] active:scale-[0.98] text-[#1E1B2E] text-xs sm:text-sm font-extrabold shadow-[0_8px_24px_rgba(255,184,0,0.35)] transition-all hover:scale-105 cursor-pointer flex items-center gap-2"
          >
            <span>Selesaikan & Buka Workspace</span>
            <ArrowRight className="w-4 h-4 text-[#1E1B2E]" />
          </button>
        </div>
      </div>
    </form>
  );
}
