"use client";

import React, { useState } from "react";
import { ShowcaseItem } from "@/application/showcaseService";
import { ShowcaseCard } from "./ShowcaseCard";
import { TearSheetModal } from "./TearSheetModal";

interface ShowcaseGalleryClientProps {
  items: ShowcaseItem[];
}

export function ShowcaseGalleryClient({ items }: ShowcaseGalleryClientProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

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

  return (
    <>
      {/* ── MASONRY GRID ── */}
      <div className="columns-2 sm:columns-2 md:columns-3 xl:columns-4 gap-4">
        {items.map((item) => (
          <ShowcaseCard
            key={item.id}
            item={item}
            onOpenTearSheet={handleOpenTearSheet}
          />
        ))}
      </div>

      {/* ── INTERACTIVE HOTSPOT TEAR-SHEET MODAL ── */}
      <TearSheetModal
        item={currentItem}
        items={items}
        currentIndex={selectedIndex ?? 0}
        isOpen={selectedIndex !== null}
        onClose={handleClose}
        onSelectIndex={handleSelectIndex}
      />
    </>
  );
}
