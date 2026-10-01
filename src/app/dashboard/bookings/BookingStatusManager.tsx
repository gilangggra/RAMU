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
  const [confirmAction, setConfirmAction] = useState<"ACCEPTED" | "DECLINED" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successStatus, setSuccessStatus] = useState<"ACCEPTED" | "DECLINED" | null>(null);
  const router = useRouter();

  async function handleStatusUpdate(status: "ACCEPTED" | "DECLINED") {
    setIsLoading(true);
    setErrorMessage(null);

    const result = await updateBookingStatus(bookingId, status);

    setIsLoading(false);
    if (!result.success) {
      setErrorMessage(result.error || "Gagal memperbarui status.");
      setConfirmAction(null);
    } else {
      setSuccessStatus(status);
      setConfirmAction(null);
      router.refresh();
    }
  }

  if (successStatus === "ACCEPTED") {
    return (
      <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Pesanan Berhasil Diterima! Jadwal terkunci & SPK berlaku.</span>
        </div>
      </div>
    );
  }

  if (successStatus === "DECLINED") {
    return (
      <div className="mt-4 pt-4 border-t border-stone-100 flex items-center gap-2 p-3 rounded-xl bg-stone-100 text-stone-600 text-xs font-bold">
        <XCircle className="w-4 h-4 text-red-500" />
        <span>Pesanan telah ditolak.</span>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-stone-100 space-y-2">
      {errorMessage && (
        <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-800 font-bold ml-2">×</button>
        </div>
      )}

      {confirmAction ? (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-amber-950">
              {confirmAction === "ACCEPTED"
                ? "Konfirmasi Terima Pesanan?"
                : "Konfirmasi Tolak Pesanan?"}
            </div>
            <p className="text-[11px] text-amber-800 mt-0.5">
              {confirmAction === "ACCEPTED"
                ? "Dengan menerima, Anda menyetujui SPK dan jadwal kerja terkunci."
                : "Permintaan sewa ini akan dibatalkan."}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleStatusUpdate(confirmAction)}
              disabled={isLoading}
              className={`px-3.5 py-1.5 rounded-lg text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                confirmAction === "ACCEPTED" ? "bg-stone-900 hover:bg-black" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : confirmAction === "ACCEPTED" ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <XCircle className="w-3.5 h-3.5" />
              )}
              <span>{confirmAction === "ACCEPTED" ? "Ya, Terima" : "Ya, Tolak"}</span>
            </button>
            <button
              onClick={() => setConfirmAction(null)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setConfirmAction("ACCEPTED")}
            disabled={isLoading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E1B2E] hover:bg-black text-white text-[11px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Terima</span>
          </button>
          <button
            onClick={() => setConfirmAction("DECLINED")}
            disabled={isLoading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-red-50 text-stone-600 hover:text-red-600 border border-stone-200 text-[11px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50 cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Tolak</span>
          </button>
        </div>
      )}
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

import { SpkAgreementModal, BookingSpkData } from "@/components/bookings/SpkAgreementModal";
import { FileText, ShieldCheck } from "lucide-react";

interface ViewSpkButtonProps {
  booking: BookingSpkData;
}

export function ViewSpkButton({ booking }: ViewSpkButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors border border-stone-200 cursor-pointer"
        title="Buka Surat Perjanjian Kerja & Slip Pembayaran"
      >
        <FileText className="w-3.5 h-3.5 text-amber-700" />
        <span>Lihat SPK & Kesepakatan</span>
      </button>

      <SpkAgreementModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        booking={booking}
      />
    </>
  );
}

export function BookingMilestoneTracker({ status, dpPercentage = 50 }: { status: string; dpPercentage?: number }) {
  const isAccepted = status === "ACCEPTED";
  const isDeclined = status === "DECLINED";

  return (
    <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 space-y-2 mt-3">
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-stone-400">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          <span>Alur Proteksi Pembayaran RAMU</span>
        </span>
        <span className="font-mono text-[9px] text-stone-500">2-Tahap Aman</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">

        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
          <div className="text-[10px] font-bold">1. SPK & T&C</div>
          <div className="text-[9px] text-emerald-600">Disepakati</div>
        </div>

        <div
          className={`p-2 rounded-lg border ${
            isAccepted
              ? "bg-amber-50 border-amber-200 text-amber-900"
              : isDeclined
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-white border-stone-200 text-stone-600"
          }`}
        >
          <div className="text-[10px] font-bold">2. DP {dpPercentage}%</div>
          <div className="text-[9px]">
            {isAccepted ? "Kunci Jadwal" : isDeclined ? "Dibatalkan" : "Menunggu Konfirmasi"}
          </div>
        </div>

        <div className="p-2 rounded-lg bg-white border border-stone-200 text-stone-500">
          <div className="text-[10px] font-bold">3. Pelunasan {100 - dpPercentage}%</div>
          <div className="text-[9px]">Serah Terima Aset</div>
        </div>
      </div>
    </div>
  );
}
