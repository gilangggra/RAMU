"use client";

import React, { useState } from "react";
import { ShowcaseItem } from "@/application/showcaseService";
import { ShowcaseCard } from "./ShowcaseCard";
import { TearSheetModal } from "./TearSheetModal";

interface ShowcaseGalleryClientProps {
  items: ShowcaseItem[];
  currentActorId?: string;
}

export function ShowcaseGalleryClient({ items, currentActorId }: ShowcaseGalleryClientProps) {
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

      <div className="columns-2 sm:columns-3 md:columns-4 xl:columns-5 gap-1.5 sm:gap-2">
        {items.map((item) => (
          <ShowcaseCard
            key={item.id}
            item={item}
            onOpenTearSheet={handleOpenTearSheet}
          />
        ))}
      </div>

      <TearSheetModal
        item={currentItem}
        items={items}
        currentIndex={selectedIndex ?? 0}
        isOpen={selectedIndex !== null}
        onClose={handleClose}
        onSelectIndex={handleSelectIndex}
        currentActorId={currentActorId}
      />
    </>
  );
}
