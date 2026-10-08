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
  iconClassName = "text-white",
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
        "btn-primary-pill !text-xs !py-2.5 !px-6 shadow-md shadow-[#4CC9FE]/25 flex items-center gap-2 cursor-pointer active:scale-95 text-white font-semibold transition-all"
      }
    >
      <Pencil className={`w-3.5 h-3.5 ${iconClassName}`} />
      <span>{label}</span>
    </button>
  );
}
