"use client";

import React, { useState, useEffect, useRef, useTransition, useMemo } from "react";
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
  Link2,
  Film,
  Play,
  Users,
  Star,
  Sliders,
  MapPin,
  Clock,
  Briefcase,
  ShieldCheck,
  Package,
  Scissors,
  HelpCircle,
  Layers,
  Check,
  Video,
  PenTool,
  Shirt,
  PackageCheck,
  Eye,
} from "lucide-react";
import {
  updateActorSpecs,
  updateProfileBasicInfo,
  updateServicePackagesAndRates,
  updatePreferences,
} from "@/app/settings/actions";
import {
  ROLE_PRESETS,
  RoleCategory,
  detectRoleCategory,
} from "@/lib/constants/rolePresets";
import { RatesForm } from "@/components/settings/RatesForm";
import { SpecsForm } from "@/components/settings/SpecsForm";
import { createShowcaseAsset, deleteShowcaseAsset } from "@/app/api/assets/actions";
import { parseSocialLinks, InstagramIcon } from "@/lib/socialUtils";
import { parseVideoUrl, captureVideoFrame } from "@/lib/videoUtils";
import { ShowcaseUploadModal, RegisteredActor } from "@/components/showcase/ShowcaseUploadModal";
import { HotspotCategory } from "@/components/showcase/tearSheetTypes";

export interface QuickUploadCredit {
  id: string;
  category: HotspotCategory;
  role: string;
  name: string;
  handle: string;
  details: string;
  actorId?: string;
  isUploader?: boolean;
}

export const CREDIT_CATEGORIES: { category: HotspotCategory; label: string; defaultRole: string }[] = [
  { category: "cinematography", label: "Sinematografi & Video", defaultRole: "Film Director / DoP" },
  { category: "photography", label: "Fotografi & Kamera", defaultRole: "Lead Photographer" },
  { category: "wardrobe", label: "Wardrobe & Styling", defaultRole: "Fashion Stylist / Wardrobe Stylist" },
  { category: "hmua", label: "Makeup & Hair (HMUA)", defaultRole: "Lead Beauty & Hair Stylist" },
  { category: "talent", label: "Model & Muse", defaultRole: "Editorial Model" },
  { category: "art_direction", label: "Art Direction & Desain", defaultRole: "Art Director" },
  { category: "sound", label: "Penata Suara & Audio", defaultRole: "Sound Designer" },
];

export const CREDIT_CATEGORY_COLORS: Record<HotspotCategory, { bg: string; text: string; badge: string }> = {
  cinematography: { bg: "bg-purple-500", text: "text-purple-700", badge: "bg-purple-50 text-purple-800 border-purple-200" },
  photography: { bg: "bg-emerald-500", text: "text-emerald-700", badge: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  wardrobe: { bg: "bg-indigo-500", text: "text-indigo-700", badge: "bg-indigo-50 text-indigo-800 border-indigo-200" },
  hmua: { bg: "bg-rose-500", text: "text-rose-700", badge: "bg-rose-50 text-rose-800 border-rose-200" },
  talent: { bg: "bg-amber-500", text: "text-amber-800", badge: "bg-amber-50 text-amber-900 border-amber-200" },
  art_direction: { bg: "bg-sky-500", text: "text-sky-700", badge: "bg-sky-50 text-sky-800 border-sky-200" },
  sound: { bg: "bg-cyan-500", text: "text-cyan-700", badge: "bg-cyan-50 text-cyan-800 border-cyan-200" },
};

function detectCategoryFromSector(sector: string): HotspotCategory {
  const s = sector.toLowerCase();
  if (s.includes("video") || s.includes("film") || s.includes("sinema") || s.includes("sutradara")) return "cinematography";
  if (s.includes("suara") || s.includes("musik") || s.includes("audio") || s.includes("sound")) return "sound";
  if (s.includes("foto") || s.includes("visual") || s.includes("kamera")) return "photography";
  if (s.includes("fashion") || s.includes("desain") || s.includes("busana") || s.includes("stylist") || s.includes("label")) return "wardrobe";
  if (s.includes("makeup") || s.includes("mua") || s.includes("kecantikan")) return "hmua";
  if (s.includes("model") || s.includes("talent") || s.includes("aktor")) return "talent";
  if (s.includes("art") || s.includes("director") || s.includes("studio") || s.includes("kreatif")) return "art_direction";
  return "wardrobe";
}

function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export type DrawerTabType =
  | "profile"
  | "portfolio"
  | "rates"
  | "specs"
  | "about"
  | "reviews"
  | "contact"
  | "porto"
  | "tarif"
  | "spesifikasi"
  | "tentang"
  | "usulan"
  | "ulasan";

export type NormalizedDrawerTab = "profile" | "portfolio" | "rates" | "specs" | "about" | "reviews";

export function normalizeDrawerTab(tab?: string | null): NormalizedDrawerTab {
  if (!tab) return "profile";
  const t = tab.toLowerCase();
  if (t === "portfolio" || t === "porto") return "portfolio";
  if (t === "rates" || t === "tarif") return "rates";
  if (t === "specs" || t === "spesifikasi") return "specs";
  if (t === "about" || t === "contact" || t === "tentang") return "about";
  if (t === "reviews" || t === "usulan" || t === "ulasan") return "reviews";
  return "profile";
}

interface ServicePackageItem {
  title: string;
  subtitle: string;
  price: string;
  unit: string;
  popular?: boolean;
  features: string[];
}

export interface ProfileSlideOverDrawerProps {
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
    feedbacks?: Array<{
      id: string;
      relevanceScore?: number | null;
      feasibilityScore?: number | null;
      noveltyScore?: number | null;
      usefulnessScore?: number | null;
      comments?: string | null;
      createdAt: Date | string;
    }>;
    opportunityParticipations?: Array<{
      opportunity: {
        id: string;
        title: string;
        patternCode: string;
        feasibilityStatus: string;
        scores: Array<{ overallScore: number }>;
      };
    }>;
    experienceLevel?: string | null;
    aestheticStyles?: string[];
    compensationModels?: string[];
  };
  registeredActors?: RegisteredActor[];
}

export function ProfileSlideOverDrawer({
  isOpen,
  onClose,
  defaultTab = "profile",
  actor,
  registeredActors = [],
}: ProfileSlideOverDrawerProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<NormalizedDrawerTab>(normalizeDrawerTab(defaultTab));
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Local assets state for instantaneous portfolio addition/removal
  const [localAssets, setLocalAssets] = useState(actor.assets);
  useEffect(() => {
    setLocalAssets(actor.assets);
  }, [actor.assets]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setActiveDrawerTab(normalizeDrawerTab(defaultTab));
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
        handleModalClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleTabChange = (targetTab: NormalizedDrawerTab) => {
    setActiveDrawerTab(targetTab);
    setMessage(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("edit", targetTab);
      window.history.replaceState({}, "", url.toString());
    }
  };

  const handleModalClose = () => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.has("edit")) {
        url.searchParams.delete("edit");
        window.history.replaceState({}, "", url.toString());
      }
    }
    onClose();
  };

  const sectorLower = actor.sector.toLowerCase();
  const isBrand =
    actor.actorType === "BRAND" ||
    (actor.actorType as string) === "MSME" ||
    actor.actorType === "COLLECTIVE" ||
    sectorLower.includes("brand") ||
    sectorLower.includes("label") ||
    sectorLower.includes("agency") ||
    sectorLower.includes("umkm") ||
    sectorLower.includes("designer") ||
    sectorLower.includes("desain");
  const isModel = !isBrand && (sectorLower.includes("model") || sectorLower.includes("talent"));
  const isPhotographer = !isBrand && (sectorLower.includes("photographer") || sectorLower.includes("fotografi"));
  const isVideographer = !isBrand && (sectorLower.includes("video") || sectorLower.includes("film") || sectorLower.includes("cinema"));
  const isMUA = !isBrand && (sectorLower.includes("mua") || sectorLower.includes("makeup") || sectorLower.includes("hair"));
  const isStylist = !isBrand && (sectorLower.includes("stylist") || sectorLower.includes("wardrobe"));
  const isIndividualSector = isModel || isPhotographer || isVideographer || isMUA || isStylist;

  const hasStudioSpaceAsset = actor.assets.some(
    (a) => a.category === "STUDIO_SPACE" || a.subtype?.toLowerCase().includes("studio")
  );
  const isStudio = !isIndividualSector && !isBrand && (actor.actorType === "STUDIO" || sectorLower.includes("studio") || hasStudioSpaceAsset);

  // Specs assets & attributes
  const existingAsset = actor.assets.find(
    (a) =>
      (isModel && (a.subtype.toLowerCase().includes("model") || (a.attributes && typeof a.attributes === "object" && "comp_card" in a.attributes))) ||
      (isStudio && (a.subtype.toLowerCase().includes("studio") || (a.attributes && typeof a.attributes === "object" && "cyclorama_type" in a.attributes))) ||
      (isPhotographer && a.attributes && typeof a.attributes === "object" && "primary_camera" in a.attributes) ||
      (isVideographer && a.attributes && typeof a.attributes === "object" && ("primary_cinema_camera" in a.attributes || "stabilizer_gimbal" in a.attributes)) ||
      (isMUA && a.attributes && typeof a.attributes === "object" && ("makeup_styles" in a.attributes || "primary_kit_brands" in a.attributes)) ||
      (isStylist && a.attributes && typeof a.attributes === "object" && ("styling_specialties" in a.attributes || "onset_equipment" in a.attributes)) ||
      (isBrand && a.attributes && typeof a.attributes === "object" && ("design_dna" in a.attributes || "sample_sizes_ready" in a.attributes || "fabric_materials" in a.attributes || "brand_gallery" in a.attributes))
  );

  const attrs = (existingAsset?.attributes && typeof existingAsset.attributes === "object")
    ? (existingAsset.attributes as Record<string, any>)
    : {};

  // Comp Card Polaroids for Models
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

  // Profile basic fields synchronization
  const [avatarPreview, setAvatarPreview] = useState<string | null>(actor.owner?.avatarUrl || null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const initialSocials = parseSocialLinks(actor.websiteUrl);
  const [profileName, setProfileName] = useState(actor.name || "");
  const [profileLocation, setProfileLocation] = useState(actor.location || "");
  const [profileDescription, setProfileDescription] = useState(actor.description || "");

  const [contactInstagram, setContactInstagram] = useState(initialSocials.instagram?.handle || "");
  const [contactWebsite, setContactWebsite] = useState(initialSocials.website?.url || "");
  const [contactPhone, setContactPhone] = useState(actor.contactPhone || "");
  const [contactEmail, setContactEmail] = useState(actor.contactEmail || "");

  useEffect(() => {
    setProfileName(actor.name || "");
    setProfileLocation(actor.location || "");
    setProfileDescription(actor.description || "");
    setContactPhone(actor.contactPhone || "");
    setContactEmail(actor.contactEmail || "");
    setAvatarPreview(actor.owner?.avatarUrl || null);
  }, [actor]);

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

  // Rates & Packages state
  const serviceAsset = actor.assets.find(
    (a) =>
      a.subtype === "COMMERCIAL_SERVICE_PACKAGES" ||
      (a.attributes && typeof a.attributes === "object" && "service_packages" in (a.attributes as any))
  );
  const serviceAttrs = (serviceAsset?.attributes as any) || {};

  const detectedRole = detectRoleCategory(actor.sector, actor.actorType);
  const [selectedPresetRole, setSelectedPresetRole] = useState<RoleCategory>(detectedRole);
  const currentRolePreset = ROLE_PRESETS[selectedPresetRole];

  const [startingRate, setStartingRate] = useState<string>(
    serviceAttrs.starting_rate || currentRolePreset.defaultStartingRate
  );
  const [turnaroundTime, setTurnaroundTime] = useState<string>(
    serviceAttrs.turnaround_time || currentRolePreset.defaultTurnaround
  );

  const initialServicePackages: ServicePackageItem[] =
    Array.isArray(serviceAttrs.service_packages) && serviceAttrs.service_packages.length > 0
      ? serviceAttrs.service_packages
      : currentRolePreset.packages;

  const [packages, setPackages] = useState<ServicePackageItem[]>(initialServicePackages);

  const handleApplyRolePreset = (roleKey: RoleCategory) => {
    const preset = ROLE_PRESETS[roleKey];
    setSelectedPresetRole(roleKey);
    setStartingRate(preset.defaultStartingRate);
    setTurnaroundTime(preset.defaultTurnaround);
    setPackages(JSON.parse(JSON.stringify(preset.packages)));
    setMessage({
      type: "success",
      text: `Rekomendasi standar ${preset.name} berhasil diterapkan ke form tarif.`,
    });
  };

  const handleAppendDeliverableTag = (pkgIdx: number, tag: string) => {
    setPackages((prev) => {
      const next = [...prev];
      const currentFeatures = next[pkgIdx].features || [];
      if (!currentFeatures.includes(tag)) {
        next[pkgIdx] = { ...next[pkgIdx], features: [...currentFeatures, tag] };
      }
      return next;
    });
  };

  // Brand Collaboration State
  const brandCollabAsset = actor.assets.find(
    (a) => a.attributes && typeof a.attributes === "object" && "collab_types" in (a.attributes as any)
  );
  const brandCollabAttrs = (brandCollabAsset?.attributes as any) || {};

  const COLLAB_TYPE_OPTIONS = [
    "Paid Campaign",
    "Product Seeding / Gifting",
    "Revenue Share / Affiliate",
    "Barter / Trade for Content",
    "Co-Branding & Kolaborasi Koleksi",
    "Casting Open",
  ];

  const [brandCollabTypes, setBrandCollabTypes] = useState<string[]>(
    Array.isArray(brandCollabAttrs.collab_types) && brandCollabAttrs.collab_types.length > 0
      ? brandCollabAttrs.collab_types
      : ["Paid Campaign", "Product Seeding / Gifting"]
  );
  const [brandBudgetRange, setBrandBudgetRange] = useState<string>(
    brandCollabAttrs.budget_range || "Sesuai brief & scope proyek"
  );
  const [brandCollabTimeline, setBrandCollabTimeline] = useState<string>(
    brandCollabAttrs.collab_timeline || "2 – 4 Minggu per Kampanye"
  );
  const [brandCreatorRequirements, setBrandCreatorRequirements] = useState<string>(
    brandCollabAttrs.creator_requirements || "Fotografer & Model Fashion dengan portofolio editorial"
  );
  const [brandCollabNotes, setBrandCollabNotes] = useState<string>(
    brandCollabAttrs.collab_notes || ""
  );

  const toggleBrandCollabType = (type: string) => {
    setBrandCollabTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  async function handleBrandCollabSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("collab_types", JSON.stringify(brandCollabTypes));
    formData.append("budget_range", brandBudgetRange);
    formData.append("collab_timeline", brandCollabTimeline);
    formData.append("creator_requirements", brandCreatorRequirements);
    formData.append("collab_notes", brandCollabNotes);

    const result = await updateActorSpecs(formData);

    if (result.success) {
      setMessage({ type: "success", text: "Preferensi kerjasama berhasil disimpan." });
      router.refresh();
    } else {
      setMessage({ type: "error", text: result.error || "Gagal menyimpan preferensi kerjasama." });
    }
    setIsPending(false);
  }

  // Submit handlers
  async function handleSpecsSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateActorSpecs(formData);

    if (result.success) {
      setMessage({ type: "success", text: result.message || "Spesifikasi teknis berhasil disimpan." });
      router.refresh();
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
      if (result.avatarUrl !== undefined) {
        setAvatarPreview(result.avatarUrl);
        setRemoveAvatar(false);
        window.dispatchEvent(new CustomEvent("ramu:avatar-updated", { detail: { avatarUrl: result.avatarUrl } }));
      }
      setMessage({ type: "success", text: result.message || "Profil berhasil diperbarui." });
      router.refresh();
    } else {
      setMessage({ type: "error", text: result.error || "Gagal menyimpan profil." });
    }

    setIsPending(false);
  }

  // Usulan & Kolaborasi Preferences State
  const [experienceLevel, setExperienceLevel] = useState<string>(
    actor.experienceLevel || "OPEN_FOR_COMMISSION"
  );
  const [selectedStyles, setSelectedStyles] = useState<string[]>(
    actor.aestheticStyles && actor.aestheticStyles.length > 0
      ? actor.aestheticStyles
      : ["Lookbook Editorial", "Kampanye Komersial", "Fashion Film"]
  );
  const [selectedCompModels, setSelectedCompModels] = useState<string[]>(
    actor.compensationModels && actor.compensationModels.length > 0
      ? actor.compensationModels
      : ["Paid Commercial Project", "Standard Production Rate"]
  );

  async function handlePreferencesSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("experienceLevel", experienceLevel);
    formData.append("aestheticStyles", selectedStyles.join(", "));
    formData.append("compensationModels", selectedCompModels.join(", "));

    const result = await updatePreferences(formData);
    if (result.success) {
      setMessage({ type: "success", text: result.message || "Preferensi usulan & kolaborasi berhasil diperbarui." });
      router.refresh();
    } else {
      setMessage({ type: "error", text: result.error || "Gagal menyimpan preferensi usulan." });
    }
    setIsPending(false);
  }

  const toggleStyleTag = (tag: string) => {
    setSelectedStyles((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleCompModel = (model: string) => {
    setSelectedCompModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    );
  };

  // ── Portfolio Management & Studio Upload State ─────────────────────────────
  const [isStudioUploadOpen, setIsStudioUploadOpen] = useState(false);
  const [showQuickUpload, setShowQuickUpload] = useState(false);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>("ALL");

  const [portfolioIsPending, startPortfolioTransition] = useTransition();
  const [portfolioMediaType, setPortfolioMediaType] = useState<"IMAGE" | "VIDEO">("IMAGE");
  const [portfolioMode, setPortfolioMode] = useState<"file" | "url">("file");
  const [portfolioImageUrl, setPortfolioImageUrl] = useState("");
  const [portfolioName, setPortfolioName] = useState("");
  const [portfolioDesc, setPortfolioDesc] = useState("");
  const [portfolioSubtype, setPortfolioSubtype] = useState("Editorial / Lookbook");
  const [portfolioProjectUrl, setPortfolioProjectUrl] = useState("");
  const [portfolioImagePreview, setPortfolioImagePreview] = useState<string | null>(null);
  const portfolioFileRef = useRef<HTMLInputElement>(null);

  // Video specific state
  const [portfolioVideoSource, setPortfolioVideoSource] = useState<"FILE" | "URL">("FILE");
  const [portfolioVideoFile, setPortfolioVideoFile] = useState<File | null>(null);
  const [portfolioVideoUrl, setPortfolioVideoUrl] = useState("");
  const [portfolioVideoPreviewUrl, setPortfolioVideoPreviewUrl] = useState<string | null>(null);
  const [portfolioAspectRatio, setPortfolioAspectRatio] = useState<"16:9" | "9:16" | "1:1">("16:9");
  const [portfolioPosterPreview, setPortfolioPosterPreview] = useState<string | null>(null);
  const [portfolioPosterFile, setPortfolioPosterFile] = useState<File | null>(null);
  const [isCapturingPoster, setIsCapturingPoster] = useState(false);
  const portfolioVideoFileRef = useRef<HTMLInputElement>(null);
  const portfolioPosterFileRef = useRef<HTMLInputElement>(null);

  // Collaborator Credits State
  const initialUploaderCredit: QuickUploadCredit = useMemo(() => ({
    id: `uploader-${actor.id}`,
    category: detectCategoryFromSector(actor.sector),
    role: isModel
      ? "Editorial Model"
      : isPhotographer
      ? "Lead Photographer"
      : isVideographer
      ? "Director of Photography"
      : isMUA
      ? "Lead Makeup Artist"
      : isStylist
      ? "Fashion Stylist"
      : isBrand
      ? "Creative Director / Brand Principal"
      : isStudio
      ? "Studio & Set Production"
      : "Kreator Utama (Uploader)",
    name: actor.name,
    handle: `@${actor.name.toLowerCase().replace(/[\s&.]+/g, "_")}`,
    details: "Pemilik Portofolio & Uploader",
    actorId: actor.id,
    isUploader: true,
  }), [actor.id, actor.name, actor.sector, isModel, isPhotographer, isVideographer, isMUA, isStylist, isBrand, isStudio]);

  const [portfolioCredits, setPortfolioCredits] = useState<QuickUploadCredit[]>([initialUploaderCredit]);
  const [showAddCredit, setShowAddCredit] = useState(false);
  const [creditCategory, setCreditCategory] = useState<HotspotCategory>("photography");
  const [creditName, setCreditName] = useState("");
  const [creditHandle, setCreditHandle] = useState("");
  const [creditRole, setCreditRole] = useState("Lead Photographer");
  const [creditSelectedActorId, setCreditSelectedActorId] = useState<string | null>(null);
  const [showActorSuggestions, setShowActorSuggestions] = useState(false);

  const cleanActorQuery = creditName.trim().toLowerCase();
  const filteredActorSuggestions = cleanActorQuery.length >= 2
    ? registeredActors
        .filter(
          (ra) =>
            ra.id !== actor.id &&
            (ra.name.toLowerCase().includes(cleanActorQuery) ||
             ra.sector.toLowerCase().includes(cleanActorQuery))
        )
        .slice(0, 5)
    : [];

  const handleSelectSuggestedActor = (ra: RegisteredActor) => {
    setCreditName(ra.name);
    setCreditHandle(`@${ra.name.toLowerCase().replace(/[\s&.]+/g, "_")}`);
    setCreditSelectedActorId(ra.id);
    const detected = detectCategoryFromSector(ra.sector);
    setCreditCategory(detected);
    const matchedRole = CREDIT_CATEGORIES.find((c) => c.category === detected)?.defaultRole || ra.sector;
    setCreditRole(matchedRole);
    setShowActorSuggestions(false);
  };

  const handleAddCredit = () => {
    if (!creditName.trim()) return;
    const newCredit: QuickUploadCredit = {
      id: `credit-${Date.now()}`,
      category: creditCategory,
      role: creditRole.trim() || CREDIT_CATEGORIES.find((c) => c.category === creditCategory)?.defaultRole || "Kolaborator",
      name: creditName.trim(),
      handle: creditHandle.trim()
        ? (creditHandle.startsWith("@") ? creditHandle : `@${creditHandle}`)
        : `@${creditName.toLowerCase().replace(/[\s&.]+/g, "_")}`,
      details: creditSelectedActorId ? "Kreator Terdaftar di RAMU" : "Kontributor Eksternal",
      actorId: creditSelectedActorId || undefined,
    };
    setPortfolioCredits((prev) => [...prev, newCredit]);
    setCreditName("");
    setCreditHandle("");
    setCreditRole("");
    setCreditSelectedActorId(null);
    setShowActorSuggestions(false);
  };

  const handleRemoveCredit = (id: string) => {
    setPortfolioCredits((prev) => prev.filter((c) => c.id !== id));
  };

  const [portfolioMessage, setPortfolioMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);

  // Categories and filtering for portfolio works
  const portfolioCategories = useMemo(() => {
    const counts: Record<string, number> = {};
    let videoCount = 0;
    const portfolioAssets = localAssets.filter((a) => a.category === "PORTFOLIO_WORK");
    portfolioAssets.forEach((a) => {
      const aAttrs = (a.attributes as any) || {};
      const isVid = aAttrs.media_type === "VIDEO" || Boolean(aAttrs.video_url) || a.subtype?.toLowerCase().includes("video");
      if (isVid) videoCount++;
      const sub = a.subtype || "Karya";
      counts[sub] = (counts[sub] || 0) + 1;
    });

    return {
      list: Object.entries(counts).map(([name, count]) => ({ id: name, label: name, count })),
      videoCount,
      totalCount: portfolioAssets.length,
    };
  }, [localAssets]);

  const filteredPortfolioAssets = useMemo(() => {
    const portfolioAssets = localAssets.filter((a) => a.category === "PORTFOLIO_WORK");
    if (selectedFilterCategory === "ALL") return portfolioAssets;
    if (selectedFilterCategory === "VIDEO") {
      return portfolioAssets.filter((a) => {
        const aAttrs = (a.attributes as any) || {};
        return aAttrs.media_type === "VIDEO" || Boolean(aAttrs.video_url) || a.subtype?.toLowerCase().includes("video");
      });
    }
    return portfolioAssets.filter((a) => (a.subtype || "Karya") === selectedFilterCategory);
  }, [localAssets, selectedFilterCategory]);

  const handlePortfolioImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setPortfolioMessage({ type: "error", text: "Ukuran berkas gambar maksimal 15 MB." });
      return;
    }
    setPortfolioImagePreview(URL.createObjectURL(file));
    setPortfolioMessage(null);
  };

  const handlePortfolioVideoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 200 * 1024 * 1024) {
      setPortfolioMessage({ type: "error", text: "Ukuran berkas video maksimal 200 MB." });
      return;
    }
    setPortfolioVideoFile(file);
    const blobUrl = URL.createObjectURL(file);
    setPortfolioVideoPreviewUrl(blobUrl);
    setPortfolioMessage(null);

    // Otomatis ekstrak frame pertama sebagai cover thumbnail video jika belum diset manual
    if (!portfolioPosterFile) {
      setIsCapturingPoster(true);
      try {
        const snapshot = await captureVideoFrame(file);
        if (snapshot) {
          setPortfolioPosterPreview(snapshot);
        }
      } catch (err) {
        console.warn("Video snapshot frame generation failed:", err);
      } finally {
        setIsCapturingPoster(false);
      }
    }
  };

  const handlePortfolioVideoUrlChange = (val: string) => {
    setPortfolioVideoUrl(val);
    const parsed = parseVideoUrl(val.trim());
    if (parsed && parsed.thumbnailUrl && !portfolioPosterFile && !portfolioPosterPreview) {
      setPortfolioPosterPreview(parsed.thumbnailUrl);
    }
  };

  const handlePortfolioPosterFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setPortfolioMessage({ type: "error", text: "Ukuran cover poster maksimal 10 MB." });
      return;
    }
    setPortfolioPosterFile(file);
    setPortfolioPosterPreview(URL.createObjectURL(file));
  };

  async function handleInlinePortfolioSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!portfolioName.trim()) {
      setPortfolioMessage({ type: "error", text: "Judul karya tidak boleh kosong." });
      return;
    }

    if (portfolioMediaType === "IMAGE") {
      if (portfolioMode === "url" && !portfolioImageUrl.trim()) {
        setPortfolioMessage({ type: "error", text: "Masukkan tautan URL gambar karya." });
        return;
      }
      if (portfolioMode === "file" && !portfolioFileRef.current?.files?.[0] && !portfolioImagePreview) {
        setPortfolioMessage({ type: "error", text: "Pilih berkas foto karya terlebih dahulu." });
        return;
      }
    } else {
      if (portfolioVideoSource === "FILE" && !portfolioVideoFile && !portfolioVideoPreviewUrl) {
        setPortfolioMessage({ type: "error", text: "Pilih berkas video (MP4/WebM) portofolio Anda." });
        return;
      }
      if (portfolioVideoSource === "URL" && !portfolioVideoUrl.trim()) {
        setPortfolioMessage({ type: "error", text: "Masukkan tautan video (YouTube/Vimeo/URL streaming) portofolio Anda." });
        return;
      }
    }

    setPortfolioMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.set("actorId", actor.id);
    formData.set("name", portfolioName.trim());
    formData.set("description", portfolioDesc.trim());
    formData.set("subtype", portfolioSubtype);
    formData.set("mediaType", portfolioMediaType);

    if (portfolioProjectUrl.trim()) {
      formData.set("projectUrl", portfolioProjectUrl.trim());
    }

    if (portfolioMediaType === "IMAGE") {
      if (portfolioMode === "url" && portfolioImageUrl.trim()) {
        formData.set("imageUrl", portfolioImageUrl.trim());
      }
      if (portfolioMode === "file" && portfolioFileRef.current?.files?.[0]) {
        formData.set("imageFile", portfolioFileRef.current.files[0]);
      }
    } else {
      // VIDEO fields
      formData.set("aspectRatio", portfolioAspectRatio);
      if (portfolioVideoSource === "FILE" && portfolioVideoFile) {
        formData.set("videoFile", portfolioVideoFile);
        formData.set("videoSource", "DIRECT_UPLOAD");
      } else if (portfolioVideoSource === "URL" && portfolioVideoUrl.trim()) {
        formData.set("videoUrl", portfolioVideoUrl.trim());
        const parsed = parseVideoUrl(portfolioVideoUrl.trim());
        formData.set("videoSource", parsed?.platform || "EXTERNAL");
      }

      // Video Cover Poster
      if (portfolioPosterFile) {
        formData.set("imageFile", portfolioPosterFile);
      } else if (portfolioPosterPreview && portfolioPosterPreview.startsWith("data:")) {
        const poster = dataURLtoFile(portfolioPosterPreview, `poster-${Date.now()}.jpg`);
        formData.set("imageFile", poster);
      } else if (portfolioPosterPreview && portfolioPosterPreview.startsWith("http")) {
        formData.set("imageUrl", portfolioPosterPreview);
      }
    }

    // Collaborator Credits (Tear-Sheet)
    if (portfolioCredits.length > 0) {
      const tearSheetPayload = {
        credits: portfolioCredits.map((c, index) => {
          const isUploader = index === 0;
          return {
            role: c.role,
            category: c.category,
            name: c.name,
            handle: c.handle,
            details: c.details,
            actorId: c.actorId || undefined,
            verified: isUploader,
            status: isUploader ? "VERIFIED" : (c.actorId ? "PENDING" : "EXTERNAL"),
            isUploader,
            verifiedBy: isUploader ? "Pemilik Portofolio (Uploader)" : undefined,
            verificationTimestamp: isUploader ? new Date().toISOString() : undefined,
          };
        }),
      };
      formData.set("tearSheet", JSON.stringify(tearSheetPayload));
    }

    startPortfolioTransition(async () => {
      try {
        const res = await createShowcaseAsset(formData);
        if (res.success && res.asset) {
          setLocalAssets((prev) => [res.asset as any, ...prev]);
          setPortfolioMessage({
            type: "success",
            text: portfolioMediaType === "VIDEO"
              ? "Video portofolio berhasil diunggah lengkap dengan kredit kru kolaborasi!"
              : "Karya baru berhasil ditambahkan lengkap dengan kredit kru kolaborasi!",
          });
          setPortfolioName("");
          setPortfolioDesc("");
          setPortfolioProjectUrl("");
          setPortfolioImageUrl("");
          setPortfolioImagePreview(null);
          setPortfolioVideoFile(null);
          setPortfolioVideoUrl("");
          setPortfolioVideoPreviewUrl(null);
          setPortfolioPosterPreview(null);
          setPortfolioPosterFile(null);
          setPortfolioCredits([initialUploaderCredit]);
          setShowAddCredit(false);
          if (portfolioFileRef.current) portfolioFileRef.current.value = "";
          if (portfolioVideoFileRef.current) portfolioVideoFileRef.current.value = "";
          if (portfolioPosterFileRef.current) portfolioPosterFileRef.current.value = "";
          setShowQuickUpload(false);
          router.refresh();
        } else {
          setPortfolioMessage({ type: "error", text: res.error || "Gagal mengunggah karya." });
        }
      } catch (err: any) {
        setPortfolioMessage({ type: "error", text: err.message || "Gagal mengunggah karya." });
      }
    });
  }

  async function handleDeleteAsset(assetId: string) {
    if (!window.confirm("Apakah Anda yakin ingin menghapus karya ini dari portofolio?")) {
      return;
    }
    setDeletingAssetId(assetId);
    try {
      const res = await deleteShowcaseAsset(assetId);
      if (res.success) {
        setLocalAssets((prev) => prev.filter((a) => a.id !== assetId));
        setPortfolioMessage({ type: "success", text: "Karya berhasil dihapus dari portofolio." });
        router.refresh();
      } else {
        setPortfolioMessage({ type: "error", text: res.error || "Gagal menghapus karya." });
      }
    } catch (err: any) {
      setPortfolioMessage({ type: "error", text: err.message || "Gagal menghapus karya." });
    } finally {
      setDeletingAssetId(null);
    }
  }

  if (!isOpen || !mounted) return null;

  const specsTitle = isModel
    ? "Comp Card & Fisik"
    : isStudio
    ? "Fasilitas Studio"
    : isPhotographer && !isVideographer
    ? "Kamera & Lensa"
    : isVideographer && !isPhotographer
    ? "Rig Cinema & Video"
    : isPhotographer && isVideographer
    ? "Gear Kamera & Cinema"
    : isMUA
    ? "Kit Makeup & Higienitas"
    : isStylist
    ? "Wardrobe & On-Set Kit"
    : isBrand
    ? "DNA & Karakter Brand"
    : "Spesifikasi Teknis";

  const portfolioCount = localAssets.filter((a) => a.category === "PORTFOLIO_WORK").length;

  // Exact Requested Tab Order: Profil -> Porto -> Tarif -> Spesifikasi -> Tentang -> Usulan
  const tabs: Array<{
    id: NormalizedDrawerTab;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    badge?: number;
  }> = [
    {
      id: "profile",
      label: "Profil",
      sublabel: "Bio & Domisili",
      icon: <User className="w-4 h-4 text-blue-600" />,
    },
    {
      id: "portfolio",
      label: "Porto",
      sublabel: "Galeri & Studio",
      icon: <ImageIcon className="w-4 h-4 text-rose-500" />,
      badge: portfolioCount,
    },
    {
      id: "rates",
      label: isBrand ? "Kemitraan" : "Kapasitas & Paket",
      sublabel: isBrand ? "Kolaborasi & Brief" : "3 Tier & Kapasitas",
      icon: isBrand ? <Briefcase className="w-4 h-4 text-emerald-600" /> : <CreditCard className="w-4 h-4 text-emerald-600" />,
    },
    {
      id: "specs",
      label: "Spesifikasi",
      sublabel: specsTitle,
      icon: <Camera className="w-4 h-4 text-purple-600" />,
    },
    {
      id: "about",
      label: "Tentang",
      sublabel: "Kontak & SOP",
      icon: <Phone className="w-4 h-4 text-amber-600" />,
    },
    {
      id: "reviews",
      label: "Usulan",
      sublabel: "Ulasan & Brief",
      icon: <Star className="w-4 h-4 text-amber-500" />,
      badge: actor.feedbacks?.length || 0,
    },
  ];

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 md:p-8 overflow-y-auto no-scrollbar scrollbar-none bg-slate-950/45 backdrop-blur-md animate-fade-in"
      onClick={handleModalClose}
    >
      <div
        className="w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl bg-white/95 backdrop-blur-2xl border border-white/90 shadow-[0_24px_80px_rgba(0,0,0,0.14)] flex flex-col h-[90vh] max-h-[900px] rounded-[24px] animate-fade-in relative my-auto overflow-hidden text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="px-6 sm:px-8 py-5 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-11 h-11 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 shrink-0 text-slate-700 shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight truncate">
                  Pusat Kelola Profil &amp; Studio ({profileName || actor.name})
                </h2>
                <span className="px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 rounded-full shrink-0">
                  {actor.sector}
                </span>
                <span className="px-3 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 rounded-full shrink-0 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Terverifikasi
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 truncate">
                Kelola profil bio, portofolio karya studio, paket tarif, spesifikasi teknis, kontak, serta usulan proyek dalam satu kendali terpadu.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleModalClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-4 border border-slate-200 outline-none focus:outline-none"
            aria-label="Tutup"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TAB BAR NAVIGATION (Profil -> Porto -> Tarif -> Spesifikasi -> Tentang -> Usulan) */}
        <div className="flex border-b border-slate-200/80 bg-slate-50/70 backdrop-blur-md overflow-x-auto no-scrollbar scrollbar-none shrink-0 px-4 sm:px-8 py-2.5 gap-2">
          {tabs.map((tab) => {
            const isActive = activeDrawerTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`py-2 px-3.5 sm:px-4 text-left transition-all cursor-pointer rounded-xl flex items-center gap-2.5 shrink-0 active:scale-95 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 select-none ${
                  isActive
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 font-extrabold"
                    : "text-slate-500 hover:text-slate-900 hover:bg-white/60 font-semibold border border-transparent"
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? "bg-slate-100" : "bg-transparent"}`}>
                  {tab.icon}
                </div>
                <div className="flex flex-col items-start leading-none">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider">{tab.label}</span>
                    {tab.badge !== undefined && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                          isActive ? "btn-primary-pill text-white shadow-xs" : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal mt-0.5 hidden sm:inline-block">
                    {tab.sublabel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT BODY */}
        <div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none p-6 sm:p-8 lg:p-10 space-y-6 bg-white/40 backdrop-blur-sm">
          {/* GENERAL NOTIFICATION MESSAGE */}
          {message && (
            <div
              className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm font-semibold animate-in fade-in duration-200 ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs"
                  : "bg-rose-50 text-rose-800 border border-rose-200 shadow-2xs"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {message.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                )}
                <p>{message.text}</p>
              </div>
              {message.type === "success" && (
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
                >
                  Selesai
                </button>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB 1: PROFIL (Profil & Bio)                                       */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB 1: PROFIL (Profil & Bio)                                       */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeDrawerTab === "profile" && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <input type="hidden" name="sector" value={actor.sector} />
              <input type="hidden" name="removeAvatar" value={removeAvatar ? "true" : "false"} />
              <input type="hidden" name="instagram" value={contactInstagram} />
              <input type="hidden" name="websiteUrl" value={contactWebsite} />
              <input type="hidden" name="contactEmail" value={contactEmail} />
              <input type="hidden" name="contactPhone" value={contactPhone} />

              <div className="p-6 sm:p-7 bg-white/80 backdrop-blur-xl border border-white/90 rounded-[22px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-6 text-[#111827]">
                {/* SECTION: FOTO PROFIL */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-100">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 border border-slate-200 rounded-2xl shrink-0 overflow-hidden flex items-center justify-center shadow-xs">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt={profileName || actor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-slate-300" />
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <input
                      type="file"
                      name="avatarFile"
                      ref={avatarInputRef}
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleAvatarFile}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="px-4 py-2 btn-primary-pill text-white text-xs font-bold rounded-full transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Unggah Foto Baru</span>
                      </button>
                      {avatarPreview && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="px-3.5 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 text-xs font-semibold rounded-full transition-all cursor-pointer"
                        >
                          Hapus Foto
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Format JPG, PNG, atau WebP (rasio 1:1, maks. 5 MB).
                    </p>
                  </div>
                </div>

                {/* SECTION: IDENTITAS & DOMISILI */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="popup_name_profile" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Nama Lengkap / Brand <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="popup_name_profile"
                      name="name"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                      placeholder="Nama profesional Anda"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#4CC9FE] text-xs font-medium text-slate-800 transition-colors outline-hidden"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="popup_location_profile" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>Kota Domisili</span>
                    </label>
                    <input
                      type="text"
                      id="popup_location_profile"
                      name="location"
                      value={profileLocation}
                      onChange={(e) => setProfileLocation(e.target.value)}
                      placeholder="mis. Jakarta Selatan, Indonesia"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#4CC9FE] text-xs font-medium text-slate-800 transition-colors outline-hidden"
                    />
                  </div>
                </div>

                {/* SECTION: BIO & RINGKASAN */}
                <div className="space-y-1.5">
                  <label htmlFor="popup_description_profile" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Bio Singkat &amp; Ringkasan Keahlian
                  </label>
                  <textarea
                    id="popup_description_profile"
                    name="description"
                    rows={4}
                    value={profileDescription}
                    onChange={(e) => setProfileDescription(e.target.value)}
                    placeholder="Deskripsikan pendekatan visual, pengalaman kerja, spesialisasi kreasi, dan portofolio DNA Anda..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#4CC9FE] text-xs font-medium text-slate-800 resize-none transition-colors leading-relaxed outline-hidden"
                  />
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="pt-2 flex items-center justify-between gap-4 shrink-0">
                <span className="text-xs text-slate-400">Perubahan langsung tersimpan ke profil publik.</span>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full btn-primary-pill text-white font-bold text-xs transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer shadow-xs active:scale-95"
                  >
                    {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{isPending ? "Menyimpan..." : "Simpan Profil"}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB 2: PORTO (Portofolio & Studio)                                 */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeDrawerTab === "portfolio" && (
            <div className="space-y-6">
              {/* CLEAN HEADER: PORTOFOLIO & SHOWREEL */}
              <div className="p-6 bg-white/80 backdrop-blur-xl rounded-[22px] border border-white/90 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#0284c7]" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                      Galeri Portofolio &amp; Showreel
                    </h3>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {localAssets.filter((a) => a.category === "PORTFOLIO_WORK").length} Karya
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Koleksi karya editorial, kampanye, dan video. Karya pertama otomatis menjadi sampul profil direktori.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowQuickUpload(!showQuickUpload)}
                    className="btn-primary-pill text-white text-xs font-bold px-4 py-2 rounded-full cursor-pointer shadow-xs inline-flex items-center gap-1.5 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showQuickUpload ? "Tutup Form" : "Unggah Karya Baru"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsStudioUploadOpen(true)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-full transition-colors border border-slate-200 cursor-pointer inline-flex items-center gap-1.5"
                    title="Buka studio tear-sheet untuk menandai titik hotspot produk dan busana"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#0284c7]" />
                    <span>Mode Hotspot</span>
                  </button>
                </div>
              </div>

              {/* NOTIFICATION MESSAGE */}
              {portfolioMessage && (
                <div
                  className={`p-4 flex items-center justify-between gap-3 text-xs font-semibold rounded-xl animate-in fade-in duration-200 ${
                    portfolioMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {portfolioMessage.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    )}
                    <span>{portfolioMessage.text}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPortfolioMessage(null)}
                    className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer rounded-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* STREAMLINED UPLOAD FORM */}
              {showQuickUpload && (
                <div className="p-6 sm:p-7 bg-white/80 backdrop-blur-xl rounded-[22px] border border-white/90 space-y-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] animate-in fade-in duration-200 text-[#111827]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-900 flex items-center justify-center shrink-0">
                        {portfolioMediaType === "VIDEO" ? (
                          <Film className="w-5 h-5 text-purple-700" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-amber-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-[#111827]">
                          Unggah Karya Portofolio Baru
                        </h4>
                        <p className="text-xs text-slate-500">
                          {portfolioMediaType === "VIDEO"
                            ? "Unggah berkas video MP4/WebM atau tautkan video YouTube/Vimeo"
                            : "Unggah foto karya editorial atau komersial resolusi tinggi"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* MEDIA TYPE TOGGLE */}
                      <div className="flex items-center rounded-xl border border-slate-200 p-1 bg-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            setPortfolioMediaType("IMAGE");
                            if (portfolioSubtype === "Video Fashion / Campaign") setPortfolioSubtype("Editorial / Lookbook");
                          }}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                            portfolioMediaType === "IMAGE"
                              ? "btn-primary-pill text-white shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Foto</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPortfolioMediaType("VIDEO");
                            if (portfolioSubtype === "Editorial / Lookbook") setPortfolioSubtype("Video Fashion / Campaign");
                          }}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                            portfolioMediaType === "VIDEO"
                              ? "btn-primary-pill text-white shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <Film className="w-3.5 h-3.5 text-white" />
                          <span>Video</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowQuickUpload(false)}
                        className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                        title="Tutup formulir unggah"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleInlinePortfolioSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* LEFT COLUMN: METADATA & DESKRIPSI */}
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                            Judul Karya / Proyek <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={portfolioName}
                            onChange={(e) => setPortfolioName(e.target.value)}
                            required
                            placeholder={portfolioMediaType === "VIDEO" ? "mis. Fashion Film: Eternal Horizon 4K" : "mis. Spring/Summer 2026 Editorial"}
                            className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-[#4CC9FE] focus:ring-1 focus:ring-[#4CC9FE]/20 text-xs font-medium text-slate-800 transition-all outline-hidden"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                              Kategori / Subtipe
                            </label>
                            <select
                              value={portfolioSubtype}
                              onChange={(e) => setPortfolioSubtype(e.target.value)}
                              className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-[#4CC9FE] text-xs font-medium text-slate-800 cursor-pointer outline-hidden"
                            >
                              <option value="Editorial / Lookbook">Editorial / Lookbook</option>
                              <option value="Video Fashion / Campaign">Video Fashion / Campaign</option>
                              <option value="Komersial & Brand">Komersial &amp; Brand</option>
                              <option value="Runway & Fashion Show">Runway &amp; Fashion Show</option>
                              <option value="Beauty & Makeup">Beauty &amp; Makeup</option>
                              <option value="Katalog E-Commerce">Katalog E-Commerce</option>
                              <option value="Behind The Scenes (BTS)">Behind The Scenes (BTS)</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                              Tautan Proyek (Opsional)
                            </label>
                            <input
                              type="url"
                              value={portfolioProjectUrl}
                              onChange={(e) => setPortfolioProjectUrl(e.target.value)}
                              placeholder="https://..."
                              className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-[#4CC9FE] text-xs font-medium text-slate-800 outline-hidden"
                            />
                          </div>
                        </div>

                        {/* ASPECT RATIO SELECTOR (FOR VIDEO) */}
                        {portfolioMediaType === "VIDEO" && (
                          <div className="space-y-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                              Rasio Layar Video
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { id: "16:9", label: "16:9 Lanskap", desc: "YouTube / Bioskop" },
                                { id: "9:16", label: "9:16 Vertikal", desc: "Reels / TikTok" },
                                { id: "1:1", label: "1:1 Persegi", desc: "Feed Instagram" },
                              ].map((ratio) => (
                                <button
                                  key={ratio.id}
                                  type="button"
                                  onClick={() => setPortfolioAspectRatio(ratio.id as any)}
                                  className={`p-2.5 rounded-xl text-center border text-xs font-bold transition-all cursor-pointer ${
                                    portfolioAspectRatio === ratio.id
                                      ? "btn-primary-pill text-white border-[#4CC9FE] shadow-sm shadow-[#4CC9FE]/25"
                                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                                  }`}
                                >
                                  <div>{ratio.label}</div>
                                  <div className={`text-[10px] ${portfolioAspectRatio === ratio.id ? "text-white/80" : "text-slate-400"}`}>
                                    {ratio.desc}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                            Deskripsi Karya / Konsep Visual
                          </label>
                          <textarea
                            rows={3}
                            value={portfolioDesc}
                            onChange={(e) => setPortfolioDesc(e.target.value)}
                            placeholder="Ceritakan konsep pemotretan, brand, atau gaya visual yang dieksplorasi..."
                            className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-[#4CC9FE] text-xs font-medium text-slate-800 resize-none outline-hidden"
                          />
                        </div>
                      </div>

                      {/* RIGHT COLUMN: MEDIA UPLOAD & PREVIEW */}
                      <div className="space-y-4">
                        {portfolioMediaType === "IMAGE" ? (
                          <>
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Berkas Foto Karya <span className="text-rose-500">*</span>
                              </label>
                              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-full border border-slate-200">
                                <button
                                  type="button"
                                  onClick={() => setPortfolioMode("file")}
                                  className={`px-3.5 py-1 rounded-full text-xs font-bold transition-colors ${portfolioMode === "file" ? "bg-[#4CC9FE] text-white shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"}`}
                                >
                                  Unggah Berkas
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPortfolioMode("url")}
                                  className={`px-3.5 py-1 rounded-full text-xs font-bold transition-colors ${portfolioMode === "url" ? "bg-[#4CC9FE] text-white shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"}`}
                                >
                                  Tautan URL
                                </button>
                              </div>
                            </div>

                            {portfolioMode === "file" ? (
                              <div className="space-y-3">
                                <input
                                  type="file"
                                  name="imageFile"
                                  ref={portfolioFileRef}
                                  accept="image/png, image/jpeg, image/jpg, image/webp"
                                  onChange={handlePortfolioImageFile}
                                  className="hidden"
                                />
                                <div
                                  onClick={() => portfolioFileRef.current?.click()}
                                  className="border-2 border-dashed border-slate-300 hover:border-[#4CC9FE] rounded-[20px] p-6 text-center cursor-pointer transition-all bg-slate-50 hover:bg-white aspect-[16/10] flex flex-col items-center justify-center relative overflow-hidden group"
                                >
                                  {portfolioImagePreview ? (
                                    <>
                                      <img
                                        src={portfolioImagePreview}
                                        alt="Preview Karya"
                                        className="w-full h-full object-cover absolute inset-0"
                                      />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="px-3 py-1.5 bg-white text-[#111827] text-xs font-bold rounded-lg shadow-sm">
                                          Ganti Foto Terpilih
                                        </span>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="space-y-2">
                                      <div className="w-12 h-12 rounded-full bg-amber-400/20 text-[#111827] mx-auto flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <Upload className="w-6 h-6 text-[#111827]" />
                                      </div>
                                      <p className="text-xs font-bold text-slate-700">Klik untuk memilih berkas foto</p>
                                      <p className="text-[11px] text-slate-400">JPG, PNG, atau WebP hingga 15 MB</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <input
                                  type="url"
                                  value={portfolioImageUrl}
                                  onChange={(e) => {
                                    setPortfolioImageUrl(e.target.value);
                                    setPortfolioImagePreview(e.target.value);
                                  }}
                                  placeholder="https://images.unsplash.com/..."
                                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-hidden"
                                />
                                {portfolioImageUrl && (
                                  <div className="aspect-[16/10] bg-slate-100 rounded-xl border border-slate-200 overflow-hidden">
                                    <img
                                      src={portfolioImageUrl}
                                      alt="Preview Karya URL"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        ) : (
                          /* VIDEO UPLOAD & STREAMING UI */
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Sumber Video Karya <span className="text-rose-500">*</span>
                              </label>
                              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-full border border-slate-200">
                                <button
                                  type="button"
                                  onClick={() => setPortfolioVideoSource("FILE")}
                                  className={`px-3.5 py-1 rounded-full text-xs font-bold transition-colors ${
                                    portfolioVideoSource === "FILE" ? "bg-[#4CC9FE] text-white shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"
                                  }`}
                                >
                                  Berkas Video
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPortfolioVideoSource("URL")}
                                  className={`px-3.5 py-1 rounded-full text-xs font-bold transition-colors ${
                                    portfolioVideoSource === "URL" ? "bg-[#4CC9FE] text-white shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"
                                  }`}
                                >
                                  Tautan URL
                                </button>
                              </div>
                            </div>

                            {portfolioVideoSource === "FILE" ? (
                              <div className="space-y-3">
                                <input
                                  type="file"
                                  ref={portfolioVideoFileRef}
                                  accept="video/mp4, video/webm, video/quicktime"
                                  onChange={handlePortfolioVideoFile}
                                  className="hidden"
                                />

                                {portfolioVideoPreviewUrl ? (
                                  <div className="space-y-2">
                                    <div className="aspect-video bg-black rounded-xl overflow-hidden relative border border-slate-800">
                                      <video
                                        src={portfolioVideoPreviewUrl}
                                        controls
                                        playsInline
                                        className="w-full h-full object-contain"
                                      />
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                                      <div className="truncate max-w-[220px]">
                                        <span className="font-bold text-slate-800 block truncate">
                                          {portfolioVideoFile?.name || "Video Terpilih"}
                                        </span>
                                        <span className="text-[11px] text-slate-400">
                                          {portfolioVideoFile ? `${(portfolioVideoFile.size / (1024 * 1024)).toFixed(1)} MB` : ""}
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => portfolioVideoFileRef.current?.click()}
                                        className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                                      >
                                        Ganti Video
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    onClick={() => portfolioVideoFileRef.current?.click()}
                                    className="border-2 border-dashed border-slate-300 hover:border-[#4CC9FE] rounded-xl p-6 text-center cursor-pointer transition-all bg-slate-50 hover:bg-white aspect-video flex flex-col items-center justify-center relative overflow-hidden group"
                                  >
                                    <div className="space-y-2">
                                      <div className="w-12 h-12 rounded-full bg-amber-400/20 text-[#111827] mx-auto flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <Film className="w-6 h-6 text-purple-700" />
                                      </div>
                                      <p className="text-xs font-bold text-slate-800">
                                        Klik untuk memilih berkas video portofolio
                                      </p>
                                      <p className="text-[11px] text-slate-400">
                                        Format MP4, WebM, atau MOV hingga 200 MB
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="space-y-1">
                                  <input
                                    type="url"
                                    value={portfolioVideoUrl}
                                    onChange={(e) => handlePortfolioVideoUrlChange(e.target.value)}
                                    placeholder="https://www.youtube.com/watch?v=... atau Vimeo"
                                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-hidden"
                                  />
                                  <span className="text-[11px] text-slate-400 block">
                                    Mendukung YouTube, Vimeo, atau tautan streaming MP4 langsung
                                  </span>
                                </div>

                                {portfolioVideoUrl && (
                                  <div className="aspect-video bg-black rounded-xl border border-slate-200 overflow-hidden relative flex items-center justify-center">
                                    {portfolioPosterPreview ? (
                                      <img
                                        src={portfolioPosterPreview}
                                        alt="Video Thumbnail"
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="text-center text-white/70 space-y-1">
                                        <Play className="w-8 h-8 mx-auto fill-white/20" />
                                        <p className="text-xs font-bold">Tautan Video Terdeteksi</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* COVER POSTER THUMBNAIL (AUTO-CAPTURED OR CUSTOM) */}
                            <div className="pt-2 border-t border-slate-200 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                                    Sampul Poster Video
                                  </label>
                                  <span className="text-[10px] text-slate-400 block">
                                    {isCapturingPoster
                                      ? "Sedang mengekstrak frame otomatis..."
                                      : portfolioPosterPreview
                                      ? "Cover snapshot otomatis siap digunakan"
                                      : "Otomatis dibuat saat memilih video, atau unggah cover kustom"}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => portfolioPosterFileRef.current?.click()}
                                  className="px-3 py-1 text-xs font-bold border border-slate-300 rounded-lg bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
                                >
                                  Ganti Sampul
                                </button>
                              </div>

                              <input
                                type="file"
                                ref={portfolioPosterFileRef}
                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                onChange={handlePortfolioPosterFile}
                                className="hidden"
                              />

                              {isCapturingPoster && (
                                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-2 text-xs text-amber-800">
                                  <Loader2 className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
                                  <span>Sedang mengekstrak frame video untuk sampul poster...</span>
                                </div>
                              )}

                              {portfolioPosterPreview && !isCapturingPoster && (
                                <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                                  <img
                                    src={portfolioPosterPreview}
                                    alt="Cover Sampul"
                                    className="w-16 h-12 rounded-lg object-cover border border-slate-300"
                                  />
                                  <div className="text-xs">
                                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Sampul Siap
                                    </span>
                                    <span className="text-[11px] text-slate-400">
                                      Ditampilkan di kartu galeri dan sebelum video diputar
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* COLLABORATOR CREDITS ENGINE */}
                    <div className="pt-5 border-t border-slate-200 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-700" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
                              Kredit Kru &amp; Kolaborator Tim ({portfolioCredits.length})
                            </h4>
                            <span className="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-700 font-bold rounded-full border border-purple-200">
                              Peer-Verified
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Tandai kru, model, stylist, fotografer, atau studio yang berkolaborasi. Karya otomatis terhubung ke portofolio mereka.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowAddCredit(!showAddCredit)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full bg-white/90 hover:bg-white text-[#0284c7] border border-[#4CC9FE]/30 hover:border-[#4CC9FE] transition-colors cursor-pointer shadow-2xs self-start sm:self-auto"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{showAddCredit ? "Tutup Form Kru" : "Tambah Rekan Kru"}</span>
                        </button>
                      </div>

                      {/* CREDITS CARDS / CHIPS */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {portfolioCredits.map((c, index) => {
                          const col = CREDIT_CATEGORY_COLORS[c.category] || CREDIT_CATEGORY_COLORS.wardrobe;
                          const isUploader = index === 0;
                          return (
                            <div
                              key={c.id}
                              className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-2.5 text-xs relative group hover:border-slate-400 transition-colors"
                            >
                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${col.badge}`}>
                                    {CREDIT_CATEGORIES.find((cat) => cat.category === c.category)?.label || c.category}
                                  </span>
                                  {isUploader && (
                                    <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-900 text-white rounded-full">
                                      Uploader
                                    </span>
                                  )}
                                  {c.actorId && !isUploader && (
                                    <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-0.5">
                                      <CheckCircle2 className="w-2.5 h-2.5" />
                                      Terhubung
                                    </span>
                                  )}
                                </div>

                                <div className="font-bold text-slate-900 truncate text-xs">
                                  {c.name}
                                </div>

                                <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                                  <span className="font-medium text-slate-700">{c.role}</span>
                                  <span>&bull;</span>
                                  <span className="font-mono text-slate-400">{c.handle}</span>
                                </div>
                              </div>

                              {!isUploader && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCredit(c.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white cursor-pointer transition-colors shrink-0"
                                  title="Hapus kredit kru ini"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* INLINE ADD CREDIT SUBFORM */}
                      {showAddCredit && (
                        <div className="p-4 sm:p-5 bg-amber-50/40 rounded-xl border border-amber-200/80 space-y-3.5 animate-in fade-in duration-150">
                          <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                              Detail Kredit Kru Baru
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowAddCredit(false)}
                              className="text-xs text-amber-800 hover:text-slate-900 cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {/* DEPT SELECTOR */}
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                                Departemen
                              </label>
                              <select
                                value={creditCategory}
                                onChange={(e) => {
                                  const cat = e.target.value as HotspotCategory;
                                  setCreditCategory(cat);
                                  const def = CREDIT_CATEGORIES.find((c) => c.category === cat)?.defaultRole;
                                  if (def) setCreditRole(def);
                                }}
                                className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs font-medium text-slate-800 cursor-pointer outline-hidden"
                              >
                                {CREDIT_CATEGORIES.map((cat) => (
                                  <option key={cat.category} value={cat.category}>
                                    {cat.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* NAME INPUT WITH AUTOCOMPLETE */}
                            <div className="space-y-1 relative">
                              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                                Nama Kru / Cari di RAMU
                              </label>
                              <input
                                type="text"
                                value={creditName}
                                onChange={(e) => {
                                  setCreditName(e.target.value);
                                  setShowActorSuggestions(true);
                                  if (creditSelectedActorId) setCreditSelectedActorId(null);
                                }}
                                onFocus={() => setShowActorSuggestions(true)}
                                placeholder="Ketik nama untuk mencari..."
                                className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs font-medium text-slate-800 outline-hidden"
                              />

                              {showActorSuggestions && filteredActorSuggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl z-50 divide-y divide-slate-100 max-h-48 overflow-y-auto no-scrollbar scrollbar-none">
                                  {filteredActorSuggestions.map((ra) => (
                                    <button
                                      key={ra.id}
                                      type="button"
                                      onClick={() => handleSelectSuggestedActor(ra)}
                                      className="w-full text-left px-3.5 py-2 hover:bg-purple-50 flex items-center justify-between text-xs transition-colors cursor-pointer"
                                    >
                                      <div>
                                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                          <span>{ra.name}</span>
                                          <span className="text-[9px] px-1.5 py-0.2 bg-emerald-50 text-emerald-800 font-bold rounded border border-emerald-200">
                                            Terdaftar
                                          </span>
                                        </div>
                                        <div className="text-[10px] text-slate-400">
                                          {ra.sector} &bull; {ra.location || "Indonesia"}
                                        </div>
                                      </div>
                                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* INSTAGRAM HANDLE */}
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                                Instagram Tag / Handle
                              </label>
                              <input
                                type="text"
                                value={creditHandle}
                                onChange={(e) => setCreditHandle(e.target.value)}
                                placeholder="@username"
                                className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs font-medium text-slate-800 outline-hidden"
                              />
                            </div>

                            {/* SPECIFIC ROLE */}
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                                Peran Spesifik
                              </label>
                              <input
                                type="text"
                                value={creditRole}
                                onChange={(e) => setCreditRole(e.target.value)}
                                placeholder="mis. Lead Stylist"
                                className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs font-medium text-slate-800 outline-hidden"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={handleAddCredit}
                              disabled={!creditName.trim()}
                              className="btn-primary-pill !text-xs !py-2 !px-4 text-white font-semibold rounded-full shadow-md shadow-[#4CC9FE]/25 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5 active:scale-95"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Tambahkan Kru ke Daftar</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowQuickUpload(false)}
                        className="px-5 py-2.5 rounded-full bg-white/80 hover:bg-white border border-slate-200 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={portfolioIsPending}
                        className="px-6 py-2.5 rounded-full btn-primary-pill text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2 shadow-xs active:scale-95"
                      >
                        {portfolioIsPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{portfolioIsPending ? "Mengunggah..." : portfolioMediaType === "VIDEO" ? "Terbitkan Video Portofolio" : "Terbitkan Karya"}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* FILTER TABS & ASSET GALLERY GRID */}
              <div className="p-6 sm:p-7 bg-white/80 backdrop-blur-xl rounded-[22px] border border-white/90 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-6 text-[#111827]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-700" />
                    <h4 className="text-sm font-bold uppercase tracking-wider text-[#111827]">
                      Koleksi Portofolio &amp; Karya ({filteredPortfolioAssets.length})
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setSelectedFilterCategory("ALL")}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                        selectedFilterCategory === "ALL"
                          ? "btn-primary-pill text-white shadow-xs border-transparent"
                          : "bg-white/80 hover:bg-white text-slate-600 border border-slate-200/80"
                      }`}
                    >
                      Semua ({portfolioCategories.totalCount})
                    </button>
                    {portfolioCategories.videoCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedFilterCategory("VIDEO")}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                          selectedFilterCategory === "VIDEO"
                            ? "btn-primary-pill text-white shadow-xs border-transparent"
                            : "bg-white/80 hover:bg-white text-slate-600 border border-slate-200/80"
                        }`}
                      >
                        <Film className="w-3.5 h-3.5 text-[#0284c7]" />
                        <span>Video ({portfolioCategories.videoCount})</span>
                      </button>
                    )}
                    {portfolioCategories.list.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedFilterCategory(cat.id)}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                          selectedFilterCategory === cat.id
                            ? "btn-primary-pill text-white shadow-xs border-transparent"
                            : "bg-white/80 hover:bg-white text-slate-600 border border-slate-200/80"
                        }`}
                      >
                        {cat.label} ({cat.count})
                      </button>
                    ))}
                  </div>
                </div>

                

                {filteredPortfolioAssets.length === 0 ? (
                  <div className="py-16 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <ImageIcon className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-bold text-slate-800">Belum ada karya dalam kategori ini</p>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Tampilkan keahlian terbaik Anda dengan mengunggah foto editorial, komersial, maupun video kampanye showreel.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowQuickUpload(true)}
                      className="btn-primary-pill !text-xs !py-2.5 !px-6 text-white font-semibold rounded-full transition-all cursor-pointer shadow-md shadow-[#4CC9FE]/25 inline-flex items-center gap-2 active:scale-95"
                    >
                      <Plus className="w-4 h-4 text-white" />
                      <span>Unggah Karya Portofolio Pertama</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                    {filteredPortfolioAssets.map((item, idx) => {
                      const itemAttrs = (item.attributes as any) || {};
                      const isVideo =
                        itemAttrs.media_type === "VIDEO" ||
                        Boolean(itemAttrs.video_url) ||
                        item.subtype?.toLowerCase().includes("video");
                      const hasTearSheet = Boolean(itemAttrs.tear_sheet && Array.isArray(itemAttrs.tear_sheet.credits) && itemAttrs.tear_sheet.credits.length > 0);
                      const isDirectVideo =
                        isVideo &&
                        itemAttrs.video_url &&
                        (/\.(mp4|webm|mov)(\?.*)?$/i.test(itemAttrs.video_url) ||
                          itemAttrs.video_url.startsWith("/uploads/portfolios/videos/"));
                      const isDeleting = deletingAssetId === item.id;
                      const img =
                        itemAttrs.image_url ||
                        actor.owner?.avatarUrl ||
                        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400";

                      return (
                        <div
                          key={item.id}
                          className="aspect-[4/5] bg-slate-900 rounded-[20px] border border-slate-200 overflow-hidden relative group shadow-2xs hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                        >
                          {isDirectVideo && (
                            <video
                              src={itemAttrs.video_url}
                              muted
                              loop
                              playsInline
                              preload="none"
                              onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                              onMouseLeave={(e) => {
                                e.currentTarget.pause();
                                e.currentTarget.currentTime = 0;
                              }}
                              className="absolute inset-0 w-full h-full object-cover z-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                            />
                          )}

                          <img
                            src={img}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />

                          {/* TOP BADGES */}
                          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start z-10 pointer-events-none">
                            {idx === 0 && selectedFilterCategory === "ALL" && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 bg-amber-400 text-slate-950 rounded-full shadow-xs">
                                <Star className="w-2.5 h-2.5 fill-current text-slate-950" />
                                Sampul Profil
                              </span>
                            )}
                            {isVideo && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 bg-black/85 text-amber-400 rounded-full border border-amber-400/40 backdrop-blur-xs shadow-xs">
                                <Play className="w-2.5 h-2.5 fill-current" />
                                Video
                              </span>
                            )}
                            {hasTearSheet && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 bg-slate-900/90 text-white rounded-full border border-white/20 backdrop-blur-xs shadow-xs">
                                <Users className="w-2.5 h-2.5 text-amber-400" />
                                Kru ({itemAttrs.tear_sheet.credits.length})
                              </span>
                            )}
                          </div>

                          {/* DELETE ACTION BUTTON */}
                          <button
                            type="button"
                            onClick={() => handleDeleteAsset(item.id)}
                            disabled={isDeleting}
                            title="Hapus Karya"
                            className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/70 hover:bg-rose-600 text-white transition-all duration-200 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer shadow-md disabled:opacity-50 z-20 backdrop-blur-xs"
                          >
                            {isDeleting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>

                          {/* BOTTOM GRADIENT INFO */}
                          <div className="absolute inset-x-0 bottom-0 p-3.5 bg-gradient-to-t from-black/95 via-black/60 to-transparent text-white z-10 pointer-events-none">
                            <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 backdrop-blur-xs mb-1">
                              {item.subtype || "Karya"}
                            </span>
                            <p className="text-xs font-bold truncate leading-tight">
                              {item.name}
                            </p>
                            {item.description && (
                              <p className="text-[10px] text-slate-300 truncate mt-0.5">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB 3A: KERJASAMA (Khusus Brand)                                   */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeDrawerTab === "rates" && isBrand && (
            <form onSubmit={handleBrandCollabSubmit} className="space-y-6">
              {/* INFO BANNER */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <Briefcase className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 leading-relaxed">
                  <strong className="font-bold block mb-0.5">Halaman Kerjasama Brand</strong>
                  Atur jenis kolaborasi yang terbuka, budget range, dan profil kreator ideal yang Anda cari. Informasi ini akan tampil di tab "Kerjasama" profil direktori Anda.
                </div>
              </div>

              {/* JENIS KERJASAMA */}
              <div className="p-6 bg-white/80 backdrop-blur-xl border border-white/90 rounded-[22px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4 text-[#111827]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#111827]">Jenis Kerjasama yang Dibuka</h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">Pilih semua yang relevan</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {COLLAB_TYPE_OPTIONS.map((type) => (
                    <label key={type} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 hover:border-[#4CC9FE] cursor-pointer transition-colors group">
                      <input
                        type="checkbox"
                        checked={brandCollabTypes.includes(type)}
                        onChange={() => toggleBrandCollabType(type)}
                        className="w-4 h-4 rounded-xl accent-[#0284c7] cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-700 group-hover:text-[#111827] transition-colors">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* BUDGET & TIMELINE */}
              <div className="p-6 bg-white/80 backdrop-blur-xl border border-white/90 rounded-[22px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4 text-[#111827]">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#111827]">Budget & Timeline Kampanye</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Budget / Kompensasi Kreator
                    </label>
                    <input
                      type="text"
                      value={brandBudgetRange}
                      onChange={(e) => setBrandBudgetRange(e.target.value)}
                      placeholder="mis. Rp 1-5 Jt per campaign, atau Sesuai brief"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#4CC9FE] text-sm font-medium text-slate-800 transition-colors"
                    />
                    <span className="text-[10px] text-slate-400">Estimasi, bukan harga pasti. Bisa berupa range atau deskripsi.</span>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Timeline per Kampanye
                    </label>
                    <input
                      type="text"
                      value={brandCollabTimeline}
                      onChange={(e) => setBrandCollabTimeline(e.target.value)}
                      placeholder="mis. 2 – 4 Minggu per Kampanye"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#4CC9FE] text-sm font-medium text-slate-800 transition-colors"
                    />
                    <span className="text-[10px] text-slate-400">Dari pengiriman brief hingga konten dipublikasikan.</span>
                  </div>
                </div>
              </div>

              {/* PROFIL KREATOR YANG DICARI */}
              <div className="p-6 bg-white/80 backdrop-blur-xl border border-white/90 rounded-[22px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4 text-[#111827]">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Users className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#111827]">Profil & Persyaratan Kreator Ideal</h3>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Deskripsi Kreator yang Dicari
                  </label>
                  <textarea
                    rows={3}
                    value={brandCreatorRequirements}
                    onChange={(e) => setBrandCreatorRequirements(e.target.value)}
                    placeholder="mis. Fotografer fashion dengan estetika minimalis & lookbook editorial, pengalaman min. 1 tahun dengan fashion brand lokal"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#4CC9FE] text-xs font-medium text-slate-800 resize-none leading-relaxed"
                  />
                  <span className="text-[10px] text-slate-400">Niche, gaya, level pengalaman, atau follower minimum yang Anda harapkan.</span>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Catatan Tambahan (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    value={brandCollabNotes}
                    onChange={(e) => setBrandCollabNotes(e.target.value)}
                    placeholder="mis. Prioritas kreator berbasis Bandung & Jakarta. Tidak menerima konten yang mempromosikan brand kompetitor."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#4CC9FE] text-xs font-medium text-slate-800 resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4 shrink-0">
                <span className="text-xs text-slate-500">Preferensi kerjasama ditampilkan di tab "Kerjasama" profil direktori brand Anda.</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="px-5 py-2.5 rounded-full bg-white/80 hover:bg-white border border-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full btn-primary-pill text-white font-bold text-xs transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer shadow-xs active:scale-95"
                  >
                    {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{isPending ? "Menyimpan..." : "Simpan Preferensi Kerjasama"}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB 3B: TARIF (Paket & Tarif Layanan — Identik dengan Settings)     */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeDrawerTab === "rates" && !isBrand && (
            <div className="py-2">
              <RatesForm
                embedded
                initialStartingRate={startingRate}
                initialTurnaroundTime={turnaroundTime}
                initialPackages={packages}
                initialTerms={serviceAttrs.terms_and_conditions || null}
                actorSector={actor.sector}
                actorType={actor.actorType}
                onSuccess={() => {
                  setMessage({ type: "success", text: "Paket tarif & aturan SPK berhasil disimpan." });
                  router.refresh();
                }}
                onCancel={handleModalClose}
              />
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB 4: SPESIFIKASI (Spesifikasi Teknis / Comp Card / Fasilitas)    */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeDrawerTab === "specs" && (
            <div className="py-2">
              <SpecsForm
                actorSector={actor.sector}
                actorType={actor.actorType}
                actorName={actor.name}
                initialAttributes={attrs}
                embedded
                onSuccess={() => {
                  router.refresh();
                }}
              />
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB 5: TENTANG (Tentang, Kontak & SOP Medsos)                     */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeDrawerTab === "about" && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <input type="hidden" name="name" value={profileName} />
              <input type="hidden" name="sector" value={actor.sector} />
              <input type="hidden" name="description" value={profileDescription} />
              <input type="hidden" name="location" value={profileLocation} />
              <input type="hidden" name="removeAvatar" value="false" />

              {/* CONTACT & SOCIAL CARDS */}
              <div className="p-6 bg-white/80 backdrop-blur-xl border border-white/90 rounded-[22px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-6 text-[#111827]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-amber-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
                      Saluran Komunikasi &amp; Media Sosial Resmi
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">Tautan Langsung</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="popup_contactPhone_contact" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Nomor WhatsApp</span>
                    </label>
                    <input
                      type="tel"
                      id="popup_contactPhone_contact"
                      name="contactPhone"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="0812-3456-7890"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#4CC9FE] text-xs font-medium text-slate-800 outline-hidden transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="popup_instagram_contact" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <InstagramIcon className="w-3.5 h-3.5 text-slate-600" />
                      <span>Akun Instagram</span>
                    </label>
                    <input
                      type="text"
                      id="popup_instagram_contact"
                      name="instagram"
                      value={contactInstagram}
                      onChange={(e) => setContactInstagram(e.target.value)}
                      placeholder="@username"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#4CC9FE] text-xs font-medium text-slate-800 outline-hidden transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="popup_contactEmail_contact" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                      <span>Email Resmi</span>
                    </label>
                    <input
                      type="email"
                      id="popup_contactEmail_contact"
                      name="contactEmail"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="kontak@domain.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#4CC9FE] text-xs font-medium text-slate-800 outline-hidden transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="popup_websiteUrl_contact" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                      <span>Website / Portofolio</span>
                    </label>
                    <input
                      type="text"
                      id="popup_websiteUrl_contact"
                      name="websiteUrl"
                      value={contactWebsite}
                      onChange={(e) => setContactWebsite(e.target.value)}
                      placeholder="https://portofolioanda.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#4CC9FE] text-xs font-medium text-slate-800 outline-hidden transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* SOP WORKING TERMS OVERVIEW */}
              <div className="p-6 bg-white/80 backdrop-blur-xl border border-white/90 rounded-[22px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4 text-[#111827]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
                      Standar Ketentuan Kerja (SOP) RAMU
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 font-bold">
                    SOP Terverifikasi
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-[#111827] block">Jam Kerja &amp; Overtime</span>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Sesi standar 8 jam kerja (termasuk 1 jam istirahat). Overtime dihitung proporsional per jam.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-[#111827] block">DP &amp; Pelunasan</span>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      DP 50% untuk penguncian tanggal jadwal. Pelunasan saat preview berkas final disetujui.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-[#111827] block">Revisi &amp; Serah Terima</span>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Termasuk 2x revisi minor. Master file diserahkan melalui cloud drive resmi resolusi tinggi.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-[#111827] block">Hak Cipta Komersial</span>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Lisensi komersial penuh untuk kebutuhan media sosial, website e-commerce, dan katalog promosi.
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4 shrink-0">
                <span className="text-xs text-slate-500">Saluran kontak akan langsung terlihat oleh klien yang ingin menyewa jasa.</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="px-5 py-2.5 rounded-full bg-white/80 hover:bg-white border border-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full btn-primary-pill text-white font-bold text-xs transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer shadow-xs active:scale-95"
                  >
                    {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{isPending ? "Menyimpan..." : "Simpan Kontak"}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB 6: USULAN (Usulan, Ulasan & Kolaborasi)                         */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeDrawerTab === "reviews" && (
            <div className="space-y-6">
              {/* CARD 1: STATUS & PREFERENSI USULAN PROYEK */}
              <form onSubmit={handlePreferencesSubmit} className="p-6 bg-white/80 backdrop-blur-xl border border-white/90 rounded-[22px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-6 text-[#111827]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
                      Kesiapan &amp; Preferensi Penerimaan Usulan Proyek
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">Pengaturan Kolaborasi</span>
                </div>

                {/* STATUS TOGGLE */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Status Ketersediaan Menerima Usulan / Proyek Baru
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        value: "OPEN_FOR_COMMISSION",
                        label: "Terbuka untuk Proyek Baru",
                        desc: "Siap menerima tawaran komersial & brief baru",
                        dotColor: "bg-emerald-500",
                      },
                      {
                        value: "SELECTIVE_COLLABORATION",
                        label: "Kolaborasi Terpilih Saja",
                        desc: "Hanya proyek lookbook & rilis khusus",
                        dotColor: "bg-amber-500",
                      },
                      {
                        value: "FULLY_BOOKED",
                        label: "Jadwal Sedang Penuh",
                        desc: "Sementara tidak menerima proyek dadakan",
                        dotColor: "bg-rose-500",
                      },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setExperienceLevel(opt.value)}
                        className={`p-4 border text-left rounded-xl transition-all cursor-pointer ${
                          experienceLevel === opt.value
                            ? "border-[#4CC9FE] bg-slate-50 shadow-xs"
                            : "border-slate-200 bg-white hover:bg-slate-50/50"
                        }`}
                      >
                        <span className="text-xs font-bold flex items-center gap-1.5 text-[#111827]">
                          <span className={`w-2 h-2 rounded-full ${opt.dotColor} shrink-0`} />
                          {opt.label}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-1 block">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* FORMAT USULAN YANG DIMINATI */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Format Usulan yang Diutamakan (Pilih yang sesuai)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Lookbook Editorial",
                      "Kampanye Komersial",
                      "Fashion Film Sinematik",
                      "Runway & Fashion Show",
                      "Katalog E-Commerce",
                      "Co-Branding Activation",
                      "Content Creation Reels",
                    ].map((tag) => {
                      const isSelected = selectedStyles.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleStyleTag(tag)}
                          className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border rounded-full flex items-center gap-1.5 ${
                            isSelected
                              ? "btn-primary-pill !text-xs !py-1.5 !px-3.5 text-white border-[#4CC9FE] shadow-xs"
                              : "bg-white/80 text-slate-700 border-slate-200 hover:bg-white hover:text-slate-900"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                          <span>{tag}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* MODEL KOMPENSASI */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Model Kompensasi / Skema Usulan Kerjasama
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Paid Commercial Project",
                      "Standard Production Rate",
                      "Day-Rate Shift Sesi",
                      "Revenue Share / Co-Op",
                      "Creative Portfolio Collab",
                    ].map((model) => {
                      const isSelected = selectedCompModels.includes(model);
                      return (
                        <button
                          key={model}
                          type="button"
                          onClick={() => toggleCompModel(model)}
                          className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border rounded-full flex items-center gap-1.5 ${
                            isSelected
                              ? "btn-primary-pill !text-xs !py-1.5 !px-3.5 text-white border-[#4CC9FE] shadow-xs"
                              : "bg-white/80 text-slate-700 border-slate-200 hover:bg-white hover:text-slate-900"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                          <span>{model}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#111827] hover:underline"
                  >
                    <span>Buka Dashboard Brief &amp; Peluang Proyek</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full btn-primary-pill text-white font-bold text-xs transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer shadow-xs active:scale-95"
                  >
                    {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{isPending ? "Menyimpan..." : "Simpan Preferensi Usulan"}</span>
                  </button>
                </div>
              </form>

              {/* INFO REPUTASI & ULASAN */}
              <div className="p-5 rounded-[22px] bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2.5 text-sky-950">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
                  <span className="leading-relaxed">
                    <strong>Ulasan &amp; Reputasi:</strong> Testimoni klien otomatis terverifikasi setelah brief proyek diselesaikan. Tinjau seluruh ulasan publik Anda di tab <strong>Ulasan</strong> pada profil.
                  </span>
                </div>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-full btn-primary-pill text-white font-bold text-xs transition-all shadow-xs shrink-0 text-center active:scale-95"
                >
                  Buka Brief Proyek
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FULL STUDIO UPLOAD MODAL (TEAR-SHEET & MULTI-PARTY CREDITS ENGINE) */}
      {isStudioUploadOpen && (
        <ShowcaseUploadModal
          isOpen={isStudioUploadOpen}
          onClose={() => setIsStudioUploadOpen(false)}
          registeredActors={registeredActors}
          onSuccess={() => {
            setIsStudioUploadOpen(false);
            setPortfolioMessage({
              type: "success",
              text: "Karya baru berhasil diterbitkan lengkap dengan kredit tim kolaborasi!",
            });
            router.refresh();
          }}
        />
      )}
    </div>
  );

  return typeof document !== "undefined" && mounted
    ? createPortal(modalContent, document.body)
    : null;
}
