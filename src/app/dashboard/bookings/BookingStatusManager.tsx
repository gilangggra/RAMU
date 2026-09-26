"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, Handshake, MessageCircle, Mail, ExternalLink } from "lucide-react";
import { updateBookingStatus, convertBookingToCollaboration } from "@/app/api/bookings/actions";

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
        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E1B2E] hover:bg-black text-white text-[11px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50 cursor-pointer"
      >
        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
        Terima
      </button>
      <button
        onClick={() => handleStatusUpdate("DECLINED")}
        disabled={isLoading}
        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-red-50 text-stone-600 hover:text-red-600 border border-stone-200 text-[11px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50 cursor-pointer"
      >
        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
        Tolak
      </button>
    </div>
  );
}

interface ConvertBookingButtonProps {
  bookingId: string;
  collaborationId?: string | null;
}

export function ConvertBookingButton({ bookingId, collaborationId }: ConvertBookingButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (collaborationId) {
    return (
      <Link
        href={`/collaborations/${collaborationId}`}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs shadow-xs transition-colors"
      >
        <Handshake className="w-3.5 h-3.5" />
        <span>Buka Ruang Kolaborasi</span>
        <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
      </Link>
    );
  }

  async function handleConvert() {
    setIsLoading(true);
    try {
      const res = await convertBookingToCollaboration(bookingId);
      if (res.success && res.collaborationId) {
        router.push(`/collaborations/${res.collaborationId}`);
      } else {
        alert(res.error || "Gagal membuka ruang kolaborasi.");
      }
    } catch {
      alert("Terjadi kesalahan teknis.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleConvert}
      disabled={isLoading}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E1B2E] hover:bg-black text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Mempersiapkan Workspace...</span>
        </>
      ) : (
        <>
          <Handshake className="w-3.5 h-3.5 text-amber-400" />
          <span>Inisiasi Ruang Kolaborasi Resmi</span>
        </>
      )}
    </button>
  );
}

interface BookingContactActionsProps {
  phone?: string | null;
  email?: string | null;
  contactName: string;
  myRole: "requester" | "target";
}

export function BookingContactActions({ phone, email, contactName, myRole }: BookingContactActionsProps) {
  const defaultText = myRole === "target"
    ? `Halo ${contactName}, saya menerima pesanan booking Anda melalui RAMU. Mari kita koordinasikan jadwal dan teknis produksinya.`
    : `Halo ${contactName}, saya telah mengajukan booking layanan melalui RAMU. Mohon konfirmasi jadwal dan teknis pembayarannya.`;

  let waUrl = null;
  if (phone) {
    let clean = phone.replace(/[^0-9]/g, "");
    if (clean.startsWith("0")) {
      clean = "62" + clean.slice(1);
    }
    waUrl = `https://wa.me/${clean}?text=${encodeURIComponent(defaultText)}`;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      {waUrl && (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors border border-emerald-200"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </a>
      )}
      {email && (
        <a
          href={`mailto:${email}?subject=${encodeURIComponent("Konfirmasi Pesanan RAMU: " + contactName)}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors border border-stone-200"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Email</span>
        </a>
      )}
    </div>
  );
}

