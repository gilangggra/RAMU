"use client";

import React, { useState } from "react";
import { ShowcaseItem } from "@/application/showcaseService";
import { ShowcaseCard } from "./ShowcaseCard";
import { TearSheetModal } from "./TearSheetModal";
import { LayoutGrid, Columns3, Sparkles } from "lucide-react";

interface ShowcaseGalleryClientProps {
  items: ShowcaseItem[];
  currentActorId?: string;
}

export function ShowcaseGalleryClient({ items, currentActorId }: ShowcaseGalleryClientProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [layoutMode, setLayoutMode] = useState<"masonry" | "grid">("masonry");

  const handleOpenTearSheet = (item: ShowcaseItem) => {
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx !== -1) {
      setSelectedIndex(idx);
    }
  };

  const handleClose = () => {
    setSelectedIndex(null);
  };

  const handleSelectIndex = (index: number) => {
    if (index >= 0 && index < items.length) {
      setSelectedIndex(index);
    }
  };

  const currentItem = selectedIndex !== null ? items[selectedIndex] : null;

  // Breakdown of media formats for aesthetic info
  const portraitCount = items.filter(
    (i) =>
      i.aspectRatio === "4:5" ||
      i.aspectRatio === "3:4" ||
      i.category?.toLowerCase().includes("lookbook") ||
      i.category?.toLowerCase().includes("busana") ||
      i.category?.toLowerCase().includes("fashion") ||
      i.category?.toLowerCase().includes("styling")
  ).length;

  const verticalVideoCount = items.filter(
    (i) =>
      i.aspectRatio === "9:16" ||
      i.category?.toLowerCase().includes("reel") ||
      i.category?.toLowerCase().includes("tiktok") ||
      i.videoUrl?.includes("shorts/")
  ).length;

  return (
    <div className="space-y-4">
      {/* GALLERY TOOLBAR & VIEW CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 py-1 text-xs">
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-[#0284c7]" />
          <span>
            Menampilkan <strong className="text-slate-800">{items.length}</strong> karya
          </span>
          {(portraitCount > 0 || verticalVideoCount > 0) && (
            <span className="hidden sm:inline text-slate-400">
              ({portraitCount > 0 ? `${portraitCount} Portret` : ""}
              {portraitCount > 0 && verticalVideoCount > 0 ? ", " : ""}
              {verticalVideoCount > 0 ? `${verticalVideoCount} Reel Vertikal` : ""})
            </span>
          )}
        </div>

        {/* Layout Switcher (Editorial Masonry vs Grid Seragam) */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 w-fit self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setLayoutMode("masonry")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              layoutMode === "masonry"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
            title="Tampilan Editorial Masonry (Menyesuaikan foto potret & lanskap tanpa terpotong)"
          >
            <Columns3 className="w-3.5 h-3.5" />
            <span>Editorial (Masonry)</span>
          </button>
          <button
            type="button"
            onClick={() => setLayoutMode("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              layoutMode === "grid"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
            title="Tampilan Grid Seimbang (Tinggi kartu seragam dengan backdrop ambient)"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid Seimbang</span>
          </button>
        </div>
      </div>

      {/* GALLERY DISPLAY */}
      {layoutMode === "masonry" ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
          {items.map((item) => (
            <ShowcaseCard
              key={item.id}
              item={item}
              layoutMode="masonry"
              onOpenTearSheet={handleOpenTearSheet}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <ShowcaseCard
              key={item.id}
              item={item}
              layoutMode="grid"
              onOpenTearSheet={handleOpenTearSheet}
            />
          ))}
        </div>
      )}

      {/* TEAR-SHEET MODAL */}
      <TearSheetModal
        item={currentItem}
        items={items}
        currentIndex={selectedIndex ?? 0}
        isOpen={selectedIndex !== null}
        onClose={handleClose}
        onSelectIndex={handleSelectIndex}
        currentActorId={currentActorId}
      />
    </div>
  );
}
