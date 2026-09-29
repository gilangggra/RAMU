"use client";

import React, { useState, useRef } from "react";
import { ShowcaseItem } from "@/application/showcaseService";
import { Play } from "lucide-react";

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

  const handleCardClick = () => {
    if (onOpenTearSheet) {
      onOpenTearSheet(item);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (isDirectVideo && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay may be restricted by browser until interacted
      });
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
    <div
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group break-inside-avoid mb-1.5 sm:mb-2 w-full relative block overflow-hidden rounded-none bg-stone-100 cursor-pointer select-none"
    >
      {/* Loading Skeleton */}
      {!imgLoaded && (
        <div className="w-full aspect-[3/4] bg-stone-200/70 animate-pulse" />
      )}

      {/* Direct Video Silent Hover Loop */}
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

      {/* Main Visual Poster Image */}
      <img
        src={item.imageUrl}
        alt={item.title}
        onLoad={() => setImgLoaded(true)}
        className={`w-full h-auto object-cover rounded-none transition-all duration-500 ease-out group-hover:scale-[1.02] group-hover:brightness-[0.97] block ${
          imgLoaded ? "opacity-100" : "opacity-0 absolute inset-0"
        }`}
        loading="lazy"
      />

      {/* Minimalist Cinema Indicator Badge (Discreet top-right, visible on hover) */}
      {isVideo && (
        <div className="absolute top-2 right-2 z-20 w-6 h-6 bg-black/50 backdrop-blur-xs flex items-center justify-center text-white/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <Play className="w-3 h-3 fill-current ml-0.5" />
        </div>
      )}
    </div>
  );
}
