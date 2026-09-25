"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShowcaseItem } from "@/application/showcaseService";
import { MapPin, Heart, ArrowUpRight, Sparkles } from "lucide-react";

interface ShowcaseCardProps {
  item: ShowcaseItem;
}

const COMP_LABEL: Record<string, string> = {
  PAID: "Paid",
  TFP: "TFP",
  REVENUE_SHARE: "Bagi Hasil",
};

export function ShowcaseCard({ item }: ShowcaseCardProps) {
  const realActorId = item.actor.id.split("-copy-")[0];
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Pick first compensation model label
  const compLabel = item.actor.compensationModels?.[0]
    ? COMP_LABEL[item.actor.compensationModels[0]] ?? item.actor.compensationModels[0]
    : "Negosiasi";

  const city = item.actor.location?.split(",")?.[0]?.trim() ?? "Indonesia";

  return (
    <Link 
      href={`/directory/${realActorId}`}
      className="group break-inside-avoid mb-5 w-full relative block overflow-hidden bg-[#1a1721] shadow-sm hover:shadow-xl transition-all duration-500"
    >
      {/* ── IMAGE WITH NATURAL HEIGHT ── */}
      {!imgLoaded && (
        <div className="absolute inset-0 bg-[#27213D]/20 animate-pulse" />
      )}
      <img
        src={item.imageUrl}
        alt={item.title}
        onLoad={() => setImgLoaded(true)}
        className={`w-full h-auto min-h-[280px] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] ${
          imgLoaded ? "opacity-100" : "opacity-0"
        }`}
        loading="lazy"
      />

      {/* ── TOP FLOATING ELEMENTS ── */}
      <div className="absolute top-4 inset-x-4 z-20 flex items-start justify-between">
        
        {/* Creator Pill */}
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 p-1 pr-3.5 rounded-full text-white shadow-sm transition-transform group-hover:-translate-y-1">
          <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${item.actor.avatarBg} flex items-center justify-center font-bold text-[10px] shrink-0`}>
            {item.actor.initials}
          </div>
          <span className="text-xs font-bold tracking-tight truncate max-w-[120px]">
            {item.actor.name}
          </span>
        </div>

        {/* Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setIsLiked(!isLiked);
          }}
          className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-all duration-300 ${
            isLiked 
              ? "bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]" 
              : "bg-black/40 backdrop-blur-md border border-white/10 text-white/90 hover:bg-black/60"
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? "fill-white" : ""}`} />
        </button>
      </div>

      {/* ── GRADIENT OVERLAY ── */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#15111E]/95 via-[#15111E]/40 to-transparent pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity duration-500" />

      {/* ── BOTTOM INFO SECTION ── */}
      <div className="absolute bottom-0 inset-x-0 p-5 z-10 flex flex-col justify-end">
        
        {/* Hover Reveal: Bio Description */}
        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
          <div className="overflow-hidden">
            <p className="text-stone-300 text-[11px] leading-relaxed line-clamp-2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
              {item.title || "Karya visual dari kreator RAMU."}
            </p>
          </div>
        </div>

        {/* Core Info */}
        <div className="flex items-end justify-between gap-4">
          
          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
            {/* Sector / Role */}
            <h3 className="text-white font-extrabold text-[15px] leading-tight truncate">
              {item.category}
            </h3>
            
            {/* Meta Tags (Location & Comp) */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-[10px] text-stone-400">
                <MapPin className="w-3 h-3 text-stone-500" />
                {city}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                <Sparkles className="w-3 h-3" />
                {compLabel}
              </span>
            </div>
          </div>

          {/* Action Circular Button */}
          <div className="w-10 h-10 shrink-0 rounded-full bg-white text-[#15111E] flex items-center justify-center transform group-hover:bg-amber-400 group-hover:scale-110 transition-all duration-300 shadow-lg">
            <ArrowUpRight className="w-5 h-5" />
          </div>

        </div>
      </div>
    </Link>
  );
}
