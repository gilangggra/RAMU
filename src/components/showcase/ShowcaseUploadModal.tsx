"use client";

import React, { useState, useTransition, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  Link as LinkIcon,
  Camera,
  Shirt,
  User,
  Palette,
  Check,
  Video,
  Film,
  Play,
  Volume2,
  UploadCloud,
  ArrowRight,
  Maximize2,
  Smartphone,
  Info,
  CheckCircle2,
  Trash2,
  Search,
  ExternalLink,
  Layers,
  Sliders,
  Sparkle
} from "lucide-react";
import { createShowcaseAsset } from "@/app/api/assets/actions";
import { useRouter } from "next/navigation";
import { HotspotCategory } from "@/components/showcase/tearSheetTypes";
import { parseVideoUrl, captureVideoFrame } from "@/lib/videoUtils";

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

export interface RegisteredActor {
  id: string;
  name: string;
  sector: string;
  location: string | null;
}

interface InputCredit {
  id: string;
  category: HotspotCategory;
  role: string;
  name: string;
  handle: string;
  details: string;
  actorId?: string;
}

interface InputHotspot {
  id: string;
  category: HotspotCategory;
  title: string;
  role: string;
  creatorName: string;
  creatorHandle: string;
  x: number;
  y: number;
  details: { label: string; value: string }[];
  notes?: string;
}

const CATEGORY_ROLES: {
  category: HotspotCategory;
  label: string;
  defaultRole: string;
  icon: React.ElementType;
}[] = [
  { category: "cinematography", label: "Penyutradaraan & Sinematografi", defaultRole: "Film Director / DoP", icon: Video },
  { category: "photography", label: "Fotografi & Lighting", defaultRole: "Director of Photography", icon: Camera },
  { category: "wardrobe", label: "Wardrobe & Styling", defaultRole: "Fashion Stylist & Wardrobe", icon: Shirt },
  { category: "hmua", label: "Makeup & Hair (HMUA)", defaultRole: "Lead Beauty & Hair Stylist", icon: Sparkles },
  { category: "talent", label: "Model & Talent", defaultRole: "Editorial Muse / Model", icon: User },
  { category: "art_direction", label: "Art Direction & Pascaproduksi", defaultRole: "Art Director & Colorist", icon: Palette },
  { category: "sound", label: "Penata Suara & Musik", defaultRole: "Sound Designer / Music", icon: Volume2 },
];

const CATEGORY_COLORS: Record<HotspotCategory, { bg: string; text: string; border: string; ring: string }> = {
  cinematography: { bg: "bg-purple-500", text: "text-purple-700", border: "border-purple-300", ring: "ring-purple-400" },
  photography: { bg: "bg-emerald-500", text: "text-emerald-700", border: "border-emerald-300", ring: "ring-emerald-400" },
  wardrobe: { bg: "bg-indigo-500", text: "text-indigo-700", border: "border-indigo-300", ring: "ring-indigo-400" },
  hmua: { bg: "bg-rose-500", text: "text-rose-700", border: "border-rose-300", ring: "ring-rose-400" },
  talent: { bg: "bg-amber-500", text: "text-amber-800", border: "border-amber-300", ring: "ring-amber-400" },
  art_direction: { bg: "bg-sky-500", text: "text-sky-700", border: "border-sky-300", ring: "ring-sky-400" },
  sound: { bg: "bg-cyan-500", text: "text-cyan-700", border: "border-cyan-300", ring: "ring-cyan-400" },
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

interface ShowcaseUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  registeredActors?: RegisteredActor[];
  onSuccess?: () => void;
}

export function ShowcaseUploadModal({
  isOpen,
  onClose,
  registeredActors = [],
  onSuccess
}: ShowcaseUploadModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"basics" | "tearsheet">("basics");

  // Media Config
  const [mediaType, setMediaType] = useState<"IMAGE" | "VIDEO">("IMAGE");
  const [videoSourceType, setVideoSourceType] = useState<"URL" | "FILE">("URL");
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "4:5" | "1:1" | "4:3">("4:5");
  const [isCapturingPoster, setIsCapturingPoster] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  // Artwork Basics
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [subtype, setSubtype] = useState("Fotografi");
  const [description, setDescription] = useState("");
  const [projectUrl, setProjectUrl] = useState("");

  // Credits & Tear-Sheet
  const [credits, setCredits] = useState<InputCredit[]>([
    {
      id: "credit-1",
      category: "photography",
      role: "Director of Photography",
      name: "Studio Creator",
      handle: "@creator",
      details: "Commercial & Editorial Shoot"
    }
  ]);
  const [hotspots, setHotspots] = useState<InputHotspot[]>([]);

  // Add Credit State
  const [newCategory, setNewCategory] = useState<HotspotCategory>("wardrobe");
  const [newName, setNewName] = useState("");
  const [newHandle, setNewHandle] = useState("");
  const [newDetails, setNewDetails] = useState("");
  const [selectedActorId, setSelectedActorId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Production Gear
  const [camera, setCamera] = useState("");
  const [lens, setLens] = useState("");
  const [lighting, setLighting] = useState("");

  const photoCanvasRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setError("Ukuran foto maksimal 15 MB.");
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setError("");

      // Auto-detect image aspect ratio from uploaded file
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
        const ratio = img.width / img.height;
        if (ratio <= 0.65) {
          setAspectRatio("9:16");
        } else if (ratio <= 0.9) {
          setAspectRatio("4:5");
        } else if (ratio <= 1.15) {
          setAspectRatio("1:1");
        } else if (ratio >= 1.55) {
          setAspectRatio("16:9");
        } else {
          setAspectRatio("4:3");
        }
      };
      img.src = url;
    }
  };

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        setError("Ukuran video maksimal 100 MB.");
        return;
      }
      setSelectedVideoFile(file);
      const blobUrl = URL.createObjectURL(file);
      setVideoPreviewUrl(blobUrl);
      setError("");

      // Auto-detect video orientation
      const videoEl = document.createElement("video");
      videoEl.preload = "metadata";
      videoEl.onloadedmetadata = () => {
        if (videoEl.videoHeight > videoEl.videoWidth * 1.2) {
          setAspectRatio("9:16");
        } else {
          setAspectRatio("16:9");
        }
      };
      videoEl.src = blobUrl;

      if (!imagePreview) {
        setIsCapturingPoster(true);
        try {
          const snapshotDataUrl = await captureVideoFrame(file);
          if (snapshotDataUrl) {
            setImagePreview(snapshotDataUrl);
          }
        } catch {
        } finally {
          setIsCapturingPoster(false);
        }
      }
    }
  };

  const handleExternalVideoUrlChange = (val: string) => {
    setVideoUrl(val);
    const parsed = parseVideoUrl(val.trim());
    if (parsed && parsed.thumbnailUrl && !selectedFile && !imagePreview) {
      setImagePreview(parsed.thumbnailUrl);
    }
    const lower = val.toLowerCase();
    if (lower.includes("shorts/") || lower.includes("tiktok.com") || lower.includes("reel")) {
      setAspectRatio("9:16");
    }
  };

  const cleanSearchQuery = newName.trim().toLowerCase();
  const filteredSuggestions = cleanSearchQuery.length >= 2
    ? registeredActors.filter((actor) =>
        actor.name.toLowerCase().includes(cleanSearchQuery) ||
        actor.sector.toLowerCase().includes(cleanSearchQuery)
      ).slice(0, 5)
    : [];

  const handleSelectActor = (actor: RegisteredActor) => {
    setNewName(actor.name);
    setNewHandle(`@${actor.name.toLowerCase().replace(/[\s&.]+/g, "_")}`);
    setSelectedActorId(actor.id);
    const detected = detectCategoryFromSector(actor.sector);
    setNewCategory(detected);
    setShowSuggestions(false);
  };

  const handleAddCredit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newName.trim()) return;

    const roleConfig = CATEGORY_ROLES.find((r) => r.category === newCategory);
    const newCredit: InputCredit = {
      id: `credit-${Date.now()}`,
      category: newCategory,
      role: roleConfig?.defaultRole || "Kolaborator",
      name: newName.trim(),
      handle: newHandle.trim() || `@${newName.trim().toLowerCase().replace(/[\s&.]+/g, "_")}`,
      details: newDetails.trim() || roleConfig?.label || "Kontributor Kreatif",
      actorId: selectedActorId || undefined,
    };

    setCredits((prev) => [...prev, newCredit]);
    setNewName("");
    setNewHandle("");
    setNewDetails("");
    setSelectedActorId(null);
  };

  const handleRemoveCredit = (id: string) => {
    setCredits((prev) => prev.filter((c) => c.id !== id));
    setHotspots((prev) => prev.filter((h) => h.id !== id));
  };

  const handlePhotoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!photoCanvasRef.current) return;
    const rect = photoCanvasRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const activeCredit = credits[credits.length - 1];
    const roleConfig = CATEGORY_ROLES.find((r) => r.category === (activeCredit?.category || "wardrobe"));

    const newPin: InputHotspot = {
      id: `pin-${Date.now()}`,
      category: activeCredit ? activeCredit.category : "wardrobe",
      title: activeCredit ? activeCredit.name : "Karya Busana",
      role: activeCredit ? activeCredit.role : (roleConfig?.defaultRole || "Designer"),
      creatorName: activeCredit ? activeCredit.name : "Brand / Kreator",
      creatorHandle: activeCredit ? activeCredit.handle : "@creator",
      x,
      y,
      details: [
        { label: "Departemen", value: roleConfig?.label || "Wardrobe" },
        { label: "Posisi Titik", value: `${x}% x ${y}%` }
      ],
      notes: "Interactive Spotlight Tear-Sheet"
    };

    setHotspots((prev) => [...prev, newPin]);
  };

  const handleRemovePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHotspots((prev) => prev.filter((h) => h.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Judul karya wajib diisi.");
      return;
    }

    if (mediaType === "IMAGE" && !selectedFile && !imagePreview) {
      setError("Mohon pilih file foto cover untuk karya Anda.");
      return;
    }

    if (mediaType === "VIDEO") {
      if (videoSourceType === "FILE" && !selectedVideoFile) {
        setError("Mohon pilih file video (MP4/WebM) portofolio Anda.");
        return;
      }
      if (videoSourceType === "URL" && !videoUrl.trim()) {
        setError("Mohon masukkan tautan video (YouTube/Vimeo/URL streaming) portofolio Anda.");
        return;
      }
    }

    setError("");
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", title.trim());
      formData.append("subtype", subtype);
      formData.append("description", description);
      formData.append("projectUrl", projectUrl);
      formData.append("mediaType", mediaType);
      formData.append("aspectRatio", aspectRatio);

      if (mediaType === "VIDEO") {
        if (videoSourceType === "FILE" && selectedVideoFile) {
          formData.append("videoFile", selectedVideoFile);
          formData.append("videoSource", "DIRECT_UPLOAD");
        } else if (videoSourceType === "URL" && videoUrl.trim()) {
          formData.append("videoUrl", videoUrl.trim());
          const parsed = parseVideoUrl(videoUrl.trim());
          formData.append("videoSource", parsed?.platform || "EXTERNAL");
        }
      }

      if (selectedFile) {
        formData.append("imageFile", selectedFile);
      } else if (imagePreview && imagePreview.startsWith("data:")) {
        const posterFile = dataURLtoFile(imagePreview, `poster-${Date.now()}.jpg`);
        formData.append("imageFile", posterFile);
      } else if (imagePreview && imagePreview.startsWith("http")) {
        formData.append("imageUrl", imagePreview);
      }

      const tearSheetPayload = {
        credits: credits.map((c, index) => {
          const isUploader = index === 0;
          return {
            role: c.role,
            category: c.category,
            name: c.name,
            handle: c.handle,
            details: c.details,
            actorId: c.actorId || null,
            status: isUploader ? "VERIFIED" : "PENDING",
            verified: isUploader ? true : false,
            isUploader: isUploader ? true : false,
            verifiedBy: isUploader ? "Pemilik Portofolio (Uploader)" : null,
            verificationTimestamp: isUploader ? new Date().toISOString() : null,
          };
        }),
        hotspots: hotspots.map((h) => ({
          category: h.category,
          title: h.title,
          role: h.role,
          creatorName: h.creatorName,
          creatorHandle: h.creatorHandle,
          x: h.x,
          y: h.y,
          details: h.details,
          notes: h.notes,
        })),
        specs: {
          camera: camera.trim() || undefined,
          lens: lens.trim() || undefined,
          lighting: lighting.trim() || undefined,
        },
      };

      formData.append("tearSheet", JSON.stringify(tearSheetPayload));

      try {
        const res = await createShowcaseAsset(formData);
        if (res.success) {
          if (onSuccess) onSuccess();
          onClose();
          router.refresh();
        } else {
          setError(res.error || "Gagal mengunggah portofolio.");
        }
      } catch (err: any) {
        setError(err?.message || "Terjadi kesalahan saat memproses portofolio.");
      }
    });
  };

  // Preview container aspect ratio class
  const previewAspectClass = useMemo(() => {
    if (aspectRatio === "9:16") return "aspect-[9/16] max-w-[260px] mx-auto";
    if (aspectRatio === "4:5") return "aspect-[4/5] max-w-[320px] mx-auto";
    if (aspectRatio === "1:1") return "aspect-square max-w-[320px] mx-auto";
    if (aspectRatio === "4:3") return "aspect-[4/3] w-full";
    return "aspect-video w-full";
  }, [aspectRatio]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-slate-950/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl h-full md:h-[90vh] max-h-[880px] bg-white border border-slate-200/90 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden text-slate-900"
      >
        {/* 1. MODAL HEADER */}
        <div className="shrink-0 px-6 py-4 bg-white border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-sky-50 border border-sky-200 text-[#0284c7] flex items-center justify-center shadow-2xs shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 truncate">
                  Unggah Karya &amp; Kurasi Portofolio
                </h3>
                <span className="hidden sm:inline-flex text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-sky-50 text-[#0284c7] font-bold border border-sky-200">
                  RAMU DOSSIER
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate">
                Publikasikan mahakarya visual dengan verifikasi tim &amp; spesifikasi proporsional
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
            {/* Step Selector Tabs (Consistent Capsule Pills) */}
            <div className="flex items-center p-1 bg-slate-100 rounded-full border border-slate-200/80">
              <button
                type="button"
                onClick={() => setActiveTab("basics")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "basics"
                    ? "btn-primary-pill text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>1. Media &amp; Konsep</span>
                {imagePreview && <Check className="w-3 h-3 text-white" />}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("tearsheet")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "tearsheet"
                    ? "btn-primary-pill text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>2. Tim &amp; Tear-Sheet</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    activeTab === "tearsheet"
                      ? "bg-white/20 text-white"
                      : "bg-sky-100 text-[#0284c7]"
                  }`}
                >
                  {credits.length} Kru
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              title="Tutup (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. FORM BODY */}
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {error && (
            <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold shrink-0 flex items-center gap-2">
              <X className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: MEDIA & BASICS */}
          {activeTab === "basics" && (
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar scrollbar-none p-6 sm:p-7 space-y-6">
              {/* Media Type Segmented Pills (Capsule Pills) */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center p-1 bg-slate-100 rounded-full border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => {
                      setMediaType("IMAGE");
                      if (subtype === "Video Komersial") setSubtype("Fotografi");
                    }}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      mediaType === "IMAGE"
                        ? "btn-primary-pill text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 bg-transparent"
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Portofolio Foto &amp; Lookbook</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaType("VIDEO");
                      if (subtype === "Fotografi") setSubtype("Video Komersial");
                    }}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      mediaType === "VIDEO"
                        ? "btn-primary-pill text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 bg-transparent"
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Portofolio Video &amp; Sinema</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Info className="w-3.5 h-3.5 text-[#0284c7]" />
                  <span>Mendukung orientasi potret, vertikal (reels), dan lanskap</span>
                </div>
              </div>

              {/* PHOTO UPLOAD FLOW */}
              {mediaType === "IMAGE" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Form Details (7 cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Judul Karya *
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Contoh: Fall Fashion Campaign 'Silk Horizon'"
                        className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4CC9FE]/20 focus:border-[#4CC9FE] transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Kategori Spesifik *
                        </label>
                        <select
                          value={subtype}
                          onChange={(e) => setSubtype(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4CC9FE]/20 focus:border-[#4CC9FE] transition-all cursor-pointer"
                        >
                          <option value="Fotografi">Fotografi</option>
                          <option value="Koleksi Lookbook">Koleksi Lookbook</option>
                          <option value="Fashion Styling">Fashion Styling</option>
                          <option value="Desain Grafis">Desain Grafis</option>
                          <option value="3D & Animasi">3D & Animasi</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                          <span>Orientasi Rasio *</span>
                          {imageDimensions && (
                            <span className="text-[10px] text-emerald-600 font-mono font-bold lowercase">
                              auto-detected
                            </span>
                          )}
                        </label>
                        <select
                          value={aspectRatio}
                          onChange={(e) => setAspectRatio(e.target.value as any)}
                          className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4CC9FE]/20 focus:border-[#4CC9FE] transition-all cursor-pointer"
                        >
                          <option value="4:5">4:5 (Portret Editorial Lookbook)</option>
                          <option value="9:16">9:16 (Vertikal Penuh / Reels / Story)</option>
                          <option value="16:9">16:9 (Lanskap Sinematik)</option>
                          <option value="1:1">1:1 (Persegi Square)</option>
                          <option value="4:3">4:3 (Lanskap Klasik)</option>
                        </select>
                      </div>
                    </div>

                    {/* Quick Aspect Ratio Shortcut Buttons (Capsule Pills) */}
                    <div>
                      <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Pilihan Cepat Format:
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {[
                          { val: "4:5", label: "4:5 Portret", icon: Camera },
                          { val: "9:16", label: "9:16 Vertikal", icon: Smartphone },
                          { val: "16:9", label: "16:9 Lanskap", icon: Maximize2 },
                          { val: "1:1", label: "1:1 Persegi", icon: Layers },
                        ].map((btn) => (
                          <button
                            key={btn.val}
                            type="button"
                            onClick={() => setAspectRatio(btn.val as any)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                              aspectRatio === btn.val
                                ? "bg-sky-50 text-[#0284c7] border-2 border-[#4CC9FE] shadow-2xs"
                                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                          >
                            <btn.icon className="w-3.5 h-3.5" />
                            <span>{btn.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>Tautan Proyek (Opsional)</span>
                      </label>
                      <input
                        type="url"
                        value={projectUrl}
                        onChange={(e) => setProjectUrl(e.target.value)}
                        placeholder="https://behance.net/... atau portofolio eksternal"
                        className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4CC9FE]/20 focus:border-[#4CC9FE] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Deskripsi &amp; Konsep Visual
                      </label>
                      <textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ceritakan konsep karya, tema styling, teknik pencahayaan, atau peranan Anda..."
                        className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4CC9FE]/20 focus:border-[#4CC9FE] transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Right Column: Studio Live Frame Dropzone (5 cols) */}
                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-slate-500" />
                        <span>{imagePreview ? "Pratinjau Bingkai Karya *" : "Berkas Foto Karya *"}</span>
                      </label>
                      {imagePreview && (
                        <span className="text-[10px] text-[#0284c7] font-mono font-bold bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                          Format {aspectRatio}
                        </span>
                      )}
                    </div>

                    <div className="relative border-2 border-dashed border-slate-200/90 hover:border-[#4CC9FE] rounded-2xl p-5 bg-slate-50/50 hover:bg-sky-50/20 transition-all flex flex-col items-center justify-center min-h-[320px] text-center overflow-hidden">
                      {imagePreview ? (
                        <div className="relative w-full flex flex-col items-center justify-center space-y-3.5">
                          {/* Adaptive Frame Box */}
                          <div
                            className={`relative overflow-hidden rounded-2xl bg-slate-950 shadow-md ${previewAspectClass} border border-slate-200/90 transition-all duration-300 w-full`}
                          >
                            {/* Ambient Blur Backdrop */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
                              <img
                                src={imagePreview}
                                alt=""
                                aria-hidden="true"
                                className="w-full h-full object-cover scale-125 filter blur-xl opacity-40 brightness-90 transform-gpu"
                              />
                            </div>

                            {/* Main Framed Artwork */}
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-full object-cover object-top relative z-5"
                            />

                            {/* Format Pill on Top */}
                            <div className="absolute top-2.5 left-2.5 z-10 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-mono font-bold flex items-center gap-1 border border-white/20">
                              <span>{aspectRatio}</span>
                              {imageDimensions && (
                                <span className="text-slate-300">
                                  ({imageDimensions.width}x{imageDimensions.height})
                                </span>
                              )}
                            </div>

                            {/* Remove Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setImagePreview(null);
                                setSelectedFile(null);
                                setImageDimensions(null);
                              }}
                              className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white transition-colors cursor-pointer shadow-md"
                              title="Hapus Foto"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <label className="px-4 py-2 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1.5">
                              <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                              <span>Ganti Foto</span>
                              <input
                                type="file"
                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                onChange={handleImageFileChange}
                                className="hidden"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setImagePreview(null);
                                setSelectedFile(null);
                                setImageDimensions(null);
                              }}
                              className="px-4 py-2 rounded-full bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center justify-center space-y-3.5 w-full h-full py-10 group">
                          <div className="w-14 h-14 rounded-full bg-sky-50 border border-sky-200/90 text-[#0284c7] flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:bg-[#4CC9FE] group-hover:text-white transition-all">
                            <UploadCloud className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <span className="text-sm font-extrabold text-slate-900 block group-hover:text-[#0284c7] transition-colors">
                              Pilih File Foto dari Perangkat
                            </span>
                            <span className="text-xs text-slate-500 block max-w-xs">
                              Mendukung JPG, PNG, atau WebP resolusi tinggi (hingga 15 MB)
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono pt-1">
                            <span className="bg-white px-2.5 py-0.5 rounded-full border border-slate-200/80 shadow-2xs">Potret 4:5</span>
                            <span className="bg-white px-2.5 py-0.5 rounded-full border border-slate-200/80 shadow-2xs">Reels 9:16</span>
                            <span className="bg-white px-2.5 py-0.5 rounded-full border border-slate-200/80 shadow-2xs">Lanskap 16:9</span>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                            onChange={handleImageFileChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* VIDEO UPLOAD FLOW */}
              {mediaType === "VIDEO" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Form Details (7 cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Judul Karya Video *
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Contoh: Commercial Lookbook Fashion Film 'Eclipse'"
                        className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4CC9FE]/20 focus:border-[#4CC9FE] transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Kategori *
                        </label>
                        <select
                          value={subtype}
                          onChange={(e) => setSubtype(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4CC9FE]/20 focus:border-[#4CC9FE] transition-all cursor-pointer"
                        >
                          <option value="Video Komersial">Video Komersial</option>
                          <option value="Fashion Styling">Fashion Styling Film</option>
                          <option value="3D & Animasi">3D &amp; Animasi</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Rasio Layar Video *
                        </label>
                        <select
                          value={aspectRatio}
                          onChange={(e) => setAspectRatio(e.target.value as any)}
                          className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4CC9FE]/20 focus:border-[#4CC9FE] transition-all cursor-pointer"
                        >
                          <option value="16:9">16:9 (Lanskap Cinema YouTube)</option>
                          <option value="9:16">9:16 (Vertikal Reels / TikTok / Shorts)</option>
                          <option value="1:1">1:1 (Persegi Square)</option>
                          <option value="4:5">4:5 (Portret Editorial)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Sumber Video *
                      </label>
                      <div className="flex items-center p-1 bg-slate-100 rounded-full border border-slate-200/80 w-fit">
                        <button
                          type="button"
                          onClick={() => setVideoSourceType("URL")}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            videoSourceType === "URL"
                              ? "bg-white text-slate-900 shadow-2xs"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          Tautan Streaming (YouTube / Shorts / Vimeo)
                        </button>
                        <button
                          type="button"
                          onClick={() => setVideoSourceType("FILE")}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            videoSourceType === "FILE"
                              ? "bg-white text-slate-900 shadow-2xs"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          Unggah File MP4 / WebM
                        </button>
                      </div>

                      {videoSourceType === "URL" ? (
                        <div className="space-y-1 pt-1">
                          <input
                            type="url"
                            value={videoUrl}
                            onChange={(e) => handleExternalVideoUrlChange(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=... atau https://vimeo.com/..."
                            className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4CC9FE]/20 focus:border-[#4CC9FE] transition-all"
                          />
                          <p className="text-[10px] text-slate-500">
                            Mendukung tautan YouTube reguler, YouTube Shorts (otomatis 9:16), Vimeo, atau tautan file MP4.
                          </p>
                        </div>
                      ) : (
                        <div className="pt-1">
                          {selectedVideoFile ? (
                            <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 truncate">
                                <Film className="w-4 h-4 text-[#0284c7] shrink-0" />
                                <span className="truncate">{selectedVideoFile.name}</span>
                                <span className="text-[10px] text-slate-500 font-mono shrink-0">
                                  ({(selectedVideoFile.size / (1024 * 1024)).toFixed(1)} MB)
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedVideoFile(null);
                                  setVideoPreviewUrl(null);
                                }}
                                className="p-1 hover:text-rose-600 transition-colors cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <label className="border-2 border-dashed border-slate-200/90 hover:border-[#4CC9FE] p-5 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-slate-50/50 hover:bg-sky-50/20 transition-all">
                              <UploadCloud className="w-5 h-5 text-slate-500" />
                              <span className="text-xs font-bold text-slate-800">
                                Pilih File Video dari Perangkat (MP4 / WebM)
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Ukuran maksimal hingga 100 MB
                              </span>
                              <input
                                type="file"
                                accept="video/mp4, video/webm, video/quicktime"
                                onChange={handleVideoFileChange}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Sinopsis / Deskripsi Video
                      </label>
                      <textarea
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Uraikan sinopsis, tone visual, atau spesifikasi format video..."
                        className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4CC9FE]/20 focus:border-[#4CC9FE] transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Right Column: Live Player & Cover Poster (5 cols) */}
                  <div className="lg:col-span-5 space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Play className="w-3.5 h-3.5 text-slate-500" />
                          <span>Pratinjau Pemutaran Video</span>
                        </label>
                        <span className="text-[10px] text-[#0284c7] font-mono font-bold bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                          {aspectRatio}
                        </span>
                      </div>

                      <div
                        className={`relative border border-slate-200 rounded-2xl bg-slate-950 flex items-center justify-center overflow-hidden shadow-xs transition-all ${
                          aspectRatio === "9:16"
                            ? "aspect-[9/16] max-w-[220px] mx-auto ring-1 ring-white/10"
                            : "aspect-video w-full"
                        }`}
                      >
                        {videoPreviewUrl ? (
                          <video
                            src={videoPreviewUrl}
                            controls
                            className="w-full h-full object-contain"
                          />
                        ) : videoUrl && parseVideoUrl(videoUrl)?.embedUrl ? (
                          <iframe
                            src={parseVideoUrl(videoUrl)!.embedUrl!}
                            className="w-full h-full"
                            allowFullScreen
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400 text-xs font-medium space-y-1.5 p-6 text-center">
                            <Film className="w-8 h-8 opacity-40 mb-1" />
                            <span>Preview video akan aktif setelah URL atau file dipilih</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-slate-500" /> Poster Cover Video *
                        </label>
                        {isCapturingPoster && (
                          <span className="text-[10px] text-[#0284c7] animate-pulse font-medium">
                            Mengambil frame...
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="relative w-20 h-16 rounded-xl border border-slate-200 bg-slate-200/60 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Poster Cover"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-slate-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all shadow-2xs cursor-pointer">
                            <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                            <span>Ganti Poster Cover</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageFileChange}
                              className="hidden"
                            />
                          </label>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Tampil di galeri sebelum video diputar
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TEAR-SHEET & TEAM CREDITS */}
          {activeTab === "tearsheet" && (
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar scrollbar-none p-6 sm:p-7 space-y-6">
              {/* Educational Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 via-sky-50/50 to-indigo-50/40 border border-sky-200/90 text-slate-900 text-xs space-y-1.5">
                <div className="font-extrabold flex items-center gap-2 text-[#0284c7]">
                  <Sparkles className="w-4 h-4 text-[#0284c7]" />
                  <span>Interactive Hotspot Tear-Sheet &bull; Peer-Verified Co-Credit</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Tandai seluruh rekan tim atau studio terdaftar di RAMU (Fotografer, MUA, Stylist, Model, Studio). Karya ini otomatis tersambung ke profil resmi mereka dan terverifikasi secara silang untuk mencegah catfishing.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Hotspot Canvas (5 cols) */}
                <div className="lg:col-span-5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Titik Hotspot Interaktif
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Klik foto untuk pasang pin
                    </span>
                  </div>

                  <div
                    ref={photoCanvasRef}
                    onClick={handlePhotoClick}
                    className={`relative w-full ${previewAspectClass} bg-slate-950 rounded-2xl overflow-hidden cursor-crosshair border border-slate-200 select-none shadow-md group`}
                  >
                    {imagePreview ? (
                      <>
                        <img
                          src={imagePreview}
                          alt="Canvas"
                          className="w-full h-full object-cover object-top pointer-events-none"
                        />
                        <div className="absolute inset-0 bg-black/10 pointer-events-none group-hover:bg-transparent transition-colors" />
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs p-6 text-center space-y-1">
                        <ImageIcon className="w-6 h-6 opacity-40 mb-1" />
                        <span>Pilih foto cover di Tab 1 untuk mengaktifkan titik hotspot</span>
                      </div>
                    )}

                    {hotspots.map((pin) => {
                      const color = CATEGORY_COLORS[pin.category] || CATEGORY_COLORS.wardrobe;
                      return (
                        <div
                          key={pin.id}
                          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group/pin"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div
                            className={`w-6 h-6 rounded-full ${color.bg} text-white font-bold text-[10px] flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-black/20 hover:scale-125 transition-transform cursor-pointer`}
                          >
                            {pin.title.charAt(0)}
                          </div>

                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover/pin:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 text-white text-[10px] font-semibold whitespace-nowrap z-30 shadow-md">
                            <span>{pin.creatorName} ({pin.role})</span>
                            <button
                              type="button"
                              onClick={(e) => handleRemovePin(pin.id, e)}
                              className="text-slate-400 hover:text-rose-400 ml-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-400 italic text-center">
                    Pin di atas akan tampil interaktif saat karya dibuka di Dossier lookbook.
                  </p>
                </div>

                {/* Right: Add Team Member Form & Specs (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Add Member Card */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-3">
                    <span className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      + Tambahkan Kredit Rekan Tim / Kolaborator
                    </span>

                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          Departemen / Kategori Peran
                        </label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value as HotspotCategory)}
                          className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4CC9FE]/20 focus:border-[#4CC9FE] cursor-pointer"
                        >
                          {CATEGORY_ROLES.map((role) => (
                            <option key={role.category} value={role.category}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="relative">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          Nama Kreator / Cari Profil di RAMU
                        </label>
                        <div className="relative">
                          <input
                            ref={searchInputRef}
                            type="text"
                            value={newName}
                            onChange={(e) => {
                              setNewName(e.target.value);
                              setShowSuggestions(true);
                              if (selectedActorId) setSelectedActorId(null);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            placeholder="Ketik nama kreator atau studio terdaftar..."
                            className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4CC9FE]/20 focus:border-[#4CC9FE]"
                          />
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        {showSuggestions && filteredSuggestions.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto no-scrollbar scrollbar-none">
                            {filteredSuggestions.map((actor) => (
                              <button
                                key={actor.id}
                                type="button"
                                onClick={() => handleSelectActor(actor)}
                                className="w-full text-left px-3.5 py-2 hover:bg-sky-50 flex items-center justify-between text-xs transition-colors cursor-pointer"
                              >
                                <div>
                                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                    <span>{actor.name}</span>
                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">
                                      Terdaftar di RAMU
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-500">
                                    {actor.sector} &bull; {actor.location || "Indonesia"}
                                  </div>
                                </div>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Handle Instagram / Medsos
                          </label>
                          <input
                            type="text"
                            value={newHandle}
                            onChange={(e) => setNewHandle(e.target.value)}
                            placeholder="@handle"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4CC9FE]/20 focus:border-[#4CC9FE]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Peran / Kontribusi
                          </label>
                          <input
                            type="text"
                            value={newDetails}
                            onChange={(e) => setNewDetails(e.target.value)}
                            placeholder="Misal: Lead MUA &amp; Hair"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4CC9FE]/20 focus:border-[#4CC9FE]"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddCredit}
                        disabled={!newName.trim()}
                        className="w-full py-2.5 rounded-full btn-primary-pill text-white text-xs font-bold disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-[#4CC9FE]/25 active:scale-95"
                      >
                        + Sematkan ke Daftar Kredit Tim
                      </button>
                    </div>
                  </div>

                  {/* List of Attached Crew */}
                  <div className="space-y-2">
                    <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Daftar Tim Terpasang ({credits.length})
                    </span>

                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 no-scrollbar scrollbar-none">
                      {credits.map((c) => {
                        const color = CATEGORY_COLORS[c.category] || CATEGORY_COLORS.wardrobe;
                        return (
                          <div
                            key={c.id}
                            className="p-2.5 rounded-xl bg-white border border-slate-200/90 flex items-center justify-between gap-3 text-xs shadow-2xs hover:border-slate-300 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`w-2 h-2 rounded-full ${color.bg} shrink-0`} />
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span className="truncate">{c.name}</span>
                                  <span className="font-mono text-[10px] text-slate-400">
                                    {c.handle}
                                  </span>
                                  {c.actorId && (
                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 shrink-0">
                                      Terhubung Akun
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-500 truncate block">
                                  {c.role} &bull; {c.details}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveCredit(c.id)}
                              className="text-slate-400 hover:text-rose-500 p-1 shrink-0 transition-colors cursor-pointer"
                              title="Hapus kredit"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Gear Specs Accordion Card */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-2.5">
                    <span className="block text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-slate-400" />
                      <span>Spesifikasi Gear &amp; Studio (Opsional)</span>
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <input
                        type="text"
                        value={camera}
                        onChange={(e) => setCamera(e.target.value)}
                        placeholder="Kamera (misal: Sony A7IV)"
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#4CC9FE]"
                      />
                      <input
                        type="text"
                        value={lens}
                        onChange={(e) => setLens(e.target.value)}
                        placeholder="Lensa (misal: 85mm f/1.4 GM)"
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#4CC9FE]"
                      />
                      <input
                        type="text"
                        value={lighting}
                        onChange={(e) => setLighting(e.target.value)}
                        placeholder="Lighting (misal: Profoto B10X Plus + Softbox 120cm)"
                        className="col-span-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#4CC9FE]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. MODAL FOOTER ACTION BAR (Consistent Capsule Pills & Brand Palette) */}
          <div className="shrink-0 px-6 py-4 bg-white border-t border-slate-200/80 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              Batal
            </button>

            <div className="flex items-center gap-2.5">
              {activeTab === "basics" ? (
                <button
                  type="button"
                  onClick={() => setActiveTab("tearsheet")}
                  className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>Lanjut: Atur Tim &amp; Tear-Sheet</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab("basics")}
                  className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  &larr; Kembali ke Media &amp; Konsep
                </button>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="px-6 py-2.5 rounded-full btn-primary-pill text-white text-xs font-bold transition-all shadow-md shadow-[#4CC9FE]/25 flex items-center gap-2 disabled:opacity-70 active:scale-95 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Menyimpan Karya...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Publikasikan Mahakarya</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
