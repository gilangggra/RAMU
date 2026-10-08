"use client";

import React, { useState, useRef } from "react";
import { ShowcaseItem } from "@/application/showcaseService";
import {
  Play,
  Sparkles,
  ArrowUpRight,
  Image as ImageIcon,
  Users,
} from "lucide-react";
import { ActorAvatar } from "@/components/ui/ActorAvatar";

interface ShowcaseCardProps {
  item: ShowcaseItem;
  onOpenTearSheet?: (item: ShowcaseItem) => void;
}

export function ShowcaseCard({ item, onOpenTearSheet }: ShowcaseCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const isVideo = item.mediaType === "VIDEO" || !!item.videoUrl;
  const isDirectVideo =
    isVideo &&
    item.videoUrl &&
    (/\.(mp4|webm|mov)(\?.*)?$/i.test(item.videoUrl) ||
      item.videoUrl.startsWith("/uploads/portfolios/videos/"));

  // Detect Aspect Ratio & Layout Type
  const isVerticalMedia =
    item.aspectRatio === "9:16" ||
    item.category?.toLowerCase().includes("reel") ||
    item.category?.toLowerCase().includes("tiktok") ||
    item.category?.toLowerCase().includes("vertikal");

  const isSquareMedia = item.aspectRatio === "1:1";
  const isLandscapeVideo = isVideo && !isVerticalMedia;

  // Adaptive Container Ratio (16:9 for landscape video, 4:5 for photo, 9:16 for reel)
  const containerAspectClass = isLandscapeVideo
    ? "aspect-video" // 16:9 Cinema Landscape
    : isVerticalMedia
    ? "aspect-[9/16]" // 9:16 Vertical Reel
    : isSquareMedia
    ? "aspect-square" // 1:1 Square
    : "aspect-[4/5]"; // 4:5 Editorial Portrait

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

  return (
    <article
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group break-inside-avoid mb-4 w-full rounded-2xl border border-stone-200/80 bg-white p-2 shadow-2xs hover:shadow-md hover:border-stone-300 transition-all duration-200 cursor-pointer select-none flex flex-col"
    >
      {/* 1. MEDIA PREVIEW BOX (Clean Canvas - No heavy badges on top of artwork) */}
      <div
        className={`relative w-full overflow-hidden rounded-xl bg-stone-900 ${containerAspectClass}`}
      >
        {/* Ambient Blur Glass Backdrop for Landscape Videos */}
        {isLandscapeVideo && item.imageUrl && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
            <img
              src={item.imageUrl}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover scale-125 filter blur-xl opacity-40 brightness-75 transform-gpu"
            />
          </div>
        )}

        {!imgLoaded && (
          <div className="absolute inset-0 bg-stone-100 animate-pulse flex items-center justify-center text-stone-300 z-1">
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
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 z-10 pointer-events-none ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {/* Main Artwork Poster */}
        <img
          src={item.imageUrl}
          alt={item.title}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.02] block relative z-5 ${
            imgLoaded ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
        />

        {/* Minimalist Micro-Badge in Corner (Only for Video) */}
        {isVideo && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/65 backdrop-blur-md text-white text-[9px] font-medium flex items-center gap-1 shadow-2xs z-15 pointer-events-none">
            <Play className="w-2 h-2 fill-white" />
            <span>{isLandscapeVideo ? "16:9" : isVerticalMedia ? "9:16" : "Video"}</span>
          </div>
        )}

        {/* Subtle Hover Action Pill (Only visible on hover) */}
        <div className="absolute inset-x-2 bottom-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none flex justify-center">
          <span className="px-2.5 py-1 rounded-lg bg-stone-900/90 backdrop-blur-md text-white text-[10px] font-semibold shadow-md flex items-center gap-1.5 border border-white/10">
            {isVideo ? (
              <Play className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
            ) : (
              <Sparkles className="w-2.5 h-2.5 text-stone-300" />
            )}
            <span>{isVideo ? "Tonton & Bedah Kru" : "Buka Tear-Sheet"}</span>
            <ArrowUpRight className="w-2.5 h-2.5 text-stone-400" />
          </span>
        </div>
      </div>

      {/* 2. CARD METADATA (Neat & Clean Below Artwork) */}
      <div className="pt-2 pb-0.5 px-1 space-y-1.5">
        {/* Category & Format info */}
        <div className="flex items-center gap-1.5 text-[10px] text-stone-400 font-medium">
          <span className="text-stone-500 uppercase tracking-wider font-semibold truncate max-w-[140px]">
            {item.category}
          </span>
          {hasTearSheet && (
            <>
              <span>&bull;</span>
              <span className="text-stone-600 flex items-center gap-0.5 font-semibold">
                <Sparkles className="w-2.5 h-2.5 text-stone-500" />
                <span>Tear-Sheet</span>
              </span>
            </>
          )}
        </div>

        {/* Title & Status */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-xs sm:text-[13px] font-bold text-stone-900 line-clamp-1 group-hover:text-stone-700 transition-colors">
            {item.title}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            {item.collaborationId && (
              <span
                className="text-[9px] font-bold text-amber-900 bg-amber-50 border border-amber-300/80 px-1.5 py-0.5 rounded leading-tight flex items-center gap-0.5"
                title="Karya Hasil Kolaborasi Resmi Terverifikasi di RAMU"
              >
                <span>🏆</span>
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
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100">
          <div className="flex items-center gap-1.5 min-w-0">
            <ActorAvatar
              name={item.actor.name}
              avatarUrl={item.actor.avatarUrl}
              className="w-4 h-4 rounded-full"
              textClassName="text-[8px]"
            />
            <span className="text-[11px] font-semibold text-stone-700 truncate">
              {item.actor.name}
            </span>
          </div>

          {creditCount > 0 ? (
            <span className="shrink-0 text-[10px] text-stone-500 font-medium flex items-center gap-1">
              <Users className="w-3 h-3 text-stone-400" />
              <span>+{creditCount} Tim</span>
            </span>
          ) : item.actor.location ? (
            <span className="shrink-0 text-[10px] text-stone-400 truncate max-w-[90px]">
              {item.actor.location}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
