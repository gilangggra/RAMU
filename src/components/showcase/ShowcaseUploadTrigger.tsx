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
          "btn-primary-pill !text-xs !py-2 !px-4 text-white font-bold inline-flex items-center gap-1.5 shadow-md shadow-[#4CC9FE]/25 cursor-pointer active:scale-95 transition-all shrink-0"
        }
      >
        <Plus className="w-3.5 h-3.5 text-white" />
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
