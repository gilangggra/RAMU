"use client";

import React from "react";
import Link from "next/link";
import { UserCircle, ImageIcon, ArrowUpRight, Sparkles } from "lucide-react";

interface PublicProfileBannerProps {
  actorId: string;
}

export function PublicProfileBanner({ actorId }: PublicProfileBannerProps) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-900 to-stone-800 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-white/10 text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-300">
            Wilayah Profil Publik &amp; Portofolio
          </span>
        </div>
        <p className="text-xs text-stone-300 leading-relaxed max-w-xl">
          Ingin mengubah foto profil, comp-card fisik, gear kamera, paket tarif, atau karya visual Anda? Kelola langsung secara visual di halaman publik.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <Link
          href={`/directory/${actorId}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-stone-900 font-semibold text-xs hover:bg-stone-100 transition-colors shadow-2xs"
        >
          <UserCircle className="w-3.5 h-3.5" />
          <span>Profil &amp; Comp Card</span>
          <ArrowUpRight className="w-3 h-3 text-stone-400" />
        </Link>
        <Link
          href="/dashboard/showcase"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/20 transition-colors shadow-2xs"
        >
          <ImageIcon className="w-3.5 h-3.5 text-stone-300" />
          <span>Kelola Karya</span>
          <ArrowUpRight className="w-3 h-3 text-stone-400" />
        </Link>
      </div>
    </div>
  );
}
