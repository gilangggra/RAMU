"use client";

import React from "react";
import { Pencil } from "lucide-react";
import { DrawerTabType } from "./ProfileSlideOverDrawer";

interface OpenEditModalButtonProps {
  initialTab?: DrawerTabType;
  label?: string;
  className?: string;
  iconClassName?: string;
}

export function OpenEditModalButton({
  initialTab = "profile",
  label = "Edit Halaman Profil",
  className,
  iconClassName = "text-purple-300",
}: OpenEditModalButtonProps) {
  const handleClick = () => {
    window.dispatchEvent(
      new CustomEvent("open-edit-modal", {
        detail: { tab: initialTab },
      })
    );
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("edit", initialTab);
      window.history.replaceState({}, "", url.toString());
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ||
        "inline-flex items-center gap-2 px-6 py-3 bg-[#1E1B2E] hover:bg-black text-white text-xs font-bold uppercase tracking-widest transition-all rounded-none shadow-xs cursor-pointer"
      }
    >
      <Pencil className={`w-3.5 h-3.5 ${iconClassName}`} />
      <span>{label}</span>
    </button>
  );
}
