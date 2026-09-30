"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  X,
  Camera,
  User,
  Ruler,
  Sparkles,
  Building2,
  Upload,
  Trash2,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  CreditCard,
  Plus,
  ArrowRight,
  ImageIcon,
  Phone,
} from "lucide-react";
import {
  updateActorSpecs,
  updateProfileBasicInfo,
  updateServicePackagesAndRates,
} from "@/app/settings/actions";
import { parseSocialLinks, InstagramIcon } from "@/lib/socialUtils";

export type DrawerTabType = "specs" | "rates" | "profile" | "contact" | "portfolio";

interface ServicePackageItem {
  title: string;
  subtitle: string;
  price: string;
  unit: string;
  popular?: boolean;
  features: string[];
}

interface ProfileSlideOverDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: DrawerTabType;
  actor: {
    id: string;
    name: string;
    sector: string;
    actorType: string;
    description?: string | null;
    location?: string | null;
    websiteUrl?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    owner?: {
      displayName?: string | null;
      avatarUrl?: string | null;
    } | null;
    assets: Array<{
      id: string;
      name: string;
      category: string;
      subtype: string;
      roles: string[];
      description?: string | null;
      attributes?: Record<string, unknown> | null;
    }>;
  };
}

export function ProfileSlideOverDrawer({
  isOpen,
  onClose,
  defaultTab = "specs",
  actor,
}: ProfileSlideOverDrawerProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<DrawerTabType>(defaultTab);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setActiveDrawerTab(defaultTab);
      setMessage(null);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, defaultTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const sectorLower = actor.sector.toLowerCase();
  const isStudio = actor.actorType === "STUDIO" || sectorLower.includes("studio");
  const isModel = sectorLower.includes("model") || sectorLower.includes("talent");
  const isPhotographer = sectorLower.includes("photographer") || sectorLower.includes("fotografi");
  const isVideographer = sectorLower.includes("video") || sectorLower.includes("film") || sectorLower.includes("cinema");
  const isMUA = sectorLower.includes("mua") || sectorLower.includes("makeup") || sectorLower.includes("hair");
  const isStylist = sectorLower.includes("stylist") || sectorLower.includes("wardrobe");
  const isDesigner = sectorLower.includes("designer") || sectorLower.includes("desain");

  const existingAsset = actor.assets.find(
    (a) =>
      (isModel && (a.subtype.toLowerCase().includes("model") || (a.attributes && typeof a.attributes === "object" && "comp_card" in a.attributes))) ||
      (isStudio && (a.subtype.toLowerCase().includes("studio") || (a.attributes && typeof a.attributes === "object" && "cyclorama_type" in a.attributes))) ||
      (isPhotographer && a.attributes && typeof a.attributes === "object" && "primary_camera" in a.attributes) ||
      (isVideographer && a.attributes && typeof a.attributes === "object" && "primary_cinema_camera" in a.attributes) ||
      (isMUA && a.attributes && typeof a.attributes === "object" && "makeup_styles" in a.attributes) ||
      (isStylist && a.attributes && typeof a.attributes === "object" && "styling_specialties" in a.attributes) ||
      (isDesigner && a.attributes && typeof a.attributes === "object" && "design_disciplines" in a.attributes)
  );

  const attrs = (existingAsset?.attributes && typeof existingAsset.attributes === "object")
    ? (existingAsset.attributes as Record<string, any>)
    : {};

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

  useEffect(() => {
    const freshCompCard = Array.isArray(attrs.comp_card) ? attrs.comp_card : [];
    setPolaroidPreviews([
      {
        url: freshCompCard[0]?.url || "",
        type: freshCompCard[0]?.type || "Headshot / Close-up",
        caption: freshCompCard[0]?.caption || "Foto Headshot Natural (Tanpa Makeup Berlebih)",
      },
      {
        url: freshCompCard[1]?.url || "",
        type: freshCompCard[1]?.type || "Profile / 45° Angle",
        caption: freshCompCard[1]?.caption || "Tampak Samping Garis Rahang & Siluet",
      },
      {
        url: freshCompCard[2]?.url || "",
        type: freshCompCard[2]?.type || "Full Body Polaroid",
        caption: freshCompCard[2]?.caption || "Proporsi Tubuh Penuh (Minimalist Outfit)",
      },
    ]);
  }, [attrs.comp_card]);

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

  const [avatarPreview, setAvatarPreview] = useState<string | null>(actor.owner?.avatarUrl || null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const initialSocials = parseSocialLinks(actor.websiteUrl);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "Ukuran foto profil maksimal 5 MB." });
        return;
      }
      setAvatarPreview(URL.createObjectURL(file));
      setRemoveAvatar(false);
      setMessage(null);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setRemoveAvatar(true);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  };

  const serviceAsset = actor.assets.find(
    (a) =>
      a.subtype === "COMMERCIAL_SERVICE_PACKAGES" ||
      (a.attributes && typeof a.attributes === "object" && "service_packages" in (a.attributes as any))
  );
  const serviceAttrs = (serviceAsset?.attributes as any) || {};

  const [startingRate, setStartingRate] = useState<string>(
    serviceAttrs.starting_rate || (isModel ? "Mulai Rp 1,0 Jt / sesi" : isStudio ? "Mulai Rp 200rb / jam" : "Mulai Rp 1,5 Jt / sesi")
  );
  const [turnaroundTime, setTurnaroundTime] = useState<string>(
    serviceAttrs.turnaround_time || (isModel ? "Selesai Sesi Pemotretan" : isStudio ? "Instan / Slot Booking" : "3 – 5 Hari Kerja")
  );

  const initialServicePackages: ServicePackageItem[] = Array.isArray(serviceAttrs.service_packages) && serviceAttrs.service_packages.length > 0
    ? serviceAttrs.service_packages
    : [
        {
          title: isModel ? "Half-Day Editorial Lookbook" : "Paket Sesi Dasar",
          subtitle: "Sesi standar pemotretan komersial",
          price: isModel ? "Rp 1.500.000" : "Rp 1.200.000",
          unit: "per 4 jam",
          popular: false,
          features: ["Sesi kerja on-set terstruktur", "Penyesuaian moodboard klien"],
        },
        {
          title: isModel ? "Full-Day Fashion Campaign" : "Paket Produksi Penuh",
          subtitle: "Kampanye musiman & lookbook rilis",
          price: isModel ? "Rp 2.800.000" : "Rp 2.500.000",
          unit: "per 8 jam",
          popular: true,
          features: ["Sesi penuh 8 jam kerja", "Prioritas jadwal pengerjaan"],
        },
      ];

  const [packages, setPackages] = useState<ServicePackageItem[]>(initialServicePackages);

  const handleAddPackage = () => {
    setPackages((prev) => [
      ...prev,
      {
        title: "Paket Baru",
        subtitle: "Deskripsi singkat paket layanan",
        price: "Rp 1.000.000",
        unit: "per sesi",
        popular: false,
        features: ["Fitur layanan 1", "Fitur layanan 2"],
      },
    ]);
  };

  const handleRemovePackage = (index: number) => {
    setPackages((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePackageChange = (index: number, field: keyof ServicePackageItem, value: any) => {
    setPackages((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleFeaturesChange = (index: number, rawFeatures: string) => {
    const featureList = rawFeatures.split("\n").map((f) => f.trim()).filter(Boolean);
    handlePackageChange(index, "features", featureList);
  };

  async function handleSpecsSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateActorSpecs(formData);

    if (result.success) {
      setMessage({ type: "success", text: result.message || "Spesifikasi berhasil disimpan." });
      router.refresh();
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setMessage({ type: "error", text: result.error || "Gagal menyimpan spesifikasi." });
    }

    setIsPending(false);
  }

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateProfileBasicInfo(formData);

    if (result.success) {
      setMessage({ type: "success", text: result.message || "Profil berhasil diperbarui." });
      router.refresh();
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setMessage({ type: "error", text: result.error || "Gagal menyimpan profil." });
    }

    setIsPending(false);
  }

  async function handleRatesSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("startingRate", startingRate);
    formData.append("turnaroundTime", turnaroundTime);
    formData.append("packagesJson", JSON.stringify(packages));

    const result = await updateServicePackagesAndRates(formData);

    if (result.success) {
      setMessage({ type: "success", text: result.message || "Paket tarif berhasil diperbarui." });
      router.refresh();
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setMessage({ type: "error", text: result.error || "Gagal menyimpan tarif." });
    }

    setIsPending(false);
  }

  if (!isOpen || !mounted) return null;

  const specsTitle = isModel
    ? "Comp Card & Fisik"
    : isStudio
    ? "Fasilitas Studio"
    : isPhotographer || isVideographer
    ? "Kamera & Gear"
    : "Spesifikasi Teknis";

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 md:p-8 overflow-y-auto bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-white shadow-2xl flex flex-col max-h-[90vh] rounded-none border border-stone-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200 my-auto"
      >
        <div className="px-6 py-5 bg-[#1E1B2E] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-4 h-4 text-purple-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                Edit Informasi Profil ({actor.name})
              </h2>
              <p className="text-xs text-stone-300 mt-0.5">
                Perbarui data spesifikasi, tarif, bio, dan kontak Anda langsung di sini.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-white/10 transition-colors rounded-none cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-stone-200 bg-stone-50 overflow-x-auto no-scrollbar shrink-0 px-3 sm:px-6">
          <button
            type="button"
            onClick={() => {
              setActiveDrawerTab("specs");
              setMessage(null);
            }}
            className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer border-b-2 rounded-none ${
              activeDrawerTab === "specs"
                ? "border-[#1E1B2E] text-[#1E1B2E] bg-white shadow-2xs"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-purple-600" />
            <span>{specsTitle}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveDrawerTab("rates");
              setMessage(null);
            }}
            className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer border-b-2 rounded-none ${
              activeDrawerTab === "rates"
                ? "border-[#1E1B2E] text-[#1E1B2E] bg-white shadow-2xs"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
            <span>Paket &amp; Tarif</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveDrawerTab("profile");
              setMessage(null);
            }}
            className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer border-b-2 rounded-none ${
              activeDrawerTab === "profile"
                ? "border-[#1E1B2E] text-[#1E1B2E] bg-white shadow-2xs"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <User className="w-3.5 h-3.5 text-blue-600" />
            <span>Profil &amp; Bio</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveDrawerTab("contact");
              setMessage(null);
            }}
            className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer border-b-2 rounded-none ${
              activeDrawerTab === "contact"
                ? "border-[#1E1B2E] text-[#1E1B2E] bg-white shadow-2xs"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-amber-600" />
            <span>Kontak &amp; Medsos</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveDrawerTab("portfolio");
              setMessage(null);
            }}
            className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer border-b-2 rounded-none ${
              activeDrawerTab === "portfolio"
                ? "border-[#1E1B2E] text-[#1E1B2E] bg-white shadow-2xs"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-rose-500" />
            <span>Portofolio</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
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

          {activeDrawerTab === "specs" && (
            <form onSubmit={handleSpecsSubmit} className="space-y-6">
              {isModel && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                      <Ruler className="w-4 h-4 text-purple-700" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E]">
                        Ukuran Tubuh Vital (Fitting &amp; Sample Specs)
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="popup_height_cm" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                          Tinggi Badan (cm) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          id="popup_height_cm"
                          name="height_cm"
                          defaultValue={attrs.height_cm || ""}
                          placeholder="175"
                          required
                          className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="popup_weight_kg" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                          Berat Badan (kg)
                        </label>
                        <input
                          type="number"
                          id="popup_weight_kg"
                          name="weight_kg"
                          defaultValue={attrs.weight_kg || ""}
                          placeholder="52"
                          className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="popup_bust_waist_hips" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                          Dada - Pinggang - Pinggul <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="popup_bust_waist_hips"
                          name="bust_waist_hips"
                          defaultValue={attrs.bust_waist_hips || ""}
                          placeholder="84-60-89 cm"
                          required
                          className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="popup_clothing_size" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                          Ukuran Baju Sampel <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="popup_clothing_size"
                          name="clothing_size"
                          defaultValue={attrs.clothing_size || ""}
                          placeholder="S / 36 EU"
                          required
                          className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="popup_shoe_size" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                          Ukuran Sepatu <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="popup_shoe_size"
                          name="shoe_size"
                          defaultValue={attrs.shoe_size || ""}
                          placeholder="39 EU"
                          required
                          className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="popup_experience_years" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                          Pengalaman Kerja (Tahun)
                        </label>
                        <input
                          type="number"
                          id="popup_experience_years"
                          name="experience_years"
                          defaultValue={attrs.experience_years || ""}
                          placeholder="5"
                          className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label htmlFor="popup_video_reel_title" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                          Judul Showreel Video (Opsional)
                        </label>
                        <input
                          type="text"
                          id="popup_video_reel_title"
                          name="video_reel_title"
                          defaultValue={attrs.video_reel_title || ""}
                          placeholder="Runway & Motion Lookbook Showreel 2026"
                          className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                      <Sparkles className="w-4 h-4 text-purple-700" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E]">
                        Karakteristik &amp; Fitur Fisik Alami
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="popup_hair_color" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                          Warna &amp; Tipe Rambut
                        </label>
                        <input
                          type="text"
                          id="popup_hair_color"
                          name="hair_color"
                          defaultValue={attrs.hair_color || "Hitam Alami"}
                          placeholder="Hitam Alami"
                          className="w-full px-3 py-2.5 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-xs font-medium text-stone-800"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="popup_eye_color" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                          Warna Mata
                        </label>
                        <input
                          type="text"
                          id="popup_eye_color"
                          name="eye_color"
                          defaultValue={attrs.eye_color || "Cokelat Tua"}
                          placeholder="Cokelat Tua"
                          className="w-full px-3 py-2.5 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-xs font-medium text-stone-800"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="popup_skin_undertone" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                          Skin Undertone
                        </label>
                        <input
                          type="text"
                          id="popup_skin_undertone"
                          name="skin_undertone"
                          defaultValue={attrs.skin_undertone || "Warm Olive"}
                          placeholder="Warm Olive"
                          className="w-full px-3 py-2.5 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-xs font-medium text-stone-800"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-purple-700" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E]">
                          Foto Polaroid Comp Card (3 Sudut Pandang)
                        </h3>
                      </div>
                      <span className="text-[10px] text-stone-400">Natural Lighting</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {polaroidPreviews.map((slot, idx) => (
                        <div key={idx} className="p-3 bg-stone-50 border border-stone-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#1E1B2E] truncate">
                              Slot {idx + 1}: {slot.type}
                            </span>
                            {slot.url && (
                              <button
                                type="button"
                                onClick={() => handleRemovePolaroid(idx)}
                                className="text-[9px] text-rose-600 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                              >
                                <Trash2 className="w-2.5 h-2.5" /> Hapus
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
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1">
                                  <Upload className="w-4 h-4" />
                                  <span>Ganti Foto</span>
                                </div>
                              </>
                            ) : (
                              <div className="text-center p-2 space-y-1 text-stone-400">
                                <Upload className="w-5 h-5 mx-auto text-stone-400" />
                                <span className="text-[10px] font-bold block text-stone-600">Unggah Foto</span>
                                <span className="text-[8px] text-stone-400 block">Maks 10 MB</span>
                              </div>
                            )}
                          </div>

                          <input
                            type="text"
                            name={`polaroid_caption_${idx}`}
                            defaultValue={slot.caption}
                            placeholder="Keterangan..."
                            className="w-full px-2 py-1.5 rounded-none bg-white border border-stone-200 text-[11px] font-medium text-stone-800 focus:outline-none focus:border-[#1E1B2E]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-stone-100">
                    <label htmlFor="popup_specialties" className="text-xs font-bold text-[#1E1B2E] uppercase tracking-wider block">
                      Spesialisasi Modeling (Pisahkan koma)
                    </label>
                    <input
                      type="text"
                      id="popup_specialties"
                      name="specialties"
                      defaultValue={
                        Array.isArray(attrs.specialties)
                          ? attrs.specialties.join(", ")
                          : "Editorial Fashion, Lookbook & Catalog, Commercial Beauty, Runway"
                      }
                      placeholder="Editorial Fashion, Lookbook, Runway"
                      className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-xs font-medium text-stone-800"
                    />
                  </div>
                </div>
              )}

              {(isPhotographer || isVideographer) && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="popup_primary_camera" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Kamera Utama
                    </label>
                    <input
                      type="text"
                      id="popup_primary_camera"
                      name="primary_camera"
                      defaultValue={attrs.primary_camera || ""}
                      placeholder="Sony A7R V / Canon EOS R5"
                      className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="popup_secondary_camera" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Kamera Cadangan
                    </label>
                    <input
                      type="text"
                      id="popup_secondary_camera"
                      name="secondary_camera"
                      defaultValue={attrs.secondary_camera || ""}
                      placeholder="Sony FX3 / Fujifilm X-T5"
                      className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="popup_lenses" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Lensa Andalan (Pisahkan koma)
                    </label>
                    <input
                      type="text"
                      id="popup_lenses"
                      name="lenses"
                      defaultValue={Array.isArray(attrs.lenses) ? attrs.lenses.join(", ") : ""}
                      placeholder="FE 24-70mm f/2.8 GM II, FE 85mm f/1.4 GM"
                      className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="popup_lighting_gear" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Lighting Kit (Pisahkan koma)
                    </label>
                    <input
                      type="text"
                      id="popup_lighting_gear"
                      name="lighting_gear"
                      defaultValue={Array.isArray(attrs.lighting_gear) ? attrs.lighting_gear.join(", ") : ""}
                      placeholder="Profoto B10X, Godox AD600 Pro"
                      className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="popup_drone_aerial"
                      name="drone_aerial"
                      value="true"
                      defaultChecked={Boolean(attrs.drone_aerial)}
                      className="w-4 h-4 rounded-none accent-[#1E1B2E] cursor-pointer"
                    />
                    <label htmlFor="popup_drone_aerial" className="text-xs font-bold text-[#1E1B2E] cursor-pointer select-none">
                      Layanan Drone Aerial Bersertifikat
                    </label>
                  </div>
                </div>
              )}

              {isStudio && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="popup_area_sqm" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                        Luas Area Studio (m²)
                      </label>
                      <input
                        type="number"
                        id="popup_area_sqm"
                        name="area_sqm"
                        defaultValue={attrs.area_sqm || ""}
                        placeholder="120"
                        className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="popup_ceiling_height_m" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                        Tinggi Plafon (m)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        id="popup_ceiling_height_m"
                        name="ceiling_height_m"
                        defaultValue={attrs.ceiling_height_m || ""}
                        placeholder="4.5"
                        className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="popup_cyclorama_type" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Tipe Cyclorama Wall
                    </label>
                    <input
                      type="text"
                      id="popup_cyclorama_type"
                      name="cyclorama_type"
                      defaultValue={attrs.cyclorama_type || "3-Wall Seamless Curve"}
                      placeholder="3-Wall Seamless Curve"
                      className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="popup_electrical_capacity" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Kapasitas Listrik
                    </label>
                    <input
                      type="text"
                      id="popup_electrical_capacity"
                      name="electrical_capacity"
                      defaultValue={attrs.electrical_capacity || "16.500 Watt"}
                      placeholder="16.500 Watt"
                      className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="popup_facilities" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Fasilitas (Pisahkan koma)
                    </label>
                    <input
                      type="text"
                      id="popup_facilities"
                      name="facilities"
                      defaultValue={Array.isArray(attrs.facilities) ? attrs.facilities.join(", ") : ""}
                      placeholder="Makeup Station, Garment Steamer, AC, Wi-Fi"
                      className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                    />
                  </div>
                </div>
              )}

              {!isModel && !isStudio && !isPhotographer && !isVideographer && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="popup_specialties_gen" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Spesialisasi &amp; Bidang Layanan (Pisahkan koma)
                    </label>
                    <input
                      type="text"
                      id="popup_specialties_gen"
                      name="specialties"
                      defaultValue={Array.isArray(attrs.specialties) ? attrs.specialties.join(", ") : ""}
                      placeholder="Editorial Styling, High-Fashion Makeup, Commercial"
                      className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-none border border-stone-300 text-stone-700 font-bold text-xs uppercase tracking-wider hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-none bg-[#1E1B2E] text-white font-bold text-xs uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{isPending ? "Menyimpan..." : "Simpan Spesifikasi"}</span>
                </button>
              </div>
            </form>
          )}

          {activeDrawerTab === "rates" && (
            <form onSubmit={handleRatesSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Tarif Mulai Dari <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={startingRate}
                    onChange={(e) => setStartingRate(e.target.value)}
                    required
                    placeholder="Mulai Rp 1,5 Jt / sesi"
                    className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                  />
                  <span className="text-[10px] text-stone-400">Muncul di header halaman profil</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Estimasi Turnaround
                  </label>
                  <input
                    type="text"
                    value={turnaroundTime}
                    onChange={(e) => setTurnaroundTime(e.target.value)}
                    placeholder="3 – 5 Hari Kerja"
                    className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                  />
                  <span className="text-[10px] text-stone-400">Waktu serah terima hasil kerja</span>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E]">
                      Daftar Paket Layanan ({packages.length})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPackage}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold uppercase tracking-wider rounded-none cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Paket</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {packages.map((pkg, idx) => (
                    <div key={idx} className="p-4 bg-stone-50 border border-stone-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E]">
                          Paket #{idx + 1}
                        </span>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 text-xs text-stone-600 font-semibold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(pkg.popular)}
                              onChange={(e) => handlePackageChange(idx, "popular", e.target.checked)}
                              className="w-3.5 h-3.5 rounded-none accent-[#1E1B2E]"
                            />
                            <span>Paling Populer</span>
                          </label>
                          {packages.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePackage(idx)}
                              className="text-rose-600 text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" /> Hapus
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                            Nama Paket
                          </label>
                          <input
                            type="text"
                            value={pkg.title}
                            onChange={(e) => handlePackageChange(idx, "title", e.target.value)}
                            placeholder="Nama Paket"
                            className="w-full px-3 py-2 bg-white border border-stone-200 rounded-none text-xs font-medium text-stone-800"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                            Harga &amp; Satuan (contoh: Rp 1.500.000 / per 4 jam)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={pkg.price}
                              onChange={(e) => handlePackageChange(idx, "price", e.target.value)}
                              placeholder="Rp 1.500.000"
                              className="w-2/3 px-3 py-2 bg-white border border-stone-200 rounded-none text-xs font-medium text-stone-800"
                            />
                            <input
                              type="text"
                              value={pkg.unit}
                              onChange={(e) => handlePackageChange(idx, "unit", e.target.value)}
                              placeholder="per sesi"
                              className="w-1/3 px-3 py-2 bg-white border border-stone-200 rounded-none text-xs font-medium text-stone-800"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                            Keterangan Singkat
                          </label>
                          <input
                            type="text"
                            value={pkg.subtitle}
                            onChange={(e) => handlePackageChange(idx, "subtitle", e.target.value)}
                            placeholder="Deskripsi singkat paket"
                            className="w-full px-3 py-2 bg-white border border-stone-200 rounded-none text-xs font-medium text-stone-800"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                            Fitur Paket (1 baris per fitur)
                          </label>
                          <textarea
                            rows={3}
                            value={pkg.features.join("\n")}
                            onChange={(e) => handleFeaturesChange(idx, e.target.value)}
                            placeholder="Fitur 1&#10;Fitur 2&#10;Fitur 3"
                            className="w-full px-3 py-2 bg-white border border-stone-200 rounded-none text-xs font-medium text-stone-800 resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-none border border-stone-300 text-stone-700 font-bold text-xs uppercase tracking-wider hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-none bg-[#1E1B2E] text-white font-bold text-xs uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{isPending ? "Menyimpan..." : "Simpan Paket & Tarif"}</span>
                </button>
              </div>
            </form>
          )}

          {activeDrawerTab === "profile" && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <input type="hidden" name="sector" value={actor.sector} />
              <input type="hidden" name="removeAvatar" value={removeAvatar ? "true" : "false"} />
              <input type="hidden" name="instagram" value={initialSocials.instagram?.handle || ""} />
              <input type="hidden" name="websiteUrl" value={initialSocials.website?.url || ""} />
              <input type="hidden" name="contactEmail" value={actor.contactEmail || ""} />
              <input type="hidden" name="contactPhone" value={actor.contactPhone || ""} />

              <div className="flex items-center gap-5 p-4 bg-stone-50 border border-stone-200">
                <div className="w-20 h-20 bg-stone-200 border border-stone-300 shrink-0 relative overflow-hidden flex items-center justify-center">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt={actor.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-stone-400" />
                  )}
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#1E1B2E] block">Foto Profil Resmi</span>
                  <input
                    type="file"
                    name="avatarFile"
                    ref={avatarInputRef}
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleAvatarFile}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white border border-stone-300 hover:border-[#1E1B2E] text-stone-700 text-xs font-bold transition-all rounded-none cursor-pointer"
                    >
                      Unggah Foto
                    </button>
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="px-3 py-1.5 text-rose-600 hover:underline text-xs font-bold transition-all rounded-none cursor-pointer"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-400 block">JPG, PNG, atau WebP maks 5 MB</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="popup_name_profile" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Nama Publik / Profil <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="popup_name_profile"
                    name="name"
                    defaultValue={actor.name}
                    required
                    className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="popup_location_profile" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Kota Domisili / Lokasi Kerja
                  </label>
                  <input
                    type="text"
                    id="popup_location_profile"
                    name="location"
                    defaultValue={actor.location || ""}
                    placeholder="Jakarta Selatan, Indonesia"
                    className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="popup_description_profile" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Bio &amp; Ringkasan Keahlian
                  </label>
                  <textarea
                    id="popup_description_profile"
                    name="description"
                    rows={4}
                    defaultValue={actor.description || ""}
                    placeholder="Deskripsikan gaya, jam terbang, dan fokus kerja Anda..."
                    className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-none border border-stone-300 text-stone-700 font-bold text-xs uppercase tracking-wider hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-none bg-[#1E1B2E] text-white font-bold text-xs uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{isPending ? "Menyimpan..." : "Simpan Profil"}</span>
                </button>
              </div>
            </form>
          )}

          {activeDrawerTab === "contact" && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <input type="hidden" name="name" value={actor.name} />
              <input type="hidden" name="sector" value={actor.sector} />
              <input type="hidden" name="description" value={actor.description || ""} />
              <input type="hidden" name="location" value={actor.location || ""} />
              <input type="hidden" name="removeAvatar" value="false" />

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="popup_instagram_contact" className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <InstagramIcon className="w-3.5 h-3.5 text-stone-600" />
                    <span>Akun Instagram</span>
                  </label>
                  <input
                    type="text"
                    id="popup_instagram_contact"
                    name="instagram"
                    defaultValue={initialSocials.instagram?.handle || ""}
                    placeholder="username atau link profil"
                    className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                  />
                  <span className="text-[10px] text-stone-400 block">
                    Bila dikosongkan, ikon dan informasi Instagram akan otomatis disembunyikan dari profil.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="popup_websiteUrl_contact" className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-stone-600" />
                    <span>Website / Portfolio URL</span>
                  </label>
                  <input
                    type="text"
                    id="popup_websiteUrl_contact"
                    name="websiteUrl"
                    defaultValue={initialSocials.website?.url || ""}
                    placeholder="https://portofolioanda.com"
                    className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                  />
                  <span className="text-[10px] text-stone-400 block">
                    Bila dikosongkan, informasi website akan otomatis disembunyikan dari profil.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label htmlFor="popup_contactPhone_contact" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Nomor WhatsApp / HP
                    </label>
                    <input
                      type="tel"
                      id="popup_contactPhone_contact"
                      name="contactPhone"
                      defaultValue={actor.contactPhone || ""}
                      placeholder="08123456789"
                      className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="popup_contactEmail_contact" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Email Kerjasama
                    </label>
                    <input
                      type="email"
                      id="popup_contactEmail_contact"
                      name="contactEmail"
                      defaultValue={actor.contactEmail || ""}
                      placeholder="kontak@domain.com"
                      className="w-full px-4 py-3 rounded-none bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#1E1B2E] text-sm font-medium text-stone-800"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-none border border-stone-300 text-stone-700 font-bold text-xs uppercase tracking-wider hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-none bg-[#1E1B2E] text-white font-bold text-xs uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{isPending ? "Menyimpan..." : "Simpan Kontak"}</span>
                </button>
              </div>
            </form>
          )}

          {activeDrawerTab === "portfolio" && (
            <div className="space-y-6">
              <div className="p-6 bg-stone-50 border border-stone-200 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1E1B2E] text-white flex items-center justify-center shrink-0">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1E1B2E] uppercase tracking-wider">
                      Manajemen Karya &amp; Showcase Portofolio
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Unggah foto resolusi tinggi, video reel catwalk, dan tag kolaborator produksi di Showcase.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/dashboard/showcase"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1E1B2E] hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                  >
                    <span>Buka Studio Portofolio</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/dashboard/works/new"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-stone-300 hover:border-[#1E1B2E] text-stone-800 text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                  >
                    <span>+ Unggah Karya Baru</span>
                  </Link>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                  Karya yang Sedang Ditampilkan ({actor.assets.filter((a) => a.category === "PORTFOLIO_WORK").length})
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {actor.assets
                    .filter((a) => a.category === "PORTFOLIO_WORK")
                    .slice(0, 6)
                    .map((item) => {
                      const itemAttrs = (item.attributes as any) || {};
                      const img = itemAttrs.image_url || actor.owner?.avatarUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400";
                      return (
                        <div key={item.id} className="aspect-[4/5] bg-stone-100 border border-stone-200 overflow-hidden relative group">
                          <img src={img} alt={item.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-x-0 bottom-0 p-2 bg-black/60 backdrop-blur-2xs text-white text-[10px] truncate font-medium">
                            {item.name}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" && mounted
    ? createPortal(modalContent, document.body)
    : null;
}
