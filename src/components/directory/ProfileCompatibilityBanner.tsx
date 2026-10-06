"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Handshake, MessageSquare, Sparkles } from "lucide-react";
import { BookingModal } from "./BookingModal";

interface ProfileCompatibilityBannerProps {
  targetActor: {
    id: string;
    name: string;
    sector: string;
    actorType: string;
    location?: string | null;
    assets?: Array<{
      category: string;
      subtype: string;
      attributes?: any;
    }>;
  };
  currentActor?: {
    id: string;
    name: string;
    sector: string;
  } | null;
  termsConfig?: any;
}

export function ProfileCompatibilityBanner({
  targetActor,
  termsConfig,
}: ProfileCompatibilityBannerProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <div className="rounded-2xl bg-stone-900 text-white px-5 py-3.5 shadow-xs border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Left: Compact Match Indicator */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md">
              98% Match
            </span>
            <span className="text-xs font-bold text-white truncate">
              Kapasitas {targetActor.name} Cocok untuk Proyek Anda
            </span>
          </div>
          <p className="text-[11px] text-stone-400 truncate mt-0.5">
            Spesifikasi terverifikasi &amp; terbuka untuk jadwal kolaborasi mendatang.
          </p>
        </div>
      </div>

      {/* Right: Quick Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={`/messages?with=${targetActor.id}`}
          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 hover:text-white text-xs font-semibold transition-colors border border-white/10 inline-flex items-center gap-1.5"
        >
          <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
          <span>Chat</span>
        </Link>
        <button
          type="button"
          onClick={() => setIsBookingOpen(true)}
          className="px-4 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-900 text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
        >
          <Handshake className="w-3.5 h-3.5 text-stone-900" />
          <span>Ajak Kolaborasi</span>
        </button>
      </div>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        targetId={targetActor.id}
        targetName={targetActor.name}
        targetSector={targetActor.sector}
        targetType={targetActor.actorType}
        termsConfig={termsConfig}
      />
    </div>
  );
}
