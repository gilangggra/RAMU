"use client";

import React from "react";
import Link from "next/link";
import { UserCircle, ImageIcon, ArrowUpRight, Sparkles } from "lucide-react";

interface PublicProfileBannerProps {
  actorId: string;
}

export function PublicProfileBanner({ actorId }: PublicProfileBannerProps) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl sm:rounded-[24px] bg-gradient-to-r from-sky-50/90 via-white to-amber-50/40 border border-sky-100/90 text-[#27213D] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-[#4CC9FE]/15 text-[#0284c7]">
            <Sparkles className="w-3.5 h-3.5 text-[#0284c7]" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0284c7]">
            Wilayah Profil Publik &amp; Portofolio
          </span>
        </div>
        <p className="text-xs text-[#716B7E] leading-relaxed max-w-xl">
          Ingin mengubah foto profil, comp-card fisik, gear kamera, paket tarif, atau karya visual Anda? Kelola langsung secara visual di halaman publik.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <Link
          href={`/directory/${actorId}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#4CC9FE] hover:bg-[#38bbf5] text-white font-bold text-xs shadow-sm shadow-[#4CC9FE]/20 transition-all cursor-pointer group"
        >
          <UserCircle className="w-3.5 h-3.5" />
          <span>Profil &amp; Comp Card</span>
          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
        <Link
          href="/dashboard/showcase"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-stone-50 text-[#27213D] border border-stone-200/80 font-bold text-xs shadow-xs transition-colors cursor-pointer group"
        >
          <ImageIcon className="w-3.5 h-3.5 text-[#716B7E]" />
          <span>Kelola Karya</span>
          <ArrowUpRight className="w-3 h-3 text-stone-400 group-hover:text-[#27213D] transition-colors" />
        </Link>
      </div>
    </div>
  );
}

