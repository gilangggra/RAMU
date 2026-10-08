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
    <div className="rounded-[22px] bg-slate-900 text-white px-6 py-4 shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Left: Compact Match Indicator */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-9 h-9 rounded-full bg-[#4CC9FE]/15 border border-[#4CC9FE]/30 text-[#4CC9FE] flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
              98% Match
            </span>
            <span className="text-xs font-bold text-white truncate">
              Kapasitas {targetActor.name} Cocok untuk Proyek Anda
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            Spesifikasi terverifikasi &amp; terbuka untuk jadwal kolaborasi mendatang.
          </p>
        </div>
      </div>

      {/* Right: Quick Action Buttons */}
      <div className="flex items-center gap-2.5 shrink-0">
        <Link
          href={`/messages?with=${targetActor.id}`}
          className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs font-semibold transition-colors border border-white/10 inline-flex items-center gap-1.5 active:scale-95"
        >
          <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
          <span>Chat</span>
        </Link>
        <button
          type="button"
          onClick={() => setIsBookingOpen(true)}
          className="btn-primary-pill !text-xs !py-2 !px-5 text-white font-semibold shadow-md shadow-[#4CC9FE]/25 cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
        >
          <Handshake className="w-3.5 h-3.5 text-white" />
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
