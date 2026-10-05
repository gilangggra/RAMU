"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { ShowcaseUploadModal, RegisteredActor } from "./ShowcaseUploadModal";

interface ShowcaseUploadTriggerProps {
  registeredActors: RegisteredActor[];
  className?: string;
  label?: string;
}

export function ShowcaseUploadTrigger({
  registeredActors,
  className,
  label = "Unggah Karya",
}: ShowcaseUploadTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          className ||
          "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-black text-white text-xs font-semibold shadow-2xs transition-colors shrink-0 cursor-pointer"
        }
      >
        <Plus className="w-3.5 h-3.5 text-stone-300" />
        <span>{label}</span>
      </button>

      <ShowcaseUploadModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        registeredActors={registeredActors}
      />
    </>
  );
}
