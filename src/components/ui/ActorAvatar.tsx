"use client";

import { useEffect, useState } from "react";

interface ActorAvatarProps {
  name: string;
  avatarUrl?: string | null;
  className?: string;
  textClassName?: string;
}

/**
 * Avatar konsisten di seluruh platform: tampilkan Profile.avatarUrl bila ada,
 * jatuh ke inisial nama bila kosong atau gambar gagal dimuat.
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

  return (
    <div
      className={`${className} overflow-hidden bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-stone-800 shrink-0`}
    >
      {showImage ? (
        <img
          src={avatarUrl as string}
          alt={name}
          onError={() => setFailed(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className={textClassName}>{(name || "?").charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}
