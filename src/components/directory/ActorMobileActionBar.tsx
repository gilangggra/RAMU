"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Handshake, MessageSquare } from "lucide-react";
import { BookingModal } from "./BookingModal";

interface ActorMobileActionBarProps {
  actor: {
    id: string;
    name: string;
    sector: string;
    actorType: string;
    avatarUrl?: string | null;
  };
  termsConfig?: any;
}

export function ActorMobileActionBar({
  actor,
  termsConfig,
}: ActorMobileActionBarProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const sectorLower = actor.sector.toLowerCase();
  const actorTypeUpper = (actor.actorType || "").toUpperCase();
  const isBrand =
    actorTypeUpper === "BRAND" ||
    actorTypeUpper === "MSME" ||
    actorTypeUpper === "COLLECTIVE" ||
    sectorLower.includes("brand") ||
    sectorLower.includes("label") ||
    sectorLower.includes("umkm");

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.07)] flex items-center justify-between gap-3">
        {/* Info Left */}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-900 truncate">{actor.name}</p>
          <p className="text-[10px] text-slate-500 truncate">
            {isBrand ? "Kebutuhan Terbuka" : "Alokasi Resource SPK"}
          </p>
        </div>

        {/* Action Buttons Right */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/messages?with=${actor.id}`}
            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors flex items-center justify-center cursor-pointer"
            title="Kirim Pesan Langsung"
          >
            <MessageSquare className="w-4 h-4 text-slate-600" />
          </Link>

          <button
            type="button"
            onClick={() => setIsBookingOpen(true)}
            className="btn-primary-pill !text-xs !py-2.5 !px-5 text-white font-bold flex items-center gap-1.5 shadow-md shadow-[#4CC9FE]/25 cursor-pointer active:scale-95"
          >
            <Handshake className="w-3.5 h-3.5 text-white" />
            <span>{isBrand ? "Ajukan Kemitraan" : "+ Kolaborasi"}</span>
          </button>
        </div>
      </div>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        targetId={actor.id}
        targetName={actor.name}
        targetSector={actor.sector}
        targetType={actor.actorType}
        termsConfig={termsConfig}
      />
    </>
  );
}
