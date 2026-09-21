"use client";

import React from "react";
import Link from "next/link";
import { ShowcaseItem } from "@/application/showcaseService";

interface ShowcaseCardProps {
  item: ShowcaseItem;
}

export function ShowcaseCard({ item }: ShowcaseCardProps) {
  // We extract the real actor ID (ignoring the -copy- suffix if it's a duplicate)
  const realActorId = item.actor.id.split("-copy-")[0];

  return (
    <div className="group relative w-full mb-6 break-inside-avoid rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 bg-stone-100">
      
      {/* Image */}
      <img
        src={item.imageUrl}
        alt={item.title}
        className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />

      {/* Gradient Overlay (Visible on Hover) */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#27213D]/90 via-[#27213D]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none flex flex-col justify-end p-5">
        
        {/* Content appearing from bottom */}
        <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
          <span className="inline-block px-2 py-1 mb-2 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
            {item.category}
          </span>
          <h3 className="text-lg font-extrabold text-white leading-snug mb-3">
            {item.title}
          </h3>

          <Link 
            href={`/directory/${realActorId}`}
            className="flex items-center gap-2.5 group/author pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${item.actor.avatarBg} flex items-center justify-center font-bold text-xs text-white shadow-md border border-white/20`}>
              {item.actor.initials}
            </div>
            <div>
              <p className="text-sm font-bold text-white group-hover/author:text-amber-300 transition-colors">
                {item.actor.name}
              </p>
              <p className="text-[10px] text-stone-300">
                {item.actor.sector}
              </p>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}
