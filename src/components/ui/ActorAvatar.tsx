"use client";

import { useEffect, useState } from "react";

interface ActorAvatarProps {
  name: string;
  avatarUrl?: string | null;
  className?: string;
  textClassName?: string;
}

const PASTEL_PALETTES = [
  { bg: "bg-amber-100/90", text: "text-amber-900", border: "border-amber-200/80" },
  { bg: "bg-rose-100/90", text: "text-rose-900", border: "border-rose-200/80" },
  { bg: "bg-emerald-100/90", text: "text-emerald-900", border: "border-emerald-200/80" },
  { bg: "bg-sky-100/90", text: "text-sky-900", border: "border-sky-200/80" },
  { bg: "bg-indigo-100/90", text: "text-indigo-900", border: "border-indigo-200/80" },
  { bg: "bg-purple-100/90", text: "text-purple-900", border: "border-purple-200/80" },
  { bg: "bg-teal-100/90", text: "text-teal-900", border: "border-teal-200/80" },
  { bg: "bg-orange-100/90", text: "text-orange-900", border: "border-orange-200/80" },
];

function getAvatarPalette(name: string) {
  let hash = 0;
  const safeName = name || "RAMU";
  for (let i = 0; i < safeName.length; i++) {
    hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PASTEL_PALETTES.length;
  return PASTEL_PALETTES[index];
}

/**
 * Avatar konsisten di seluruh platform: tampilkan Profile.avatarUrl bila ada,
 * jatuh ke inisial nama dengan warna pastel harmonis bila kosong atau gambar gagal dimuat.
 */
export function ActorAvatar({
  name,
  avatarUrl,
  className = "w-9 h-9 rounded-lg",
  textClassName = "text-sm",
}: ActorAvatarProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [avatarUrl]);

  const showImage = Boolean(avatarUrl) && !failed;
  const palette = getAvatarPalette(name);

  return (
    <div
      className={`${className} overflow-hidden ${
        showImage ? "bg-stone-100 border border-stone-200" : `${palette.bg} ${palette.border} border`
      } flex items-center justify-center font-bold shrink-0 shadow-2xs`}
    >
      {showImage ? (
        <img
          src={avatarUrl as string}
          alt={name}
          onError={() => setFailed(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className={`${textClassName} ${palette.text}`}>
          {(name || "?").charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}
