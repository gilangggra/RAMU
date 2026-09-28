"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShowcaseItem } from "@/application/showcaseService";
import { MapPin, Heart, Sparkles, Layers, ShieldCheck, CheckCircle2 } from "lucide-react";

interface ShowcaseCardProps {
  item: ShowcaseItem;
  onOpenTearSheet?: (item: ShowcaseItem) => void;
}

const COMP_LABEL: Record<string, string> = {
  PAID: "Paid",
  TFP: "TFP",
  REVENUE_SHARE: "Bagi Hasil",
};

export function ShowcaseCard({ item, onOpenTearSheet }: ShowcaseCardProps) {
  const realActorId = item.actor.id.split("-copy-")[0];
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Pick first compensation model label
  const compLabel = item.actor.compensationModels?.[0]
    ? COMP_LABEL[item.actor.compensationModels[0]] ?? item.actor.compensationModels[0]
    : "Negosiasi";

  const city = item.actor.location?.split(",")?.[0]?.trim() ?? "Indonesia";

  const handleCardClick = () => {
    if (onOpenTearSheet) {
      onOpenTearSheet(item);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group break-inside-avoid mb-5 w-full relative block overflow-hidden rounded-2xl bg-white border border-stone-200/80 shadow-[0_2px_12px_rgba(39,33,61,0.04)] hover:shadow-[0_16px_40px_rgba(39,33,61,0.1)] transition-all duration-500 cursor-pointer select-none"
    >
      {/* ── IMAGE WITH NATURAL HEIGHT ── */}
      {!imgLoaded && (
        <div className="absolute inset-0 bg-stone-100 animate-pulse" />
      )}
      <img
        src={item.imageUrl}
        alt={item.title}
        onLoad={() => setImgLoaded(true)}
        className={`w-full h-auto min-h-[280px] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] ${
          imgLoaded ? "opacity-100" : "opacity-0"
        }`}
        loading="lazy"
      />

      {/* ── TOP FLOATING ELEMENTS (CLEAN WHITE) ── */}
      <div className="absolute top-3.5 inset-x-3.5 z-20 flex items-start justify-between gap-2">
        
        {/* Creator Pill (Links to profile) */}
        <Link
          href={`/directory/${realActorId}`}
          onClick={(e) => e.stopPropagation()}
          title={`Lihat profil ${item.actor.name}`}
          className="flex items-center gap-2 bg-white/95 hover:bg-white backdrop-blur-xl border border-stone-200/90 p-1 pr-3 rounded-full text-stone-900 shadow-sm transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <div
            className={`w-6 h-6 rounded-full bg-gradient-to-br ${item.actor.avatarBg} flex items-center justify-center font-bold text-[10px] text-black shrink-0 shadow-2xs`}
          >
            {item.actor.initials}
          </div>
          <span className="text-xs font-bold tracking-tight text-stone-900 truncate max-w-[110px]">
            {item.actor.name}
          </span>
        </Link>

        {/* Top Right: Heart & Peer-Verified Crew Badge */}
        <div className="flex items-center gap-1.5">
          {/* Peer-Verified Crew / Anti-Catfishing Badge */}
          <div
            title="Peer-Verified Co-Credit: Seluruh kru produksi terverifikasi silang (Anti-Catfishing)"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xl border border-emerald-300 text-[10px] font-mono font-bold text-emerald-900 shadow-sm"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span className="hidden sm:inline">VERIFIED CREW</span>
            <span className="sm:hidden">VERIFIED</span>
          </div>

          {/* Heart Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
              isLiked
                ? "bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                : "bg-white/95 backdrop-blur-xl border border-stone-200/90 text-stone-700 hover:text-stone-950 hover:bg-white hover:scale-105"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-white" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── CENTER HOVER ACTION: "INSPECT TEAR-SHEET" (CLEAN WHITE GLASS) ── */}
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-95">
        <div className="px-4 py-2 rounded-full bg-white/98 backdrop-blur-2xl border border-stone-200 text-stone-900 font-mono text-xs font-bold tracking-wider shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-600" />
          <span>INSPECT TEAR-SHEET ✦</span>
        </div>
      </div>

      {/* ── GRADIENT OVERLAY ── */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/30 to-transparent pointer-events-none opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

      {/* ── BOTTOM INFO SECTION ── */}
      <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 z-10 flex flex-col justify-end">
        {/* Hover Bio Snippet */}
        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
          <div className="overflow-hidden">
            <p className="text-stone-200 text-[11px] leading-relaxed line-clamp-2 mb-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
              {item.title || "Karya kolaboratif dalam ekosistem kreatif RAMU."}
            </p>
          </div>
        </div>

        {/* Title and Meta */}
        <div className="flex items-end justify-between gap-3">
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <h3 className="text-white font-extrabold text-[15px] leading-tight truncate drop-shadow-xs">
              {item.category}
            </h3>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-[10px] text-stone-300">
                <MapPin className="w-3 h-3 text-stone-400" />
                {city}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300">
                <Sparkles className="w-3 h-3" />
                {compLabel}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-300">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Verified Crew
              </span>
            </div>
          </div>

          {/* Action Circular Trigger */}
          <div className="w-9 h-9 shrink-0 rounded-full bg-white/95 group-hover:bg-amber-400 border border-white/80 group-hover:border-amber-400 text-stone-800 group-hover:text-black flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-md">
            <Layers className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
