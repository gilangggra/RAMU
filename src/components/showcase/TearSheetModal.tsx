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
  ArrowRight
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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset states on item change
  useEffect(() => {
    setImgLoaded(false);
    setActivePinId(null);
    setHoveredPinId(null);
  }, [item?.id]);

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
              <span className="text-stone-300">•</span>
              <span className="text-xs font-semibold text-stone-500 hidden sm:inline">
                {tearSheetData.issueNumber} ({tearSheetData.edition})
              </span>
            </div>
          </div>

          {/* Center Navigation & Counter */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Tim Kolaborator Terverifikasi</span>
            </div>

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
          
          {/* ── LEFT: INTERACTIVE PHOTO HOTSPOT VIEWPORT ── */}
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

            {/* Image Canvas Container (Clean Photo, No Pins) */}
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

              {/* ── COLLABORATIVE CREDITS ROSTER (CLICK TO PROFILE) ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-black text-stone-800 uppercase tracking-widest">
                    KREDIT KONTRIBUTOR ({tearSheetData.credits.length})
                  </h3>
                  <span className="text-[10px] text-amber-700 font-mono font-bold">
                    KLIK UNTUK KE PROFIL
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
                        className="group/credit block p-3 rounded-2xl border border-stone-200/70 bg-white hover:bg-amber-50/50 hover:border-amber-300 hover:shadow-xs transition-all duration-200"
                        title={`Buka profil ${credit.name} (${credit.role})`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-stone-100 group-hover/credit:bg-amber-500 group-hover/credit:text-white flex items-center justify-center text-stone-600 shrink-0 mt-0.5 transition-colors">
                              <Icon className="w-3.5 h-3.5" />
                            </div>

                            <div className="min-w-0">
                              <span className="block text-[10px] font-mono uppercase font-black tracking-wider text-stone-500 group-hover/credit:text-amber-800">
                                {credit.role}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-xs font-bold text-stone-900 group-hover/credit:text-amber-950 truncate">
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
                            <ExternalLink className="w-3 h-3 text-stone-400 group-hover/credit:text-amber-700" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
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

            {/* ── FIXED ACTION FOOTER (COPY CREDITS + COLLAB CTA) ── */}
            <div className="p-4 sm:p-5 bg-white border-t border-stone-200/80 space-y-2.5 shrink-0">
              
              {/* 1-Click Copy Tear-Sheet to Instagram/Press */}
              <button
                type="button"
                onClick={handleCopyCredits}
                className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 active:scale-98 ${
                  copied
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs"
                    : "bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-800"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Kredit Editorial Tersalin ke Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-amber-600" />
                    <span>Salin Format Kredit (Instagram / Press)</span>
                  </>
                )}
              </button>

              {/* Primary Collab CTA or Direct Booking */}
              {onBookAuthor ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onBookAuthor();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[#1E1B2E] hover:bg-black text-white font-extrabold text-xs transition-all shadow-md hover:scale-[1.01] active:scale-98 flex items-center justify-center gap-2"
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

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
