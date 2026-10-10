"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShowcaseItem } from "@/application/showcaseService";
import { getTearSheetData, formatInstagramCredits } from "./tearSheetUtils";
import { HotspotCategory } from "./tearSheetTypes";
import { confirmCoCredit, rejectCoCredit, claimCoCreditAction } from "@/app/api/assets/actions";
import { parseVideoUrl } from "@/lib/videoUtils";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Copy,
  Check,
  Camera,
  Shirt,
  Sparkles,
  User,
  Palette,
  MapPin,
  Trophy,
  ExternalLink,
  Sliders,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Shield,
  UserCheck,
  Share2,
  Info,
  Clock,
  Loader2,
  Play,
  Film,
  Video,
  Volume2
} from "lucide-react";

interface TearSheetModalProps {
  item: ShowcaseItem | null;
  items: ShowcaseItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
  onBookAuthor?: () => void;
  currentActorId?: string;
}

const CATEGORY_ICONS: Record<HotspotCategory, React.ElementType> = {
  cinematography: Video,
  photography: Camera,
  wardrobe: Shirt,
  hmua: Sparkles,
  talent: User,
  art_direction: Palette,
  sound: Volume2
};

const CATEGORY_COLORS: Record<
  HotspotCategory,
  { border: string; bg: string; text: string; badgeBg: string; activeRing: string }
> = {
  cinematography: {
    border: "border-purple-300",
    bg: "bg-purple-500",
    text: "text-purple-700",
    badgeBg: "bg-purple-50 text-purple-800 border-purple-200",
    activeRing: "ring-2 ring-purple-400/40"
  },
  photography: {
    border: "border-emerald-300",
    bg: "bg-emerald-500",
    text: "text-emerald-700",
    badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
    activeRing: "ring-2 ring-emerald-400/40"
  },
  wardrobe: {
    border: "border-indigo-300",
    bg: "bg-indigo-500",
    text: "text-indigo-700",
    badgeBg: "bg-indigo-50 text-indigo-800 border-indigo-200",
    activeRing: "ring-2 ring-indigo-400/40"
  },
  hmua: {
    border: "border-rose-300",
    bg: "bg-rose-500",
    text: "text-rose-700",
    badgeBg: "bg-rose-50 text-rose-800 border-rose-200",
    activeRing: "ring-2 ring-rose-400/40"
  },
  talent: {
    border: "border-amber-300",
    bg: "bg-amber-500",
    text: "text-amber-800",
    badgeBg: "bg-amber-50 text-amber-900 border-amber-200",
    activeRing: "ring-2 ring-amber-400/40"
  },
  art_direction: {
    border: "border-sky-300",
    bg: "bg-sky-500",
    text: "text-sky-700",
    badgeBg: "bg-sky-50 text-sky-800 border-sky-200",
    activeRing: "ring-2 ring-sky-400/40"
  },
  sound: {
    border: "border-cyan-300",
    bg: "bg-cyan-500",
    text: "text-cyan-700",
    badgeBg: "bg-cyan-50 text-cyan-800 border-cyan-200",
    activeRing: "ring-2 ring-cyan-400/40"
  }
};

export function TearSheetModal({
  item,
  items,
  currentIndex,
  isOpen,
  onClose,
  onSelectIndex,
  onBookAuthor,
  currentActorId
}: TearSheetModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);
  const [activePinId, setActivePinId] = useState<string | null>(null);
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isPortraitVideoState, setIsPortraitVideoState] = useState(false);
  const creditRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [userClaimedRole, setUserClaimedRole] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimedRoleInput, setClaimedRoleInput] = useState("Fashion Stylist / Wardrobe Stylist");
  const [customRoleInput, setCustomRoleInput] = useState("");
  const [claimDetailsInput, setClaimDetailsInput] = useState("");
  const [isClaimSubmitting, setIsClaimSubmitting] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccessMessage, setClaimSuccessMessage] = useState<string | null>(null);
  const [showGuaranteeModal, setShowGuaranteeModal] = useState(false);

  const [isConfirming, setIsConfirming] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "rejected" | "info"; msg: string } | null>(null);
  const [localConfirmedActorIds, setLocalConfirmedActorIds] = useState<string[]>([]);

  const isVideo = item?.mediaType === "VIDEO" || !!item?.videoUrl;
  const parsedVideo = isVideo && item?.videoUrl ? parseVideoUrl(item.videoUrl) : null;

  const isVerticalVideo = Boolean(
    isVideo && (
      item?.aspectRatio === "9:16" ||
      item?.videoUrl?.includes("shorts/") ||
      item?.videoUrl?.includes("tiktok.com") ||
      item?.category?.toLowerCase().includes("reel") ||
      item?.category?.toLowerCase().includes("tiktok") ||
      item?.category?.toLowerCase().includes("vertikal") ||
      isPortraitVideoState
    )
  );

  const isPortraitImage = Boolean(
    item && !isVideo && (
      item.aspectRatio === "4:5" ||
      item.aspectRatio === "3:4" ||
      item.aspectRatio === "9:16" ||
      item.category?.toLowerCase().includes("lookbook") ||
      item.category?.toLowerCase().includes("busana") ||
      item.category?.toLowerCase().includes("fashion") ||
      item.category?.toLowerCase().includes("styling") ||
      item.category?.toLowerCase().includes("potret")
    )
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setImgLoaded(false);
    setIsPortraitVideoState(false);
    setActivePinId(null);
    setHoveredPinId(null);
    setIsClaiming(false);
    setClaimSuccessMessage(null);
    setClaimError(null);
    setActionFeedback(null);
    if (item?.id && typeof window !== "undefined") {
      const saved = localStorage.getItem(`ramu_verified_role_${item.id}`);
      setUserClaimedRole(saved);
    }
  }, [item?.id]);

  const handleConfirmClaim = async () => {
    if (!item?.id) return;
    const finalRole = claimedRoleInput === "LAINNYA" ? customRoleInput.trim() : claimedRoleInput;
    if (!finalRole) {
      setClaimError("Silakan tentukan nama peran Anda.");
      return;
    }
    setIsClaimSubmitting(true);
    setClaimError(null);
    try {
      const res = await claimCoCreditAction({
        assetId: item.id,
        role: finalRole,
        details: claimDetailsInput.trim() || undefined,
      });
      if (res.success) {
        setUserClaimedRole(finalRole);
        setIsClaiming(false);
        setClaimSuccessMessage(`Klaim peran "${finalRole}" berhasil diajukan! Menunggu persetujuan pemilik karya.`);
        router.refresh();
        setTimeout(() => setClaimSuccessMessage(null), 5000);
      } else {
        setClaimError(res.error || "Gagal mengajukan klaim kredit.");
      }
    } catch (err: any) {
      setClaimError(err?.message || "Terjadi kesalahan saat mengajukan klaim.");
    } finally {
      setIsClaimSubmitting(false);
    }
  };

  const handleRevokeClaim = () => {
    if (!item?.id) return;
    localStorage.removeItem(`ramu_verified_role_${item.id}`);
    setUserClaimedRole(null);
    setIsClaiming(false);
  };

  const handleShareWhatsApp = (certId: string, title: string, edition: string) => {
    const showcaseUrl = typeof window !== "undefined" ? window.location.origin : "https://ramu-gamma.vercel.app";
    const text = `*SERTIFIKAT KEASLIAN PORTOFOLIO & PEER-VERIFIED CO-CREDIT (RAMU)*\n\nKarya: "${title}"\nEdisi: ${edition}\nID Sertifikat: #${certId}\nStatus: Anti-Catfishing Certified (5/5 Kru Terverifikasi Silang)\n\nSeluruh tim produksi (Fotografer, MUA, Stylist, Model, Studio) telah memvalidasi keterlibatan masing-masing di set produksi RAMU Ecosystem untuk menjamin karya orisinal 100% tanpa materi catfishing/curian.\n\nLihat rincian lengkap & profil kru: ${showcaseUrl}/showcase`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        if (currentIndex > 0) onSelectIndex(currentIndex - 1);
        else onSelectIndex(items.length - 1);
      } else if (e.key === "ArrowRight") {
        if (currentIndex < items.length - 1) onSelectIndex(currentIndex + 1);
        else onSelectIndex(0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, currentIndex, items.length, onClose, onSelectIndex]);

  if (!isOpen || !item || !mounted) return null;

  const tearSheetData = getTearSheetData(item);

  const realActorId = item.actor.id.split("-copy-")[0];
  const isOwner = Boolean(
    currentActorId &&
    (realActorId === currentActorId || item.actor.id === currentActorId)
  );

  const activeCredits = tearSheetData.credits.map((c) => {
    const isLocallyConfirmed = c.actorId && localConfirmedActorIds.includes(c.actorId);
    if (isLocallyConfirmed) {
      return {
        ...c,
        verified: true,
        status: "VERIFIED" as const,
        verifiedBy: "Dikonfirmasi Langsung oleh Anda",
      };
    }
    if (
      userClaimedRole &&
      (c.role.toLowerCase().includes(userClaimedRole.toLowerCase()) ||
        userClaimedRole.toLowerCase().includes(c.role.toLowerCase()))
    ) {
      return {
        ...c,
        verified: true,
        status: "VERIFIED" as const,
        verifiedBy: "Dikonfirmasi Langsung oleh Anda",
      };
    }
    return c;
  });

  const myCredit = activeCredits.find((c) => c.actorId === currentActorId);
  const isCoCreditor = Boolean(myCredit);
  const isPendingCoCredit = isCoCreditor && (!myCredit?.verified || myCredit?.status === "PENDING") && !localConfirmedActorIds.includes(currentActorId || "");
  const isVerifiedCoCredit = isCoCreditor && (myCredit?.verified || localConfirmedActorIds.includes(currentActorId || ""));

  const pendingCredits = activeCredits.filter((c) => (!c.verified || c.status === "PENDING") && !localConfirmedActorIds.includes(c.actorId || ""));
  const verifiedCount = activeCredits.filter((c) => c.verified).length;
  const totalCount = activeCredits.length;
  const isFullyVerified = verifiedCount === totalCount && totalCount > 0;
  const currentVerificationRate = isFullyVerified
    ? `100% (${verifiedCount}/${totalCount} Kru Terverifikasi)`
    : `${verifiedCount}/${totalCount} Kru Terkonfirmasi (Verifikasi Parsial)`;

  const handleConfirmMyCredit = async () => {
    if (!item?.id || !currentActorId) return;
    setIsConfirming(true);
    try {
      const res = await confirmCoCredit(item.id);
      if (res.success) {
        setLocalConfirmedActorIds((prev) => [...prev, currentActorId]);
        setActionFeedback({
          type: "success",
          msg: `Keterlibatan Anda pada "${item.title}" berhasil diverifikasi dan resmi tersinkronisasi ke profil portofolio Anda!`,
        });
        router.refresh();
        setTimeout(() => setActionFeedback(null), 4000);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleRejectMyCredit = async () => {
    if (!item?.id || !currentActorId) return;
    if (!confirm(`Apakah Anda yakin ingin menolak penyematan kredit pada "${item.title}"? Nama Anda akan dihapus dari penyematan karya ini.`)) return;
    setIsConfirming(true);
    try {
      const res = await rejectCoCredit(item.id);
      if (res.success) {
        setActionFeedback({
          type: "rejected",
          msg: `Penyematan kredit telah ditolak.`,
        });
        router.refresh();
        setTimeout(() => setActionFeedback(null), 3000);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleSendCrewReminderWA = () => {
    const pendingNames = pendingCredits.map((c) => c.name).join(", ");
    const showcaseUrl = typeof window !== "undefined" ? window.location.origin : "https://ramu-gamma.vercel.app";
    const text = `Halo tim kreatif (${pendingNames})! Portofolio karya kolaborasi kita "${tearSheetData.title}" sudah tayang di RAMU. Yuk luangkan 10 detik untuk konfirmasi kreditmu di sini agar sertifikat anti-catfishing kita 100% aktif & karyanya otomatis tersambung ke profilmu: ${showcaseUrl}/showcase`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleSharePitchWA = () => {
    const showcaseUrl = typeof window !== "undefined" ? window.location.origin : "https://ramu-gamma.vercel.app";
    const text = `Halo, berikut adalah portofolio kurasi visual resmi kami di RAMU: "${tearSheetData.title}" (${item.category}). Diproduksi secara sinergis dengan seluruh tim terverifikasi (bebas catfishing). Cek detail konsep dan spesifikasi produksi: ${showcaseUrl}/showcase`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleCopyCredits = async () => {
    const dynamicData = {
      ...tearSheetData,
      credits: activeCredits,
      verificationRate: currentVerificationRate,
    };
    const text = formatInstagramCredits(item, dynamicData);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }
  };

  const handlePinSelect = (pinId: string) => {
    setActivePinId(activePinId === pinId ? null : pinId);
    if (creditRefs.current[pinId]) {
      creditRefs.current[pinId]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) onSelectIndex(currentIndex - 1);
    else onSelectIndex(items.length - 1);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < items.length - 1) onSelectIndex(currentIndex + 1);
    else onSelectIndex(0);
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-slate-950/50 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-6xl h-full md:h-[90vh] max-h-[880px] bg-white border border-slate-200/90 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.16)] flex flex-col overflow-hidden text-slate-900"
      >

        <div className="h-14 shrink-0 px-4 sm:px-6 bg-white border-b border-slate-100 flex items-center justify-between gap-4">

          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-slate-900" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-extrabold tracking-[0.18em] uppercase text-slate-900">
                RAMU DOSSIER &bull; LOOKBOOK EDITORIAL
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                {tearSheetData.issueNumber} ({tearSheetData.edition})
              </span>
              {isVideo ? (
                <span className="px-2 py-0.5 rounded-full btn-primary-pill text-white font-mono text-[9px] font-bold tracking-wider uppercase hidden sm:inline-flex items-center gap-1 shadow-xs">
                  <Play className="w-2.5 h-2.5 fill-current" /> {isVerticalVideo ? "REEL VERTIKAL 9:16" : "CINEMA FILM 16:9"}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[9px] font-bold tracking-wider uppercase hidden sm:inline-flex items-center gap-1 border border-slate-200">
                  <Camera className="w-2.5 h-2.5 text-slate-500" />
                  {isPortraitImage
                    ? "LOOKBOOK PORTRET 4:5"
                    : item.aspectRatio === "1:1"
                    ? "PERSEGI 1:1"
                    : "LANSKAP EDITORIAL"}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setShowGuaranteeModal(true)}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200/90 hover:border-slate-400 bg-slate-50/70 hover:bg-slate-100 text-slate-700 text-xs transition-all cursor-pointer shadow-2xs"
              title="Klik untuk membuka Sertifikat Keaslian & Anti-Catfishing"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isFullyVerified ? "bg-emerald-500" : "bg-amber-500"}`} />
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 hidden sm:inline">
                {isFullyVerified ? "VERIFIKASI PENUH" : "VERIFIKASI KRU"}
              </span>
              <span className="text-[11px] font-bold text-slate-900">
                {isFullyVerified ? "100% Terverifikasi" : `${verifiedCount}/${totalCount} Terkonfirmasi`}
              </span>
              <span className="text-slate-400 text-[10px]">↗</span>
            </button>

            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/80 rounded-full px-2 py-0.5 shadow-2xs">
              <button
                type="button"
                onClick={handlePrev}
                title="Karya Sebelumnya (Panah Kiri)"
                className="w-5 h-5 rounded-full hover:bg-slate-200/80 flex items-center justify-center text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[10px] px-1 font-bold text-slate-600">
                {String(currentIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={handleNext}
                title="Karya Selanjutnya (Panah Kanan)"
                className="w-5 h-5 rounded-full hover:bg-slate-200/80 flex items-center justify-center text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            title="Tutup (Esc)"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-950 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">

          <div className="flex-1 min-h-0 relative bg-[#0D0D0C] lg:bg-slate-50/50 border-b lg:border-b-0 lg:border-r border-slate-100 flex items-center justify-center overflow-hidden p-3 sm:p-6 md:p-8 select-none">

            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 hover:bg-white border border-slate-200/90 shadow-md backdrop-blur-md flex items-center justify-center text-slate-700 hover:text-slate-950 transition-all hover:scale-110 active:scale-95 hidden md:flex cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 hover:bg-white border border-slate-200/90 shadow-md backdrop-blur-md flex items-center justify-center text-slate-700 hover:text-slate-950 transition-all hover:scale-110 active:scale-95 hidden md:flex cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {isVideo && parsedVideo ? (
              <div className="relative w-full max-w-4xl max-h-[calc(90vh-140px)] flex items-center justify-center p-2 z-10">
                {parsedVideo.embedUrl ? (
                  <div
                    className={`relative w-full overflow-hidden rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.4)] border border-slate-800 bg-black ${
                      isVerticalVideo ? "max-w-[360px] aspect-[9/16] ring-1 ring-white/10" : "aspect-video"
                    }`}
                  >
                    <iframe
                      src={parsedVideo.embedUrl}
                      title={item.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>
                ) : (
                  <div className="relative w-full max-w-4xl flex items-center justify-center">
                    <video
                      src={parsedVideo.directUrl || item.videoUrl!}
                      poster={item.imageUrl}
                      controls
                      playsInline
                      autoPlay
                      onLoadedMetadata={(e) => {
                        const v = e.currentTarget;
                        if (v.videoHeight > v.videoWidth * 1.2) {
                          setIsPortraitVideoState(true);
                        }
                      }}
                      className={`max-w-full max-h-[calc(90vh-140px)] rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.4)] border border-slate-800/80 bg-black object-contain ${
                        isVerticalVideo ? "max-w-[360px] aspect-[9/16] ring-1 ring-white/10" : ""
                      }`}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="relative inline-flex items-center justify-center max-w-full max-h-full">
                {/* Ambient Blurred Backdrop for Photos */}
                {item.imageUrl && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
                    <img
                      src={item.imageUrl}
                      alt=""
                      aria-hidden="true"
                      className="w-full h-full object-cover scale-125 filter blur-3xl opacity-25 brightness-95 transform-gpu"
                    />
                  </div>
                )}

                {!imgLoaded && (
                  <div className="w-[380px] h-[520px] max-w-full bg-slate-200/60 rounded-2xl animate-pulse flex items-center justify-center z-10">
                    <span className="font-mono text-xs text-slate-400 tracking-wider">
                      MEMUAT RESOLUSI TINGGI...
                    </span>
                  </div>
                )}

                <img
                  src={item.imageUrl}
                  alt={item.title}
                  onLoad={() => setImgLoaded(true)}
                  className={`max-w-full max-h-[calc(90vh-140px)] object-contain rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-slate-200/60 relative z-10 transition-opacity duration-500 ${
                    imgLoaded ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
            )}
          </div>

          <div className="w-full lg:w-[420px] xl:w-[460px] shrink-0 bg-white flex flex-col h-full min-h-0 overflow-hidden">

            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar scrollbar-none p-6 sm:p-7 space-y-6">

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono tracking-[0.2em] text-slate-400 uppercase">
                  <span>{item.category}</span>
                  <span>{item.actor.location || "Indonesia"}</span>
                </div>

                <h2 className="text-2xl sm:text-[26px] font-extrabold text-slate-950 tracking-tight leading-[1.25] font-serif pt-0.5">
                  {tearSheetData.title}
                </h2>

                <div className="flex items-center justify-between gap-3 pt-2 pb-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-full bg-gradient-to-br ${item.actor.avatarBg} flex items-center justify-center text-xs font-bold text-black shrink-0 shadow-2xs`}
                    >
                      {item.actor.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Link
                          href={`/directory/${realActorId}`}
                          className="text-xs font-bold text-slate-900 hover:text-[#0284c7] transition-colors truncate block"
                        >
                          {item.actor.name}
                        </Link>
                        {isOwner && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-sky-50 text-[#0284c7] font-mono font-bold border border-sky-200">
                            KARYA ANDA
                          </span>
                        )}
                        {isCoCreditor && !isOwner && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-900 font-mono font-black border border-emerald-300">
                            KOLABORASI ANDA
                          </span>
                        )}
                        {item.collaborationId && (
                          <Link
                            href={`/collaborations/${item.collaborationId}`}
                            className="text-[9px] px-2 py-0.5 rounded-md bg-sky-50 text-[#0284c7] font-bold border border-sky-200 hover:bg-sky-100 transition-colors flex items-center gap-1 shrink-0"
                            title="Buka Ruang Kerja & SPK Kolaborasi Resmi"
                          >
                            <Trophy className="w-2.5 h-2.5 text-[#0284c7] inline" />
                            <span>Karya Kolaborasi RAMU</span>
                          </Link>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono block truncate">
                        {item.actor.sector}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowGuaranteeModal(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-900 text-[10px] font-mono font-bold transition-all cursor-pointer shrink-0"
                    title="Buka sertifikat resmi anti-catfishing"
                  >
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Anti-Catfish</span>
                    <span className="text-emerald-700">↗</span>
                  </button>
                </div>

                <p className="text-[13px] text-slate-600 leading-relaxed font-sans pt-1">
                  {tearSheetData.concept}
                </p>
              </div>

              {actionFeedback && (
                <div
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 animate-fade-in ${
                    actionFeedback.type === "success"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                      : "bg-rose-50 border-rose-300 text-rose-950"
                  }`}
                >
                  {actionFeedback.type === "success" ? (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{actionFeedback.msg}</span>
                </div>
              )}

              {isOwner && pendingCredits.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200/90 text-amber-950 text-xs flex items-center justify-between gap-3 animate-fade-in">
                  <div className="flex items-center gap-2 min-w-0">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">
                      <strong>{pendingCredits.length} rekan tim</strong> belum konfirmasi
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendCrewReminderWA}
                    className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] shrink-0 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                    title="Kirim pengingat konfirmasi ke WhatsApp rekan tim"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>Ingatkan (WA)</span>
                  </button>
                </div>
              )}

              {isCoCreditor && isPendingCoCredit && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white border border-amber-300/80 text-xs text-slate-900 space-y-2.5 animate-fade-in shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span className="font-bold">
                        {myCredit?.claimedByActorId === currentActorId
                          ? "Pengajuan Klaim Co-Credit Terkirim"
                          : "Permintaan Verifikasi Co-Credit"}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                      {myCredit?.claimedByActorId === currentActorId
                        ? "Menunggu Persetujuan Pemilik"
                        : "Menunggu Konfirmasi Anda"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {myCredit?.claimedByActorId === currentActorId
                      ? `Anda telah mengajukan klaim peran sebagai ${myCredit?.role}. Pemilik portofolio akan meninjau dan memvalidasi kontribusi Anda.`
                      : `Kreator menyematkan Anda sebagai ${myCredit?.role}. Konfirmasi sekarang untuk mengaktifkan sertifikat anti-catfishing dan menyinkronkan karya ini ke portofolio profil Anda.`}
                  </p>

                  {myCredit?.claimedByActorId !== currentActorId && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleConfirmMyCredit}
                        disabled={isConfirming}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isConfirming ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        <span>Konfirmasi Keterlibatan</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRejectMyCredit}
                        disabled={isConfirming}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
                      >
                        <span>Tolak</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {isCoCreditor && isVerifiedCoCredit && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center justify-between gap-2 animate-fade-in">
                  <div className="flex items-center gap-2 min-w-0">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">
                      Anda terverifikasi sebagai <strong>{myCredit?.role}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 shrink-0">
                    Tersinkron di Profil
                  </span>
                </div>
              )}

              <div className="space-y-2 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between pb-1">
                  <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-slate-400 uppercase">
                    PRODUCTION CREDITS
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {verifiedCount}/{totalCount} CONFIRMED
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {activeCredits.map((credit, idx) => {
                    const profileHref = credit.actorId
                      ? `/directory/${credit.actorId}`
                      : `/directory?q=${encodeURIComponent(credit.name)}`;

                    const isThisUser = currentActorId && credit.actorId === currentActorId;

                    return (
                      <Link
                        key={idx}
                        href={profileHref}
                        className={`group py-2.5 flex items-center justify-between gap-3 text-xs -mx-2 px-2 rounded-lg transition-colors ${
                          isThisUser ? "bg-amber-50/60 hover:bg-amber-100/60" : "hover:bg-slate-50/80"
                        }`}
                        title={`Buka profil ${credit.name} (${credit.role})`}
                      >

                        <div className="w-[42%] shrink-0 min-w-0">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 group-hover:text-slate-700 truncate block">
                            {credit.role}
                          </span>
                        </div>

                        <div className="w-[58%] flex items-center justify-end gap-2 min-w-0">
                          <div className="text-right min-w-0">
                            <span className="font-medium text-slate-900 group-hover:text-slate-950 truncate block">
                              {credit.name} {isThisUser && <span className="text-amber-800 font-bold">(Anda)</span>}
                            </span>
                            {credit.handle && (
                              <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-500 block truncate">
                                {credit.handle}
                              </span>
                            )}
                          </div>

                          {credit.isUploader ? (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"
                              title="Pemilik Portofolio (Uploader)"
                            />
                          ) : credit.verified ? (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"
                              title="Terverifikasi Bersama"
                            />
                          ) : credit.status === "EXTERNAL" ? (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"
                              title="Kredit Eksternal"
                            />
                          ) : (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0"
                              title="Menunggu Konfirmasi Rekan"
                            />
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {!isOwner && !isCoCreditor && (
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  {claimSuccessMessage && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{claimSuccessMessage}</span>
                    </div>
                  )}

                  {userClaimedRole ? (
                    <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-emerald-900">
                      <div className="flex items-center gap-2 min-w-0">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">Peran Anda: <strong>{userClaimedRole}</strong> (Pending Verifikasi)</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRevokeClaim}
                        className="text-[10px] text-slate-400 hover:text-slate-700 underline shrink-0 cursor-pointer ml-2"
                      >
                        Reset
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-slate-500 py-1">
                      <span>Terlibat dalam produksi karya ini?</span>
                      {currentActorId ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsClaiming(!isClaiming);
                            setClaimError(null);
                          }}
                          className="font-bold text-[#0284c7] hover:text-[#0369a1] underline text-xs cursor-pointer inline-flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-[#0284c7]" />
                          <span>{isClaiming ? "Tutup Form" : "Klaim Kredit Kru ↗"}</span>
                        </button>
                      ) : (
                        <Link
                          href="/login"
                          className="font-bold text-[#0284c7] hover:text-[#0369a1] underline text-xs"
                        >
                          Masuk untuk Klaim ↗
                        </Link>
                      )}
                    </div>
                  )}

                  {isClaiming && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3 animate-fade-in text-xs shadow-inner">
                      <div>
                        <label className="block text-[10px] font-mono uppercase font-bold text-slate-700 mb-1">
                          Pilih Peran Anda di Tim Produksi:
                        </label>
                        <select
                          value={claimedRoleInput}
                          onChange={(e) => setClaimedRoleInput(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0284c7]/30 focus:border-[#0284c7] font-medium"
                        >
                          <option value="Fotografi / Asisten Lighting">Fotografi / Asisten Lighting</option>
                          <option value="Fashion Stylist / Wardrobe Stylist">Fashion Stylist / Wardrobe Stylist</option>
                          <option value="Hair & Makeup Artist (HMUA)">Hair & Makeup Artist (HMUA)</option>
                          <option value="Model / Talent">Model / Talent</option>
                          <option value="Art Director / Set Designer">Art Director / Set Designer</option>
                          <option value="Videografer / Colorist">Videografer / Colorist</option>
                          <option value="Studio / Location Provider">Studio / Location Provider</option>
                          <option value="LAINNYA">Peran Lainnya (Kustom)...</option>
                        </select>
                      </div>

                      {claimedRoleInput === "LAINNYA" && (
                        <div>
                          <label className="block text-[10px] font-mono uppercase font-bold text-slate-700 mb-1">
                            Tuliskan Nama Peran Anda:
                          </label>
                          <input
                            type="text"
                            value={customRoleInput}
                            onChange={(e) => setCustomRoleInput(e.target.value)}
                            placeholder="Contoh: Digital Imaging Specialist, Gaffer..."
                            className="w-full text-xs p-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0284c7]/30 focus:border-[#0284c7] font-medium"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] font-mono uppercase font-bold text-slate-700 mb-1">
                          Catatan Kontribusi / Bukti Terlibat (Opsional):
                        </label>
                        <textarea
                          value={claimDetailsInput}
                          onChange={(e) => setClaimDetailsInput(e.target.value)}
                          placeholder="Jelaskan secara singkat peran atau kapabilitas Anda dalam produksi bersama ini..."
                          rows={2}
                          className="w-full text-xs p-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0284c7]/30 focus:border-[#0284c7] font-medium resize-none"
                        />
                      </div>

                      {claimError && (
                        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                          {claimError}
                        </div>
                      )}

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleConfirmClaim}
                          disabled={isClaimSubmitting}
                          className="flex-1 py-2.5 px-3 rounded-xl btn-primary-pill text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm shadow-[#4CC9FE]/20"
                        >
                          {isClaimSubmitting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-white" />
                          )}
                          <span>{isClaimSubmitting ? "Mengirim..." : "Kirim Pengajuan Klaim"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsClaiming(false);
                            setClaimError(null);
                          }}
                          className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tearSheetData.technicalSpecs && (
                <div className="pt-4 border-t border-slate-100 text-[10px] font-mono text-slate-500 space-y-1.5">
                  <span className="font-bold uppercase tracking-wider text-slate-400 block">
                    PRODUCTION GEAR
                  </span>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-700">
                    <span>{tearSheetData.technicalSpecs.camera}</span>
                    <span className="text-slate-300">•</span>
                    <span>{tearSheetData.technicalSpecs.lens}</span>
                    <span className="text-slate-300">•</span>
                    <span>{tearSheetData.technicalSpecs.lighting}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-1.5 pt-2">
                {tearSheetData.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-mono text-slate-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>RAMU PROTOCOL • UU NO. 28/2014</span>
                <button
                  type="button"
                  onClick={() => setShowGuaranteeModal(true)}
                  className="hover:text-slate-700 underline cursor-pointer"
                >
                  Jaminan Anti-Catfishing ↗
                </button>
              </div>

            </div>

            <div className="p-4 sm:p-5 bg-white border-t border-slate-100 flex items-center gap-2.5 shrink-0">

              {isOwner ? (
                <>
                  <button
                    type="button"
                    onClick={handleCopyCredits}
                    className={`h-11 px-3.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                      copied
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                    title="Salin Format Kredit untuk Caption Instagram"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span className="hidden sm:inline">{copied ? "Tersalin" : "Salin IG"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSharePitchWA}
                    className="h-11 px-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                    title="Kirim presentasi portofolio ke Klien via WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Kirim Pitch</span>
                  </button>

                  <Link
                    href="/dashboard/showcase"
                    className="flex-1 h-11 px-4 rounded-xl btn-primary-pill text-white font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#4CC9FE]/25 active:scale-98"
                  >
                    <Sliders className="w-3.5 h-3.5 text-white" />
                    <span>Kelola Portofolio</span>
                  </Link>
                </>
              ) : isCoCreditor && isPendingCoCredit ? (

                <>
                  <button
                    type="button"
                    disabled={isConfirming}
                    onClick={handleRejectMyCredit}
                    className="h-11 px-3.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 border border-slate-200 text-slate-600 text-xs font-semibold transition-all flex items-center justify-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
                    title="Tolak penyematan kredit jika Anda tidak terlibat"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Bukan Saya</span>
                  </button>

                  <button
                    type="button"
                    disabled={isConfirming}
                    onClick={handleConfirmMyCredit}
                    className="flex-1 h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:scale-[1.01] active:scale-98 disabled:opacity-50"
                  >
                    {isConfirming ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>Konfirmasi Keterlibatan Saya</span>
                  </button>
                </>
              ) : isCoCreditor && isVerifiedCoCredit ? (

                <>
                  <button
                    type="button"
                    onClick={handleCopyCredits}
                    className={`h-11 px-3.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                      copied
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                    title="Salin Format Kredit untuk Caption Instagram"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span className="hidden sm:inline">{copied ? "Tersalin" : "Salin IG"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleShareWhatsApp(
                        tearSheetData.antiCatfishingCertificateId,
                        tearSheetData.title,
                        tearSheetData.edition
                      )
                    }
                    className="h-11 px-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                    title="Bagikan Bukti Sertifikat via WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Bukti WA</span>
                  </button>

                  <Link
                    href={`/directory/${currentActorId}`}
                    className="flex-1 h-11 px-4 rounded-xl btn-primary-pill text-white font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#4CC9FE]/25 active:scale-98"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-white" />
                    <span>Lihat di Profil Saya</span>
                  </Link>
                </>
              ) : (

                <>
                  <button
                    type="button"
                    onClick={handleCopyCredits}
                    className={`h-11 px-3.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                      copied
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                    title="Salin Format Kredit untuk Caption Instagram"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span className="hidden sm:inline">{copied ? "Tersalin" : "Salin IG"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleShareWhatsApp(
                        tearSheetData.antiCatfishingCertificateId,
                        tearSheetData.title,
                        tearSheetData.edition
                      )
                    }
                    className="h-11 px-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                    title="Bagikan Bukti Sertifikat via WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Bukti WA</span>
                  </button>

                  {onBookAuthor ? (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onBookAuthor();
                      }}
                      className="flex-1 h-11 px-4 rounded-xl btn-primary-pill text-white font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#4CC9FE]/25 active:scale-98"
                    >
                      <span>Ajak Tim Ini Berkolaborasi</span>
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </button>
                  ) : (
                    <Link
                      href={`/projects/new?title=${encodeURIComponent(
                        `Kolaborasi Sinergis: ${item.title}`
                      )}&category=${encodeURIComponent(item.category)}`}
                      className="flex-1 h-11 px-4 rounded-xl btn-primary-pill text-white font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 shadow-md shadow-[#4CC9FE]/25 active:scale-98"
                    >
                      <span>Ajak Tim Ini Berkolaborasi</span>
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </Link>
                  )}
                </>
              )}

            </div>

          </div>

        </div>

        {showGuaranteeModal && (
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
            onClick={(e) => {
              e.stopPropagation();
              setShowGuaranteeModal(false);
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-slate-900 space-y-5 animate-scale-up"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900 tracking-tight">
                      SERTIFIKAT KEASLIAN PORTOFOLIO
                    </h3>
                    <p className="text-[11px] font-mono text-emerald-800 font-bold">
                      Anti-Catfishing &bull; Peer-Verified Co-Credit
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGuaranteeModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase font-bold text-slate-500">
                    ID SERTIFIKAT RAMU
                  </span>
                  <span className="font-mono text-xs font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    #{tearSheetData.antiCatfishingCertificateId}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase font-bold text-slate-500">
                    JUDUL KARYA
                  </span>
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[200px]">
                    {tearSheetData.title}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase font-bold text-slate-500">
                    STATUS VERIFIKASI
                  </span>
                  <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    {tearSheetData.verificationRate}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[11px] font-mono font-black text-slate-700 uppercase">
                  Daftar Kru Produksi Terverifikasi Bersama:
                </h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {tearSheetData.credits.map((c, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-900">{c.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono ml-1.5">
                            ({c.role})
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                        CONFIRMED
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-950 space-y-1">
                <p className="font-bold">Atribusi &amp; Catatan Hak Cipta Komunitas:</p>
                <p className="text-[10px] leading-relaxed text-amber-900">
                  Catatan verifikasi rekan (Peer-Verification) mencatat kontribusi masing-masing talenta dalam sesi produksi ini untuk menjamin transparansi atribusi karya dan mencegah klaim portofolio sepihak.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleShareWhatsApp(
                      tearSheetData.antiCatfishingCertificateId,
                      tearSheetData.title,
                      tearSheetData.edition
                    )
                  }
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Bagikan Bukti ke WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowGuaranteeModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-all cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
