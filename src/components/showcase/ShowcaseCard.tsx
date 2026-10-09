"use client";

import React, { useState, useRef, useMemo } from "react";
import { ShowcaseItem } from "@/application/showcaseService";
import {
  Play,
  Sparkles,
  ArrowUpRight,
  Image as ImageIcon,
  Users,
  Camera,
  Smartphone,
  Maximize2,
  Trophy,
} from "lucide-react";
import { ActorAvatar } from "@/components/ui/ActorAvatar";

interface ShowcaseCardProps {
  item: ShowcaseItem;
  onOpenTearSheet?: (item: ShowcaseItem) => void;
  layoutMode?: "masonry" | "grid";
}

export function ShowcaseCard({
  item,
  onOpenTearSheet,
  layoutMode = "masonry"
}: ShowcaseCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [naturalAspect, setNaturalAspect] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const isVideo = item.mediaType === "VIDEO" || !!item.videoUrl;
  const isDirectVideo =
    isVideo &&
    item.videoUrl &&
    (/\.(mp4|webm|mov)(\?.*)?$/i.test(item.videoUrl) ||
      item.videoUrl.startsWith("/uploads/portfolios/videos/"));

  // Check category or URL hints
  const categoryLower = item.category?.toLowerCase() || "";
  const titleLower = item.title?.toLowerCase() || "";
  const videoUrlLower = item.videoUrl?.toLowerCase() || "";

  const isHintedVertical =
    item.aspectRatio === "9:16" ||
    categoryLower.includes("reel") ||
    categoryLower.includes("tiktok") ||
    categoryLower.includes("vertikal") ||
    categoryLower.includes("shorts") ||
    videoUrlLower.includes("shorts/") ||
    videoUrlLower.includes("tiktok.com");

  const isHintedPortrait =
    item.aspectRatio === "4:5" ||
    item.aspectRatio === "3:4" ||
    item.aspectRatio === "2:3" ||
    categoryLower.includes("lookbook") ||
    categoryLower.includes("busana") ||
    categoryLower.includes("ready-to-wear") ||
    categoryLower.includes("fashion") ||
    categoryLower.includes("styling") ||
    categoryLower.includes("model") ||
    categoryLower.includes("potret") ||
    titleLower.includes("lookbook") ||
    titleLower.includes("koleksi");

  // Determine effective aspect ratio
  const effectiveRatio = useMemo(() => {
    if (isVideo) {
      if (isHintedVertical) return "9:16";
      if (item.aspectRatio === "1:1") return "1:1";
      return "16:9";
    }

    // For images:
    if (naturalAspect) return naturalAspect;
    if (item.aspectRatio && item.aspectRatio !== "16:9") return item.aspectRatio;
    if (isHintedVertical) return "9:16";
    if (isHintedPortrait) return "4:5";
    if (item.aspectRatio === "1:1") return "1:1";
    if (item.aspectRatio === "16:9") return "16:9";
    return "4:5"; // Default elegant portrait editorial
  }, [isVideo, isHintedVertical, isHintedPortrait, item.aspectRatio, naturalAspect]);

  const isPortrait = effectiveRatio === "4:5" || effectiveRatio === "3:4" || effectiveRatio === "2:3";
  const isVerticalReel = effectiveRatio === "9:16";
  const isSquare = effectiveRatio === "1:1";
  const isLandscape = effectiveRatio === "16:9" || effectiveRatio === "16:10" || effectiveRatio === "4:3";

  // Aspect ratio class in masonry mode
  const containerAspectClass = useMemo(() => {
    if (layoutMode === "grid") {
      // In uniform grid mode: use a balanced 4:5 editorial frame that accommodates portraits comfortably
      return "aspect-[4/5]";
    }

    // In Masonry mode: adapt organically to the item's true aspect ratio
    if (isVerticalReel) return "aspect-[9/16]";
    if (isPortrait) return "aspect-[4/5]";
    if (isSquare) return "aspect-square";
    if (effectiveRatio === "16:9" || (isVideo && !isVerticalReel)) return "aspect-video";
    return "aspect-[16/10]";
  }, [layoutMode, isVerticalReel, isPortrait, isSquare, effectiveRatio, isVideo]);

  const hasTearSheet = Boolean(
    item.tearSheet &&
      ((Array.isArray(item.tearSheet.credits) && item.tearSheet.credits.length > 0) ||
        (Array.isArray(item.tearSheet.hotspots) && item.tearSheet.hotspots.length > 0))
  );

  const creditCount = Array.isArray(item.tearSheet?.credits)
    ? item.tearSheet.credits.length
    : 0;

  const handleCardClick = () => {
    if (onOpenTearSheet) {
      onOpenTearSheet(item);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (isDirectVideo && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (isDirectVideo && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImgLoaded(true);
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth && naturalHeight) {
      const ratio = naturalWidth / naturalHeight;
      if (ratio <= 0.65) {
        setNaturalAspect("9:16");
      } else if (ratio <= 0.9) {
        setNaturalAspect("4:5");
      } else if (ratio <= 1.15) {
        setNaturalAspect("1:1");
      } else if (ratio >= 1.55) {
        setNaturalAspect("16:9");
      } else {
        setNaturalAspect("4:3");
      }
    }
  };

  const handleVideoMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const { videoWidth, videoHeight } = e.currentTarget;
    if (videoWidth && videoHeight) {
      if (videoHeight > videoWidth * 1.3) {
        setNaturalAspect("9:16");
      } else if (videoWidth > videoHeight * 1.3) {
        setNaturalAspect("16:9");
      }
    }
  };

  return (
    <article
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group w-full break-inside-avoid mb-6 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-2xs hover:shadow-xl hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer select-none flex flex-col justify-between"
    >
      {/* 1. ADAPTIVE MEDIA PREVIEW BOX */}
      <div
        className={`relative w-full overflow-hidden rounded-xl bg-slate-950 ${containerAspectClass} transition-[aspect-ratio] duration-300`}
      >
        {/* Ambient Blurred Backdrop: Provides luxurious color harmony and eliminates ugly blank voids */}
        {item.imageUrl && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
            <img
              src={item.imageUrl}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover scale-125 filter blur-xl opacity-35 brightness-90 transform-gpu"
            />
          </div>
        )}

        {!imgLoaded && (
          <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center text-slate-300 z-1">
            <ImageIcon className="w-6 h-6 stroke-1" />
          </div>
        )}

        {/* Video Preview on Hover (Smooth silent loop) */}
        {isDirectVideo && item.videoUrl && (
          <video
            ref={videoRef}
            src={item.videoUrl}
            muted
            loop
            playsInline
            preload="none"
            onLoadedMetadata={handleVideoMetadata}
            className={`absolute inset-0 w-full h-full transition-opacity duration-300 z-10 pointer-events-none ${
              layoutMode === "grid" && !isPortrait ? "object-contain" : "object-cover object-center"
            } ${isHovered ? "opacity-100" : "opacity-0"}`}
          />
        )}

        {/* Main Artwork Poster */}
        <img
          src={item.imageUrl}
          alt={item.title}
          onLoad={handleImageLoad}
          className={`w-full h-full transition-transform duration-500 ease-out group-hover:scale-105 block relative z-5 ${
            layoutMode === "grid" && isLandscape
              ? "object-contain"
              : isPortrait
              ? "object-cover object-top"
              : "object-cover object-center"
          } ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          loading="lazy"
        />

        {/* Top Badges (Format & Interactivity) */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 z-15 pointer-events-none">
          {/* Format Indicator Pill */}
          <div className="px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 shadow-xs border border-white/15">
            {isVerticalReel ? (
              <>
                <Smartphone className="w-2.5 h-2.5 text-rose-400" />
                <span className="tracking-wide">Reel 9:16</span>
              </>
            ) : isVideo ? (
              <>
                <Play className="w-2.5 h-2.5 fill-sky-400 text-sky-400" />
                <span className="tracking-wide">Cinema 16:9</span>
              </>
            ) : isPortrait ? (
              <>
                <Camera className="w-2.5 h-2.5 text-amber-400" />
                <span className="tracking-wide">Portret 4:5</span>
              </>
            ) : isSquare ? (
              <>
                <Maximize2 className="w-2.5 h-2.5 text-emerald-400" />
                <span className="tracking-wide">Persegi 1:1</span>
              </>
            ) : (
              <>
                <Camera className="w-2.5 h-2.5 text-slate-300" />
                <span className="tracking-wide">Lanskap</span>
              </>
            )}
          </div>

          {/* Tear-Sheet Indicator Pill */}
          {hasTearSheet && (
            <div className="px-2 py-0.5 rounded-full bg-[#0284c7]/85 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 shadow-xs border border-white/20">
              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
              <span>Tear-Sheet</span>
            </div>
          )}
        </div>

        {/* Hover Action Pill (Visible on hover) */}
        <div className="absolute inset-x-2 bottom-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none flex justify-center">
          <span className="px-3.5 py-1.5 rounded-full btn-primary-pill text-white text-[11px] font-bold shadow-lg flex items-center gap-1.5 backdrop-blur-sm">
            {isVideo ? (
              <Play className="w-3 h-3 text-white fill-white" />
            ) : (
              <Sparkles className="w-3 h-3 text-white" />
            )}
            <span>{isVideo ? "Tonton & Bedah Tim" : "Buka Tear-Sheet"}</span>
            <ArrowUpRight className="w-3 h-3 text-white" />
          </span>
        </div>
      </div>

      {/* 2. CARD METADATA (Neat & Clean Below Artwork) */}
      <div className="pt-3 pb-0.5 px-1 space-y-2">
        {/* Category & Format Info */}
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <span className="text-[#0284c7] font-extrabold truncate max-w-[160px]">
            {item.category}
          </span>
          <span>&bull;</span>
          <span className="text-slate-500 font-mono">
            {isVerticalReel
              ? "Vertikal"
              : isPortrait
              ? "Lookbook Portret"
              : isVideo
              ? "Sinematik"
              : "Editorial"}
          </span>
        </div>

        {/* Title & Status */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-extrabold text-slate-900 line-clamp-1 group-hover:text-[#0284c7] transition-colors">
            {item.title}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            {item.collaborationId && (
              <span
                className="text-[9px] font-bold text-amber-900 bg-amber-50 border border-amber-300/80 px-1.5 py-0.5 rounded leading-tight flex items-center gap-0.5"
                title="Karya Hasil Kolaborasi Resmi Terverifikasi di RAMU"
              >
                <Trophy className="w-2.5 h-2.5 text-amber-600 inline" />
                <span>Kolaborasi</span>
              </span>
            )}
            {item.isOwner && (
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-1.5 py-0.5 rounded leading-tight">
                Milik Anda
              </span>
            )}
            {!item.isOwner && item.isCoCreditor && (
              <span className="text-[9px] font-bold text-purple-700 bg-purple-50 border border-purple-200/70 px-1.5 py-0.5 rounded leading-tight">
                Kredit Anda
              </span>
            )}
          </div>
        </div>

        {/* Creator Identity & Team Count */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 min-w-0">
            <ActorAvatar
              name={item.actor.name}
              avatarUrl={item.actor.avatarUrl}
              className="w-5 h-5 rounded-full"
              textClassName="text-[8px]"
            />
            <span className="text-xs font-bold text-slate-700 truncate">
              {item.actor.name}
            </span>
          </div>

          {creditCount > 0 ? (
            <span className="shrink-0 text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-bold border border-slate-200/80 flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" />
              <span>+{creditCount} Tim</span>
            </span>
          ) : item.actor.location ? (
            <span className="shrink-0 text-[10px] text-slate-400 truncate max-w-[110px] font-medium">
              {item.actor.location}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
