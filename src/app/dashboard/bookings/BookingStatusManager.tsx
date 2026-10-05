"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Handshake,
  MessageCircle,
  MessageSquare,
  Mail,
  ExternalLink,
  FileText,
  ShieldCheck,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import { updateBookingStatus, convertBookingToCollaboration } from "@/app/api/bookings/actions";
import { SpkAgreementModal, BookingSpkData } from "@/components/bookings/SpkAgreementModal";

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
      <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200/80 text-emerald-800 text-xs font-medium flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Pesanan berhasil diterima. Kontrak kerja (SPK) resmi aktif.</span>
      </div>
    );
  }

  if (successStatus === "DECLINED") {
    return (
      <div className="p-2.5 rounded-lg bg-stone-100 text-stone-600 border border-stone-200/70 text-xs font-medium flex items-center gap-2">
        <XCircle className="w-4 h-4 text-stone-400 shrink-0" />
        <span>Pesanan telah ditolak.</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {errorMessage && (
        <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-800 font-bold ml-2">×</button>
        </div>
      )}

      {confirmAction ? (
        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-semibold text-stone-900">
              {confirmAction === "ACCEPTED" ? "Konfirmasi Terima Pesanan?" : "Konfirmasi Tolak Pesanan?"}
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {confirmAction === "ACCEPTED"
                ? "Dengan menerima, jadwal terkunci dan Kontrak SPK resmi mengikat kedua pihak."
                : "Permintaan pemesanan ini akan dibatalkan."}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleStatusUpdate(confirmAction)}
              disabled={isLoading}
              className={`px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                confirmAction === "ACCEPTED" ? "bg-stone-900 hover:bg-black" : "bg-rose-600 hover:bg-rose-700"
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
              className="px-3 py-1.5 rounded-lg bg-white border border-stone-200/80 text-stone-700 text-xs font-medium hover:bg-stone-50 transition-colors cursor-pointer shadow-2xs"
            >
              Batal
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setConfirmAction("ACCEPTED")}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-black text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Terima Pesanan</span>
          </button>
          <button
            onClick={() => setConfirmAction("DECLINED")}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-600 hover:text-rose-600 border border-stone-200/80 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
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
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-black text-white font-semibold text-xs shadow-2xs transition-colors"
      >
        <Handshake className="w-3.5 h-3.5 text-stone-300" />
        <span>Buka Ruang Kolaborasi</span>
        <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
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
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs border border-stone-200/80 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Mempersiapkan Workspace...</span>
        </>
      ) : (
        <>
          <Handshake className="w-3.5 h-3.5 text-stone-500" />
          <span>Inisiasi Ruang Kolaborasi</span>
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
  partnerActorId?: string | null;
}

export function BookingContactActions({ phone, email, contactName, myRole, partnerActorId }: BookingContactActionsProps) {
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
    <div className="flex flex-wrap items-center gap-1.5">
      {partnerActorId && (
        <Link
          href={`/messages?with=${partnerActorId}`}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-black text-white text-xs font-medium transition-colors shadow-2xs"
        >
          <MessageSquare className="w-3 h-3 text-stone-300" />
          <span>Chat Resmi RAMU</span>
        </Link>
      )}
      {waUrl && (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium border border-stone-200/80 transition-colors shadow-2xs"
          title="Gunakan WhatsApp untuk koordinasi on-set di hari pelaksanaan"
        >
          <MessageCircle className="w-3 h-3 text-emerald-600" />
          <span>WhatsApp (On-Set)</span>
        </a>
      )}
      {email && (
        <a
          href={`mailto:${email}?subject=${encodeURIComponent("Konfirmasi Pesanan RAMU: " + contactName)}`}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium border border-stone-200/80 transition-colors shadow-2xs"
        >
          <Mail className="w-3 h-3 text-stone-400" />
          <span>Email</span>
        </a>
      )}
    </div>
  );
}

interface ViewSpkButtonProps {
  booking: BookingSpkData;
}

export function ViewSpkButton({ booking }: ViewSpkButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 text-xs font-semibold border border-stone-200/80 shadow-2xs transition-colors cursor-pointer"
        title="Buka Surat Perjanjian Kerja & Lembar Kesepakatan Resmi"
      >
        <FileText className="w-3.5 h-3.5 text-stone-500" />
        <span>Lihat SPK Resmi</span>
      </button>

      <SpkAgreementModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        booking={booking}
      />
    </>
  );
}

interface BookingMilestoneTrackerProps {
  status: string;
  dpPercentage?: number;
  collaborationId?: string | null;
}

export function BookingMilestoneTracker({
  status,
  dpPercentage = 50,
  collaborationId,
}: BookingMilestoneTrackerProps) {
  const isAccepted = status === "ACCEPTED";
  const isDeclined = status === "DECLINED";
  const hasCollab = Boolean(collaborationId);

  return (
    <div className="p-3 bg-stone-50/80 rounded-xl border border-stone-200/70 space-y-2">
      <div className="flex items-center justify-between text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
          <span>Tahapan Transaksi &amp; SPK Terverifikasi</span>
        </span>
        <span className="font-mono text-[9px] text-stone-400 font-medium">Standar Ekosistem RAMU</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        {/* Step 1: Kontrak */}
        <div className="p-2 rounded-lg bg-white border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-stone-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>1. Kontrak SPK</span>
          </div>
          <div className="text-[10px] text-stone-500 mt-0.5 font-medium">Disahkan Digital</div>
        </div>

        {/* Step 2: DP / Jadwal */}
        <div
          className={`p-2 rounded-lg border transition-all ${
            hasCollab || isAccepted
              ? "bg-white border-stone-200/80 shadow-2xs"
              : isDeclined
              ? "bg-stone-100 text-stone-400 border-stone-200/60"
              : "bg-white/60 border-stone-200/60 text-stone-400"
          }`}
        >
          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-stone-800">
            {hasCollab || isAccepted ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            ) : (
              <span className="w-3 h-3 rounded-full bg-stone-200 text-stone-600 text-[8px] flex items-center justify-center font-bold">2</span>
            )}
            <span>2. Jadwal &amp; DP</span>
          </div>
          <div className="text-[10px] text-stone-500 mt-0.5 font-medium">
            {hasCollab || isAccepted ? "Terkunci & Aktif" : isDeclined ? "Dibatalkan" : "Menunggu Konfirmasi"}
          </div>
        </div>

        {/* Step 3: Workspace & Pelunasan */}
        <div
          className={`p-2 rounded-lg border transition-all ${
            hasCollab
              ? "bg-stone-900 text-white border-stone-900 shadow-2xs"
              : "bg-white/60 border-stone-200/60 text-stone-400"
          }`}
        >
          <div className={`flex items-center justify-center gap-1 text-[11px] font-semibold ${hasCollab ? "text-white" : "text-stone-700"}`}>
            {hasCollab ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ) : (
              <span className="w-3 h-3 rounded-full bg-stone-200 text-stone-600 text-[8px] flex items-center justify-center font-bold">3</span>
            )}
            <span>3. Workspace</span>
          </div>
          <div className={`text-[10px] mt-0.5 font-medium ${hasCollab ? "text-stone-300" : "text-stone-400"}`}>
            {hasCollab ? "Tugas & Serah Terima" : "Pelunasan & Luaran"}
          </div>
        </div>
      </div>
    </div>
  );
}
