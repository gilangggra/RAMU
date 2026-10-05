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
  iconClassName = "text-stone-300",
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
        "inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
      }
    >
      <Pencil className={`w-3.5 h-3.5 ${iconClassName}`} />
      <span>{label}</span>
    </button>
  );
}
