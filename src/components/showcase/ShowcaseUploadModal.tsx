"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
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
  ArrowRight
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

const CATEGORY_ROLES: { category: HotspotCategory; label: string; defaultRole: string; icon: React.ElementType }[] = [
  { category: "cinematography", label: "Penyutradaraan & Sinematografi", defaultRole: "Film Director / DoP", icon: Video },
  { category: "photography", label: "Fotografi & Lighting", defaultRole: "Director of Photography", icon: Camera },
  { category: "wardrobe", label: "Wardrobe & Styling", defaultRole: "Fashion Designer / Stylist", icon: Shirt },
  { category: "hmua", label: "Makeup & Hair (HMUA)", defaultRole: "Lead Beauty & Hair Stylist", icon: Sparkles },
  { category: "talent", label: "Model & Talent", defaultRole: "Editorial Muse / Model", icon: User },
  { category: "art_direction", label: "Art Direction & Pascaproduksi", defaultRole: "Art Director & Colorist", icon: Palette },
  { category: "sound", label: "Penata Suara & Musik", defaultRole: "Sound Designer / Music", icon: Volume2 },
];

const CATEGORY_COLORS: Record<HotspotCategory, { bg: string; text: string; border: string }> = {
  cinematography: { bg: "bg-purple-500", text: "text-purple-700", border: "border-purple-300" },
  photography: { bg: "bg-emerald-500", text: "text-emerald-700", border: "border-emerald-300" },
  wardrobe: { bg: "bg-indigo-500", text: "text-indigo-700", border: "border-indigo-300" },
  hmua: { bg: "bg-rose-500", text: "text-rose-700", border: "border-rose-300" },
  talent: { bg: "bg-amber-500", text: "text-amber-800", border: "border-amber-300" },
  art_direction: { bg: "bg-sky-500", text: "text-sky-700", border: "border-sky-300" },
  sound: { bg: "bg-cyan-500", text: "text-cyan-700", border: "border-cyan-300" },
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

  const [mediaType, setMediaType] = useState<"IMAGE" | "VIDEO">("IMAGE");
  const [videoSourceType, setVideoSourceType] = useState<"URL" | "FILE">("URL");
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1">("16:9");
  const [isCapturingPoster, setIsCapturingPoster] = useState(false);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [subtype, setSubtype] = useState("Fotografi");
  const [description, setDescription] = useState("");
  const [projectUrl, setProjectUrl] = useState("");

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

  const [newCategory, setNewCategory] = useState<HotspotCategory>("wardrobe");
  const [newName, setNewName] = useState("");
  const [newHandle, setNewHandle] = useState("");
  const [newDetails, setNewDetails] = useState("");
  const [selectedActorId, setSelectedActorId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [camera, setCamera] = useState("");
  const [lens, setLens] = useState("");
  const [lighting, setLighting] = useState("");

  const photoCanvasRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      handle: newHandle.trim()
        ? (newHandle.startsWith("@") ? newHandle : `@${newHandle}`)
        : `@${newName.toLowerCase().replace(/[\s&.]+/g, "_")}`,
      details: newDetails.trim() || "Kontributor Kreatif Terverifikasi",
      actorId: selectedActorId || undefined
    };

    setCredits([...credits, newCredit]);
    setNewName("");
    setNewHandle("");
    setNewDetails("");
    setSelectedActorId(null);
    setShowSuggestions(false);
  };

  const handleRemoveCredit = (id: string) => {
    setCredits(credits.filter((c) => c.id !== id));
  };

  const handlePhotoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!photoCanvasRef.current) return;
    const rect = photoCanvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const x = Math.round((clickX / rect.width) * 100);
    const y = Math.round((clickY / rect.height) * 100);

    const assignedCredit = credits[hotspots.length % credits.length] || {
      category: "wardrobe" as HotspotCategory,
      role: "Wardrobe / Detail",
      name: "Detail Karya",
      handle: "@kreator",
      details: "Fokus Visual"
    };

    const newPin: InputHotspot = {
      id: `pin-${Date.now()}`,
      category: assignedCredit.category,
      title: assignedCredit.role,
      role: assignedCredit.role,
      creatorName: assignedCredit.name,
      creatorHandle: assignedCredit.handle,
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y)),
      details: [
        { label: "Karya", value: assignedCredit.details || "Elemen Visual" }
      ],
      notes: "Disematkan via Hotspot Pin RAMU."
    };

    setHotspots([...hotspots, newPin]);
  };

  const handleRemovePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHotspots(hotspots.filter((h) => h.id !== id));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !subtype) {
      setError("Mohon lengkapi judul dan kategori karya.");
      return;
    }

    if (mediaType === "IMAGE" && !selectedFile && !imagePreview) {
      setError("Mohon pilih foto cover portofolio Anda.");
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

      if (mediaType === "VIDEO") {
        formData.append("aspectRatio", aspectRatio);
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
            actorId: c.actorId || undefined,
            verified: isUploader,
            status: isUploader ? "VERIFIED" : (c.actorId ? "PENDING" : "EXTERNAL"),
            isUploader,
            verifiedBy: isUploader ? "Pemilik Portofolio (Uploader)" : undefined,
            verificationTimestamp: isUploader ? new Date().toISOString() : undefined
          };
        }),
        hotspots: hotspots.length > 0 ? hotspots : undefined,
        technicalSpecs: (camera || lens || lighting) ? {
          camera: camera || undefined,
          lens: lens || undefined,
          lighting: lighting || undefined
        } : undefined
      };

      formData.append("tearSheet", JSON.stringify(tearSheetPayload));

      const res = await createShowcaseAsset(formData);
      if (res.success) {
        setTitle("");
        setDescription("");
        setProjectUrl("");
        setSelectedFile(null);
        setImagePreview(null);
        setSelectedVideoFile(null);
        setVideoPreviewUrl(null);
        setVideoUrl("");
        setMediaType("IMAGE");
        setVideoSourceType("URL");
        setHotspots([]);
        setActiveTab("basics");
        onClose();
        if (onSuccess) onSuccess();
        router.refresh();
      } else {
        setError(res.error || "Gagal menambahkan karya");
      }
    });
  }

  if (!isOpen || !mounted) return null;

  const modalNode = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-stone-950/45 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl h-full md:h-[90vh] max-h-[860px] bg-white border border-stone-200/90 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.16)] flex flex-col overflow-hidden text-stone-900"
      >
        <div className="h-16 shrink-0 px-6 bg-white border-b border-stone-200/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-stone-900">Unggah Karya &amp; Tear-Sheet</h3>
              <p className="text-[11px] text-stone-500 font-medium">Kurasi portofolio dengan kredit kolaborasi terverifikasi</p>
            </div>
          </div>

          <div className="flex items-center p-1 bg-stone-100 rounded-full border border-stone-200/80">
            <button
              type="button"
              onClick={() => setActiveTab("basics")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === "basics"
                  ? "bg-white text-stone-950 shadow-xs"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              1. Info Karya *
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("tearsheet")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "tearsheet"
                  ? "bg-white text-amber-900 shadow-xs"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <span>2. Kredit Tim Kolaborasi</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-mono font-bold">
                OPSIONAL
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-900 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {error && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold shrink-0">
              {error}
            </div>
          )}

          {activeTab === "basics" && (
            <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-2 p-1.5 bg-stone-100/90 rounded-2xl w-fit border border-stone-200/80 mb-1">
                <button
                  type="button"
                  onClick={() => {
                    setMediaType("IMAGE");
                    if (subtype === "Video Komersial") setSubtype("Fotografi");
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    mediaType === "IMAGE"
                      ? "bg-white text-stone-900 shadow-xs"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5 text-stone-700" />
                  <span>Portofolio Foto</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMediaType("VIDEO");
                    if (subtype === "Fotografi") setSubtype("Video Komersial");
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    mediaType === "VIDEO"
                      ? "bg-stone-950 text-white shadow-xs"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  <Film className="w-3.5 h-3.5 text-amber-400" />
                  <span>Portofolio Video / Sinema</span>
                </button>
              </div>

              {mediaType === "IMAGE" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                        Judul Karya *
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Contoh: Fall Fashion Campaign 'Silk Horizon'"
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                        Kategori Spesifik *
                      </label>
                      <select
                        value={subtype}
                        onChange={(e) => setSubtype(e.target.value)}
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      >
                        <option value="Fotografi">Fotografi</option>
                        <option value="Fashion Styling">Fashion Styling</option>
                        <option value="Desain Grafis">Desain Grafis</option>
                        <option value="3D & Animasi">3D & Animasi</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <LinkIcon className="w-3.5 h-3.5 text-stone-500" /> Tautan Proyek (Opsional)
                      </label>
                      <input
                        type="url"
                        value={projectUrl}
                        onChange={(e) => setProjectUrl(e.target.value)}
                        placeholder="https://behance.net/... atau tautan eksternal"
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                        Deskripsi Singkat
                      </label>
                      <textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ceritakan konsep karya, siluet, atau peranan Anda dalam kolaborasi ini..."
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-stone-500" /> Foto Cover Karya *
                    </label>

                    <div className="relative border-2 border-dashed border-stone-200 hover:border-amber-400/80 rounded-2xl p-4 bg-stone-50/60 transition-colors flex flex-col items-center justify-center min-h-[260px] text-center overflow-hidden">
                      {imagePreview ? (
                        <div className="relative w-full h-[240px] flex items-center justify-center">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-h-full max-w-full object-contain rounded-xl shadow-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setSelectedFile(null);
                            }}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-stone-900/80 hover:bg-rose-600 text-white text-xs transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center space-y-2 w-full h-full py-8">
                          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-700 flex items-center justify-center shadow-xs">
                            <UploadCloud className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-bold text-stone-800">
                            Pilih File Foto dari Perangkat
                          </span>
                          <span className="text-[11px] text-stone-400 max-w-[220px]">
                            Mendukung JPG, PNG, atau WebP (hingga 15 MB)
                          </span>
                          <input
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

              {mediaType === "VIDEO" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                        Judul Karya Video *
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Contoh: Commercial Lookbook Film 'Eclipse'"
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                          Kategori *
                        </label>
                        <select
                          value={subtype}
                          onChange={(e) => setSubtype(e.target.value)}
                          className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        >
                          <option value="Video Komersial">Video Komersial</option>
                          <option value="Fashion Styling">Fashion Styling</option>
                          <option value="3D & Animasi">3D & Animasi</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                          Rasio Layar *
                        </label>
                        <select
                          value={aspectRatio}
                          onChange={(e) => setAspectRatio(e.target.value as any)}
                          className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        >
                          <option value="16:9">16:9 (Landscape Cinema)</option>
                          <option value="9:16">9:16 (Vertical Reels/TikTok)</option>
                          <option value="1:1">1:1 (Persegi Square)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                        Sumber Video *
                      </label>
                      <div className="flex items-center gap-2 p-1 bg-stone-100 rounded-xl w-fit">
                        <button
                          type="button"
                          onClick={() => setVideoSourceType("URL")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            videoSourceType === "URL"
                              ? "bg-white text-stone-900 shadow-2xs"
                              : "text-stone-500 hover:text-stone-800"
                          }`}
                        >
                          Streaming Link (YouTube/Vimeo)
                        </button>
                        <button
                          type="button"
                          onClick={() => setVideoSourceType("FILE")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            videoSourceType === "FILE"
                              ? "bg-white text-stone-900 shadow-2xs"
                              : "text-stone-500 hover:text-stone-800"
                          }`}
                        >
                          File MP4 / Direct Upload
                        </button>
                      </div>

                      {videoSourceType === "URL" ? (
                        <div className="space-y-1 pt-1">
                          <input
                            type="url"
                            value={videoUrl}
                            onChange={(e) => handleExternalVideoUrlChange(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=... atau https://vimeo.com/..."
                            className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                          />
                          <p className="text-[10px] text-stone-500">
                            Masukkan tautan YouTube, Vimeo, atau link file video streaming .mp4 langsung.
                          </p>
                        </div>
                      ) : (
                        <div className="pt-1">
                          {selectedVideoFile ? (
                            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs font-bold text-amber-950 truncate">
                                <Film className="w-4 h-4 text-amber-600 shrink-0" />
                                <span className="truncate">{selectedVideoFile.name}</span>
                                <span className="text-[10px] text-amber-700/80 font-mono shrink-0">
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
                            <label className="border border-dashed border-stone-300 hover:border-amber-400 p-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer bg-stone-50/50 hover:bg-stone-50 transition-colors">
                              <UploadCloud className="w-4 h-4 text-stone-500" />
                              <span className="text-xs font-bold text-stone-700">Pilih File Video MP4 / WebM</span>
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
                      <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                        Deskripsi Video
                      </label>
                      <textarea
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Uraikan sinopsis, tone visual, atau spesifikasi format video..."
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Play className="w-3.5 h-3.5 text-stone-500" /> Preview Pemutaran Video
                      </label>
                      <div className="relative border border-stone-200 rounded-2xl bg-stone-950 aspect-video flex items-center justify-center overflow-hidden">
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
                          <div className="flex flex-col items-center justify-center text-stone-500 text-xs font-medium space-y-1">
                            <Film className="w-8 h-8 opacity-40 mb-1" />
                            <span>Preview video akan muncul di sini</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-stone-500" /> Poster Cover Video *
                        </label>
                        {isCapturingPoster && (
                          <span className="text-[10px] text-amber-600 animate-pulse font-medium">
                            Mengambil frame poster...
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="relative w-24 h-16 rounded-xl border border-stone-200 bg-stone-100 overflow-hidden flex items-center justify-center shrink-0">
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Poster Cover"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-stone-400" />
                          )}
                        </div>

                        <div className="flex-1">
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors cursor-pointer">
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>Unggah Poster Kustom</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageFileChange}
                              className="hidden"
                            />
                          </label>
                          <p className="text-[10px] text-stone-400 mt-1">
                            Poster ini tampil di galeri showcase sebelum video diputar.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "tearsheet" && (
            <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-8 space-y-6">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-amber-950 text-xs space-y-1">
                <div className="font-extrabold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Kredit Tim Resmi &bull; Peer-Verified Co-Credit (Anti-Catfishing)</span>
                </div>
                <p className="text-amber-800/90 leading-relaxed text-[11px]">
                  Tandai kreator atau studio terdaftar di RAMU yang terlibat dalam produksi ini. Karya ini akan otomatis terhubung ke profil dan portofolio resmi mereka.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                      Titik Hotspot Interaktif (Opsional)
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Klik foto untuk menyematkan pin
                    </span>
                  </div>

                  <div
                    ref={photoCanvasRef}
                    onClick={handlePhotoClick}
                    className="relative w-full aspect-[4/5] bg-stone-900 rounded-2xl overflow-hidden cursor-crosshair border border-stone-200 select-none shadow-xs group"
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Canvas"
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                        Pilih foto di Tab 1 terlebih dahulu
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
                          <div className={`w-6 h-6 rounded-full ${color.bg} text-white font-bold text-[10px] flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-black/20 hover:scale-125 transition-transform`}>
                            {pin.title.charAt(0)}
                          </div>

                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover/pin:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-900 text-white text-[10px] font-semibold whitespace-nowrap z-30 shadow-md">
                            <span>{pin.creatorName} ({pin.role})</span>
                            <button
                              type="button"
                              onClick={(e) => handleRemovePin(pin.id, e)}
                              className="text-stone-400 hover:text-rose-400 ml-1 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-3">
                    <span className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                      + Tambah Kredit Kru / Kolaborator
                    </span>

                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">
                          Kategori Departemen
                        </label>
                        <select
                          value={newCategory}
                          onChange={(e) => {
                            const cat = e.target.value as HotspotCategory;
                            setNewCategory(cat);
                          }}
                          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        >
                          {CATEGORY_ROLES.map((role) => (
                            <option key={role.category} value={role.category}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="relative">
                        <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">
                          Nama Kreator / Cari Talenta RAMU
                        </label>
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
                          placeholder="Ketik nama untuk mencari pelaku terdaftar..."
                          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        />

                        {showSuggestions && filteredSuggestions.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg z-30 overflow-hidden divide-y divide-stone-100 max-h-48 overflow-y-auto">
                            {filteredSuggestions.map((actor) => (
                              <button
                                key={actor.id}
                                type="button"
                                onClick={() => handleSelectActor(actor)}
                                className="w-full text-left px-3 py-2 hover:bg-amber-50 flex items-center justify-between text-xs transition-colors cursor-pointer"
                              >
                                <div>
                                  <div className="font-bold text-stone-900 flex items-center gap-1.5">
                                    <span>{actor.name}</span>
                                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">
                                      Terdaftar
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-stone-500">
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
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">
                            Handle / Tag Akun
                          </label>
                          <input
                            type="text"
                            value={newHandle}
                            onChange={(e) => setNewHandle(e.target.value)}
                            placeholder="@handle"
                            className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">
                            Peran / Kontribusi
                          </label>
                          <input
                            type="text"
                            value={newDetails}
                            onChange={(e) => setNewDetails(e.target.value)}
                            placeholder="Misal: Lead MUA"
                            className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddCredit}
                        disabled={!newName.trim()}
                        className="w-full py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold disabled:opacity-50 transition-all cursor-pointer shadow-xs"
                      >
                        + Tambahkan ke Daftar Kru
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                      Daftar Tim Terpasang ({credits.length})
                    </span>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {credits.map((c) => {
                        const color = CATEGORY_COLORS[c.category] || CATEGORY_COLORS.wardrobe;
                        return (
                          <div
                            key={c.id}
                            className="p-2.5 rounded-xl bg-white border border-stone-200 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`w-2 h-2 rounded-full ${color.bg} shrink-0`} />
                              <div className="min-w-0">
                                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                                  <span className="truncate">{c.name}</span>
                                  <span className="font-mono text-[10px] text-stone-400">
                                    {c.handle}
                                  </span>
                                  {c.actorId && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 shrink-0">
                                      Terhubung
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-stone-500 truncate block">
                                  {c.role} &bull; {c.details}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveCredit(c.id)}
                              className="text-stone-400 hover:text-rose-500 p-1 shrink-0 transition-colors cursor-pointer"
                              title="Hapus kredit"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                    <span className="block text-[10px] font-mono font-bold text-stone-600 uppercase tracking-wider">
                      Spesifikasi Gear &amp; Studio (Opsional)
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <input
                        type="text"
                        value={camera}
                        onChange={(e) => setCamera(e.target.value)}
                        placeholder="Kamera (misal: Sony A7IV)"
                        className="px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-[11px]"
                      />
                      <input
                        type="text"
                        value={lens}
                        onChange={(e) => setLens(e.target.value)}
                        placeholder="Lensa (misal: 85mm f/1.4)"
                        className="px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-[11px]"
                      />
                      <input
                        type="text"
                        value={lighting}
                        onChange={(e) => setLighting(e.target.value)}
                        placeholder="Lighting (misal: Profoto B10X Octabox)"
                        className="col-span-2 px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="h-16 shrink-0 px-6 bg-white border-t border-stone-200/80 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>

            <div className="flex items-center gap-2.5">
              {activeTab === "basics" ? (
                <button
                  type="button"
                  onClick={() => setActiveTab("tearsheet")}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Atur Kredit Tim (Tear-Sheet)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab("basics")}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all cursor-pointer"
                >
                  &larr; Kembali ke Info Karya
                </button>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="px-6 py-2.5 rounded-xl bg-[#1E1B2E] hover:bg-black text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-70 active:scale-95 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Simpan &amp; Publikasikan Karya</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
}
