"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { BookingModal } from "./BookingModal";

interface BookingButtonProps {
  targetId: string;
  targetName: string;
  targetSector: string;
  targetType: string;
  label?: string;
}

export function BookingButton({ targetId, targetName, targetSector, targetType, label }: BookingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-8 py-3 bg-[#1E1B2E] hover:bg-black text-white text-[11px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
      >
        <PlusCircle className="w-4 h-4" />
        <span>{label || "Booking Request"}</span>
      </button>

      <BookingModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        targetId={targetId}
        targetName={targetName}
        targetSector={targetSector}
        targetType={targetType}
      />
    </>
  );
}
