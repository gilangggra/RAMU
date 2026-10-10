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
  Calendar,
  Clock,
  CircleDollarSign,
  AlertTriangle,
  X,
  RotateCcw,
  CreditCard,
} from "lucide-react";
import {
  updateBookingStatus,
  convertBookingToCollaboration,
  cancelBookingRequestAction,
  rescheduleBookingRequestAction,
  completeBookingRequestAction,
  reportBookingDisputeAction,
} from "@/app/api/bookings/actions";
import { SpkAgreementModal, BookingSpkData } from "@/components/bookings/SpkAgreementModal";
import { BookingInvoiceModal } from "@/components/bookings/BookingInvoiceModal";
import { BookingCallSheetModal } from "@/components/bookings/BookingCallSheetModal";
import { toast } from "@/components/ui/Toast";
import { CurrencyInput } from "@/components/ui/CurrencyInput";

function toDateInputValue(dateInput?: string | Date | null): string {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

// ==========================================
// 1. RESCHEDULE MODAL
// ==========================================
export interface BookingRescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  currentStartDate: string | Date;
  currentEndDate?: string | Date | null;
  currentBudget?: string | null;
  partnerName: string;
}

export function BookingRescheduleModal({
  isOpen,
  onClose,
  bookingId,
  currentStartDate,
  currentEndDate,
  currentBudget,
  partnerName,
}: BookingRescheduleModalProps) {
  const router = useRouter();
  const [startDate, setStartDate] = useState(toDateInputValue(currentStartDate));
  const [endDate, setEndDate] = useState(toDateInputValue(currentEndDate));
  const [budget, setBudget] = useState(currentBudget || "");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!startDate) {
      setErrorMessage("Silakan tentukan tanggal mulai pelaksanaan yang baru.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await rescheduleBookingRequestAction({
      bookingId,
      startDate,
      endDate: endDate || undefined,
      budget: budget.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setIsLoading(false);
    if (!res.success) {
      setErrorMessage(res.error || "Gagal mengajukan reschedule.");
    } else {
      toast.success("Pengajuan penyesuaian jadwal berhasil dikirim!");
      onClose();
      router.refresh();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200/90 rounded-[22px] shadow-2xl max-w-lg w-full overflow-hidden space-y-0">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between bg-sky-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-[#0284c7] flex items-center justify-center shrink-0 border border-sky-200/60 shadow-2xs">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0f172a] leading-tight">
                Ajukan Penyesuaian Jadwal (Reschedule SPK)
              </h3>
              <p className="text-[11px] text-[#475569] mt-0.5">
                Usulkan jadwal baru kepada <span className="font-bold text-[#0f172a]">{partnerName}</span>.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-500 hover:text-rose-800 font-bold ml-2 cursor-pointer"
              >
                ×
              </button>
            </div>
          )}

          {/* Current schedule reminder */}
          <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-center gap-2.5 text-slate-600">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="text-[11px]">
              <span className="text-slate-400">Jadwal saat ini: </span>
              <span className="font-bold text-[#0f172a]">
                {new Date(currentStartDate).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Date Picker Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Tanggal Mulai Baru <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                min={todayStr}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-[#4CC9FE]/20 focus:border-[#4CC9FE] focus:outline-hidden transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Tanggal Selesai (Opsional)
              </label>
              <input
                type="date"
                min={startDate || todayStr}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-[#4CC9FE]/20 focus:border-[#4CC9FE] focus:outline-hidden transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Budget adjustment */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              Penyesuaian Anggaran (Opsional)
            </label>
            <div className="relative">
              <CircleDollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 z-10 pointer-events-none" />
              <CurrencyInput
                value={budget}
                onChange={(val) => setBudget(val)}
                placeholder="Rp 2.500.000"
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-[#4CC9FE]/20 focus:border-[#4CC9FE] focus:outline-hidden transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Notes textarea */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              Alasan / Catatan Penyesuaian
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Mohon izin geser jadwal karena bentrok agenda studio, terima kasih..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-[#4CC9FE]/20 focus:border-[#4CC9FE] focus:outline-hidden resize-none transition-all shadow-2xs"
            />
          </div>

          {/* Legal / Process notice */}
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Pengajuan ini akan mengembalikan status ke peninjauan ulang dan mengirimkan pemberitahuan resmi kepada mitra untuk disetujui.
          </p>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading || !startDate}
              className="btn-primary-pill !text-xs !py-2 !px-5 text-white font-semibold shadow-md shadow-[#4CC9FE]/25 cursor-pointer flex items-center gap-1.5 disabled:opacity-50 active:scale-95 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Calendar className="w-3.5 h-3.5 text-white" />
                  <span>Kirim Pengajuan Reschedule</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 2. CANCEL BOOKING MODAL
// ==========================================
export interface BookingCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  partnerName: string;
  refCode: string;
}

export function BookingCancelModal({
  isOpen,
  onClose,
  bookingId,
  partnerName,
  refCode,
}: BookingCancelModalProps) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleConfirmCancel() {
    setIsLoading(true);
    setErrorMessage(null);

    const res = await cancelBookingRequestAction(bookingId, reason.trim() || undefined);

    setIsLoading(false);
    if (!res.success) {
      setErrorMessage(res.error || "Gagal membatalkan pengajuan.");
    } else {
      toast.success("Pengajuan kerja sama berhasil dibatalkan.");
      onClose();
      router.refresh();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200/90 rounded-[22px] shadow-2xl max-w-md w-full overflow-hidden space-y-0">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-rose-100 flex items-start justify-between bg-rose-50/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200/70 shadow-2xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0f172a] leading-tight">
                Batalkan Pengajuan Kolaborasi SPK?
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                {refCode}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-500 hover:text-rose-800 font-bold ml-2 cursor-pointer"
              >
                ×
              </button>
            </div>
          )}

          <p className="text-[#475569] leading-relaxed">
            Kerja sama dengan <span className="font-bold text-[#0f172a]">{partnerName}</span> akan dibatalkan. Riwayat pembatalan akan disimpan secara transparan untuk menjaga keandalan ekosistem.
          </p>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              Alasan Pembatalan (Opsional)
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Perubahan agenda pemotretan / sudah menemukan alternatif jadwal..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-hidden resize-none transition-all shadow-2xs"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={handleConfirmCancel}
              disabled={isLoading}
              className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Membatalkan...</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5 text-white" />
                  <span>Ya, Batalkan Pengajuan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. TARGET STATUS MANAGER (TERIMA / RESCHEDULE / TOLAK)
// ==========================================
interface BookingStatusManagerProps {
  bookingId: string;
  partnerName?: string;
  refCode?: string;
  currentStartDate?: string | Date;
  currentEndDate?: string | Date | null;
  currentBudget?: string | null;
}

export function BookingStatusManager({
  bookingId,
  partnerName = "Pemesan",
  refCode = "SPK",
  currentStartDate,
  currentEndDate,
  currentBudget,
}: BookingStatusManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"ACCEPTED" | "DECLINED" | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
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
      toast.success(status === "ACCEPTED" ? "Kolaborasi berhasil disetujui!" : "Pengajuan kolaborasi ditolak.");
      router.refresh();
    }
  }

  if (successStatus === "ACCEPTED") {
    return (
      <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-2xs">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Kolaborasi berhasil diterima. Kontrak kerja (SPK) resmi aktif.</span>
      </div>
    );
  }

  if (successStatus === "DECLINED") {
    return (
      <div className="p-3 rounded-2xl bg-slate-100 text-slate-600 border border-slate-200/70 text-xs font-semibold flex items-center gap-2 shadow-2xs">
        <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
        <span>Pengajuan kolaborasi telah ditolak.</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-800 font-bold ml-2 cursor-pointer">×</button>
        </div>
      )}

      {confirmAction ? (
        <div className="p-3.5 rounded-2xl bg-white/70 backdrop-blur-md border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div>
            <div className="font-bold text-[#0f172a]">
              {confirmAction === "ACCEPTED" ? "Konfirmasi Terima Kolaborasi?" : "Konfirmasi Tolak Pengajuan?"}
            </div>
            <p className="text-[11px] text-[#475569] mt-0.5">
              {confirmAction === "ACCEPTED"
                ? "Dengan menerima, jadwal terkunci dan Kontrak SPK resmi mengikat kedua pihak."
                : "Permintaan kolaborasi ini akan dibatalkan."}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleStatusUpdate(confirmAction)}
              disabled={isLoading}
              className={`px-4.5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                confirmAction === "ACCEPTED"
                  ? "btn-primary-pill text-white shadow-md shadow-[#4CC9FE]/25"
                  : "bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              ) : confirmAction === "ACCEPTED" ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-white" />
              )}
              <span>{confirmAction === "ACCEPTED" ? "Ya, Terima" : "Ya, Tolak"}</span>
            </button>
            <button
              onClick={() => setConfirmAction(null)}
              disabled={isLoading}
              className="px-4 py-2 rounded-full bg-white border border-slate-200/80 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            >
              Batal
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {/* Primary Action Button (Project Blue + White Text) */}
          <button
            onClick={() => setConfirmAction("ACCEPTED")}
            disabled={isLoading}
            className="btn-primary-pill !text-xs !py-2 !px-4.5 text-white font-semibold shadow-md shadow-[#4CC9FE]/25 inline-flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            <span>Terima Kolaborasi</span>
          </button>

          {currentStartDate && (
            <button
              onClick={() => setShowRescheduleModal(true)}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full bg-white/80 hover:bg-white hover:text-[#0284c7] text-slate-700 border border-white/80 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
              title="Ajukan alternatif tanggal jika jadwal ini bentrok"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Usul Tanggal Lain</span>
            </button>
          )}

          <button
            onClick={() => setConfirmAction("DECLINED")}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full bg-white/80 hover:bg-white hover:text-rose-600 text-slate-600 border border-white/80 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Tolak</span>
          </button>
        </div>
      )}

      {currentStartDate && (
        <BookingRescheduleModal
          isOpen={showRescheduleModal}
          onClose={() => setShowRescheduleModal(false)}
          bookingId={bookingId}
          currentStartDate={currentStartDate}
          currentEndDate={currentEndDate}
          currentBudget={currentBudget}
          partnerName={partnerName}
        />
      )}
    </div>
  );
}

// ==========================================
// 4. REQUESTER ACTIONS (RESCHEDULE & CANCEL)
// ==========================================
export interface BookingRequesterActionsProps {
  bookingId: string;
  partnerName: string;
  refCode: string;
  currentStartDate: string | Date;
  currentEndDate?: string | Date | null;
  currentBudget?: string | null;
}

export function BookingRequesterActions({
  bookingId,
  partnerName,
  refCode,
  currentStartDate,
  currentEndDate,
  currentBudget,
}: BookingRequesterActionsProps) {
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setShowReschedule(true)}
          className="btn-primary-pill !text-xs !py-2 !px-4 text-white font-semibold shadow-md shadow-[#4CC9FE]/25 inline-flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
        >
          <Calendar className="w-3.5 h-3.5 text-white" />
          <span>Ajukan Reschedule</span>
        </button>
        <button
          onClick={() => setShowCancel(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/80 hover:bg-white hover:text-rose-600 text-slate-600 border border-white/80 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Batalkan Pengajuan</span>
        </button>
      </div>

      <BookingRescheduleModal
        isOpen={showReschedule}
        onClose={() => setShowReschedule(false)}
        bookingId={bookingId}
        currentStartDate={currentStartDate}
        currentEndDate={currentEndDate}
        currentBudget={currentBudget}
        partnerName={partnerName}
      />

      <BookingCancelModal
        isOpen={showCancel}
        onClose={() => setShowCancel(false)}
        bookingId={bookingId}
        partnerName={partnerName}
        refCode={refCode}
      />
    </div>
  );
}

// ==========================================
// 5. CONVERT TO COLLABORATION BUTTON
// ==========================================
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
        className="btn-primary-pill !text-xs !py-2 !px-4.5 text-white font-semibold shadow-md shadow-[#4CC9FE]/25 inline-flex items-center gap-1.5 active:scale-95 transition-all"
      >
        <Handshake className="w-3.5 h-3.5 text-white" />
        <span>Buka Workspace Kolaborasi</span>
        <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
      </Link>
    );
  }

  async function handleConvert() {
    setIsLoading(true);
    try {
      const res = await convertBookingToCollaboration(bookingId);
      if (res.success && res.collaborationId) {
        toast.success("Workspace kolaborasi berhasil dibuka!");
        router.push(`/collaborations/${res.collaborationId}`);
      } else {
        toast.error(res.error || "Gagal membuka workspace kolaborasi.");
      }
    } catch {
      toast.error("Terjadi kesalahan teknis saat membuka workspace kolaborasi.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleConvert}
      disabled={isLoading}
      className="btn-primary-pill !text-xs !py-2 !px-4.5 text-white font-semibold shadow-md shadow-[#4CC9FE]/25 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95 transition-all"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
          <span>Mempersiapkan Workspace...</span>
        </>
      ) : (
        <>
          <Handshake className="w-3.5 h-3.5 text-white" />
          <span>Buka Workspace Kolaborasi</span>
        </>
      )}
    </button>
  );
}

// ==========================================
// 5B. COMPLETE BOOKING BUTTON & MODAL
// ==========================================
export interface CompleteBookingButtonProps {
  bookingId: string;
  partnerName: string;
  refCode: string;
}

export function CompleteBookingButton({
  bookingId,
  partnerName,
  refCode,
}: CompleteBookingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleConfirm() {
    setIsLoading(true);
    try {
      const res = await completeBookingRequestAction(bookingId, notes);
      if (res.success) {
        toast.success("Kolaborasi berhasil diselesaikan!");
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Gagal menyelesaikan kolaborasi.");
      }
    } catch {
      toast.error("Terjadi kesalahan teknis.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
        title="Tandai pekerjaan tuntas dan terbitkan konfirmasi pemenuhan SPK"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
        <span>Selesaikan Proyek &amp; Tuntaskan SPK</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-[22px] shadow-2xl max-w-md w-full overflow-hidden space-y-0">
            <div className="p-5 sm:p-6 border-b border-emerald-100 flex items-start justify-between bg-emerald-50/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200/80 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0f172a] leading-tight">
                    Konfirmasi Penyelesaian Kolaborasi?
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{refCode}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 text-xs">
              <p className="text-[#475569] leading-relaxed">
                Menandai kolaborasi bersama <strong className="text-[#0f172a]">{partnerName}</strong> sebagai selesai mengonfirmasi bahwa deliverables (hasil karya / layanan) telah diterima dan kewajiban SPK telah terpenuhi.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Catatan Penyelesaian (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Seluruh file master telah diterima dalam kondisi baik..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-none transition-all shadow-2xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Menyelesaikan...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      <span>Ya, Konfirmasi Selesai</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ==========================================
// 6. CONTACT ACTIONS
// ==========================================
interface BookingContactActionsProps {
  phone?: string | null;
  email?: string | null;
  contactName: string;
  myRole: "requester" | "target";
  partnerActorId?: string | null;
  bookingRefCode?: string | null;
  bookingId?: string | null;
}

export function BookingContactActions({
  phone,
  email,
  contactName,
  myRole,
  partnerActorId,
  bookingRefCode,
  bookingId,
}: BookingContactActionsProps) {
  const refText = bookingRefCode ? ` [${bookingRefCode}]` : "";
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://ramu-gamma.vercel.app";
  const linkText = bookingId ? ` Tinjau draf SPK & jadwal resmi: ${baseUrl}/dashboard/bookings/${bookingId}` : "";

  const defaultText = myRole === "target"
    ? `Halo ${contactName}, saya menerima pengajuan kolaborasi Anda melalui platform RAMU${refText}.${linkText} Mari kita koordinasikan teknis produksi dan jadwalnya.`
    : `Halo ${contactName}, saya telah mengajukan kolaborasi resmi melalui platform RAMU${refText}.${linkText} Mohon konfirmasi jadwal dan pelaksanaan teknisnya.`;

  let waUrl = null;
  if (phone) {
    let clean = phone.replace(/[^0-9]/g, "");
    if (clean.startsWith("0")) {
      clean = "62" + clean.slice(1);
    }
    waUrl = `https://wa.me/${clean}?text=${encodeURIComponent(defaultText)}`;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {partnerActorId && (
        <Link
          href={`/messages?with=${partnerActorId}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white hover:text-[#0284c7] text-[#0f172a] text-xs font-semibold border border-white/80 transition-all shadow-xs"
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#0284c7]" />
          <span>Chat Resmi RAMU</span>
        </Link>
      )}
      {waUrl && (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white hover:text-emerald-700 text-[#0f172a] text-xs font-semibold border border-white/80 transition-all shadow-xs"
          title="Gunakan WhatsApp untuk koordinasi on-set di hari pelaksanaan"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>WhatsApp (On-Set)</span>
        </a>
      )}
      {email && (
        <a
          href={`mailto:${email}?subject=${encodeURIComponent("Konfirmasi Kolaborasi RAMU: " + contactName)}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-slate-700 text-xs font-semibold border border-white/80 transition-all shadow-xs"
        >
          <Mail className="w-3.5 h-3.5 text-slate-400" />
          <span>Email</span>
        </a>
      )}
    </div>
  );
}

// ==========================================
// 7. VIEW SPK BUTTON
// ==========================================
interface ViewSpkButtonProps {
  booking: BookingSpkData;
}

export function ViewSpkButton({ booking }: ViewSpkButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white hover:text-[#0284c7] text-[#0f172a] text-xs font-semibold border border-white/80 shadow-xs transition-all cursor-pointer"
        title="Buka Surat Perjanjian Kerja & Lembar Kesepakatan Resmi"
      >
        <FileText className="w-3.5 h-3.5 text-slate-500" />
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

// ==========================================
// 7B. VIEW INVOICE & KWITANSI BUTTON
// ==========================================
interface ViewInvoiceButtonProps {
  booking: BookingSpkData;
}

export function ViewInvoiceButton({ booking }: ViewInvoiceButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white hover:text-[#0284c7] text-[#0f172a] text-xs font-semibold border border-white/80 shadow-xs transition-all cursor-pointer"
        title="Buka Faktur Invoice DP, Invoice Pelunasan, atau Kwitansi Tanda Terima Resmi"
      >
        <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
        <span>Invoice &amp; Kwitansi</span>
      </button>

      <BookingInvoiceModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        booking={booking}
      />
    </>
  );
}

// ==========================================
// 7C. VIEW CALL SHEET & RUNDOWN BUTTON
// ==========================================
interface ViewCallSheetButtonProps {
  booking: BookingSpkData;
}

export function ViewCallSheetButton({ booking }: ViewCallSheetButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white hover:text-[#0284c7] text-[#0f172a] text-xs font-semibold border border-white/80 shadow-xs transition-all cursor-pointer"
        title="Buka Lembar Panggilan Kerja On-Set, Rundown Jam Divisi & Siaran WhatsApp"
      >
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        <span>Lembar Call Sheet</span>
      </button>

      <BookingCallSheetModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        booking={booking}
      />
    </>
  );
}

// ==========================================
// 8. MILESTONE PIPELINE TRACKER
// ==========================================
interface BookingMilestoneTrackerProps {
  status: string;
  dpPercentage?: number;
  collaborationId?: string | null;
}

export function BookingMilestoneTracker({
  status,
  collaborationId,
}: BookingMilestoneTrackerProps) {
  const isCompleted = status === "COMPLETED";
  const isAccepted = status === "ACCEPTED";
  const isDeclined = status === "DECLINED";
  const isCancelled = status === "CANCELLED";
  const isNegotiating = status === "NEGOTIATING";
  const hasCollab = Boolean(collaborationId);

  return (
    <div className="p-3.5 bg-white/50 backdrop-blur-md rounded-2xl border border-slate-200/60 space-y-2.5">
      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0284c7]" />
          <span>Tahapan Transaksi &amp; SPK Terverifikasi</span>
        </span>
        <span className="font-mono text-[9px] text-slate-400 font-semibold">Standar Ekosistem RAMU</span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
        {/* Step 1: Kontrak */}
        <div className={`p-2.5 rounded-xl border shadow-2xs transition-all ${isCancelled ? "bg-slate-100 text-slate-400 border-slate-200/60" : "bg-white border-slate-200/80"}`}>
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-800">
            <CheckCircle2 className={`w-3 h-3 ${isCancelled ? "text-slate-400" : "text-emerald-600"}`} />
            <span>1. Kontrak SPK</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
            {isCancelled ? "Dibatalkan" : "Disahkan Digital"}
          </div>
        </div>

        {/* Step 2: DP / Jadwal */}
        <div
          className={`p-2.5 rounded-xl border transition-all ${
            isCompleted || hasCollab || isAccepted
              ? "bg-white border-slate-200/80 shadow-2xs"
              : isDeclined || isCancelled
              ? "bg-slate-100 text-slate-400 border-slate-200/60"
              : isNegotiating
              ? "bg-sky-50 border-[#4CC9FE]/40 text-[#0284c7] shadow-2xs"
              : "bg-white/60 border-slate-200/60 text-slate-400"
          }`}
        >
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-800">
            {isCompleted || hasCollab || isAccepted ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            ) : isCancelled ? (
              <XCircle className="w-3 h-3 text-rose-500" />
            ) : (
              <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-600 text-[8px] flex items-center justify-center font-bold">2</span>
            )}
            <span>2. Jadwal &amp; DP</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
            {isCompleted
              ? "Tuntas Terlaksana"
              : hasCollab || isAccepted
              ? "Terkunci & Aktif"
              : isCancelled
              ? "Dibatalkan"
              : isDeclined
              ? "Ditolak"
              : isNegotiating
              ? "Meninjau Jadwal"
              : "Menunggu Konfirmasi"}
          </div>
        </div>

        {/* Step 3: Workspace & Pelunasan */}
        {hasCollab ? (
          <Link
            href={`/collaborations/${collaborationId}`}
            className={`p-2.5 rounded-xl border transition-all shadow-2xs hover:scale-[1.01] cursor-pointer block ${
              isCompleted
                ? "bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100"
                : "btn-primary-pill !rounded-xl !p-2.5 text-white"
            }`}
            title="Buka Ruang Kerja Kolaborasi Resmi"
          >
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold">
              <CheckCircle2 className="w-3 h-3 text-white" />
              <span>3. Workspace</span>
              <ArrowUpRight className="w-2.5 h-2.5 opacity-80" />
            </div>
            <div className="text-[10px] mt-0.5 font-medium text-center text-white/90">
              {isCompleted ? "Selesai & Diarsipkan" : "Tugas & Serah Terima"}
            </div>
          </Link>
        ) : isCompleted ? (
          <div className="p-2.5 rounded-xl border transition-all bg-emerald-50 border-emerald-200 text-emerald-900 shadow-2xs">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-900">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>3. Tuntas</span>
            </div>
            <div className="text-[10px] mt-0.5 font-medium text-emerald-700 text-center">
              Pelunasan &amp; Selesai
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl border transition-all bg-white/60 border-slate-200/60 text-slate-400">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-700">
              <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-600 text-[8px] flex items-center justify-center font-bold">3</span>
              <span>3. Workspace</span>
            </div>
            <div className="text-[10px] mt-0.5 font-medium text-slate-400 text-center">
              {isCancelled ? "Tidak Dilanjutkan" : "Pelunasan & Luaran"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 9. REPORT DISPUTE BUTTON & MODAL
// ==========================================
export interface ReportDisputeButtonProps {
  bookingId: string;
  partnerName: string;
  refCode: string;
}

export function ReportDisputeButton({
  bookingId,
  partnerName,
  refCode,
}: ReportDisputeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState("PAYMENT_BREACH");
  const [reason, setReason] = useState("");
  const [resolution, setResolution] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleReport(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Alasan kendala wajib dijelaskan.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await reportBookingDisputeAction({
        bookingId,
        category,
        reason,
        requestedResolution: resolution,
      });
      if (res.success) {
        toast.success("Pengajuan mediasi berhasil dikirim. Tim kepatuhan RAMU akan meninjau.");
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Gagal mengajukan mediasi.");
      }
    } catch {
      toast.error("Terjadi kesalahan teknis saat mengirim laporan.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/90 font-semibold text-xs transition-colors cursor-pointer"
        title="Laporkan kendala pembayaran, batas revisi, atau pelaksanaan untuk mediasi resmi RAMU"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        <span>Laporkan Kendala &amp; Ajukan Mediasi</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-[22px] shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-amber-100 flex items-start justify-between bg-amber-50/70">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200 shadow-2xs">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0f172a] leading-tight">
                    Pusat Mediasi Sengketa SPK RAMU
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{refCode}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReport} className="p-5 sm:p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 leading-relaxed">
                Pengajuan ini akan dicatat dalam audit trail RAMU dan diteruskan kepada mitra Anda (<strong className="text-[#0f172a]">{partnerName}</strong>) serta tim kepatuhan untuk fasilitasi musyawarah mufakat sesuai Pasal 8 SPK.
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Kategori Kendala *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-medium focus:outline-hidden focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 cursor-pointer shadow-2xs"
                >
                  <option value="PAYMENT_BREACH">Kendala Finansial / Pelunasan Terlambat / DP Macet</option>
                  <option value="NO_SHOW">Ketidakhadiran di Lokasi (No-Show)</option>
                  <option value="QUALITY_MISMATCH">Perbedaan Pemahaman Hasil Kerja / Sengketa Batas Revisi</option>
                  <option value="SAMPLE_DAMAGE">Kerusakan Busana Sampel / Alat Produksi</option>
                  <option value="COMMUNICATION_DEADLOCK">Kebuntuan Komunikasi / Tidak Ada Respons</option>
                  <option value="OTHER">Kendala Lainnya</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Jelaskan Duduk Perkara &amp; Bukti *</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows={3}
                  placeholder="Ceritakan secara kronologis kendala yang dialami dan upaya komunikasi yang telah dilakukan..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all resize-none shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Solusi yang Anda Harapkan (Opsional)</label>
                <input
                  type="text"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Misal: Pengembalian DP 50%, jadwal ulang sesi, penyerahan revisi tuntas..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all shadow-2xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />}
                  <span>Kirim Pengajuan Mediasi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
