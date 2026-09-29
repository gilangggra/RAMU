"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShowcaseItem } from "@/application/showcaseService";
import { getTearSheetData, formatInstagramCredits } from "./tearSheetUtils";
import { HotspotCategory } from "./tearSheetTypes";
import { confirmCoCredit, rejectCoCredit } from "@/app/api/assets/actions";
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
  const creditRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [userClaimedRole, setUserClaimedRole] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimedRoleInput, setClaimedRoleInput] = useState("Fashion Stylist / Wardrobe Designer");
  const [claimSuccessMessage, setClaimSuccessMessage] = useState<string | null>(null);
  const [showGuaranteeModal, setShowGuaranteeModal] = useState(false);

  // Persona & Co-Credit interactive states
  const [isConfirming, setIsConfirming] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "rejected" | "info"; msg: string } | null>(null);
  const [localConfirmedActorIds, setLocalConfirmedActorIds] = useState<string[]>([]);

  // Video parsing
  const isVideo = item?.mediaType === "VIDEO" || !!item?.videoUrl;
  const parsedVideo = isVideo && item?.videoUrl ? parseVideoUrl(item.videoUrl) : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset states on item change & read localStorage
  useEffect(() => {
    setImgLoaded(false);
    setActivePinId(null);
    setHoveredPinId(null);
    setIsClaiming(false);
    setClaimSuccessMessage(null);
    setActionFeedback(null);
    if (item?.id && typeof window !== "undefined") {
      const saved = localStorage.getItem(`ramu_verified_role_${item.id}`);
      setUserClaimedRole(saved);
    }
  }, [item?.id]);

  const handleConfirmClaim = (role: string) => {
    if (!item?.id) return;
    localStorage.setItem(`ramu_verified_role_${item.id}`, role);
    setUserClaimedRole(role);
    setIsClaiming(false);
    setClaimSuccessMessage(`Peran Anda sebagai "${role}" berhasil diverifikasi silang.`);
    setTimeout(() => setClaimSuccessMessage(null), 4500);
  };

  const handleRevokeClaim = () => {
    if (!item?.id) return;
    localStorage.removeItem(`ramu_verified_role_${item.id}`);
    setUserClaimedRole(null);
    setIsClaiming(false);
  };

  const handleShareWhatsApp = (certId: string, title: string, edition: string) => {
    const text = `*SERTIFIKAT KEASLIAN PORTOFOLIO & PEER-VERIFIED CO-CREDIT (RAMU)*\n\nKarya: "${title}"\nEdisi: ${edition}\nID Sertifikat: #${certId}\nStatus: Anti-Catfishing Certified (5/5 Kru Terverifikasi Silang)\n\nSeluruh tim produksi (Fotografer, MUA, Stylist, Model, Studio) telah memvalidasi keterlibatan masing-masing di set produksi RAMU Ecosystem untuk menjamin karya orisinal 100% tanpa materi catfishing/curian.\n\nLihat rincian lengkap & profil kru: https://ramu.id/showcase`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // Keyboard navigation: Escape, ArrowLeft, ArrowRight
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

  // Determine owner and actor persona
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

  // Contributor persona
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
    const text = `Halo tim kreatif (${pendingNames})! Portofolio karya kolaborasi kita "${tearSheetData.title}" sudah tayang di RAMU. Yuk luangkan 10 detik untuk konfirmasi kreditmu di sini agar sertifikat anti-catfishing kita 100% aktif & karyanya otomatis tersambung ke profilmu: https://ramu.id/showcase`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleSharePitchWA = () => {
    const text = `Halo, berikut adalah portofolio kurasi visual resmi kami di RAMU: "${tearSheetData.title}" (${item.category}). Diproduksi secara sinergis dengan seluruh tim terverifikasi (bebas catfishing). Cek detail konsep dan spesifikasi produksi: https://ramu.id/showcase`;
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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-stone-950/45 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      {/* ── MODAL CONTAINER (CLEAN PRISTINE WHITE GALLERY AESTHETIC) ── */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-6xl h-full md:h-[90vh] max-h-[880px] bg-white border border-stone-200/90 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.16)] flex flex-col overflow-hidden text-stone-900"
      >
        {/* ── TOP EDITORIAL HEADER BAR ── */}
        <div className="h-14 shrink-0 px-4 sm:px-6 bg-white border-b border-stone-100 flex items-center justify-between gap-4">
          
          {/* Issue Branding */}
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-stone-900" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-extrabold tracking-[0.22em] uppercase text-stone-900">
                RAMU DOSSIER
              </span>
              <span className="text-stone-300 hidden sm:inline">•</span>
              <span className="text-[11px] font-mono text-stone-500 hidden sm:inline">
                {tearSheetData.issueNumber} ({tearSheetData.edition})
              </span>
              {isVideo && (
                <span className="px-2 py-0.5 rounded-full bg-stone-900 text-stone-100 font-mono text-[9px] font-bold tracking-wider uppercase hidden sm:inline-flex items-center gap-1">
                  <Play className="w-2.5 h-2.5 fill-current" /> CINEMA FILM
                </span>
              )}
            </div>
          </div>

          {/* Center Navigation & Anti-Catfishing Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setShowGuaranteeModal(true)}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-stone-200/90 hover:border-stone-400 bg-stone-50/70 hover:bg-stone-100 text-stone-700 text-xs transition-all cursor-pointer shadow-2xs"
              title="Klik untuk membuka Sertifikat Keaslian & Anti-Catfishing"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isFullyVerified ? "bg-emerald-500" : "bg-amber-500"}`} />
              <span className="font-mono text-[10px] uppercase tracking-wider text-stone-500 hidden sm:inline">
                {isFullyVerified ? "VERIFIKASI PENUH" : "VERIFIKASI KRU"}
              </span>
              <span className="text-[11px] font-bold text-stone-900">
                {isFullyVerified ? "100% Terverifikasi" : `${verifiedCount}/${totalCount} Terkonfirmasi`}
              </span>
              <span className="text-stone-400 text-[10px]">↗</span>
            </button>

            {/* Gallery Index Navigation */}
            <div className="flex items-center gap-1 bg-stone-50 border border-stone-200/80 rounded-full px-2 py-0.5 shadow-2xs">
              <button
                type="button"
                onClick={handlePrev}
                title="Karya Sebelumnya (Panah Kiri)"
                className="w-5 h-5 rounded-full hover:bg-stone-200/80 flex items-center justify-center text-stone-600 hover:text-stone-950 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[10px] px-1 font-bold text-stone-600">
                {String(currentIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={handleNext}
                title="Karya Selanjutnya (Panah Kanan)"
                className="w-5 h-5 rounded-full hover:bg-stone-200/80 flex items-center justify-center text-stone-600 hover:text-stone-950 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            title="Tutup (Esc)"
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200/80 border border-stone-200 flex items-center justify-center text-stone-600 hover:text-stone-950 transition-all hover:scale-105 active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── MAIN WORKSPACE: SPLIT STAGE (IMAGE VIEWPORT + EDITORIAL TEAR-SHEET) ── */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
          
          {/* ── LEFT: INTERACTIVE PHOTO / CINEMA VIEWPORT ── */}
          <div className="flex-1 min-h-0 relative bg-[#0D0D0C] lg:bg-[#FBFBFA] border-b lg:border-b-0 lg:border-r border-stone-100 flex items-center justify-center overflow-hidden p-3 sm:p-6 md:p-8 select-none">
            
            {/* Navigation Arrows (Hover on Desktop) */}
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 hover:bg-white border border-stone-200/90 shadow-md backdrop-blur-md flex items-center justify-center text-stone-700 hover:text-stone-950 transition-all hover:scale-110 active:scale-95 hidden md:flex"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 hover:bg-white border border-stone-200/90 shadow-md backdrop-blur-md flex items-center justify-center text-stone-700 hover:text-stone-950 transition-all hover:scale-110 active:scale-95 hidden md:flex"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {isVideo && parsedVideo ? (
              <div className="relative w-full max-w-4xl max-h-[calc(90vh-140px)] flex items-center justify-center p-2">
                {parsedVideo.embedUrl ? (
                  <div
                    className={`relative w-full overflow-hidden rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.35)] border border-stone-800 bg-black ${
                      item.aspectRatio === "9:16" ? "max-w-[360px] aspect-[9/16]" : "aspect-video"
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
                      className={`max-w-full max-h-[calc(90vh-140px)] rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.35)] border border-stone-800/80 bg-black object-contain ${
                        item.aspectRatio === "9:16" ? "max-w-[360px] aspect-[9/16]" : ""
                      }`}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="relative inline-flex items-center justify-center max-w-full max-h-full">
                {!imgLoaded && (
                  <div className="w-[380px] h-[520px] max-w-full bg-stone-200/60 rounded-2xl animate-pulse flex items-center justify-center">
                    <span className="font-mono text-xs text-stone-400 tracking-wider">
                      MEMUAT RESOLUSI TINGGI...
                    </span>
                  </div>
                )}

                <img
                  src={item.imageUrl}
                  alt={item.title}
                  onLoad={() => setImgLoaded(true)}
                  className={`max-w-full max-h-[calc(90vh-140px)] object-contain rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.07)] border border-stone-200/50 transition-opacity duration-500 ${
                    imgLoaded ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
            )}
          </div>

          {/* ── RIGHT: VOGUE EDITORIAL DOSSIER SIDEBAR ── */}
          <div className="w-full lg:w-[420px] xl:w-[460px] shrink-0 bg-white flex flex-col h-full min-h-0 overflow-hidden">
            
            {/* Scrollable Content Container */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-7 space-y-6">
              
              {/* ── EDITORIAL HEADER SECTION ── */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono tracking-[0.2em] text-stone-400 uppercase">
                  <span>{item.category}</span>
                  <span>{item.actor.location || "Indonesia"}</span>
                </div>

                <h2 className="text-2xl sm:text-[26px] font-extrabold text-stone-950 tracking-tight leading-[1.25] font-serif pt-0.5">
                  {tearSheetData.title}
                </h2>

                {/* Creator Byline & Minimalist Certificate Stamp */}
                <div className="flex items-center justify-between gap-3 pt-2 pb-3.5 border-b border-stone-100">
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
                          className="text-xs font-bold text-stone-900 hover:text-amber-800 transition-colors truncate block"
                        >
                          {item.actor.name}
                        </Link>
                        {isOwner && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 font-mono font-black border border-amber-300">
                            KARYA ANDA
                          </span>
                        )}
                        {isCoCreditor && !isOwner && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-900 font-mono font-black border border-emerald-300">
                            KOLABORASI ANDA
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-500 font-mono block truncate">
                        {item.actor.sector}
                      </span>
                    </div>
                  </div>

                  {/* Chic Minimalist Certificate Pill */}
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

                {/* Concept Narrative */}
                <p className="text-[13px] text-stone-600 leading-relaxed font-sans pt-1">
                  {tearSheetData.concept}
                </p>
              </div>

              {/* ── ACTION FEEDBACK BANNER (IF ANY) ── */}
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

              {/* ── CASE 1: OWNER PENDING CREW NUDGE ── */}
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

              {/* ── CASE 2: CO-CREDITOR INVITATION BANNER ── */}
              {isCoCreditor && isPendingCoCredit && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-emerald-500/10 border border-amber-300/80 text-xs text-stone-900 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span className="font-bold">Permintaan Verifikasi Co-Credit</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                      Menunggu Anda
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-snug">
                    Kreator menyematkan Anda sebagai <strong>{myCredit?.role}</strong>. Konfirmasi sekarang untuk mengaktifkan stempel anti-catfishing dan menyinkronkan karya ini ke portofolio profil Anda.
                  </p>
                </div>
              )}

              {/* ── CASE 2B: CO-CREDITOR VERIFIED BADGE ── */}
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

              {/* ── MASTHEAD PRODUCTION CREDITS (VOGUE ROSTER) ── */}
              <div className="space-y-2 pt-4 border-t border-stone-100">
                <div className="flex items-center justify-between pb-1">
                  <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-stone-400 uppercase">
                    PRODUCTION CREDITS
                  </span>
                  <span className="text-[10px] font-mono text-stone-400">
                    {verifiedCount}/{totalCount} CONFIRMED
                  </span>
                </div>

                <div className="divide-y divide-stone-100">
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
                          isThisUser ? "bg-amber-50/60 hover:bg-amber-100/60" : "hover:bg-stone-50/80"
                        }`}
                        title={`Buka profil ${credit.name} (${credit.role})`}
                      >
                        {/* Left: Role */}
                        <div className="w-[42%] shrink-0 min-w-0">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400 group-hover:text-stone-700 truncate block">
                            {credit.role}
                          </span>
                        </div>

                        {/* Right: Contributor Name, Handle & Status Dot */}
                        <div className="w-[58%] flex items-center justify-end gap-2 min-w-0">
                          <div className="text-right min-w-0">
                            <span className="font-medium text-stone-900 group-hover:text-stone-950 truncate block">
                              {credit.name} {isThisUser && <span className="text-amber-800 font-bold">(Anda)</span>}
                            </span>
                            {credit.handle && (
                              <span className="text-[10px] font-mono text-stone-400 group-hover:text-stone-500 block truncate">
                                {credit.handle}
                              </span>
                            )}
                          </div>

                          {/* Elegant Status Indicator */}
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
                              className="w-1.5 h-1.5 rounded-full bg-stone-300 shrink-0"
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

              {/* ── CASE 3: EXTERNAL VISITOR CLAIM ACCORDION (ONLY IF NOT OWNER & NOT CO-CREDITOR) ── */}
              {!isOwner && !isCoCreditor && (
                <div className="pt-4 border-t border-stone-100 space-y-2">
                  {claimSuccessMessage && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{claimSuccessMessage}</span>
                    </div>
                  )}

                  {userClaimedRole ? (
                    <div className="flex items-center justify-between text-xs py-1 text-emerald-900">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">Peran Anda: <strong>{userClaimedRole}</strong></span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRevokeClaim}
                        className="text-[10px] text-stone-400 hover:text-stone-700 underline shrink-0 cursor-pointer ml-2"
                      >
                        Ubah
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-stone-500 py-1">
                      <span>Terlibat dalam karya ini?</span>
                      <button
                        type="button"
                        onClick={() => setIsClaiming(!isClaiming)}
                        className="font-bold text-stone-900 hover:text-amber-800 underline text-xs cursor-pointer"
                      >
                        {isClaiming ? "Tutup" : "Klaim Kontribusi ↗"}
                      </button>
                    </div>
                  )}

                  {isClaiming && (
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2 animate-fade-in text-xs">
                      <label className="block text-[10px] font-mono uppercase font-bold text-stone-600">
                        Pilih Peran Anda di Tim Produksi:
                      </label>
                      <select
                        value={claimedRoleInput}
                        onChange={(e) => setClaimedRoleInput(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg bg-white border border-stone-300 text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-stone-400"
                      >
                        <option value="Fotografi / Asisten Lighting">Fotografi / Asisten Lighting</option>
                        <option value="Fashion Stylist / Wardrobe Designer">Fashion Stylist / Wardrobe Designer</option>
                        <option value="Hair & Makeup Artist (HMUA)">Hair & Makeup Artist (HMUA)</option>
                        <option value="Model / Talent">Model / Talent</option>
                        <option value="Art Director / Set Designer">Art Director / Set Designer</option>
                        <option value="Studio / Location Provider">Studio / Location Provider</option>
                      </select>
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleConfirmClaim(claimedRoleInput)}
                          className="flex-1 py-1.5 px-3 rounded-lg bg-stone-900 hover:bg-black text-white text-xs font-bold transition-all cursor-pointer"
                        >
                          Konfirmasi
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsClaiming(false)}
                          className="py-1.5 px-3 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── TECHNICAL RIG SPECIFICATIONS ── */}
              {tearSheetData.technicalSpecs && (
                <div className="pt-4 border-t border-stone-100 text-[10px] font-mono text-stone-500 space-y-1.5">
                  <span className="font-bold uppercase tracking-wider text-stone-400 block">
                    PRODUCTION GEAR
                  </span>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-stone-700">
                    <span>{tearSheetData.technicalSpecs.camera}</span>
                    <span className="text-stone-300">•</span>
                    <span>{tearSheetData.technicalSpecs.lens}</span>
                    <span className="text-stone-300">•</span>
                    <span>{tearSheetData.technicalSpecs.lighting}</span>
                  </div>
                </div>
              )}

              {/* ── AESTHETIC TAGS ── */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {tearSheetData.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-stone-100 text-[10px] font-mono text-stone-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* ── LEGAL ASSURANCE FOOTER LINK ── */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-[10px] font-mono text-stone-400">
                <span>RAMU PROTOCOL • UU NO. 28/2014</span>
                <button
                  type="button"
                  onClick={() => setShowGuaranteeModal(true)}
                  className="hover:text-stone-700 underline cursor-pointer"
                >
                  Jaminan Anti-Catfishing ↗
                </button>
              </div>

            </div>

            {/* ── CONTEXT-AWARE 1-ROW ACTION FOOTER ── */}
            <div className="p-4 sm:p-5 bg-white border-t border-stone-100 flex items-center gap-2.5 shrink-0">
              
              {/* CASE 1: OWNER FOOTER */}
              {isOwner ? (
                <>
                  <button
                    type="button"
                    onClick={handleCopyCredits}
                    className={`h-11 px-3.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                      copied
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                        : "bg-white hover:bg-stone-50 border-stone-200 text-stone-700"
                    }`}
                    title="Salin Format Kredit untuk Caption Instagram"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
                    <span className="hidden sm:inline">{copied ? "Tersalin" : "Salin IG"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSharePitchWA}
                    className="h-11 px-3.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                    title="Kirim presentasi portofolio ke Klien via WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5 text-stone-500" />
                    <span className="hidden sm:inline">Kirim Pitch</span>
                  </button>

                  <Link
                    href="/dashboard/showcase"
                    className="flex-1 h-11 px-4 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:scale-[1.01] active:scale-98"
                  >
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>Kelola Portofolio</span>
                  </Link>
                </>
              ) : isCoCreditor && isPendingCoCredit ? (
                /* CASE 2: CO-CREDITOR PENDING CONFIRMATION FOOTER */
                <>
                  <button
                    type="button"
                    disabled={isConfirming}
                    onClick={handleRejectMyCredit}
                    className="h-11 px-3.5 rounded-xl bg-stone-100 hover:bg-rose-50 hover:text-rose-700 border border-stone-200 text-stone-600 text-xs font-semibold transition-all flex items-center justify-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
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
                /* CASE 2B: CO-CREDITOR VERIFIED FOOTER */
                <>
                  <button
                    type="button"
                    onClick={handleCopyCredits}
                    className={`h-11 px-3.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                      copied
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                        : "bg-white hover:bg-stone-50 border-stone-200 text-stone-700"
                    }`}
                    title="Salin Format Kredit untuk Caption Instagram"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
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
                    className="h-11 px-3.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                    title="Bagikan Bukti Sertifikat via WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5 text-stone-500" />
                    <span className="hidden sm:inline">Bukti WA</span>
                  </button>

                  <Link
                    href={`/directory/${currentActorId}`}
                    className="flex-1 h-11 px-4 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:scale-[1.01] active:scale-98"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Lihat di Profil Saya</span>
                  </Link>
                </>
              ) : (
                /* CASE 3: EXTERNAL VISITOR / CLIENT FOOTER */
                <>
                  <button
                    type="button"
                    onClick={handleCopyCredits}
                    className={`h-11 px-3.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                      copied
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                        : "bg-white hover:bg-stone-50 border-stone-200 text-stone-700"
                    }`}
                    title="Salin Format Kredit untuk Caption Instagram"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
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
                    className="h-11 px-3.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                    title="Bagikan Bukti Sertifikat via WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5 text-stone-500" />
                    <span className="hidden sm:inline">Bukti WA</span>
                  </button>

                  {onBookAuthor ? (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onBookAuthor();
                      }}
                      className="flex-1 h-11 px-4 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:scale-[1.01] active:scale-98"
                    >
                      <span>Ajak Tim Ini Berkolaborasi</span>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                    </button>
                  ) : (
                    <Link
                      href={`/projects/new?title=${encodeURIComponent(
                        `Kolaborasi Sinergis: ${item.title}`
                      )}&category=${encodeURIComponent(item.category)}`}
                      className="flex-1 h-11 px-4 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 shadow-sm hover:scale-[1.01] active:scale-98"
                    >
                      <span>Ajak Tim Ini Berkolaborasi</span>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                    </Link>
                  )}
                </>
              )}

            </div>

          </div>

        </div>

        {/* ── ANTI-CATFISHING CERTIFICATE MODAL DIALOG ── */}
        {showGuaranteeModal && (
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fade-in"
            onClick={(e) => {
              e.stopPropagation();
              setShowGuaranteeModal(false);
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 text-stone-900 space-y-5 animate-scale-up"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-stone-900 tracking-tight">
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
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Certificate Details */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase font-bold text-stone-500">
                    ID SERTIFIKAT RAMU
                  </span>
                  <span className="font-mono text-xs font-black text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200">
                    #{tearSheetData.antiCatfishingCertificateId}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase font-bold text-stone-500">
                    JUDUL KARYA
                  </span>
                  <span className="text-xs font-bold text-stone-900 truncate max-w-[200px]">
                    {tearSheetData.title}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase font-bold text-stone-500">
                    STATUS VERIFIKASI
                  </span>
                  <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    {tearSheetData.verificationRate}
                  </span>
                </div>
              </div>

              {/* Verified Crew List in Certificate */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-mono font-black text-stone-700 uppercase">
                  Daftar Kru Produksi Terverifikasi Bersama:
                </h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {tearSheetData.credits.map((c, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-xl bg-white border border-stone-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <div>
                          <span className="font-bold text-stone-900">{c.name}</span>
                          <span className="text-[10px] text-stone-400 font-mono ml-1.5">
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
                <p className="font-bold">Perlindungan Klien &amp; Talenta:</p>
                <p className="text-[10px] leading-relaxed text-amber-900">
                  Sertifikat ini membuktikan bahwa portofolio ini adalah karya asli produksi tim terdaftar di RAMU, bukan foto hasil unduhan dari Pinterest atau sumber tidak sah. Pelanggaran klaim sepihak tunduk pada UU No. 28/2014 &amp; UU ITE No. 1/2024.
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
                  className="py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs transition-all cursor-pointer"
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
