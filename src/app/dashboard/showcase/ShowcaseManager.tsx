"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  X,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  Link as LinkIcon,
  Trash2,
  ExternalLink,
  Camera,
  Shirt,
  User,
  Palette,
  Sliders,
  Check,
  MapPin,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
  Search,
  Video,
  Film,
  Play,
  Volume2,
  UploadCloud
} from "lucide-react";
import { createShowcaseAsset, deleteShowcaseAsset } from "@/app/api/assets/actions";
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

interface Asset {
  id: string;
  name: string;
  description: string | null;
  subtype: string;
  attributes: any;
  createdAt: Date;
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
  x: number; // 0 - 100
  y: number; // 0 - 100
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

export function ShowcaseManager({
  assets,
  registeredActors = []
}: {
  assets: Asset[];
  registeredActors?: RegisteredActor[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"basics" | "tearsheet">("basics");

  // Media Type: Foto vs Video
  const [mediaType, setMediaType] = useState<"IMAGE" | "VIDEO">("IMAGE");
  const [videoSourceType, setVideoSourceType] = useState<"URL" | "FILE">("URL");
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1">("16:9");
  const [isCapturingPoster, setIsCapturingPoster] = useState(false);

  // Form states
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [subtype, setSubtype] = useState("Fotografi");
  const [description, setDescription] = useState("");
  const [projectUrl, setProjectUrl] = useState("");

  // Tear-Sheet states
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

  // New credit form temporary states
  const [newCategory, setNewCategory] = useState<HotspotCategory>("wardrobe");
  const [newName, setNewName] = useState("");
  const [newHandle, setNewHandle] = useState("");
  const [newDetails, setNewDetails] = useState("");
  const [selectedActorId, setSelectedActorId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Technical specs
  const [camera, setCamera] = useState("");
  const [lens, setLens] = useState("");
  const [lighting, setLighting] = useState("");

  const photoCanvasRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 55 * 1024 * 1024) {
        setError("Ukuran video melebihi 50MB. Disarankan menggunakan tautan Vimeo/YouTube untuk video sinematik resolusi tinggi.");
        return;
      }
      setError("");
      setSelectedVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);

      // Auto capture frame for cover poster if no image file has been manually uploaded yet
      if (!selectedFile) {
        setIsCapturingPoster(true);
        try {
          const frameDataUrl = await captureVideoFrame(file);
          if (frameDataUrl) {
            setImagePreview(frameDataUrl);
          }
        } catch (err) {
          console.error("Frame capture error:", err);
        } finally {
          setIsCapturingPoster(false);
        }
      }
    }
  };

  const handleVideoUrlChange = (url: string) => {
    setVideoUrl(url);
    setError("");
    const parsed = parseVideoUrl(url);
    if (parsed?.thumbnailUrl && !selectedFile) {
      setImagePreview(parsed.thumbnailUrl);
    }
  };

  const handleManualCaptureFrame = async () => {
    if (!selectedVideoFile) return;
    setIsCapturingPoster(true);
    try {
      const frameDataUrl = await captureVideoFrame(selectedVideoFile);
      if (frameDataUrl) {
        setImagePreview(frameDataUrl);
        setSelectedFile(null);
      }
    } catch (err) {
      console.error("Frame capture error:", err);
    } finally {
      setIsCapturingPoster(false);
    }
  };

  // Filtered actors for live IG-style tag mentions
  const cleanSearchQuery = newName.trim().replace(/^@/, "").toLowerCase();
  const filteredActors = cleanSearchQuery.length >= 1
    ? registeredActors.filter((actor) =>
        actor.name.toLowerCase().includes(cleanSearchQuery) ||
        actor.sector.toLowerCase().includes(cleanSearchQuery)
      ).slice(0, 5)
    : [];

  const handleSelectActor = (actor: RegisteredActor) => {
    setNewName(actor.name);
    setNewHandle(`@${actor.name.toLowerCase().replace(/[\s&.]+/g, "_")}`);
    setSelectedActorId(actor.id);

    // Auto detect category from sector
    const detected = detectCategoryFromSector(actor.sector);
    setNewCategory(detected);
    setShowSuggestions(false);
  };

  const handleClearSelectedActor = () => {
    setSelectedActorId(null);
    setNewName("");
    setNewHandle("");
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

  // Tap-to-pin on preview photo
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

      // Handle Cover Poster Image
      if (selectedFile) {
        formData.append("imageFile", selectedFile);
      } else if (imagePreview && imagePreview.startsWith("data:")) {
        const posterFile = dataURLtoFile(imagePreview, `poster-${Date.now()}.jpg`);
        formData.append("imageFile", posterFile);
      } else if (imagePreview && imagePreview.startsWith("http")) {
        formData.append("imageUrl", imagePreview);
      }

      // Tear Sheet Metadata payload with bound actorIds
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
        setIsModalOpen(false);
        // Reset states
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
        router.refresh();
      } else {
        setError(res.error || "Gagal menambahkan karya");
      }
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus karya ini?")) return;
    startTransition(async () => {
      const res = await deleteShowcaseAsset(id);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Gagal menghapus karya");
      }
    });
  }

  const modalNode = isModalOpen && mounted ? (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-stone-950/45 backdrop-blur-md animate-fade-in"
      onClick={() => setIsModalOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl h-full md:h-[90vh] max-h-[860px] bg-white border border-stone-200/90 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.16)] flex flex-col overflow-hidden text-stone-900"
      >
        {/* ── TOP HEADER WITH STEP TABS ── */}
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

          {/* Clean Step Switcher Tabs */}
          <div className="flex items-center p-1 bg-stone-100 rounded-full border border-stone-200/80">
            <button
              type="button"
              onClick={() => setActiveTab("basics")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
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
            onClick={() => setIsModalOpen(false)}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-900 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── MODAL FORM BODY ── */}
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
          
          {error && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold shrink-0">
              {error}
            </div>
          )}

          {/* ── TAB 1: INFORMASI KARYA UTAMA ── */}
          {activeTab === "basics" && (
            <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-8 space-y-5">
              
              {/* Media Mode Selector */}
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

              {/* ── CASE A: PORTOFOLIO FOTO ── */}
              {mediaType === "IMAGE" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Left: Input Fields */}
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

                  {/* Right: Cover Image Upload with Live Preview */}
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
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2 flex flex-col items-center">
                          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-2xs">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-stone-800">Pilih atau Seret Foto ke Sini</p>
                            <p className="text-[10px] text-stone-500 mt-0.5">JPG, PNG, atau WebP (Maks 5MB)</p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            required={!selectedFile}
                            onChange={handleImageChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        Setelah memilih foto, Anda dapat beralih ke <strong>Tab 2 (Kredit Tim)</strong> untuk men-tag kolaborator terdaftar!
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── CASE B: PORTOFOLIO VIDEO / SINEMA ── */}
              {mediaType === "VIDEO" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Left: Video Details */}
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
                        placeholder="Contoh: Vogue Runway Teaser 'Aura 2026'"
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                          Kategori Video *
                        </label>
                        <select
                          value={subtype}
                          onChange={(e) => setSubtype(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        >
                          <option value="Video Komersial">Video Komersial</option>
                          <option value="Fashion Film">Fashion Film</option>
                          <option value="Music Video">Music Video</option>
                          <option value="Campaign Reels">Campaign Reels (9:16)</option>
                          <option value="Dokumenter">Dokumenter</option>
                          <option value="Motion Graphic">Motion Graphic</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                          Rasio Aspek
                        </label>
                        <select
                          value={aspectRatio}
                          onChange={(e) => setAspectRatio(e.target.value as any)}
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        >
                          <option value="16:9">16:9 Sinematik (Lanskap)</option>
                          <option value="9:16">9:16 Reels / TikTok (Vertikal)</option>
                          <option value="1:1">1:1 Persegi</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                        Deskripsi / Sinopsis Konsep
                      </label>
                      <textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Deskripsikan visi visual, color grading, konsep sinematik, atau narasi film ini..."
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <LinkIcon className="w-3.5 h-3.5 text-stone-500" /> Tautan Proyek Lengkap (Opsional)
                      </label>
                      <input
                        type="url"
                        value={projectUrl}
                        onChange={(e) => setProjectUrl(e.target.value)}
                        placeholder="https://vimeo.com/... atau tautan proyek eksternal"
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>
                  </div>

                  {/* Right: Video Source & Poster */}
                  <div className="space-y-4">
                    
                    {/* Source Switcher */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                        Sumber Video *
                      </label>
                      <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl border border-stone-200/80">
                        <button
                          type="button"
                          onClick={() => setVideoSourceType("URL")}
                          className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            videoSourceType === "URL"
                              ? "bg-white text-stone-950 shadow-xs"
                              : "text-stone-500 hover:text-stone-900"
                          }`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Tautan Video</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setVideoSourceType("FILE")}
                          className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            videoSourceType === "FILE"
                              ? "bg-white text-stone-950 shadow-xs"
                              : "text-stone-500 hover:text-stone-900"
                          }`}
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Upload File MP4</span>
                        </button>
                      </div>
                    </div>

                    {/* Mode URL */}
                    {videoSourceType === "URL" && (
                      <div className="space-y-2">
                        <input
                          type="url"
                          value={videoUrl}
                          onChange={(e) => handleVideoUrlChange(e.target.value)}
                          placeholder="Tempel link: https://youtube.com/... atau https://vimeo.com/..."
                          className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        />
                        {videoUrl && (
                          <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-stone-600 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200">
                            <Video className="w-3.5 h-3.5 text-purple-600" />
                            <span>
                              Platform: {parseVideoUrl(videoUrl)?.platform === "YOUTUBE" ? "YouTube Terdeteksi" : parseVideoUrl(videoUrl)?.platform === "VIMEO" ? "Vimeo Terdeteksi" : "Tautan Streaming Langsung"}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Mode FILE Upload */}
                    {videoSourceType === "FILE" && (
                      <div className="relative border-2 border-dashed border-stone-200 hover:border-amber-400/80 rounded-2xl p-4 bg-stone-50/60 transition-colors flex flex-col items-center justify-center min-h-[140px] text-center overflow-hidden">
                        {selectedVideoFile ? (
                          <div className="space-y-2 w-full flex flex-col items-center">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                              <Video className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-bold text-stone-900 truncate max-w-[280px]">
                              {selectedVideoFile.name}
                            </p>
                            <p className="text-[10px] text-stone-500">
                              {(selectedVideoFile.size / (1024 * 1024)).toFixed(1)} MB • Video Siap
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedVideoFile(null);
                                setVideoPreviewUrl(null);
                              }}
                              className="text-[11px] text-rose-600 hover:underline font-bold cursor-pointer"
                            >
                              Ganti Video
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2 flex flex-col items-center">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shadow-2xs">
                              <UploadCloud className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-stone-800">Unggah File Video</p>
                              <p className="text-[10px] text-stone-500 mt-0.5">MP4, WebM, atau MOV (Maks 50MB)</p>
                            </div>
                            <input
                              type="file"
                              accept="video/mp4,video/webm,video/quicktime"
                              onChange={handleVideoFileChange}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Poster Cover Section */}
                    <div className="space-y-2 pt-1 border-t border-stone-200/80">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-stone-500" /> Poster Cover Video *
                        </label>
                        {selectedVideoFile && (
                          <button
                            type="button"
                            onClick={handleManualCaptureFrame}
                            disabled={isCapturingPoster}
                            className="text-[10px] font-bold text-amber-700 hover:underline cursor-pointer disabled:opacity-50"
                          >
                            {isCapturingPoster ? "Mengambil Frame..." : "⚡ Ambil Frame Video"}
                          </button>
                        )}
                      </div>

                      <div className="relative border border-stone-200 rounded-xl p-3 bg-stone-50/80 flex items-center gap-3">
                        {imagePreview ? (
                          <>
                            <img
                              src={imagePreview}
                              alt="Poster preview"
                              className="w-16 h-16 object-cover rounded-lg border border-stone-200 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-stone-900 truncate">
                                Poster Cover Terpasang
                              </p>
                              <p className="text-[10px] text-stone-500">
                                Dimuat cepat pada galeri showcase sebelum video berputar.
                              </p>
                              <label className="text-[10px] font-bold text-amber-700 hover:underline cursor-pointer mt-1 inline-block">
                                Ganti Gambar Custom
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageChange}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </>
                        ) : (
                          <div className="w-full text-center py-2">
                            <label className="text-xs font-bold text-amber-700 hover:underline cursor-pointer inline-flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5" /> Pilih Gambar Poster Cover
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                              />
                            </label>
                            <p className="text-[10px] text-stone-400 mt-0.5">
                              Atau otomatis diambil dari frame video / thumbnail YouTube
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {/* ── TAB 2: TEAR-SHEET KREDIT & AUTOCOMPLETE TAGGING ── */}
          {activeTab === "tearsheet" && (
            <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-8 space-y-6">
              
              {/* Informational Guidance Banner */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <Layers className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-stone-900">Tagging Kolaborator Ekosistem RAMU</h4>
                    <p className="text-stone-500 text-[11px] mt-0.5">
                      Ketik nama rekan kolaborator di bawah (misal: <em>&quot;gilang&quot;</em> atau <em>&quot;atelier&quot;</em>). Sistem akan merekomendasikan profil akun yang terdaftar untuk dikaitkan langsung.
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-stone-200 text-[10px] font-mono text-stone-600 shrink-0">
                  <span>{credits.length} KREDIT TERSEMAT</span>
                </div>
              </div>

              {/* Split Workspace: Preview + Collaborator Manager */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left (5 cols): Preview Foto Karya */}
                <div className="lg:col-span-5 space-y-3">
                  <span className="block font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                    PREVIEW KARYA
                  </span>

                  <div className="border border-stone-200/90 rounded-2xl p-3 bg-[#F7F6F3] min-h-[260px] flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <div className="relative inline-flex items-center justify-center max-w-full max-h-[320px]">
                        <img
                          src={imagePreview}
                          alt="Cover canvas"
                          className="max-h-[320px] max-w-full object-contain rounded-xl shadow-xs"
                        />
                      </div>
                    ) : (
                      <div className="p-8 text-center space-y-2">
                        {mediaType === "VIDEO" ? (
                          <Film className="w-8 h-8 text-stone-400 mx-auto" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-stone-400 mx-auto" />
                        )}
                        <p className="text-xs font-bold text-stone-600">
                          {mediaType === "VIDEO" ? "Video atau Poster belum dipilih" : "Foto belum dipilih"}
                        </p>
                        <p className="text-[11px] text-stone-400 max-w-xs leading-relaxed">
                          Silakan kembali ke Tab 1 (Info Karya) dan lengkapi media karya terlebih dahulu.
                        </p>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Setiap kolaborator yang Anda tambahkan akan ditampilkan di samping karya pada galeri Showcase lengkap dengan tautan langsung ke profil mereka.
                  </p>
                </div>

                {/* Right (7 cols): Tagging Kolaborator Form with Live Autocomplete */}
                <div className="lg:col-span-7 space-y-4">
                  
                  {/* Add Collaborator Form with Autocomplete */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="block text-[11px] font-bold text-stone-800 uppercase tracking-wider">
                        + Tag Tim Kolaborator
                      </span>
                      {selectedActorId && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Terhubung ke Profil RAMU
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-xs">
                      {/* Peran Dropdown */}
                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                          Peran Kolaborasi
                        </label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value as HotspotCategory)}
                          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none"
                        >
                          {CATEGORY_ROLES.map((r) => (
                            <option key={r.category} value={r.category}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Name input with Live Mention Autocomplete */}
                      <div className="relative">
                        <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                          <span>Nama Kreator / Brand</span>
                          <span className="text-[9px] text-amber-700 font-semibold normal-case">
                            Ketik nama untuk mencari akun di RAMU
                          </span>
                        </label>

                        <div className="relative">
                          <input
                            ref={searchInputRef}
                            type="text"
                            value={newName}
                            onChange={(e) => {
                              setNewName(e.target.value);
                              setSelectedActorId(null);
                              setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            placeholder="Ketik misal 'gilang' atau 'studio'..."
                            className="w-full pl-8 pr-8 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                          />
                          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          
                          {newName && (
                            <button
                              type="button"
                              onClick={handleClearSelectedActor}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* ── AUTOCOMPLETE FLOATING DROPDOWN ── */}
                        {showSuggestions && newName.trim().length >= 1 && (
                          <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden p-1.5 space-y-1 max-h-56 overflow-y-auto animate-fade-in">
                            <div className="px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-wider text-stone-400 flex items-center justify-between">
                              <span>Akun Terdaftar di RAMU</span>
                              <span>{filteredActors.length} Hasil</span>
                            </div>

                            {filteredActors.length > 0 ? (
                              filteredActors.map((actor) => (
                                <button
                                  key={actor.id}
                                  type="button"
                                  onClick={() => handleSelectActor(actor)}
                                  className="w-full text-left p-2 rounded-xl hover:bg-amber-50/70 border border-transparent hover:border-amber-200 flex items-center justify-between gap-2.5 transition-all group"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-[10px] font-bold text-black shrink-0">
                                      {actor.name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-stone-900 text-xs truncate group-hover:text-amber-950">
                                          {actor.name}
                                        </span>
                                        <span className="text-[10px] font-mono text-stone-400">
                                          @{actor.name.toLowerCase().replace(/[\s&.]+/g, "_")}
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-stone-500 truncate">
                                        {actor.sector} {actor.location ? `• ${actor.location}` : ""}
                                      </p>
                                    </div>
                                  </div>

                                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-stone-100 group-hover:bg-amber-100 text-stone-700 group-hover:text-amber-900 font-mono font-bold shrink-0">
                                    PILIH ↵
                                  </span>
                                </button>
                              ))
                            ) : (
                              <div className="p-2 text-center text-[11px] text-stone-400">
                                Tidak ada akun yang cocok di RAMU.
                              </div>
                            )}

                            {/* Option to use manual free text */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedActorId(null);
                                if (!newHandle) {
                                  setNewHandle(`@${newName.toLowerCase().replace(/[\s&.]+/g, "_")}`);
                                }
                                setShowSuggestions(false);
                              }}
                              className="w-full text-left p-2 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-100 text-[11px] text-stone-700 flex items-center justify-between"
                            >
                              <span>➕ Gunakan sebagai kolaborator manual: <strong>&ldquo;{newName}&rdquo;</strong></span>
                              <span className="text-[9px] font-mono text-stone-400">Enter</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Handle & Details Inputs */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                            Handle Instagram / Profil
                          </label>
                          <input
                            type="text"
                            value={newHandle}
                            onChange={(e) => setNewHandle(e.target.value)}
                            placeholder="@handle"
                            className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-mono font-medium text-stone-800 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                            Detail Karya / Busana / Gear
                          </label>
                          <input
                            type="text"
                            value={newDetails}
                            onChange={(e) => setNewDetails(e.target.value)}
                            placeholder="misal: Silk Drape Blazer / Sony A7IV"
                            className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddCredit()}
                        className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5 text-amber-400" />
                        <span>Sematkan ke Daftar Tim</span>
                      </button>
                    </div>
                  </div>

                  {/* Collaborators List */}
                  <div className="space-y-2">
                    <span className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                      Daftar Tim Tersemat ({credits.length})
                    </span>

                    <div className="max-h-[160px] overflow-y-auto space-y-1.5 pr-1">
                      {credits.map((c) => {
                        const Icon = CATEGORY_ROLES.find((r) => r.category === c.category)?.icon || Sparkles;
                        return (
                          <div
                            key={c.id}
                            className="p-2.5 rounded-xl bg-white border border-stone-200 flex items-center justify-between gap-2 text-xs hover:border-stone-300 transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6 h-6 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600 shrink-0">
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-stone-900 truncate">
                                    {c.name}
                                  </span>
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
                                  {c.role} • {c.details}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveCredit(c.id)}
                              className="text-stone-400 hover:text-rose-500 p-1 shrink-0 transition-colors"
                              title="Hapus kredit"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Technical Specs (Optional) */}
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

          {/* ── FOOTER ACTIONS ── */}
          <div className="h-16 shrink-0 px-6 bg-white border-t border-stone-200/80 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors"
            >
              Batal
            </button>

            <div className="flex items-center gap-2.5">
              {activeTab === "basics" ? (
                <button
                  type="button"
                  onClick={() => setActiveTab("tearsheet")}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <span>Atur Kredit Tim (Tear-Sheet)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab("basics")}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all"
                >
                  ← Kembali ke Info Karya
                </button>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="px-6 py-2.5 rounded-xl bg-[#1E1B2E] hover:bg-black text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-70 active:scale-95"
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
  ) : null;

  return (
    <div className="space-y-8">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1E1B2E]">Manajemen Portofolio &amp; Karya</h2>
          <p className="text-sm text-stone-500 mt-1">
            Unggah dan kurasi karya visual terbaik Anda lengkap dengan kredit kolaborasi Tear-Sheet.
          </p>
        </div>
        <button
          onClick={() => {
            setIsModalOpen(true);
            setActiveTab("basics");
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E1B2E] text-white text-xs font-bold hover:bg-black transition-all shadow-md shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Unggah Karya Baru</span>
        </button>
      </div>

      {/* Masonry Grid of Portfolios */}
      {assets.length === 0 ? (
        <div className="p-10 rounded-[32px] bg-white/50 border border-stone-200 border-dashed flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400">
            <ImageIcon className="w-8 h-8" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-base font-extrabold text-[#1E1B2E]">Belum Ada Karya</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Tarik perhatian klien dan kolaborator dengan memamerkan mahakarya Anda. Tambahkan foto dan sematkan kredit tim sekarang.
            </p>
          </div>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="break-inside-avoid relative group rounded-2xl overflow-hidden bg-white border border-stone-200/70 shadow-xs hover:shadow-xl transition-all duration-500"
            >
              {/* Image Thumbnail */}
              <div className="relative w-full aspect-[4/5] bg-stone-100">
                {asset.attributes?.image_url ? (
                  <img
                    src={asset.attributes.image_url}
                    alt={asset.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400">
                    <ImageIcon className="w-8 h-8 opacity-50" />
                  </div>
                )}

                {/* Top Badge: Tear-Sheet Status */}
                <div className="absolute top-3 left-3 z-10">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-stone-200 text-[10px] font-mono font-bold text-stone-800 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>TEAR-SHEET AKTIF</span>
                  </div>
                </div>

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between">
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDelete(asset.id)}
                      disabled={isPending}
                      className="p-2 rounded-xl bg-white/20 hover:bg-rose-500/90 text-white backdrop-blur-md transition-colors shadow-sm"
                      title="Hapus Karya"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1 text-white">
                    <div className="inline-flex px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                      {asset.subtype}
                    </div>
                    <h3 className="font-extrabold text-sm line-clamp-2 text-white">{asset.name}</h3>
                    {asset.attributes?.project_url && (
                      <a
                        href={asset.attributes.project_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-amber-300 font-semibold hover:text-amber-200"
                      >
                        Lihat Proyek <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Render Modal via Portal */}
      {modalNode && createPortal(modalNode, document.body)}
    </div>
  );
}
