"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ShowcaseItem } from "@/application/showcaseService";
import { getTearSheetData, formatInstagramCredits } from "./tearSheetUtils";
import { HotspotCategory } from "./tearSheetTypes";
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
  Info
} from "lucide-react";

interface TearSheetModalProps {
  item: ShowcaseItem | null;
  items: ShowcaseItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
  onBookAuthor?: () => void;
}

const CATEGORY_ICONS: Record<HotspotCategory, React.ElementType> = {
  photography: Camera,
  wardrobe: Shirt,
  hmua: Sparkles,
  talent: User,
  art_direction: Palette
};

const CATEGORY_COLORS: Record<
  HotspotCategory,
  { border: string; bg: string; text: string; badgeBg: string; activeRing: string }
> = {
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
  }
};

export function TearSheetModal({
  item,
  items,
  currentIndex,
  isOpen,
  onClose,
  onSelectIndex,
  onBookAuthor
}: TearSheetModalProps) {
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

  const handleCopyCredits = async () => {
    const text = formatInstagramCredits(item, tearSheetData);
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

  const realActorId = item.actor.id.split("-copy-")[0];

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
        <div className="h-16 shrink-0 px-4 sm:px-6 bg-white border-b border-stone-200/80 flex items-center justify-between gap-4">
          
          {/* Issue Branding */}
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black tracking-[0.2em] uppercase text-stone-900">
                RAMU TEAR-SHEET
              </span>
              <span className="text-stone-300 hidden sm:inline">•</span>
              <span className="text-xs font-semibold text-stone-500 hidden sm:inline">
                {tearSheetData.issueNumber} ({tearSheetData.edition})
              </span>
            </div>
          </div>

          {/* Center Navigation & Anti-Catfishing Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setShowGuaranteeModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 text-xs font-semibold text-emerald-950 shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Klik untuk melihat Sertifikat Keaslian & Jaminan Anti-Catfishing"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-mono text-[10px] font-black uppercase tracking-wider hidden sm:inline">
                ANTI-CATFISHING
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse hidden sm:inline" />
              <span className="text-[11px] font-bold text-emerald-800">
                {tearSheetData.verificationRate}
              </span>
            </button>

            {/* Gallery Index Navigation */}
            <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-full px-2 py-1 shadow-2xs">
              <button
                type="button"
                onClick={handlePrev}
                title="Karya Sebelumnya (Panah Kiri)"
                className="w-6 h-6 rounded-full hover:bg-stone-200/80 flex items-center justify-center text-stone-600 hover:text-stone-950 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-[11px] px-1.5 font-bold text-stone-600">
                {String(currentIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={handleNext}
                title="Karya Selanjutnya (Panah Kanan)"
                className="w-6 h-6 rounded-full hover:bg-stone-200/80 flex items-center justify-center text-stone-600 hover:text-stone-950 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            title="Tutup (Esc)"
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200/80 border border-stone-200 flex items-center justify-center text-stone-600 hover:text-stone-950 transition-all hover:scale-105 active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── MAIN WORKSPACE: SPLIT STAGE (IMAGE VIEWPORT + EDITORIAL TEAR-SHEET) ── */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
          
          {/* ── LEFT: INTERACTIVE PHOTO VIEWPORT ── */}
          <div className="flex-1 min-h-0 relative bg-[#F7F6F3] border-b lg:border-b-0 lg:border-r border-stone-200/80 flex items-center justify-center overflow-hidden p-4 sm:p-6 select-none">
            
            {/* Navigation Arrows (Hover on Desktop) */}
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/90 hover:bg-white border border-stone-200/90 shadow-md backdrop-blur-md flex items-center justify-center text-stone-700 hover:text-stone-950 transition-all hover:scale-110 active:scale-95 hidden md:flex"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/90 hover:bg-white border border-stone-200/90 shadow-md backdrop-blur-md flex items-center justify-center text-stone-700 hover:text-stone-950 transition-all hover:scale-110 active:scale-95 hidden md:flex"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Image Canvas Container (Clean Photo) */}
            <div className="relative inline-flex items-center justify-center max-w-full max-h-full">
              {!imgLoaded && (
                <div className="w-[380px] h-[520px] max-w-full bg-stone-200/70 rounded-2xl animate-pulse flex items-center justify-center">
                  <span className="font-mono text-xs text-stone-500 tracking-wider">
                    MEMUAT RESOLUSI TINGGI...
                  </span>
                </div>
              )}

              <img
                src={item.imageUrl}
                alt={item.title}
                onLoad={() => setImgLoaded(true)}
                className={`max-w-full max-h-[calc(90vh-140px)] object-contain rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-stone-200/60 transition-opacity duration-500 ${
                  imgLoaded ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>
          </div>

          {/* ── RIGHT: CLEAN WHITE EDITORIAL TEAR-SHEET SIDEBAR ── */}
          <div className="w-full lg:w-[420px] xl:w-[460px] shrink-0 bg-white flex flex-col h-full min-h-0 overflow-hidden">
            
            {/* Scrollable Content Container */}
            <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-6">
              
              {/* ── EDITORIAL HEADER SECTION ── */}
              <div className="space-y-2 border-b border-stone-100 pb-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] tracking-[0.25em] text-amber-800 uppercase font-black">
                    [ EDITORIAL DOSSIER ]
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-[10px] font-mono font-bold text-stone-700">
                    {item.category}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight leading-snug">
                  {tearSheetData.title}
                </h2>

                <div className="flex items-center gap-2 text-xs text-stone-500 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{item.actor.location || "Indonesia"}</span>
                  <span className="text-stone-300">•</span>
                  <span>{item.actor.sector}</span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed pt-2">
                  {tearSheetData.concept}
                </p>

                {/* Anti-Catfishing Certificate Code Box */}
                <div
                  onClick={() => setShowGuaranteeModal(true)}
                  className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-amber-500/5 to-transparent border border-emerald-300/80 flex items-center justify-between gap-3 cursor-pointer hover:border-emerald-400 transition-all shadow-2xs group/cert"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover/cert:scale-105 transition-transform">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="block font-mono text-[9px] uppercase font-bold text-emerald-900 tracking-wider">
                        ANTI-CATFISHING CERTIFIED
                      </span>
                      <span className="block font-mono text-xs font-black text-stone-900 truncate">
                        #{tearSheetData.antiCatfishingCertificateId}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-emerald-300 text-[10px] font-bold text-emerald-900 shrink-0 shadow-2xs group-hover/cert:bg-emerald-600 group-hover/cert:text-white transition-colors">
                    Lihat Bukti ↗
                  </span>
                </div>
              </div>

              {/* ── LEAD CREATOR CARD ── */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.actor.avatarBg} flex items-center justify-center text-sm font-extrabold text-black shrink-0 shadow-xs`}
                  >
                    {item.actor.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-bold text-stone-900 truncate">
                        {item.actor.name}
                      </h3>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 font-mono font-black border border-amber-200">
                        LEAD
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 truncate">
                      {item.actor.sector} • {item.actor.experienceLevel || "Profesional"}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/directory/${realActorId}`}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 shadow-2xs hover:scale-105 active:scale-95"
                >
                  <span>Profil</span>
                  <ExternalLink className="w-3 h-3 text-stone-500" />
                </Link>
              </div>

              {/* ── COLLABORATIVE CREDITS ROSTER (PEER-VERIFIED) ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-mono font-black text-stone-800 uppercase tracking-widest">
                      KREDIT KONTRIBUTOR ({tearSheetData.credits.length})
                    </h3>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span className="text-[10px] text-emerald-700 font-mono font-bold">
                    PEER-VERIFIED
                  </span>
                </div>

                <div className="space-y-2">
                  {tearSheetData.credits.map((credit, idx) => {
                    const Icon = CATEGORY_ICONS[credit.category] || Sparkles;
                    const profileHref = credit.actorId
                      ? `/directory/${credit.actorId}`
                      : `/directory?q=${encodeURIComponent(credit.name)}`;

                    return (
                      <Link
                        key={idx}
                        href={profileHref}
                        className="group/credit block p-3 rounded-2xl border border-stone-200/70 bg-white hover:bg-emerald-50/40 hover:border-emerald-300 hover:shadow-xs transition-all duration-200"
                        title={`Buka profil ${credit.name} (${credit.role})`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-stone-100 group-hover/credit:bg-emerald-600 group-hover/credit:text-white flex items-center justify-center text-stone-600 shrink-0 mt-0.5 transition-colors">
                              <Icon className="w-3.5 h-3.5" />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="block text-[10px] font-mono uppercase font-black tracking-wider text-stone-500 group-hover/credit:text-emerald-800">
                                  {credit.role}
                                </span>
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-900 text-[8px] font-mono font-extrabold">
                                  <Check className="w-2.5 h-2.5 text-emerald-700" />
                                  <span>VERIFIED</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-xs font-bold text-stone-900 group-hover/credit:text-emerald-950 truncate">
                                  {credit.name}
                                </span>
                                <span className="text-[11px] font-mono text-stone-400">
                                  {credit.handle}
                                </span>
                              </div>
                              <p className="text-[11px] text-stone-600 mt-0.5 line-clamp-1">
                                {credit.details}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-xl bg-stone-50 group-hover/credit:bg-white border border-stone-200 text-stone-700 text-[10px] font-bold transition-all shadow-2xs group-hover/credit:scale-105">
                            <span>Profil</span>
                            <ExternalLink className="w-3 h-3 text-stone-400 group-hover/credit:text-emerald-700" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* ── INTERACTIVE CO-CREDIT VERIFICATION / CLAIM TRIGGER ── */}
              <div className="space-y-2">
                {claimSuccessMessage && (
                  <div className="p-3 rounded-2xl bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{claimSuccessMessage}</span>
                  </div>
                )}

                {userClaimedRole ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-emerald-950">Kontribusi Anda Terverifikasi</span>
                          <span className="text-[8px] px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-900 font-mono font-black">
                            PEER-VERIFIED
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-800 truncate">
                          Peran: <strong>{userClaimedRole}</strong> • Tercatat di Sertifikat RAMU
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRevokeClaim}
                      className="text-[10px] font-bold text-stone-400 hover:text-stone-700 underline shrink-0 cursor-pointer"
                    >
                      Ubah
                    </button>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                        <h4 className="text-xs font-bold text-stone-900">
                          Apakah Anda Terlibat di Proyek Ini?
                        </h4>
                      </div>
                      <span className="text-[9px] font-mono font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Co-Credit
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-600 leading-snug">
                      Verifikasi kehadiran Anda di set untuk melindungi hak cipta, mencegah penghapusan kredit (credit erasure), dan memastikan portofolio ini bebas catfishing.
                    </p>

                    {!isClaiming ? (
                      <button
                        type="button"
                        onClick={() => setIsClaiming(true)}
                        className="w-full py-2 px-3 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-900 text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01] active:scale-98"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verifikasi Kontribusi Saya di Proyek Ini</span>
                      </button>
                    ) : (
                      <div className="space-y-2 pt-2 border-t border-stone-200">
                        <label className="block text-[10px] font-bold text-stone-700 uppercase">
                          Pilih Peran Kontribusi Anda:
                        </label>
                        <select
                          value={claimedRoleInput}
                          onChange={(e) => setClaimedRoleInput(e.target.value)}
                          className="w-full text-xs p-2 rounded-xl bg-white border border-stone-300 text-stone-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        >
                          <option value="Fotografi / Asisten Lighting">Fotografi / Asisten Lighting</option>
                          <option value="Fashion Stylist / Wardrobe Designer">Fashion Stylist / Wardrobe Designer</option>
                          <option value="Hair & Makeup Artist (HMUA)">Hair & Makeup Artist (HMUA)</option>
                          <option value="Model / Talent">Model / Talent</option>
                          <option value="Art Director / Set Designer">Art Director / Set Designer</option>
                          <option value="Studio / Location Provider">Studio / Location Provider</option>
                        </select>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleConfirmClaim(claimedRoleInput)}
                            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Konfirmasi &amp; Verifikasi</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsClaiming(false)}
                            className="py-2 px-3 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-medium cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── ANTI-CATFISHING ZERO-FRAUD GUARANTEE CARD ── */}
              <div className="p-4 rounded-2xl bg-[#1E1B2E] text-white space-y-3 shadow-md border border-stone-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-white">
                        Jaminan Anti-Catfishing RAMU
                      </h4>
                      <span className="text-[10px] text-stone-400 font-mono">
                        Perlindungan Klien &amp; Hak Cipta Kreator
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[9px] font-black">
                    TERVERIFIKASI
                  </span>
                </div>

                <div className="space-y-2 text-[11px] text-stone-300 border-t border-stone-800 pt-2.5">
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong>Verifikasi Multi-Pihak:</strong> Seluruh kru (Fotografer, MUA, Stylist, Model) saling mengonfirmasi kehadiran di set.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong>Bebas Portofolio Curian:</strong> Klien aman dari risiko booking talenta yang mencuri foto dari Pinterest / akun luar negeri.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong>Anti-Credit Erasure:</strong> Menghentikan kebiasaan posting karya komersial tanpa mencantumkan kredit kru.</span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-[10px] text-stone-400 border-t border-stone-800/80">
                  <span>KUHPerdata 1320 &amp; UU Hak Cipta 28/2014</span>
                  <button
                    type="button"
                    onClick={() => setShowGuaranteeModal(true)}
                    className="text-amber-400 hover:text-amber-300 underline font-bold cursor-pointer"
                  >
                    Detail Sertifikat ↗
                  </button>
                </div>
              </div>

              {/* ── TECHNICAL CAMERA & RIG BLUEPRINT ── */}
              {tearSheetData.technicalSpecs && (
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-amber-600" />
                    <h4 className="font-mono text-[10px] uppercase tracking-widest font-black text-stone-800">
                      TECHNICAL RIG &amp; CAMERA BLUEPRINT
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-white border border-stone-200/80 shadow-2xs">
                      <span className="block text-[9px] font-mono text-stone-500 uppercase font-bold">KAMERA</span>
                      <span className="font-bold text-stone-900 truncate block">
                        {tearSheetData.technicalSpecs.camera}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-stone-200/80 shadow-2xs">
                      <span className="block text-[9px] font-mono text-stone-500 uppercase font-bold">LENSA</span>
                      <span className="font-bold text-stone-900 truncate block">
                        {tearSheetData.technicalSpecs.lens}
                      </span>
                    </div>
                    <div className="col-span-2 p-2.5 rounded-xl bg-white border border-stone-200/80 shadow-2xs">
                      <span className="block text-[9px] font-mono text-stone-500 uppercase font-bold">LIGHTING MODIFIER</span>
                      <span className="font-semibold text-stone-900 truncate block">
                        {tearSheetData.technicalSpecs.lighting}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── AESTHETIC TAGS ── */}
              <div className="space-y-1.5">
                <span className="font-mono text-[10px] text-stone-500 uppercase tracking-widest font-black block">
                  TAGS &amp; ESTETIKA
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {tearSheetData.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 text-[10px] font-semibold text-stone-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* ── FIXED ACTION FOOTER (COPY CREDITS + WHATSAPP SHARE + COLLAB CTA) ── */}
            <div className="p-4 sm:p-5 bg-white border-t border-stone-200/80 space-y-2 shrink-0">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* 1-Click Copy Tear-Sheet to Instagram/Press */}
                <button
                  type="button"
                  onClick={handleCopyCredits}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer ${
                    copied
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs"
                      : "bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-800"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Kredit Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-amber-600" />
                      <span>Salin Kredit (IG)</span>
                    </>
                  )}
                </button>

                {/* WhatsApp Share Proof of Authenticity */}
                <button
                  type="button"
                  onClick={() =>
                    handleShareWhatsApp(
                      tearSheetData.antiCatfishingCertificateId,
                      tearSheetData.title,
                      tearSheetData.edition
                    )
                  }
                  className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 text-emerald-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer hover:scale-[1.01] active:scale-98"
                >
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <span>Kirim Bukti (WA)</span>
                </button>
              </div>

              {/* Primary Collab CTA or Direct Booking */}
              {onBookAuthor ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onBookAuthor();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[#1E1B2E] hover:bg-black text-white font-extrabold text-xs transition-all shadow-md hover:scale-[1.01] active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Ajukan Booking Jasa ke {item.actor.name}</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              ) : (
                <Link
                  href={`/projects/new?title=${encodeURIComponent(
                    `Kolaborasi Sinergis: ${item.title}`
                  )}&category=${encodeURIComponent(item.category)}`}
                  className="w-full py-3 px-4 rounded-xl bg-[#1E1B2E] hover:bg-black text-white font-extrabold text-xs transition-all shadow-md hover:scale-[1.01] active:scale-98 flex items-center justify-center gap-2"
                >
                  <span>Ajak Tim Ini Berkolaborasi</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </Link>
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
