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
  bookedDates?: string[];
}

export function BookingButton({ targetId, targetName, targetSector, targetType, label, termsConfig, bookedDates = [] }: BookingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="btn-primary-pill !text-xs !py-2.5 !px-6 shadow-md shadow-[#4CC9FE]/20 flex items-center gap-2 cursor-pointer group active:scale-95"
      >
        <PlusCircle className="w-4 h-4 text-white group-hover:rotate-90 transition-transform" />
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
        bookedDates={bookedDates}
      />
    </>
  );
}
