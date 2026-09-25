"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { updateBookingStatus } from "@/app/api/bookings/actions";

interface BookingStatusManagerProps {
  bookingId: string;
}

export function BookingStatusManager({ bookingId }: BookingStatusManagerProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleStatusUpdate(status: "ACCEPTED" | "DECLINED") {
    if (!confirm(`Apakah Anda yakin ingin ${status === "ACCEPTED" ? "menerima" : "menolak"} pesanan ini?`)) return;

    setIsLoading(true);
    const result = await updateBookingStatus(bookingId, status);
    
    setIsLoading(false);
    if (!result.success) {
      alert(result.error);
    }
  }

  return (
    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-stone-100">
      <button
        onClick={() => handleStatusUpdate("ACCEPTED")}
        disabled={isLoading}
        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E1B2E] hover:bg-black text-white text-[11px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
        Terima
      </button>
      <button
        onClick={() => handleStatusUpdate("DECLINED")}
        disabled={isLoading}
        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-red-50 text-stone-600 hover:text-red-600 border border-stone-200 text-[11px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
        Tolak
      </button>
    </div>
  );
}
