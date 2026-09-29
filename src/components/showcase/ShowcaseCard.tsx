"use client";

import React, { useState } from "react";
import { ShowcaseItem } from "@/application/showcaseService";

interface ShowcaseCardProps {
  item: ShowcaseItem;
  onOpenTearSheet?: (item: ShowcaseItem) => void;
}

export function ShowcaseCard({ item, onOpenTearSheet }: ShowcaseCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleCardClick = () => {
    if (onOpenTearSheet) {
      onOpenTearSheet(item);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group break-inside-avoid mb-1.5 sm:mb-2 w-full relative block overflow-hidden rounded-none bg-stone-100 cursor-pointer select-none"
    >
      {/* Loading Skeleton */}
      {!imgLoaded && (
        <div className="w-full aspect-[3/4] bg-stone-200/70 animate-pulse" />
      )}
      <img
        src={item.imageUrl}
        alt={item.title}
        onLoad={() => setImgLoaded(true)}
        className={`w-full h-auto object-cover rounded-none transition-all duration-500 ease-out group-hover:scale-[1.02] group-hover:brightness-[0.97] block ${
          imgLoaded ? "opacity-100" : "opacity-0 absolute inset-0"
        }`}
        loading="lazy"
      />
    </div>
  );
}
