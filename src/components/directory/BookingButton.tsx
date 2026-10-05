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
  termsConfig?: any;
}

export function BookingButton({ targetId, targetName, targetSector, targetType, label, termsConfig }: BookingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer group"
      >
        <PlusCircle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
        <span>{label || "Booking Request"}</span>
      </button>

      <BookingModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        targetId={targetId}
        targetName={targetName}
        targetSector={targetSector}
        targetType={targetType}
        termsConfig={termsConfig}
      />
    </>
  );
}
