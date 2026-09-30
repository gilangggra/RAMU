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
          "inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1E1B2E] hover:bg-black text-white text-xs font-bold transition-all shadow-sm hover:scale-[1.02] shrink-0 cursor-pointer active:scale-95"
        }
      >
        <Plus className="w-3.5 h-3.5 text-amber-400" />
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
